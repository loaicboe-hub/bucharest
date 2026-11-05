<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. POST - Submit contact form from website (Public)
if ($method === 'POST') {
    $input = getJsonInput();
    $id = 'contact-' . bin2hex(random_bytes(6));

    $stmt = $db->prepare("
        INSERT INTO contact_requests (id, name, company, country, email, phone, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    ");

    $stmt->execute([
        $id,
        $input['name'] ?? '',
        $input['company'] ?? '',
        $input['country'] ?? '',
        $input['email'] ?? '',
        $input['phone'] ?? '',
        $input['message'] ?? ''
    ]);

    sendJson(['success' => true, 'id' => $id]);
}

// 2. GET - List contact requests (Admin only)
if ($method === 'GET') {
    requireAuth();
    $stmt = $db->query("SELECT * FROM contact_requests ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();

    $contacts = array_map(function($r) {
        return [
            'id' => $r['id'],
            'name' => $r['name'],
            'company' => $r['company'],
            'country' => $r['country'],
            'email' => $r['email'],
            'phone' => $r['phone'],
            'message' => $r['message'],
            'status' => $r['status'],
            'date' => substr($r['created_at'], 0, 10)
        ];
    }, $rows);

    sendJson(['success' => true, 'contacts' => $contacts]);
}

// 3. PUT - Update contact status (Admin only)
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? $_GET['id'] ?? null;
    $status = $input['status'] ?? 'new';

    if (!$id) sendError('Contact ID is required', 400);

    $stmt = $db->prepare("UPDATE contact_requests SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    sendJson(['success' => true]);
}

// 4. DELETE - Delete contact (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Contact ID is required', 400);

    $stmt = $db->prepare("DELETE FROM contact_requests WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
