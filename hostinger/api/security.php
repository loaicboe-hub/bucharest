<?php
/**
 * BucharestEgyAgro - Hostinger WAF, Rate Limiter, Anti-DoS & Malware Guard
 * Compatible with PHP 7.4+ and 8.x (Zero external dependencies)
 */

if (defined('BEA_SECURITY_LOADED')) {
    return;
}
define('BEA_SECURITY_LOADED', true);

/**
 * Resolve real client IP safely without letting attackers bypass limits
 * by spoofing X-Forwarded-For headers directly.
 */
function getClientIp(): string {
    $remote = trim((string)($_SERVER['REMOTE_ADDR'] ?? ''));

    // If REMOTE_ADDR is missing, loopback, or private (behind Hostinger reverse proxy),
    // safely extract the rightmost valid public IP appended by the proxy.
    $isRemotePublic = $remote !== '' && filter_var(
        $remote,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    ) !== false;

    if ($isRemotePublic) {
        return $remote;
    }

    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $cf = trim((string)$_SERVER['HTTP_CF_CONNECTING_IP']);
        if (filter_var($cf, FILTER_VALIDATE_IP)) {
            return $cf;
        }
    }

    if (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $xri = trim((string)$_SERVER['HTTP_X_REAL_IP']);
        if (filter_var($xri, FILTER_VALIDATE_IP)) {
            return $xri;
        }
    }

    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = array_reverse(array_map('trim', explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR'])));
        foreach ($parts as $candidate) {
            if (filter_var($candidate, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $candidate;
            }
        }
        foreach ($parts as $candidate) {
            if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }
    }

    return $remote !== '' ? $remote : '0.0.0.0';
}

/**
 * Directory for atomic rate-limit state outside public webroot when possible.
 */
function getSecurityStateDir(): string {
    $tmpBase = rtrim((string)sys_get_temp_dir(), '/\\');
    if ($tmpBase !== '' && is_dir($tmpBase) && is_writable($tmpBase)) {
        $dir = $tmpBase . '/bea_security_state_v1';
    } else {
        $dir = dirname(__DIR__) . '/uploads/.security_state';
    }

    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
        if (strpos($dir, '/uploads/') !== false) {
            @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
        }
    }
    return $dir;
}

function securityBucketSecret(): string {
    return defined('JWT_SECRET') ? (string)JWT_SECRET : 'bea_bucket_fallback_secret_2026';
}

function sendSecurityError(string $message, int $status = 403, array $extraHeaders = []): void {
    foreach ($extraHeaders as $name => $value) {
        header("$name: $value");
    }
    if (function_exists('sendError')) {
        sendError($message, $status);
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Clean up expired rate-limit files ~1% of requests so IP-rotation floods never fill disk.
 */
function gcSecurityState(string $dir, int $maxAge = 3600): void {
    if (@mt_rand(1, 100) !== 1) {
        return;
    }
    $files = @glob($dir . '/*.rl');
    if (!is_array($files)) {
        return;
    }
    $cutoff = time() - $maxAge;
    $checked = 0;
    foreach ($files as $file) {
        if (++$checked > 250) {
            break;
        }
        $mtime = @filemtime($file);
        if ($mtime !== false && $mtime < $cutoff) {
            @unlink($file);
        }
    }
}

/**
 * Sliding-window atomic rate limiter using flock.
 *
 * @return array{allowed:bool,remaining:int,reset:int,retryAfter:int,limit:int}
 */
function checkRateLimit(string $bucket, int $maxRequests, int $windowSeconds, string $subject = '', bool $increment = true): array {
    $dir = getSecurityStateDir();
    gcSecurityState($dir, max(3600, $windowSeconds * 2));

    $key = hash_hmac('sha256', $bucket . '|' . ($subject !== '' ? $subject : getClientIp()), securityBucketSecret());
    $path = $dir . '/' . $key . '.rl';
    $now = time();
    $windowStart = $now - $windowSeconds;

    $fp = @fopen($path, 'c+');
    if (!$fp) {
        // Fail open gracefully if filesystem is temporarily read-only
        return ['allowed' => true, 'remaining' => $maxRequests, 'reset' => $now + $windowSeconds, 'retryAfter' => 0, 'limit' => $maxRequests];
    }

    $timestamps = [];
    $allowed = true;
    $retryAfter = 0;

    if (@flock($fp, LOCK_EX)) {
        rewind($fp);
        $raw = stream_get_contents($fp);
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                foreach ($decoded as $ts) {
                    $tsInt = intval($ts);
                    if ($tsInt > $windowStart) {
                        $timestamps[] = $tsInt;
                    }
                }
            }
        }

        if (count($timestamps) >= $maxRequests) {
            $allowed = false;
            $oldest = $timestamps[0] ?? $now;
            $retryAfter = max(1, ($oldest + $windowSeconds) - $now);
        } elseif ($increment) {
            $timestamps[] = $now;
        }

        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, json_encode($timestamps));
        fflush($fp);
        @flock($fp, LOCK_UN);
    }
    fclose($fp);

    $remaining = max(0, $maxRequests - count($timestamps));
    $reset = ($timestamps[0] ?? $now) + $windowSeconds;

    return [
        'allowed' => $allowed,
        'remaining' => $remaining,
        'reset' => $reset,
        'retryAfter' => $retryAfter,
        'limit' => $maxRequests,
    ];
}

