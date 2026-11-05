<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// 1. POST ?action=login
if ($method === 'POST' && $action === 'login') {
    $input = getJsonInput();
    $email = trim(strtolower($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError('Email and password are required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Invalid email or password', 401);
    }

    $token = generateToken($user['id'], $user['email'], $user['role']);

    sendJson([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'isAdmin' => true,
            'isSuperAdmin' => ($user['role'] === 'super_admin')
        ]
    ]);
}

// 2. GET ?action=me
if ($method === 'GET' && $action === 'me') {
    $authUser = requireAuth();
    $stmt = $db->prepare("SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$authUser['sub']]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError('User not found', 404);
    }

    sendJson([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'isAdmin' => true,
            'isSuperAdmin' => ($user['role'] === 'super_admin')
        ]
    ]);
}

// 3. GET ?action=users (List admins - super_admin only)
if ($method === 'GET' && $action === 'users') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }

    $stmt = $db->query("SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at ASC");
    $users = $stmt->fetchAll();

    sendJson([
        'success' => true,
        'users' => array_map(function($u) {
            return [
                'id' => $u['id'],
                'email' => $u['email'],
                'full_name' => $u['full_name'],
                'role' => $u['role'],
                'isAdmin' => true,
                'isSuperAdmin' => ($u['role'] === 'super_admin')
            ];
        }, $users)
    ]);
}

// 4. POST ?action=create-user
if ($method === 'POST' && $action === 'create-user') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }

    $input = getJsonInput();
    $email = trim(strtolower($input['email'] ?? ''));
    $password = $input['password'] ?? '';
    $fullName = trim($input['fullName'] ?? $input['full_name'] ?? '');
    $role = !empty($input['superAdmin']) ? 'super_admin' : 'admin';

    if (empty($email) || strlen($password) < 6) {
        sendError('Valid email and password (min 6 chars) are required', 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $id = 'usr-' . bin2hex(random_bytes(8));

    try {
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id, $email, $hash, $fullName, $role]);
        sendJson(['success' => true, 'id' => $id]);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            sendError('An account with this email already exists', 409);
        }
        sendError('Failed to create user', 500);
    }
}

// 5. DELETE ?action=delete-user&id=...
if ($method === 'DELETE' && $action === 'delete-user') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }

    $userId = $_GET['id'] ?? '';
    if (empty($userId)) sendError('User ID is required', 400);
    if ($userId === $authUser['sub']) sendError('Cannot delete your own account', 400);

    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    sendJson(['success' => true]);
}

// 6. POST ?action=set-password
if ($method === 'POST' && $action === 'set-password') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }
    $input = getJsonInput();
    $userId = $input['userId'] ?? '';
    $password = $input['password'] ?? '';
    if (empty($userId) || strlen($password) < 6) {
        sendError('User ID and valid password (min 6 chars) are required', 400);
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$hash, $userId]);
    sendJson(['success' => true]);
}

// 7. POST ?action=set-role
if ($method === 'POST' && $action === 'set-role') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }
    $input = getJsonInput();
    $userId = $input['userId'] ?? '';
    $role = !empty($input['value']) || ($input['role'] ?? '') === 'super_admin' ? 'super_admin' : 'admin';
    if (empty($userId)) sendError('User ID is required', 400);
    $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->execute([$role, $userId]);
    sendJson(['success' => true]);
}

// 8. GET ?action=permissions&userId=...
if ($method === 'GET' && $action === 'permissions') {
    requireAuth();
    $userId = $_GET['userId'] ?? '';
    if (empty($userId)) sendError('User ID is required', 400);
    $stmt = $db->prepare("SELECT module_key, can_view, can_create, can_edit, can_delete FROM user_permissions WHERE user_id = ?");
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();
    sendJson(['success' => true, 'permissions' => $rows]);
}

// 9. POST ?action=save-permissions
if ($method === 'POST' && $action === 'save-permissions') {
    $authUser = requireAuth();
    if ($authUser['role'] !== 'super_admin') {
        sendError('Super admin permission required', 403);
    }
    $input = getJsonInput();
    $userId = $input['userId'] ?? '';
    $perms = $input['permissions'] ?? [];
    if (empty($userId)) sendError('User ID is required', 400);

    foreach ($perms as $p) {
        $key = $p['module_key'] ?? '';
        if (!$key) continue;
        $stmt = $db->prepare("
            INSERT INTO user_permissions (id, user_id, module_key, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                can_view = VALUES(can_view),
                can_create = VALUES(can_create),
                can_edit = VALUES(can_edit),
                can_delete = VALUES(can_delete)
        ");
        $id = 'perm-' . bin2hex(random_bytes(8));
        $stmt->execute([
            $id,
            $userId,
            $key,
            !empty($p['can_view']) ? 1 : 0,
            !empty($p['can_create']) ? 1 : 0,
            !empty($p['can_edit']) ? 1 : 0,
            !empty($p['can_delete']) ? 1 : 0,
        ]);
    }
    sendJson(['success' => true]);
}

sendError('Invalid action', 400);
