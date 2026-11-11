<?php
/**
 * BucharestEgyAgro - Products API
 * Manages products in Hostinger MySQL with full English, French, Arabic & Russian support.
 */
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function ensureProductLocaleColumns(PDO $db): array {
    static $cols = null;
    if ($cols !== null) {
        return $cols;
    }

    $cols = [];
    try {
        $stmt = $db->query("SHOW COLUMNS FROM products");
        foreach ($stmt->fetchAll() as $col) {
            $cols[$col['Field']] = true;
        }

        $missing = [];
        if (empty($cols['name_fr'])) {
            $missing[] = "ADD COLUMN `name_fr` VARCHAR(255) NULL DEFAULT NULL AFTER `name_en`";
        }
        if (empty($cols['name_ru'])) {
            $missing[] = "ADD COLUMN `name_ru` VARCHAR(255) NULL DEFAULT NULL AFTER `name_ar`";
        }
        if (empty($cols['intro_fr'])) {
            $missing[] = "ADD COLUMN `intro_fr` TEXT NULL DEFAULT NULL AFTER `intro_en`";
        }
        if (empty($cols['intro_ru'])) {
            $missing[] = "ADD COLUMN `intro_ru` TEXT NULL DEFAULT NULL AFTER `intro_ar`";
        }
        if (empty($cols['description_fr'])) {
            $missing[] = "ADD COLUMN `description_fr` LONGTEXT NULL DEFAULT NULL AFTER `description_en`";
        }
        if (empty($cols['description_ru'])) {
            $missing[] = "ADD COLUMN `description_ru` LONGTEXT NULL DEFAULT NULL AFTER `description_ar`";
        }
        if (empty($cols['specs_fr'])) {
            $missing[] = "ADD COLUMN `specs_fr` JSON DEFAULT NULL AFTER `specs_en`";
        }
        if (empty($cols['specs_ru'])) {
            $missing[] = "ADD COLUMN `specs_ru` JSON DEFAULT NULL AFTER `specs_ar`";
        }

        if (!empty($missing)) {
            try {
                $db->exec("ALTER TABLE `products` " . implode(', ', $missing));
                $stmt = $db->query("SHOW COLUMNS FROM products");
                $cols = [];
                foreach ($stmt->fetchAll() as $col) {
                    $cols[$col['Field']] = true;
                }
            } catch (PDOException $e) {
                error_log('Products schema migration skipped: ' . $e->getMessage());
            }
        }
    } catch (PDOException $e) {
        error_log('Products SHOW COLUMNS error: ' . $e->getMessage());
    }

    return $cols;
}

function decodeSpecsJson($raw, bool $preserveNull = false) {
    if ($preserveNull && $raw === null) {
        return null;
    }
    $decoded = json_decode($raw ?: '{}', true);
    if (!is_array($decoded) || count($decoded) === 0) {
        return new stdClass();
    }
    return $decoded;
}

function formatProductRow(array $r): array {
    $r['specs_en'] = decodeSpecsJson($r['specs_en'] ?? null, false);
    $r['specs_ar'] = decodeSpecsJson($r['specs_ar'] ?? null, false);
    if (array_key_exists('specs_fr', $r)) {
        $r['specs_fr'] = decodeSpecsJson($r['specs_fr'], true);
    }
    if (array_key_exists('specs_ru', $r)) {
        $r['specs_ru'] = decodeSpecsJson($r['specs_ru'], true);
    }
    $hidden = json_decode($r['hidden_specs'] ?: '[]', true);
    $r['hidden_specs'] = is_array($hidden) ? $hidden : [];
    $gallery = json_decode($r['gallery'] ?: '[]', true);
    $r['gallery'] = is_array($gallery) ? $gallery : [];
    $r['published'] = (bool)$r['published'];
    $r['sort_order'] = intval($r['sort_order']);
    return $r;
}