function recordRateLimitStrike(string $ip): int {
    $res = checkRateLimit('abuse_strikes', 12, 600, $ip, true);
    return $res['allowed'] ? 0 : $res['retryAfter'];
}

function enforceRateLimit(string $bucket, int $maxRequests, int $windowSeconds, string $subject = '', string $errorMessage = ''): void {
    $ip = getClientIp();

    // Check temporary auto-ban for sustained rate-limit abusers (unless explicitly checking strikes)
    $strikeCheck = checkRateLimit('abuse_strikes', 12, 600, $ip, false);
    if (!$strikeCheck['allowed']) {
        $retry = max(60, $strikeCheck['retryAfter']);
        sendSecurityError(
            'Too many repeated requests from your network. Temporarily blocked for protection.',
            429,
            [
                'Retry-After' => (string)$retry,
                'X-RateLimit-Limit' => '0',
                'X-RateLimit-Remaining' => '0',
            ]
        );
    }

    $result = checkRateLimit($bucket, $maxRequests, $windowSeconds, $subject, true);

    header('X-RateLimit-Limit: ' . $result['limit']);
    header('X-RateLimit-Remaining: ' . $result['remaining']);
    header('X-RateLimit-Reset: ' . $result['reset']);

    if (!$result['allowed']) {
        recordRateLimitStrike($ip);
        $msg = $errorMessage !== '' ? $errorMessage : "Rate limit exceeded. Please wait {$result['retryAfter']} seconds and try again.";
        sendSecurityError($msg, 429, ['Retry-After' => (string)$result['retryAfter']]);
    }
}

/**
 * Login brute-force protection helpers (tracks failures per IP+email and global email).
 */
function enforceLoginRateLimit(string $email): void {
    $ip = getClientIp();
    $cleanEmail = strtolower(trim($email));

    enforceRateLimit(
        'login_ip',
        12,
        300,
        $ip,
        'Too many login attempts from this IP. Please wait a few minutes before trying again.'
    );

    if ($cleanEmail !== '') {
        $pairFail = checkRateLimit('login_fail_pair', 5, 900, $ip . '|' . $cleanEmail, false);
        if (!$pairFail['allowed']) {
            sendSecurityError(
                "Account temporarily locked after repeated failed attempts. Retry in {$pairFail['retryAfter']} seconds.",
                429,
                ['Retry-After' => (string)$pairFail['retryAfter']]
            );
        }

        $emailFail = checkRateLimit('login_fail_email', 25, 900, $cleanEmail, false);
        if (!$emailFail['allowed']) {
            sendSecurityError(
                'Login temporarily throttled due to unusual activity. Please try again later.',
                429,
                ['Retry-After' => (string)$emailFail['retryAfter']]
            );
        }
    }
}

