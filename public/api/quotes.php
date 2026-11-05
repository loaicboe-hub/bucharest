<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. POST - Submit a new quote request from the website (Public)
if ($method === 'POST') {
    $input = getJsonInput();
    $id = 'quote-' . bin2hex(random_bytes(6));

    $stmt = $db->prepare("
        INSERT INTO quote_requests (id, company, contact_person, email, country, product, quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    ");

    $stmt->execute([
        $id,
        $input['company'] ?? '',
        $input['contactPerson'] ?? $input['contact_person'] ?? '',
        $input['email'] ?? '',
        $input['country'] ?? '',
        $input['product'] ?? '',
        $input['quantity'] ?? ''
    ]);

    sendJson(['success' => true, 'id' => $id]);
}

// 2. GET - List quote requests (Admin only)
if ($method === 'GET') {
    requireAuth();
    $stmt = $db->query("SELECT * FROM quote_requests ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();

    $quotes = array_map(function($r) {
        return [
            'id' => $r['id'],
            'company' => $r['company'],
            'contactPerson' => $r['contact_person'],
            'email' => $r['email'],
            'country' => $r['country'],
            'product' => $r['product'],
            'quantity' => $r['quantity'],
            'status' => $r['status'],
            'date' => substr($r['created_at'], 0, 10)
        ];
    }, $rows);

    sendJson(['success' => true, 'quotes' => $quotes]);
}

// 3. PUT - Update quote status (Admin only)
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? $_GET['id'] ?? null;
    $status = $input['status'] ?? 'pending';

    if (!$id) sendError('Quote ID is required', 400);

    $stmt = $db->prepare("UPDATE quote_requests SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    sendJson(['success' => true]);
}

// 4. DELETE - Delete quote (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Quote ID is required', 400);

    $stmt = $db->prepare("DELETE FROM quote_requests WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
