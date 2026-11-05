<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List articles or single
if ($method === 'GET') {
    $slug = $_GET['slug'] ?? null;
    $id = $_GET['id'] ?? null;
    $all = isset($_GET['all']); // for admin

    if ($slug || $id) {
        $sql = "SELECT * FROM news WHERE " . ($slug ? "slug = ?" : "id = ?");
        $stmt = $db->prepare($sql);
        $stmt->execute([$slug ?: $id]);
        $row = $stmt->fetch();
        if (!$row) sendError('Article not found', 404);

        $row['gallery'] = json_decode($row['gallery'] ?: '[]', true);
        $row['tags'] = json_decode($row['tags'] ?: '[]', true);
        $row['published'] = (bool)$row['published'];
        sendJson(['success' => true, 'article' => $row]);
    }

    $where = $all ? "" : "WHERE published = 1";
    $stmt = $db->query("SELECT * FROM news $where ORDER BY published_at DESC, created_at DESC");
    $rows = $stmt->fetchAll();

    $articles = array_map(function($r) {
        $r['gallery'] = json_decode($r['gallery'] ?: '[]', true);
        $r['tags'] = json_decode($r['tags'] ?: '[]', true);
        $r['published'] = (bool)$r['published'];
        return $r;
    }, $rows);

    sendJson(['success' => true, 'articles' => $articles]);
}

// 2. POST - Create article
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();

    $id = !empty($input['id']) ? $input['id'] : 'news-' . bin2hex(random_bytes(6));
    $slug = trim($input['slug'] ?? '');
    if (empty($slug)) {
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($input['title'] ?? 'post')));
    }

    $stmt = $db->prepare("
        INSERT INTO news (
            id, slug, title, title_ar, excerpt, excerpt_ar,
            content, content_ar, featured_image, gallery,
            category, tags, author, video_url, published, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $id,
        $slug,
        $input['title'] ?? '',
        $input['title_ar'] ?? '',
        $input['excerpt'] ?? '',
        $input['excerpt_ar'] ?? '',
        $input['content'] ?? '',
        $input['content_ar'] ?? '',
        $input['featured_image'] ?? '',
        json_encode($input['gallery'] ?? [], JSON_UNESCAPED_UNICODE),
        $input['category'] ?? '',
        json_encode($input['tags'] ?? [], JSON_UNESCAPED_UNICODE),
        $input['author'] ?? 'BucharestEgyAgro',
        $input['video_url'] ?? '',
        isset($input['published']) ? ($input['published'] ? 1 : 0) : 1,
        !empty($input['published_at']) ? $input['published_at'] : date('Y-m-d H:i:s')
    ]);

    sendJson(['success' => true, 'id' => $id, 'slug' => $slug]);
}

// 3. PUT - Update article
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? $_GET['id'] ?? null;
    if (!$id) sendError('Article ID is required', 400);

    $stmt = $db->prepare("
        UPDATE news SET
            slug = ?,
            title = ?,
            title_ar = ?,
            excerpt = ?,
            excerpt_ar = ?,
            content = ?,
            content_ar = ?,
            featured_image = ?,
            gallery = ?,
            category = ?,
            tags = ?,
            author = ?,
            video_url = ?,
            published = ?,
            published_at = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $input['slug'] ?? 'post',
        $input['title'] ?? '',
        $input['title_ar'] ?? '',
        $input['excerpt'] ?? '',
        $input['excerpt_ar'] ?? '',
        $input['content'] ?? '',
        $input['content_ar'] ?? '',
        $input['featured_image'] ?? '',
        json_encode($input['gallery'] ?? [], JSON_UNESCAPED_UNICODE),
        $input['category'] ?? '',
        json_encode($input['tags'] ?? [], JSON_UNESCAPED_UNICODE),
        $input['author'] ?? 'BucharestEgyAgro',
        $input['video_url'] ?? '',
        isset($input['published']) ? ($input['published'] ? 1 : 0) : 1,
        !empty($input['published_at']) ? $input['published_at'] : date('Y-m-d H:i:s'),
        $id
    ]);

    sendJson(['success' => true]);
}

// 4. DELETE - Delete article
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) sendError('Article ID is required', 400);

    $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