function recordFailedLoginAttempt(string $email): void {
    $ip = getClientIp();
    $cleanEmail = strtolower(trim($email));
    if ($cleanEmail !== '') {
        checkRateLimit('login_fail_pair', 5, 900, $ip . '|' . $cleanEmail, true);
        checkRateLimit('login_fail_email', 25, 900, $cleanEmail, true);
    }
    usleep(random_int(150000, 300000));
}

function clearFailedLoginAttempts(string $email): void {
    $ip = getClientIp();
    $cleanEmail = strtolower(trim($email));
    if ($cleanEmail === '') {
        return;
    }
    $dir = getSecurityStateDir();
    $key = hash_hmac('sha256', 'login_fail_pair|' . $ip . '|' . $cleanEmail, securityBucketSecret());
    @unlink($dir . '/' . $key . '.rl');
}

/**
 * Request firewall & global anti-DoS checks executed on every API request before DB connect.
 */
function enforceRequestSecurity(): void {
    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
    if (!in_array($method, $allowedMethods, true)) {
        sendSecurityError('HTTP method not allowed', 405);
    }

    // URI length DoS guard
    $uri = (string)($_SERVER['REQUEST_URI'] ?? '');
    if (strlen($uri) > 2048) {
        sendSecurityError('Request URI too long', 414);
    }

    // Block automated vulnerability scanners and exploit bots
    $ua = strtolower((string)($_SERVER['HTTP_USER_AGENT'] ?? ''));
    $blockedUas = ['sqlmap', 'nikto', 'nmap', 'nessus', 'acunetix', 'masscan', 'zgrab', 'gobuster', 'dirbuster', 'wfuzz', 'havij', 'hydra', 'libwww-perl'];
    foreach ($blockedUas as $badUa) {
        if ($ua !== '' && strpos($ua, $badUa) !== false) {
            sendSecurityError('Forbidden', 403);
        }
    }

    // Query string / URI exploit & injection filter (null bytes, traversal, wrappers, XSS, SQLi probes)
    $decodedUri = rawurldecode($uri);
    $queryStr = rawurldecode((string)($_SERVER['QUERY_STRING'] ?? ''));
    foreach ([$decodedUri, $queryStr] as $inspect) {
        if (strpos($inspect, "\0") !== false) {
            sendSecurityError('Malformed request', 400);
        }
        if (preg_match('/(\.\.[\/\\\\]|php:\/\/|phar:\/\/|expect:\/\/|zip:\/\/|<script\b|javascript:|vbscript:|\bunion\b[\s\+\/\*]+(?:all[\s\+\/\*]+)?\bselect\b|\bbenchmark\s*\(|\bsleep\s*\(|\binto\s+(?:out|dump)file\b)/i', $inspect)) {
            sendSecurityError('Blocked potentially malicious request pattern', 403);
        }
    }

    // Content-Length limit before reading request body (Upload allows up to 26MB; all JSON/other endpoints max 1MB)
    $scriptName = basename((string)($_SERVER['SCRIPT_NAME'] ?? ''));
    $maxBodyBytes = ($scriptName === 'upload.php') ? (26 * 1024 * 1024) : (1024 * 1024);
    if (isset($_SERVER['CONTENT_LENGTH'])) {
        $contentLength = intval($_SERVER['CONTENT_LENGTH']);
        if ($contentLength > $maxBodyBytes) {
            sendSecurityError('Request payload exceeds maximum allowed size', 413);
        }
    }

    // Preflight CORS OPTIONS gets generous burst limit and returns early
    if ($method === 'OPTIONS') {
        enforceRateLimit('api_options', 180, 60);
        return;
    }

    // Global per-IP API burst ceiling across all scripts
    enforceRateLimit('api_global', 120, 60);

    // Separate coarse limits for reads vs writes
    if ($method === 'GET' || $method === 'HEAD') {
        enforceRateLimit('api_read', 90, 60);
    } else {
        enforceRateLimit('api_write', 60, 60);
    }
}