// 1. GET - List products or get single product by slug or id
if ($method === 'GET') {
    try {
        ensureProductLocaleColumns($db);

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

            sendJson(['success' => true, 'product' => formatProductRow($p)]);
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
        $products = array_map('formatProductRow', $stmt->fetchAll());

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

        $cols = ensureProductLocaleColumns($db);

        $rawId = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        if ($rawId === '') {
            $id = 'prod-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'prod-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $nameEn = trim((string)($input['name_en'] ?? ''));
        $nameFr = trim((string)($input['name_fr'] ?? ''));
        $nameAr = trim((string)($input['name_ar'] ?? ''));
        $nameRu = trim((string)($input['name_ru'] ?? ''));
        if ($nameEn === '' && $nameFr === '' && $nameAr === '' && $nameRu === '') {
            sendError('Product name is required', 400);
        }

        $rawSlug = trim((string)($input['slug'] ?? ''));
        if ($rawSlug === '') {
            $rawSlug = $nameEn !== '' ? $nameEn : ($nameFr !== '' ? $nameFr : ($nameAr !== '' ? $nameAr : $nameRu));
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/i', '-', strtolower($rawSlug)), '-');
        if ($slug === '') {
            $slug = 'item-' . bin2hex(random_bytes(3));
        }

        $trade = ($input['trade'] ?? 'export') === 'import' ? 'import' : 'export';

        $categoryId = !empty($input['category_id']) ? trim((string)$input['category_id']) : null;
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

        $encodeSpecs = function($val) {
            if (is_array($val) && count($val) > 0) {
                return json_encode($val, JSON_UNESCAPED_UNICODE);
            }
            return '{}';
        };
        $specsEn = $encodeSpecs($input['specs_en'] ?? null);
        $specsFr = $encodeSpecs($input['specs_fr'] ?? null);
        $specsAr = $encodeSpecs($input['specs_ar'] ?? null);
        $specsRu = $encodeSpecs($input['specs_ru'] ?? null);

        $hiddenSpecs = json_encode($input['hidden_specs'] ?? [], JSON_UNESCAPED_UNICODE);
        $rawGallery = is_array($input['gallery'] ?? null) ? $input['gallery'] : [];
        $safeGallery = array_values(array_filter(array_map(function($g) {
            return sanitizeSafeUrl((string)$g, true);
        }, array_slice($rawGallery, 0, 20))));
        $gallery = json_encode($safeGallery, JSON_UNESCAPED_UNICODE);
        $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;
        $sortOrder = intval($input['sort_order'] ?? 1);

        $fields = [
            'slug' => $slug,
            'trade' => $trade,
            'category_id' => $categoryId,
            'name_en' => $nameEn,
            'name_ar' => $nameAr,
            'intro_en' => (string)($input['intro_en'] ?? ''),
            'intro_ar' => (string)($input['intro_ar'] ?? ''),
            'description_en' => (string)($input['description_en'] ?? ''),
            'description_ar' => (string)($input['description_ar'] ?? ''),
            'specs_en' => $specsEn,
            'specs_ar' => $specsAr,
            'hidden_specs' => $hiddenSpecs,
            'main_image' => substr($mainImage, 0, 500),
            'gallery' => $gallery,
            'published' => $published,
            'sort_order' => $sortOrder,
        ];
        if (!empty($cols['name_fr'])) $fields['name_fr'] = $nameFr;
        if (!empty($cols['name_ru'])) $fields['name_ru'] = $nameRu;
        if (!empty($cols['intro_fr'])) $fields['intro_fr'] = (string)($input['intro_fr'] ?? '');
        if (!empty($cols['intro_ru'])) $fields['intro_ru'] = (string)($input['intro_ru'] ?? '');
        if (!empty($cols['description_fr'])) $fields['description_fr'] = (string)($input['description_fr'] ?? '');
        if (!empty($cols['description_ru'])) $fields['description_ru'] = (string)($input['description_ru'] ?? '');
        if (!empty($cols['specs_fr'])) $fields['specs_fr'] = $specsFr;
        if (!empty($cols['specs_ru'])) $fields['specs_ru'] = $specsRu;

        if ($exists) {
            $setParts = [];
            $params = [];
            foreach ($fields as $col => $val) {
                $setParts[] = "`$col` = ?";
                $params[] = $val;
            }
            $params[] = $id;
            $stmt = $db->prepare("UPDATE products SET " . implode(', ', $setParts) . " WHERE id = ?");
            $stmt->execute($params);
        } else {
            $insertCols = array_merge(['id'], array_keys($fields));
            $placeholders = array_fill(0, count($insertCols), '?');
            $params = array_merge([$id], array_values($fields));
            $colSql = implode(', ', array_map(function($col) { return "`$col`"; }, $insertCols));
            $stmt = $db->prepare("INSERT INTO products ($colSql) VALUES (" . implode(', ', $placeholders) . ")");
            $stmt->execute($params);
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
