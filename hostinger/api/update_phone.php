<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$authUser = requireAuth();
if (($authUser['role'] ?? '') !== 'super_admin') {
    sendError('Super admin permission required', 403);
}

$db = getDB();
$phone = '+20 107 003 3892';

$stmt = $db->prepare("UPDATE site_settings SET phone = ?, whatsapp = ? WHERE id = 'default'");
$stmt->execute([$phone, $phone]);

sendJson([
    'success' => true,
    'message' => 'Phone and WhatsApp updated successfully',
    'phone' => $phone,
    'whatsapp' => $phone
]);