/**
 * URL Sanitizer - blocks javascript:, vbscript:, data:text/html, control chars.
 */
function sanitizeSafeUrl(string $url, bool $allowRelative = true): string {
    $clean = trim($url);
    if ($clean === '') {
        return '';
    }

    // Remove ASCII control characters (prevents java\tscript: smuggling)
    $stripped = preg_replace('/[\x00-\x1F\x7F]+/', '', $clean);
    if (!is_string($stripped) || $stripped === '') {
        return '';
    }

    if ($allowRelative && $stripped[0] === '/' && (strlen($stripped) === 1 || $stripped[1] !== '/')) {
        return $stripped;
    }

    $parts = @parse_url($stripped);
    if (!is_array($parts) || empty($parts['scheme'])) {
        return '';
    }

    $scheme = strtolower($parts['scheme']);
    if ($scheme === 'http' || $scheme === 'https') {
        return $stripped;
    }

    return '';
}

/**
 * HTML Sanitizer - removes dangerous scripts, iframes, embeds, SVG, forms, event handlers, and unsafe URLs.
 */
function sanitizeSafeHtml(string $html): string {
    $html = trim($html);
    if ($html === '') {
        return '';
    }

    if (!class_exists('DOMDocument')) {
        // Fallback regex strip if DOM extension is absent
        $html = preg_replace('#<(script|style|iframe|object|embed|svg|math|form|meta|link|base)\b[^>]*>.*?</\1>#is', '', $html);
        $html = preg_replace('#<(script|style|iframe|object|embed|svg|math|form|meta|link|base)\b[^>]*/?>#is', '', $html);
        $html = preg_replace('/\son[a-z]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html);
        $html = preg_replace('/(href|src)\s*=\s*(["\'])\s*(?:javascript|vbscript|data):[^"\']*\2/i', '$1=""', $html);
        return is_string($html) ? $html : '';
    }

    $allowedTags = [
        'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
        'pre', 'code', 'hr', 'span', 'div', 'a', 'img', 'table', 'thead',
        'tbody', 'tr', 'th', 'td'
    ];
    $dropCompletely = ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'svg', 'math', 'form', 'input', 'button', 'textarea', 'select', 'option', 'meta', 'link', 'base'];
    $allowedAttrs = [
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'title', 'width', 'height'],
    ];

    $prevErrors = libxml_use_internal_errors(true);
    $dom = new DOMDocument('1.0', 'UTF-8');
    $wrapped = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body><div id="__bea_root__">' . $html . '</div></body></html>';
    $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    libxml_use_internal_errors($prevErrors);

    $root = $dom->getElementById('__bea_root__');
    if (!$root) {
        return '';
    }

    $walk = function (DOMNode $node) use (&$walk, $allowedTags, $dropCompletely, $allowedAttrs): void {
        $children = [];
        foreach ($node->childNodes as $child) {
            $children[] = $child;
        }
        foreach ($children as $child) {
            if ($child->nodeType === XML_COMMENT_NODE) {
                $node->removeChild($child);
                continue;
            }
            if ($child->nodeType === XML_ELEMENT_NODE && $child instanceof DOMElement) {
                $tag = strtolower($child->tagName);
                if (in_array($tag, $dropCompletely, true)) {
                    $node->removeChild($child);
                    continue;
                }
                if (!in_array($tag, $allowedTags, true)) {
                    // Unwrap disallowed benign containers cleanly while preserving sanitized children
                    $walk($child);
                    while ($child->firstChild) {
                        $node->insertBefore($child->firstChild, $child);
                    }
                    $node->removeChild($child);
                    continue;
                }

                // Filter attributes strictly
                $allowedForTag = $allowedAttrs[$tag] ?? [];
                $toRemove = [];
                foreach ($child->attributes as $attr) {
                    $attrName = strtolower($attr->nodeName);
                    if (!in_array($attrName, $allowedForTag, true)) {
                        $toRemove[] = $attr->nodeName;
                    }
                }
                foreach ($toRemove as $attrName) {
                    $child->removeAttribute($attrName);
                }

                if ($tag === 'a' && $child->hasAttribute('href')) {
                    $safeHref = sanitizeSafeUrl($child->getAttribute('href'), true);
                    if ($safeHref === '') {
                        $child->removeAttribute('href');
                    } else {
                        $child->setAttribute('href', $safeHref);
                    }
                    if (strtolower($child->getAttribute('target')) === '_blank') {
                        $child->setAttribute('rel', 'noopener noreferrer');
                    } else {
                        $child->removeAttribute('target');
                    }
                }

                if ($tag === 'img' && $child->hasAttribute('src')) {
                    $safeSrc = sanitizeSafeUrl($child->getAttribute('src'), true);
                    if ($safeSrc === '') {
                        $node->removeChild($child);
                        continue;
                    }
                    $child->setAttribute('src', $safeSrc);
                }

                $walk($child);
            }
        }
    };

    $walk($root);

    $out = '';
    foreach ($root->childNodes as $child) {
        $out .= $dom->saveHTML($child);
    }
    return trim($out);
}

