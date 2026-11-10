<?php
require_once __DIR__ . '/config.php';

// Uploads require admin authentication + upload rate limit
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

enforceRateLimit('upload', 30, 600, '', 'Too many uploads in a short period. Please wait a few minutes.');

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['file']['error'] ?? 'No file uploaded';
    sendError("File upload error code: $errCode", 400);
}

$file = $_FILES['file'];
if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
    sendError('Invalid file upload source', 400);
}

// 1. Clean folder parameter
$rawFolder = $_GET['folder'] ?? $_POST['folder'] ?? 'general';
$allowedFolders = ['branding', 'hero', 'about', 'partners', 'products', 'news', 'sections', 'general'];
$folder = in_array($rawFolder, $allowedFolders, true) ? $rawFolder : 'general';

// 2. Validate MIME type strictly (Disallow active/scriptable SVGs, HTML, PHP, executables)
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'video/mp4'  => 'mp4',
    'video/webm' => 'webm',
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = $finfo ? (string)finfo_file($finfo, $file['tmp_name']) : '';
if ($finfo) {
    finfo_close($finfo);
}

if (!isset($allowedMimes[$mimeType])) {
    sendError("Unsupported or unsafe file type '$mimeType'. Allowed: JPG, PNG, WebP, GIF, MP4, WebM.", 400);
}

$ext = $allowedMimes[$mimeType];
$isVideo = strpos($mimeType, 'video/') === 0;
$maxSize = $isVideo ? (25 * 1024 * 1024) : (10 * 1024 * 1024);

if ($file['size'] <= 0 || $file['size'] > $maxSize) {
    $limitMb = $isVideo ? 25 : 10;
    sendError("File size must be between 1 byte and {$limitMb} MB.", 400);
}

// 3. Verify file signature (magic bytes) matches detected MIME
if (!verifyUploadMagicBytes($file['tmp_name'], $mimeType)) {
    sendError('File signature does not match declared media type.', 400);
}

// 4. For images, verify image header integrity and prevent decompression-bomb DoS
if (!$isVideo) {
    $imgInfo = @getimagesize($file['tmp_name']);
    if (!$imgInfo || empty($imgInfo[0]) || empty($imgInfo[1])) {
        sendError('Invalid or corrupted image file.', 400);
    }
    $width = intval($imgInfo[0]);
    $height = intval($imgInfo[1]);
    if ($width > 8000 || $height > 8000 || ($width * $height) > 40000000) {
        sendError('Image resolution exceeds safe server limits (max 8000x8000).', 400);
    }
    $expectedImgTypes = [
        'image/jpeg' => IMAGETYPE_JPEG,
        'image/png' => IMAGETYPE_PNG,
        'image/webp' => defined('IMAGETYPE_WEBP') ? IMAGETYPE_WEBP : 18,
        'image/gif' => IMAGETYPE_GIF,
    ];
    if (isset($expectedImgTypes[$mimeType]) && intval($imgInfo[2]) !== $expectedImgTypes[$mimeType]) {
        sendError('Image format mismatch detected.', 400);
    }
}

// 5. Scan for embedded webshells, PHP tags, scripts, and executables
$malwareReason = scanUploadForMalware($file['tmp_name'], $mimeType);
if ($malwareReason !== null) {
    error_log('Blocked malicious upload from ' . getClientIp() . ': ' . $malwareReason);
    sendError($malwareReason, 400);
}

// 6. Ensure locked-down destination directory: public_html/uploads/{folder}/
$uploadBaseDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadBaseDir)) {
    @mkdir($uploadBaseDir, 0755, true);
}

$uploadsHtaccess = $uploadBaseDir . '/.htaccess';
if (!is_file($uploadsHtaccess)) {
    $htaccessRules = <<<'HTACCESS'
# Prevent execution of PHP, scripts, SVGs, or HTML inside /uploads/
<IfModule mod_autoindex.c>
  IndexIgnore *
</IfModule>

<FilesMatch "\.(?i:php|php[0-9]|phtml|phar|pl|py|rb|cgi|sh|bash|asp|aspx|jsp|html|htm|xhtml|svg|svgz|js|mjs|vbs|exe|dll|bat|cmd|msi|com|scr)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Content-Security-Policy "default-src 'none'"
</IfModule>
HTACCESS;
    @file_put_contents($uploadsHtaccess, $htaccessRules . "\n");
}

$uploadsIndex = $uploadBaseDir . '/index.php';
if (!is_file($uploadsIndex)) {
    @file_put_contents($uploadsIndex, "<?php http_response_code(403); exit;\n");
}

$targetDir = $uploadBaseDir . '/' . $folder;
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        sendError('Failed to create upload directory on server', 500);
    }
}

// 7. Generate safe filename (strictly sanitize fixed_name to prevent path traversal)
if ($folder === 'branding' && isset($_POST['fixed_name'])) {
    $cleanFixed = substr(preg_replace('/[^a-z0-9_-]/i', '', (string)$_POST['fixed_name']), 0, 50);
    $fileName = ($cleanFixed !== '' ? $cleanFixed : 'brand_' . bin2hex(random_bytes(4))) . '.' . $ext;
} else {
    $fileName = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
}

$targetPath = $targetDir . '/' . $fileName;

// 8. Save file cleanly (re-encodes JPG/PNG/WebP via GD when available to strip EXIF/payloads)
if (!saveSanitizedUpload($file['tmp_name'], $targetPath, $mimeType)) {
    sendError('Failed to save uploaded file', 500);
}

@chmod($targetPath, 0644);
$savedSize = @filesize($targetPath);

$publicUrl = '/uploads/' . $folder . '/' . $fileName;
$relativePath = $folder . '/' . $fileName;

sendJson([
    'success' => true,
    'url' => $publicUrl,
    'path' => $relativePath,
    'fileName' => $fileName,
    'size' => $savedSize !== false ? $savedSize : $file['size']
]);
