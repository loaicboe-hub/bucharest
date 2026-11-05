<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List products or get single
if ($method === 'GET') {
    $slug = $_GET['slug'] ?? null;
    $id = $_GET['id'] ?? null;
    $trade = $_GET['trade'] ?? null;
    $all = isset($_GET['all']); // for admin

    if ($slug || $id) {
        $sql = "SELECT * FROM products WHERE " . ($slug ? "slug = ?" : "id = ?");
        $stmt = $db->prepare($sql);
        $stmt->execute([$slug ?: $id]);
        $row = $stmt->fetch();
        if (!$row) sendError('Product not found', 404);

        $row['specs_en'] = json_decode($row['specs_en'] ?: '{}', true);
        $row['specs_ar'] = json_decode($row['specs_ar'] ?: '{}', true);
        $row['hidden_specs'] = json_decode($row['hidden_specs'] ?: '[]', true);
        $row['gallery'] = json_decode($row['gallery'] ?: '[]', true);
        $row['published'] = (bool)$row['published'];
        sendJson(['success' => true, 'product' => $row]);
    }

    $where = [];
    $params = [];

    if (!$all) {
        $where[] = "published = 1";
    }
    if ($trade) {
        $where[] = "trade = ?";
        $params[] = $trade;
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

// 2. POST - Create product (Admin only)
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();

    $id = !empty($input['id']) ? $input['id'] : 'prod-' . bin2hex(random_bytes(6));
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

// 3. PUT - Update product (Admin only)
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? $_GET['id'] ?? null;
    if (!$id) sendError('Product ID is required', 400);

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
        $input['slug'] ?? 'item',
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
        intval($input['sort_order'] ?? 1),
        $id
    ]);

    sendJson(['success' => true]);
}

// 4. DELETE - Delete product (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Product ID is required', 400);

    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