/**
 * Verify file magic bytes match detected MIME type.
 */
function verifyUploadMagicBytes(string $tmpPath, string $mimeType): bool {
    $fp = @fopen($tmpPath, 'rb');
    if (!$fp) {
        return false;
    }
    $head = fread($fp, 32);
    fclose($fp);
    if (!is_string($head) || strlen($head) < 4) {
        return false;
    }

    switch ($mimeType) {
        case 'image/jpeg':
            return substr($head, 0, 3) === "\xFF\xD8\xFF";
        case 'image/png':
            return substr($head, 0, 8) === "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";
        case 'image/webp':
            return strlen($head) >= 12 && substr($head, 0, 4) === 'RIFF' && substr($head, 8, 4) === 'WEBP';
        case 'image/gif':
            return substr($head, 0, 6) === 'GIF87a' || substr($head, 0, 6) === 'GIF89a';
        case 'video/mp4':
            return strlen($head) >= 12 && substr($head, 4, 4) === 'ftyp';
        case 'video/webm':
            return substr($head, 0, 4) === "\x1A\x45\xDF\xA3";
        default:
            return false;
    }
}

/**
 * Scan uploaded file for executables, webshells, PHP tags, and script payloads.
 * Returns null if clean, or a rejection reason string.
 */
function scanUploadForMalware(string $tmpPath, string $mimeType): ?string {
    $size = @filesize($tmpPath);
    if ($size === false || $size <= 0) {
        return 'Uploaded file is empty or unreadable.';
    }

    $fp = @fopen($tmpPath, 'rb');
    if (!$fp) {
        return 'Unable to inspect uploaded file.';
    }

    $head = fread($fp, 16);
    if (!is_string($head)) {
        fclose($fp);
        return 'Unable to read file header.';
    }

    // Block executable/script file headers regardless of extension
    if (
        substr($head, 0, 2) === 'MZ' ||
        substr($head, 0, 4) === "\x7FELF" ||
        substr($head, 0, 2) === '#!' ||
        stripos($head, '<?php') !== false ||
        strpos($head, '<?=') !== false ||
        substr($head, 0, 4) === "\xCA\xFE\xBA\xBE"
    ) {
        fclose($fp);
        return 'Blocked suspicious executable or script payload.';
    }

    // Deep signature scan across the full file for images (and first 2MB + tail for videos).
    // Tightened against random 3-byte binary collisions (e.g. accidental 0x3C3F3D "<?=" in compressed JPEG/PNG/WebP entropy).
    $isVideo = strpos($mimeType, 'video/') === 0;
    $patterns = [
        '/<\?php(?:\s|\/\*|\/\/|#|;|@|\$|[a-z_][a-z0-9_]*\s*\()/i',
        '/<\?=[ \t\r\n]*[\x20-\x7E\r\n\t]{1,256}\?>/',
        '/<\?=[ \t\r\n]*(?:`|\$_|\$\{?[a-z_][a-z0-9_]*\}?|(?:eval|assert|system|exec|shell_exec|passthru|proc_open|popen|base64_decode|gzinflate|str_rot13|include|require|include_once|require_once|phpinfo|echo|print)\b)/i',
        '/<script(?:[ \t\r\n]+[\x20-\x7E\r\n\t]{0,256}|[ \t\r\n]*)>/i',
        '/<\/script\s*>/i',
        '/\b(?:shell_exec|passthru|proc_open|base64_decode|gzinflate)\s*\(/i',
        '/\beval\s*\(\s*\$_(?:GET|POST|REQUEST|COOKIE|SERVER|FILES|ENV)\b/i',
        '/\b__halt_compiler\s*\(/i',
    ];

    rewind($fp);
    $chunkSize = 524288; // 512 KB
    $overlap = '';
    $bytesScanned = 0;
    $maxScanBytes = $isVideo ? (2 * 1024 * 1024) : (12 * 1024 * 1024);

    while (!feof($fp) && $bytesScanned < $maxScanBytes) {
        $chunk = fread($fp, $chunkSize);
        if (!is_string($chunk) || $chunk === '') {
            break;
        }
        $bytesScanned += strlen($chunk);
        $haystack = $overlap . $chunk;
        foreach ($patterns as $regex) {
            if (preg_match($regex, $haystack)) {
                fclose($fp);
                return 'Malware or embedded script signature detected in uploaded file.';
            }
        }
        $overlap = substr($chunk, -512);
    }

    // For video files, also inspect the final 512 KB tail for appended PHP/script stubs
    if ($isVideo && $size > $bytesScanned) {
        fseek($fp, max(0, $size - $chunkSize));
        $tail = fread($fp, $chunkSize);
        if (is_string($tail)) {
            foreach ($patterns as $regex) {
                if (preg_match($regex, $tail)) {
                    fclose($fp);
                    return 'Malware or embedded script signature detected in uploaded file.';
                }
            }
        }
    }

    fclose($fp);
    return null;
}

