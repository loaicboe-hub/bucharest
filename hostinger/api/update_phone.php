<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$phone = '+20 107 003 3892';

$stmt = $db->prepare("UPDATE site_settings SET phone = ?, whatsapp = ? WHERE id = 'default'");
$stmt->execute([$phone, $phone]);

sendJson([
    'success' => true,
    'message' => 'Phone and WhatsApp updated successfully to ' . $phone,
    'phone' => $phone,
    'whatsapp' => $phone
]);

