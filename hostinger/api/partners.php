<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List partners
if ($method === 'GET') {
    $all = isset($_GET['all']);
    $where = $all ? "" : "WHERE enabled = 1";
    $stmt = $db->query("SELECT * FROM partners $where ORDER BY sort_order ASC, created_at DESC");
    $partners = array_map(function($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'logo' => $p['logo_url'],
            'logoPath' => $p['logo_path'],
            'url' => $p['url'],
            'enabled' => (bool)$p['enabled'],
            'sortOrder' => intval($p['sort_order'])
        ];
    }, $stmt->fetchAll());

    sendJson(['success' => true, 'partners' => $partners]);
}

// 2. POST - Create partner
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();
    $id = !empty($input['id']) ? $input['id'] : 'partner-' . bin2hex(random_bytes(6));

    $stmt = $db->prepare("
        INSERT INTO partners (id, name, logo_url, logo_path, url, enabled, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            logo_url = VALUES(logo_url),
            logo_path = VALUES(logo_path),
            url = VALUES(url),
            enabled = VALUES(enabled),
            sort_order = VALUES(sort_order)
    ");

    $stmt->execute([
        $id,
        $input['name'] ?? '',
        $input['logo'] ?? $input['logo_url'] ?? '',
        $input['logoPath'] ?? $input['logo_path'] ?? '',
        $input['url'] ?? '',
        isset($input['enabled']) ? ($input['enabled'] ? 1 : 0) : 1,
        intval($input['sortOrder'] ?? $input['sort_order'] ?? 1)
    ]);

    sendJson(['success' => true, 'id' => $id]);
}

// 3. DELETE - Delete partner
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Partner ID is required', 400);

    $stmt = $db->prepare("DELETE FROM partners WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
