<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Admin only for invoices
requireAuth();

// 1. GET - List invoices or single
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM invoices WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) sendError('Invoice not found', 404);

        $invoice = json_decode($row['invoice_data'], true);
        sendJson(['success' => true, 'invoice' => $invoice]);
    }

    $stmt = $db->query("SELECT * FROM invoices ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();

    $invoices = array_map(function($r) {
        $data = json_decode($r['invoice_data'], true);
        return $data ?: [
            'id' => $r['id'],
            'number' => $r['number'],
            'status' => $r['status'],
            'finalized' => (bool)$r['finalized']
        ];
    }, $rows);

    sendJson(['success' => true, 'invoices' => $invoices]);
}

// 2. POST - Save or update invoice
if ($method === 'POST') {
    $input = getJsonInput();
    $id = !empty($input['id']) ? $input['id'] : 'inv-' . bin2hex(random_bytes(6));
    $number = $input['number'] ?? 'INV-' . date('Ymd-His');
    $status = $input['status'] ?? 'draft';
    $finalized = !empty($input['finalized']) ? 1 : 0;

    $stmt = $db->prepare("
        INSERT INTO invoices (id, number, status, finalized, invoice_data)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            number = VALUES(number),
            status = VALUES(status),
            finalized = VALUES(finalized),
            invoice_data = VALUES(invoice_data)
    ");

    $stmt->execute([
        $id,
        $number,
        $status,
        $finalized,
        json_encode($input, JSON_UNESCAPED_UNICODE)
    ]);

    sendJson(['success' => true, 'id' => $id]);
}

// 3. DELETE - Delete invoice
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Invoice ID is required', 400);

    $stmt = $db->prepare("DELETE FROM invoices WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
