<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. POST - Admin actions (?action=delete|status) OR public website quote submission
if ($method === 'POST') {
    $action = trim((string)($_GET['action'] ?? ''));

    // Admin fallback delete via POST (protects against gateways/proxies blocking HTTP DELETE)
    if ($action === 'delete') {
        requireAuth();
        $input = getJsonInput();
        $id = trim((string)(!empty($_GET['id']) ? $_GET['id'] : ($input['id'] ?? '')));
        if ($id === '') sendError('Quote ID is required', 400);

        try {
            $stmt = $db->prepare("DELETE FROM quote_requests WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true, 'deleted' => $stmt->rowCount(), 'id' => $id]);
        } catch (PDOException $e) {
            error_log('Quote delete DB error: ' . $e->getMessage());
            sendError('Failed to delete quote request', 500);
        }
    }

    // Admin fallback status update via POST
    if ($action === 'status') {
        requireAuth();
        $input = getJsonInput();
        $id = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        $status = (string)($input['status'] ?? 'pending');
        $allowedStatuses = ['pending', 'sent', 'won', 'lost'];

        if ($id === '') sendError('Quote ID is required', 400);
        if (!in_array($status, $allowedStatuses, true)) sendError('Invalid quote status', 400);

        try {
            $stmt = $db->prepare("UPDATE quote_requests SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            sendJson(['success' => true]);
        } catch (PDOException $e) {
            error_log('Quote status DB error: ' . $e->getMessage());
            sendError('Failed to update quote status', 500);
        }
    }

    // Public quote request submission (Strictly Rate Limited)
    enforceRateLimit('quotes_submit_short', 5, 900, '', 'Too many quote requests sent. Please wait 15 minutes before sending another.');
    enforceRateLimit('quotes_submit_daily', 20, 86400, '', 'Daily quote request limit reached. Please contact us via phone or WhatsApp.');

    $input = getJsonInput(65536);

    // Honeypot anti-spam trap
    if (!empty($input['website']) || !empty($input['honeypot'])) {
        sendError('Invalid submission', 400);
    }

    $company = substr(trim((string)($input['company'] ?? '')), 0, 191);
    $contactPerson = substr(trim((string)($input['contactPerson'] ?? $input['contact_person'] ?? '')), 0, 191);
    $email = substr(trim(strtolower((string)($input['email'] ?? ''))), 0, 191);
    $country = substr(trim((string)($input['country'] ?? '')), 0, 100);
    $product = substr(trim((string)($input['product'] ?? '')), 0, 191);
    $quantity = substr(trim((string)($input['quantity'] ?? '')), 0, 100);

    if (($contactPerson === '' && $company === '') || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Contact name/company and a valid email address are required', 400);
    }

    $id = 'quote-' . bin2hex(random_bytes(6));

    try {
        $stmt = $db->prepare("
            INSERT INTO quote_requests (id, company, contact_person, email, country, product, quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        ");

        $stmt->execute([
            $id,
            $company,
            $contactPerson,
            $email,
            $country,
            $product,
            $quantity
        ]);

        sendJson(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        error_log('Quote insert DB error: ' . $e->getMessage());
        sendError('Unable to submit quote request right now', 500);
    }
}

// 2. GET - List quote requests (Admin only)
if ($method === 'GET') {
    requireAuth();
    try {
        $stmt = $db->query("SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 500");
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
    } catch (PDOException $e) {
        error_log('Quote list DB error: ' . $e->getMessage());
        sendError('Failed to fetch quote requests', 500);
    }
}

// 3. PUT - Update quote status (Admin only)
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
    $status = (string)($input['status'] ?? 'pending');
    $allowedStatuses = ['pending', 'sent', 'won', 'lost'];

    if ($id === '') sendError('Quote ID is required', 400);
    if (!in_array($status, $allowedStatuses, true)) sendError('Invalid quote status', 400);

    try {
        $stmt = $db->prepare("UPDATE quote_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('Quote status DB error: ' . $e->getMessage());
        sendError('Failed to update quote status', 500);
    }
}

// 4. DELETE - Delete quote (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = trim((string)($_GET['id'] ?? ''));
    if ($id === '') {
        $input = getJsonInput();
        $id = trim((string)($input['id'] ?? ''));
    }
    if ($id === '') sendError('Quote ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM quote_requests WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true, 'deleted' => $stmt->rowCount(), 'id' => $id]);
    } catch (PDOException $e) {
        error_log('Quote delete DB error: ' . $e->getMessage());
        sendError('Failed to delete quote request', 500);
    }
}

sendError('Method not allowed', 405);
