<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List partners
if ($method === 'GET') {
    try {
        $all = isset($_GET['all']);
        $where = $all ? "" : "WHERE enabled = 1";
        $stmt = $db->query("SELECT * FROM partners $where ORDER BY sort_order ASC, created_at DESC LIMIT 200");
        $partners = array_map(function($p) {
            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'logo' => $p['logo_url'],
                'logoPath' => $p['logo_path'],
                'url' => sanitizeSafeUrl((string)$p['url'], false),
                'enabled' => (bool)$p['enabled'],
                'sortOrder' => intval($p['sort_order'])
            ];
        }, $stmt->fetchAll());

        sendJson(['success' => true, 'partners' => $partners]);
    } catch (PDOException $e) {
        error_log('Partners list DB error: ' . $e->getMessage());
        sendError('Failed to fetch partners', 500);
    }
}

// 2. POST - Create or update partner
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();
    $rawId = trim((string)($input['id'] ?? ''));
    $id = ($rawId !== '' && strlen($rawId) <= 36) ? $rawId : 'partner-' . bin2hex(random_bytes(6));

    $name = substr(trim((string)($input['name'] ?? '')), 0, 191);
    $logoUrl = substr(sanitizeSafeUrl((string)($input['logo'] ?? $input['logo_url'] ?? ''), true), 0, 500);
    $logoPath = substr(trim((string)($input['logoPath'] ?? $input['logo_path'] ?? '')), 0, 255);
    $url = substr(sanitizeSafeUrl((string)($input['url'] ?? ''), false), 0, 500);
    $enabled = isset($input['enabled']) ? ($input['enabled'] ? 1 : 0) : 1;
    $sortOrder = intval($input['sortOrder'] ?? $input['sort_order'] ?? 1);

    try {
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

        $stmt->execute([$id, $name, $logoUrl, $logoPath, $url, $enabled, $sortOrder]);
        sendJson(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        error_log('Partners save DB error: ' . $e->getMessage());
        sendError('Failed to save partner', 500);
    }
}

// 3. DELETE - Delete partner
if ($method === 'DELETE') {
    requireAuth();
    $id = trim((string)($_GET['id'] ?? ''));
    if ($id === '') sendError('Partner ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM partners WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('Partners delete DB error: ' . $e->getMessage());
        sendError('Failed to delete partner', 500);
    }
}

sendError('Method not allowed', 405);
