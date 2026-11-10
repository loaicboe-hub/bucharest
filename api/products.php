<?php
/**
 * BucharestEgyAgro - Products API
 * Manages products in Hostinger MySQL with full English, French & Arabic support.
 */
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List products or get single product by slug or id
if ($method === 'GET') {
    try {
        // Single product lookup
        if (isset($_GET['slug']) || isset($_GET['id'])) {
            $slug = $_GET['slug'] ?? '';
            $id = $_GET['id'] ?? '';

            $stmt = $db->prepare("SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1");
            $stmt->execute([$slug, $id]);
            $p = $stmt->fetch();

            if (!$p) {
                sendError('Product not found', 404);
            }

            $p['specs_en'] = json_decode($p['specs_en'] ?: '{}', true);
            $p['specs_ar'] = json_decode($p['specs_ar'] ?: '{}', true);
            $p['hidden_specs'] = json_decode($p['hidden_specs'] ?: '[]', true);
            $p['gallery'] = json_decode($p['gallery'] ?: '[]', true);
            $p['published'] = (bool)$p['published'];
            $p['sort_order'] = intval($p['sort_order']);

            sendJson(['success' => true, 'product' => $p]);
        }

        // List products
        $where = [];
        $params = [];

        if (!empty($_GET['trade'])) {
            $where[] = "trade = ?";
            $params[] = $_GET['trade'];
        }

        if (empty($_GET['all'])) {
            $where[] = "published = 1";
        }

        $whereClause = count($where) ? "WHERE " . implode(" AND ", $where) : "";
        $stmt = $db->prepare("SELECT * FROM products $whereClause ORDER BY sort_order ASC, created_at DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $products = array_map(function($r) {
            $r['specs_en'] = json_decode($r['specs_en'] ?: '{}', true);
            $r['specs_ar'] = json_decode($r['specs_ar'] ?: '{}', true);
            $r['hidden_specs'] = json_decode($r['hidden_specs'] ?: '[]', true);
            $r['gallery'] = json_decode($r['gallery'] ?: '[]', true);
            $r['published'] = (bool)$r['published'];
            $r['sort_order'] = intval($r['sort_order']);
            return $r;
        }, $rows);

        sendJson(['success' => true, 'products' => $products]);
    } catch (PDOException $e) {
        error_log('Products fetch DB error: ' . $e->getMessage());
        sendError('Failed to fetch products', 500);
    }
}

