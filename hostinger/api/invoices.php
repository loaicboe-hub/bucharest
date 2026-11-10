<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Admin only for invoices
requireAuth();

// 1. GET - List invoices or single
if ($method === 'GET') {
    try {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM invoices WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) sendError('Invoice not found', 404);

            $invoice = json_decode($row['invoice_data'], true);
            sendJson(['success' => true, 'invoice' => $invoice]);
        }

        $stmt = $db->query("SELECT * FROM invoices ORDER BY created_at DESC LIMIT 500");
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
    } catch (PDOException $e) {
        error_log('Invoices fetch DB error: ' . $e->getMessage());
        sendError('Failed to fetch invoices', 500);
    }
}

// 2. POST - Save or update invoice
if ($method === 'POST') {
    $input = getJsonInput();
    $rawId = trim((string)($input['id'] ?? ''));
    $id = ($rawId !== '' && strlen($rawId) <= 36) ? $rawId : 'inv-' . bin2hex(random_bytes(6));
    $number = substr(trim((string)($input['number'] ?? 'INV-' . date('Ymd-His'))), 0, 100);
    $status = (string)($input['status'] ?? 'draft');
    if (!in_array($status, ['draft', 'unpaid', 'partial', 'paid', 'overdue'], true)) {
        $status = 'draft';
    }
    $finalized = !empty($input['finalized']) ? 1 : 0;

    try {
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
    } catch (PDOException $e) {
        error_log('Invoices save DB error: ' . $e->getMessage());
        sendError('Failed to save invoice', 500);
    }
}

// 3. DELETE - Delete invoice
if ($method === 'DELETE') {
    $id = trim((string)($_GET['id'] ?? ''));
    if ($id === '') sendError('Invoice ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM invoices WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('Invoices delete DB error: ' . $e->getMessage());
        sendError('Failed to delete invoice', 500);
    }
}

sendError('Method not allowed', 405);
