<?php
/**
 * BucharestEgyAgro - Hostinger PHP Backend Configuration
 * Compatible with PHP 7.4+ and 8.x
 */

// 1. Error Reporting (Turn off display in production)
ini_set('display_errors', '0');
error_reporting(E_ALL);

// 2. Database Credentials & JWT Secret
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u724931489_bucharestegy');
define('DB_USER', getenv('DB_USER') ?: 'u724931489_bucharestegy');
define('DB_PASS', getenv('DB_PASS') ?: 'Bucharestegyagro@2027');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'bea_jwt_2026_x9K!mQ7pL2$vR8@zN4wF6*cT1^yH5_hcdn');

// 3. Strict CORS Allowlist & Security Headers
$origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
$allowedOrigins = [
    'https://bucharestegyagro.com',
    'https://www.bucharestegyagro.com',
    'http://bucharestegyagro.com',
    'http://www.bucharestegyagro.com',
];
$currentHost = trim((string)($_SERVER['HTTP_HOST'] ?? ''));
$isLocalOrigin = $origin !== '' && preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin) === 1;
$matchesHost = $origin !== '' && $currentHost !== '' && preg_match('#^https?://' . preg_quote($currentHost, '#') . '$#i', $origin) === 1;

if ($origin !== '' && (in_array(strtolower($origin), $allowedOrigins, true) || $isLocalOrigin || $matchesHost)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
header("Content-Type: application/json; charset=UTF-8");

// 4. Response Helpers
function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError($message, $status = 400) {
    sendJson(['success' => false, 'error' => $message], $status);
}

// 5. Load WAF, Rate Limiter, Anti-DoS & Malware Guard and enforce on every request
require_once __DIR__ . '/security.php';
enforceRequestSecurity();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 6. PDO Database Connection Singleton
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
            error_log('BucharestEgyAgro DB error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database service temporarily unavailable'
            ]);
            exit;
        }
    }
    return $pdo;
}

/**
 * Bounded JSON body reader (prevents large-payload memory exhaustion DoS).
 */
function getJsonInput($maxBytes = 1048576) {
    $stream = @fopen('php://input', 'rb');
    if (!$stream) {
        return [];
    }

    $raw = '';
    $limit = $maxBytes + 1;
    while (!feof($stream) && strlen($raw) < $limit) {
        $chunk = fread($stream, min(65536, $limit - strlen($raw)));
        if ($chunk === false || $chunk === '') {
            break;
        }
        $raw .= $chunk;
    }
    fclose($stream);

    if (strlen($raw) > $maxBytes) {
        sendError('Request payload exceeds maximum allowed size', 413);
    }

    if ($raw === '') {
        return [];
    }

    $data = json_decode($raw, true, 32);
    return is_array($data) ? $data : [];
}

// 7. Hardened HS256 JWT Authentication
function generateToken($userId, $email, $role) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'sub' => $userId,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + (86400 * 14) // 14 days
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
    return "$header.$payload." . base64_encode($signature);
}

function verifyToken() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? '';
    }
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = trim((string)$authHeader);
    }
    if ($token !== '' && strlen($token) <= 2048) {
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            list($b64Header, $b64Payload, $b64Sign) = $parts;
            $header = json_decode((string)base64_decode($b64Header, true), true);
            if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256' || ($header['typ'] ?? '') !== 'JWT') {
                return null;
            }
            $sig = base64_decode($b64Sign, true);
            $expected = hash_hmac('sha256', "$b64Header.$b64Payload", JWT_SECRET, true);
            if (is_string($sig) && hash_equals($expected, $sig)) {
                $payload = json_decode((string)base64_decode($b64Payload, true), true);
                if (
                    is_array($payload) &&
                    !empty($payload['sub']) &&
                    !empty($payload['role']) &&
                    isset($payload['exp']) &&
                    intval($payload['exp']) > time()
                ) {
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