// 2. POST / PUT - Create, Update, or Reorder products (Admin only)
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $action = $_GET['action'] ?? '';

    try {
        // Handle bulk reorder
        if ($action === 'reorder' && isset($input['rows']) && is_array($input['rows'])) {
            $stmt = $db->prepare("UPDATE products SET sort_order = ? WHERE id = ?");
            foreach ($input['rows'] as $row) {
                if (!empty($row['id'])) {
                    $stmt->execute([intval($row['sort_order'] ?? 1), $row['id']]);
                }
            }
            sendJson(['success' => true]);
        }

        $rawId = trim($input['id'] ?? $_GET['id'] ?? '');
        if ($rawId === '') {
            $id = 'prod-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'prod-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $nameEn = trim($input['name_en'] ?? '');
        $nameAr = trim($input['name_ar'] ?? '');
        if ($nameEn === '' && $nameAr === '') {
            sendError('Product name is required', 400);
        }

        $rawSlug = trim($input['slug'] ?? '');
        if ($rawSlug === '') {
            $rawSlug = $nameEn !== '' ? $nameEn : $nameAr;
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/i', '-', strtolower($rawSlug)), '-');
        if ($slug === '') {
            $slug = 'item-' . bin2hex(random_bytes(3));
        }

        $trade = ($input['trade'] ?? 'export') === 'import' ? 'import' : 'export';

        $categoryId = !empty($input['category_id']) ? trim($input['category_id']) : null;
        if ($categoryId !== null) {
            $catCheck = $db->prepare("SELECT id FROM product_categories WHERE id = ? LIMIT 1");
            $catCheck->execute([$categoryId]);
            if (!$catCheck->fetch()) {
                sendError('Selected category does not exist in database. Please create/refresh categories first.', 400);
            }
        }

        $mainImageRaw = trim((string)($input['main_image'] ?? ''));
        if (strpos($mainImageRaw, 'data:image/') === 0 && strlen($mainImageRaw) > 500) {
            sendError('Image must be uploaded to the server first rather than embedded as base64.', 400);
        }
        $mainImage = sanitizeSafeUrl($mainImageRaw, true);

        // Check if updating an existing product or inserting a new one
        $checkIdStmt = $db->prepare("SELECT id FROM products WHERE id = ? LIMIT 1");
        $checkIdStmt->execute([$id]);
        $exists = (bool)$checkIdStmt->fetch();

        // Ensure slug is unique across other products so we never collide or accidentally overwrite another product
        $checkSlugStmt = $db->prepare("SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1");
        $checkSlugStmt->execute([$slug, $id]);
        if ($checkSlugStmt->fetch()) {
            $slug = substr($slug, 0, 175) . '-' . bin2hex(random_bytes(2));
        }

        $specsEn = json_encode($input['specs_en'] ?? new stdClass(), JSON_UNESCAPED_UNICODE);
        $specsAr = json_encode($input['specs_ar'] ?? new stdClass(), JSON_UNESCAPED_UNICODE);
        $hiddenSpecs = json_encode($input['hidden_specs'] ?? [], JSON_UNESCAPED_UNICODE);
        $rawGallery = is_array($input['gallery'] ?? null) ? $input['gallery'] : [];
        $safeGallery = array_values(array_filter(array_map(function($g) {
            return sanitizeSafeUrl((string)$g, true);
        }, array_slice($rawGallery, 0, 20))));
        $gallery = json_encode($safeGallery, JSON_UNESCAPED_UNICODE);
        $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;
        $sortOrder = intval($input['sort_order'] ?? 1);

        if ($exists) {
            $stmt = $db->prepare("
                UPDATE products SET
                    slug = ?,
                    trade = ?,
                    category_id = ?,
                    name_en = ?,
                    name_ar = ?,
                    intro_en = ?,
                    intro_ar = ?,
                    description_en = ?,
                    description_ar = ?,
                    specs_en = ?,
                    specs_ar = ?,
                    hidden_specs = ?,
                    main_image = ?,
                    gallery = ?,
                    published = ?,
                    sort_order = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $slug,
                $trade,
                $categoryId,
                $nameEn,
                $nameAr,
                $input['intro_en'] ?? '',
                $input['intro_ar'] ?? '',
                $input['description_en'] ?? '',
                $input['description_ar'] ?? '',
                $specsEn,
                $specsAr,
                $hiddenSpecs,
                substr($mainImage, 0, 500),
                $gallery,
                $published,
                $sortOrder,
                $id
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO products (
                    id, slug, trade, category_id, name_en, name_ar,
                    intro_en, intro_ar, description_en, description_ar,
                    specs_en, specs_ar, hidden_specs, main_image, gallery,
                    published, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $slug,
                $trade,
                $categoryId,
                $nameEn,
                $nameAr,
                $input['intro_en'] ?? '',
                $input['intro_ar'] ?? '',
                $input['description_en'] ?? '',
                $input['description_ar'] ?? '',
                $specsEn,
                $specsAr,
                $hiddenSpecs,
                substr($mainImage, 0, 500),
                $gallery,
                $published,
                $sortOrder
            ]);
        }

        sendJson(['success' => true, 'id' => $id, 'slug' => $slug]);
    } catch (PDOException $e) {
        sendError('Database error while saving product: ' . $e->getMessage(), 500);
    }
}

// 3. DELETE - Remove product (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }

    if (!$id) {
        sendError('Product ID is required', 400);
    }

    try {
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        sendError('Database error while deleting product: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
