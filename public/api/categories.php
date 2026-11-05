<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List categories
if ($method === 'GET') {
    $onlyActive = isset($_GET['onlyActive']) && $_GET['onlyActive'] === 'true';
    $sql = "SELECT * FROM product_categories " . ($onlyActive ? "WHERE active = 1 " : "") . "ORDER BY sort_order ASC";
    $stmt = $db->query($sql);
    $categories = array_map(function($c) {
        $c['active'] = (bool)$c['active'];
        $c['sort_order'] = intval($c['sort_order']);
        return $c;
    }, $stmt->fetchAll());

    sendJson(['success' => true, 'categories' => $categories]);
}

// 2. POST - Create or save category
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();

    $id = !empty($input['id']) ? $input['id'] : 'cat-' . bin2hex(random_bytes(6));
    $slug = trim($input['slug'] ?? '');
    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($input['name_en'] ?? 'cat')));
    }

    $stmt = $db->prepare("
        INSERT INTO product_categories (id, slug, name_en, name_ar, sort_order, active, trade)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            slug = VALUES(slug),
            name_en = VALUES(name_en),
            name_ar = VALUES(name_ar),
            sort_order = VALUES(sort_order),
            active = VALUES(active),
            trade = VALUES(trade)
    ");

    $stmt->execute([
        $id,
        $slug,
        $input['name_en'] ?? '',
        $input['name_ar'] ?? '',
        intval($input['sort_order'] ?? 1),
        isset($input['active']) ? ($input['active'] ? 1 : 0) : 1,
        $input['trade'] ?? 'export'
    ]);

    sendJson(['success' => true, 'id' => $id]);
}

// 3. DELETE - Delete category
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Category ID is required', 400);

    $stmt = $db->prepare("DELETE FROM product_categories WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
