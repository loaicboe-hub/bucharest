<?php
/**
 * BucharestEgyAgro - Database Installer (Locked after initialization)
 */
require_once __DIR__ . '/config.php';

try {
    $db = getDB();

    // Prevent unauthenticated re-installation or password reset once initialized
    try {
        $existingUsers = (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn();
        if ($existingUsers > 0) {
            sendError('Installer is locked because the database is already initialized.', 403);
        }
    } catch (PDOException $ignored) {
        // Table does not exist yet on a clean initial server; allow one-time setup
    }

    $sqlFile = null;
    $possiblePaths = [
        __DIR__ . '/database.sql',
        __DIR__ . '/../database.sql',
        __DIR__ . '/../hostinger/database.sql',
        __DIR__ . '/../public/database.sql'
    ];

    foreach ($possiblePaths as $p) {
        if (file_exists($p)) {
            $sqlFile = $p;
            break;
        }
    }

    if (!$sqlFile) {
        sendError('Database schema file not found.', 500);
    }

    $sql = file_get_contents($sqlFile);
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
    $db->exec($sql);

    sendJson(['success' => true, 'message' => 'Database initialized successfully. Installer is now locked.']);
} catch (Exception $e) {
    error_log('Installer error: ' . $e->getMessage());
    sendError('Database initialization failed.', 500);
}
