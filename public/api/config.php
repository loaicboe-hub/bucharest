<?php
/**
 * BucharestEgyAgro - Hostinger PHP Backend Configuration
 * Compatible with PHP 7.4+ and 8.x
 */

// 1. Error Reporting (Turn off display in production)
ini_set('display_errors', '0');
error_reporting(E_ALL);

// 2. CORS & Cache-Control Headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3. Database Credentials (Configured with your Hostinger MySQL details)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u724931489_bucharestegy');
define('DB_USER', getenv('DB_USER') ?: 'u724931489_bucharestegy');
define('DB_PASS', getenv('DB_PASS') ?: 'Bucharestegyagro@2027');
define('JWT_SECRET', 'bucharestegyagro_super_secret_jwt_key_2026_xyz');

// 4. PDO Database Connection Singleton
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    return $pdo;
}

// 5. Response Helpers
function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError($message, $status = 400) {
    sendJson(['success' => false, 'error' => $message], $status);
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// 6. Simple & Secure Bearer Token Authentication
function generateToken($userId, $email, $role) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'sub' => $userId,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + (86400 * 30) // 30 days
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
    return "$header.$payload." . base64_encode($signature);
}

function verifyToken() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? $_GET['token'] ?? '';
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? '';
    }
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = trim($authHeader);
    }
    if ($token) {
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            list($b64Header, $b64Payload, $b64Sign) = $parts;
            $sig = base64_decode($b64Sign);
            $expected = hash_hmac('sha256', "$b64Header.$b64Payload", JWT_SECRET, true);
            if (hash_equals($expected, $sig)) {
                $payload = json_decode(base64_decode($b64Payload), true);
                if ($payload && isset($payload['exp']) && $payload['exp'] > time()) {
                    return $payload;
                }
            }
        }
    }
    return null;
}

function requireAuth() {
    $user = verifyToken();
    if (!$user) {
        sendError('Unauthorized access. Please log in.', 401);
    }
    return $user;
}
