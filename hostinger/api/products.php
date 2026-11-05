<?php
/**
 * BucharestEgyAgro - Products API
 * Manages products in Hostinger MySQL with full Arabic and English support.
 */
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List products or get single product by slug or id
if ($method === 'GET') {
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

        sendJson(['success' => true, 'product' => $p]);
    }

    // List products
    $where = [];
    $params = [];

    // Filter by trade (export/import)
    if (!empty($_GET['trade'])) {
        $where[] = "trade = ?";
        $params[] = $_GET['trade'];
    }

    // Default to published only unless ?all=1 (admin view)
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
        return $r;
    }, $rows);

    sendJson(['success' => true, 'products' => $products]);
}

// 2. POST / PUT - Create or Update product (Admin only, handles UPSERT)
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    $id = !empty($input['id']) ? $input['id'] : (!empty($_GET['id']) ? $_GET['id'] : 'prod-' . bin2hex(random_bytes(6)));
    $slug = trim($input['slug'] ?? '');
    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($input['name_en'] ?? 'item')));
    }

    $stmt = $db->prepare("
        INSERT INTO products (
            id, slug, trade, category_id, name_en, name_ar,
            intro_en, intro_ar, description_en, description_ar,
            specs_en, specs_ar, hidden_specs, main_image, gallery,
            published, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            slug = VALUES(slug),
            trade = VALUES(trade),
            category_id = VALUES(category_id),
            name_en = VALUES(name_en),
            name_ar = VALUES(name_ar),
            intro_en = VALUES(intro_en),
            intro_ar = VALUES(intro_ar),
            description_en = VALUES(description_en),
            description_ar = VALUES(description_ar),
            specs_en = VALUES(specs_en),
            specs_ar = VALUES(specs_ar),
            hidden_specs = VALUES(hidden_specs),
            main_image = VALUES(main_image),
            gallery = VALUES(gallery),
            published = VALUES(published),
            sort_order = VALUES(sort_order)
    ");

    $stmt->execute([
        $id,
        $slug,
        $input['trade'] ?? 'export',
        !empty($input['category_id']) ? $input['category_id'] : null,
        $input['name_en'] ?? '',
        $input['name_ar'] ?? '',
        $input['intro_en'] ?? '',
        $input['intro_ar'] ?? '',
        $input['description_en'] ?? '',
        $input['description_ar'] ?? '',
        json_encode($input['specs_en'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        json_encode($input['specs_ar'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        json_encode($input['hidden_specs'] ?? [], JSON_UNESCAPED_UNICODE),
        $input['main_image'] ?? '',
        json_encode($input['gallery'] ?? [], JSON_UNESCAPED_UNICODE),
        isset($input['published']) ? ($input['published'] ? 1 : 0) : 1,
        intval($input['sort_order'] ?? 1)
    ]);

    sendJson(['success' => true, 'id' => $id, 'slug' => $slug]);
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

    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
