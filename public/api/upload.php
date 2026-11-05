<?php
require_once __DIR__ . '/config.php';

// Uploads require admin authentication
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['file']['error'] ?? 'No file uploaded';
    sendError("File upload error code: $errCode", 400);
}

$file = $_FILES['file'];
$maxSize = 25 * 1024 * 1024; // 25 MB max (allows about-video or high-res images)

if ($file['size'] > $maxSize) {
    sendError('File size exceeds the 25 MB limit', 400);
}

// 1. Clean folder parameter
$rawFolder = $_GET['folder'] ?? $_POST['folder'] ?? 'general';
$allowedFolders = ['branding', 'hero', 'about', 'partners', 'products', 'news', 'sections', 'general'];
$folder = in_array($rawFolder, $allowedFolders, true) ? $rawFolder : 'general';

// 2. Validate file type
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/svg+xml' => 'svg',
    'application/pdf' => 'pdf',
    'video/mp4'  => 'mp4',
    'video/webm' => 'webm',
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset($allowedMimes[$mimeType])) {
    sendError("File type '$mimeType' is not supported. Please upload JPG, PNG, WebP, SVG, PDF or MP4.", 400);
}

$ext = $allowedMimes[$mimeType];

// 3. Destination directory: public_html/uploads/{folder}/
$uploadBaseDir = dirname(__DIR__) . '/uploads';
$targetDir = $uploadBaseDir . '/' . $folder;

if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        sendError('Failed to create upload directory on server', 500);
    }
}

// 4. Generate unique filename (or respect fixed branding names)
if ($folder === 'branding' && isset($_POST['fixed_name'])) {
    $fileName = preg_replace('/[^a-z0-9_-]/i', '', $_POST['fixed_name']) . '.' . $ext;
} else {
    $fileName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
}

$targetPath = $targetDir . '/' . $fileName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    sendError('Failed to save uploaded file', 500);
}

// Public relative URL
$publicUrl = '/uploads/' . $folder . '/' . $fileName;
$relativePath = $folder . '/' . $fileName;

sendJson([
    'success' => true,
    'url' => $publicUrl,
    'path' => $relativePath,
    'fileName' => $fileName,
    'size' => $file['size']
]);
