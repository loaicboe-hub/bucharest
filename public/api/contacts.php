<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. POST - Admin actions (?action=delete|status) OR public website contact submission
if ($method === 'POST') {
    $action = trim((string)($_GET['action'] ?? ''));

    // Admin fallback delete via POST (protects against gateways/proxies blocking HTTP DELETE)
    if ($action === 'delete') {
        requireAuth();
        $input = getJsonInput();
        $id = trim((string)(!empty($_GET['id']) ? $_GET['id'] : ($input['id'] ?? '')));
        if ($id === '') sendError('Contact ID is required', 400);

        try {
            $stmt = $db->prepare("DELETE FROM contact_requests WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true, 'deleted' => $stmt->rowCount(), 'id' => $id]);
        } catch (PDOException $e) {
            error_log('Contact delete DB error: ' . $e->getMessage());
            sendError('Failed to delete contact request', 500);
        }
    }

    // Admin fallback status update via POST
    if ($action === 'status') {
        requireAuth();
        $input = getJsonInput();
        $id = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        $status = (string)($input['status'] ?? 'new');
        $allowedStatuses = ['new', 'in-progress', 'closed'];

        if ($id === '') sendError('Contact ID is required', 400);
        if (!in_array($status, $allowedStatuses, true)) sendError('Invalid contact status', 400);

        try {
            $stmt = $db->prepare("UPDATE contact_requests SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            sendJson(['success' => true]);
        } catch (PDOException $e) {
            error_log('Contact status DB error: ' . $e->getMessage());
            sendError('Failed to update contact status', 500);
        }
    }

    // Public contact submission (Strictly Rate Limited)
    enforceRateLimit('contacts_submit_short', 5, 900, '', 'Too many messages submitted. Please wait 15 minutes before sending another.');
    enforceRateLimit('contacts_submit_daily', 20, 86400, '', 'Daily message limit reached. Please reach us directly via phone or WhatsApp.');

    $input = getJsonInput(65536);

    // Honeypot anti-spam trap
    if (!empty($input['website']) || !empty($input['honeypot'])) {
        sendError('Invalid submission', 400);
    }

    $name = substr(trim((string)($input['name'] ?? '')), 0, 191);
    $company = substr(trim((string)($input['company'] ?? '')), 0, 191);
    $country = substr(trim((string)($input['country'] ?? '')), 0, 100);
    $email = substr(trim(strtolower((string)($input['email'] ?? ''))), 0, 191);
    $phone = substr(trim((string)($input['phone'] ?? '')), 0, 100);
    $message = substr(trim((string)($input['message'] ?? '')), 0, 5000);

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
        sendError('Name, valid email, and message are required', 400);
    }

    $id = 'contact-' . bin2hex(random_bytes(6));

    try {
        $stmt = $db->prepare("
            INSERT INTO contact_requests (id, name, company, country, email, phone, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
        ");

        $stmt->execute([
            $id,
            $name,
            $company,
            $country,
            $email,
            $phone,
            $message
        ]);

        sendJson(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        error_log('Contact insert DB error: ' . $e->getMessage());
        sendError('Unable to submit message right now', 500);
    }
}

// 2. GET - List contact requests (Admin only)
if ($method === 'GET') {
    requireAuth();
    try {
        $stmt = $db->query("SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 500");
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
    } catch (PDOException $e) {
        error_log('Contact list DB error: ' . $e->getMessage());
        sendError('Failed to fetch contact requests', 500);
    }
}

// 3. PUT - Update contact status (Admin only)
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
    $status = (string)($input['status'] ?? 'new');
    $allowedStatuses = ['new', 'in-progress', 'closed'];

    if ($id === '') sendError('Contact ID is required', 400);
    if (!in_array($status, $allowedStatuses, true)) sendError('Invalid contact status', 400);

    try {
        $stmt = $db->prepare("UPDATE contact_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('Contact status DB error: ' . $e->getMessage());
        sendError('Failed to update contact status', 500);
    }
}

// 4. DELETE - Delete contact (Admin only)
if ($method === 'DELETE') {
    requireAuth();
    $id = trim((string)($_GET['id'] ?? ''));
    if ($id === '') {
        $input = getJsonInput();
        $id = trim((string)($input['id'] ?? ''));
    }
    if ($id === '') sendError('Contact ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM contact_requests WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true, 'deleted' => $stmt->rowCount(), 'id' => $id]);
    } catch (PDOException $e) {
        error_log('Contact delete DB error: ' . $e->getMessage());
        sendError('Failed to delete contact request', 500);
    }
}

sendError('Method not allowed', 405);