/**
 * Strip EXIF/metadata/trailing polyglot payloads by re-encoding raster images via GD when available.
 */
function saveSanitizedUpload(string $tmpPath, string $targetPath, string $mimeType): bool {
    if (strpos($mimeType, 'image/') !== 0 || !extension_loaded('gd')) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    // Preserve animated GIFs after strict signature + getimagesize validation
    if ($mimeType === 'image/gif') {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    $img = null;
    if ($mimeType === 'image/jpeg' && function_exists('imagecreatefromjpeg')) {
        $img = @imagecreatefromjpeg($tmpPath);
    } elseif ($mimeType === 'image/png' && function_exists('imagecreatefrompng')) {
        $img = @imagecreatefrompng($tmpPath);
    } elseif ($mimeType === 'image/webp' && function_exists('imagecreatefromwebp')) {
        $img = @imagecreatefromwebp($tmpPath);
    }

    if (!$img) {
        return move_uploaded_file($tmpPath, $targetPath);
    }

    $ok = false;
    if ($mimeType === 'image/jpeg' && function_exists('imagejpeg')) {
        $ok = @imagejpeg($img, $targetPath, 90);
    } elseif ($mimeType === 'image/png' && function_exists('imagepng')) {
        if (function_exists('imagepalettetotruecolor') && function_exists('imageistruecolor') && !@imageistruecolor($img)) {
            @imagepalettetotruecolor($img);
        }
        @imagealphablending($img, false);
        @imagesavealpha($img, true);
        $ok = @imagepng($img, $targetPath, 6);
    } elseif ($mimeType === 'image/webp' && function_exists('imagewebp')) {
        if (function_exists('imagepalettetotruecolor') && function_exists('imageistruecolor') && !@imageistruecolor($img)) {
            @imagepalettetotruecolor($img);
        }
        @imagealphablending($img, false);
        @imagesavealpha($img, true);
        $ok = @imagewebp($img, $targetPath, 90);
    }

    @imagedestroy($img);

    if ($ok && is_file($targetPath)) {
        @unlink($tmpPath);
        return true;
    }

    return move_uploaded_file($tmpPath, $targetPath);
}
