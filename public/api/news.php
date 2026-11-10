<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List articles or single
if ($method === 'GET') {
    try {
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
            $row['content'] = sanitizeSafeHtml((string)($row['content'] ?? ''));
            $row['content_ar'] = sanitizeSafeHtml((string)($row['content_ar'] ?? ''));
            $row['published'] = (bool)$row['published'];
            sendJson(['success' => true, 'article' => $row]);
        }

        $where = $all ? "" : "WHERE published = 1";
        $stmt = $db->query("SELECT * FROM news $where ORDER BY published_at DESC, created_at DESC LIMIT 200");
        $rows = $stmt->fetchAll();

        $articles = array_map(function($r) {
            $r['gallery'] = json_decode($r['gallery'] ?: '[]', true);
            $r['tags'] = json_decode($r['tags'] ?: '[]', true);
            $r['content'] = sanitizeSafeHtml((string)($r['content'] ?? ''));
            $r['content_ar'] = sanitizeSafeHtml((string)($r['content_ar'] ?? ''));
            $r['published'] = (bool)$r['published'];
            return $r;
        }, $rows);

        sendJson(['success' => true, 'articles' => $articles]);
    } catch (PDOException $e) {
        error_log('News fetch DB error: ' . $e->getMessage());
        sendError('Failed to fetch articles', 500);
    }
}

// 2. POST / PUT - Create or update article
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    try {
        $rawId = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        if ($rawId === '') {
            $id = 'news-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'news-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $title = substr(trim((string)($input['title'] ?? '')), 0, 255);
        $titleAr = substr(trim((string)($input['title_ar'] ?? '')), 0, 255);
        if ($title === '' && $titleAr === '') {
            sendError('Article title is required', 400);
        }

        $rawSlug = trim((string)($input['slug'] ?? ''));
        if ($rawSlug === '') {
            $rawSlug = $title !== '' ? $title : $titleAr;
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/i', '-', strtolower($rawSlug)), '-');
        if ($slug === '') {
            $slug = 'post-' . bin2hex(random_bytes(3));
        }

        $checkIdStmt = $db->prepare("SELECT id FROM news WHERE id = ? LIMIT 1");
        $checkIdStmt->execute([$id]);
        $exists = (bool)$checkIdStmt->fetch();

        $checkSlugStmt = $db->prepare("SELECT id FROM news WHERE slug = ? AND id != ? LIMIT 1");
        $checkSlugStmt->execute([$slug, $id]);
        if ($checkSlugStmt->fetch()) {
            $slug = substr($slug, 0, 175) . '-' . bin2hex(random_bytes(2));
        }

        $rawGallery = is_array($input['gallery'] ?? null) ? $input['gallery'] : [];
        $safeGallery = array_values(array_filter(array_map(function($g) {
            return sanitizeSafeUrl((string)$g, true);
        }, array_slice($rawGallery, 0, 20))));
        $gallery = json_encode($safeGallery, JSON_UNESCAPED_UNICODE);

        $rawTags = is_array($input['tags'] ?? null) ? $input['tags'] : [];
        $safeTags = array_values(array_filter(array_map(function($t) {
            return substr(trim((string)$t), 0, 50);
        }, array_slice($rawTags, 0, 20))));
        $tags = json_encode($safeTags, JSON_UNESCAPED_UNICODE);

        $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;
        $publishedAt = !empty($input['published_at']) ? substr((string)$input['published_at'], 0, 32) : date('Y-m-d H:i:s');

        $excerpt = sanitizeSafeHtml((string)($input['excerpt'] ?? ''));
        $excerptAr = sanitizeSafeHtml((string)($input['excerpt_ar'] ?? ''));
        $content = sanitizeSafeHtml((string)($input['content'] ?? ''));
        $contentAr = sanitizeSafeHtml((string)($input['content_ar'] ?? ''));
        $featuredImage = substr(sanitizeSafeUrl((string)($input['featured_image'] ?? ''), true), 0, 500);
        $category = substr(trim((string)($input['category'] ?? '')), 0, 100);
        $author = substr(trim((string)($input['author'] ?? 'BucharestEgyAgro')), 0, 100);
        $videoUrl = substr(sanitizeSafeUrl((string)($input['video_url'] ?? ''), false), 0, 500);

        if ($exists) {
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
                $slug,
                $title,
                $titleAr,
                $excerpt,
                $excerptAr,
                $content,
                $contentAr,
                $featuredImage,
                $gallery,
                $category,
                $tags,
                $author,
                $videoUrl,
                $published,
                $publishedAt,
                $id
            ]);
        } else {
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
                $title,
                $titleAr,
                $excerpt,
                $excerptAr,
                $content,
                $contentAr,
                $featuredImage,
                $gallery,
                $category,
                $tags,
                $author,
                $videoUrl,
                $published,
                $publishedAt
            ]);
        }

        sendJson(['success' => true, 'id' => $id, 'slug' => $slug]);
    } catch (PDOException $e) {
        error_log('News save DB error: ' . $e->getMessage());
        sendError('Database error while saving article', 500);
    }
}

// 3. DELETE - Delete article
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }
    if (!$id) sendError('Article ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('News delete DB error: ' . $e->getMessage());
        sendError('Database error while deleting article', 500);
    }
}

sendError('Method not allowed', 405);
