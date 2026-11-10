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
    } catch (PDOException $e) {
        sendError('Failed to fetch articles: ' . $e->getMessage(), 500);
    }
}

// 2. POST / PUT - Create or update article
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    try {
        $rawId = trim($input['id'] ?? $_GET['id'] ?? '');
        if ($rawId === '') {
            $id = 'news-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'news-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $title = trim($input['title'] ?? '');
        $titleAr = trim($input['title_ar'] ?? '');
        $rawSlug = trim($input['slug'] ?? '');
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

        $gallery = json_encode($input['gallery'] ?? [], JSON_UNESCAPED_UNICODE);
        $tags = json_encode($input['tags'] ?? [], JSON_UNESCAPED_UNICODE);
        $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;
        $publishedAt = !empty($input['published_at']) ? $input['published_at'] : date('Y-m-d H:i:s');

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
                $input['excerpt'] ?? '',
                $input['excerpt_ar'] ?? '',
                $input['content'] ?? '',
                $input['content_ar'] ?? '',
                $input['featured_image'] ?? '',
                $gallery,
                $input['category'] ?? '',
                $tags,
                $input['author'] ?? 'BucharestEgyAgro',
                $input['video_url'] ?? '',
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
                $input['excerpt'] ?? '',
                $input['excerpt_ar'] ?? '',
                $input['content'] ?? '',
                $input['content_ar'] ?? '',
                $input['featured_image'] ?? '',
                $gallery,
                $input['category'] ?? '',
                $tags,
                $input['author'] ?? 'BucharestEgyAgro',
                $input['video_url'] ?? '',
                $published,
                $publishedAt
            ]);
        }

        sendJson(['success' => true, 'id' => $id, 'slug' => $slug]);
    } catch (PDOException $e) {
        sendError('Database error while saving article: ' . $e->getMessage(), 500);
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
        sendError('Database error while deleting article: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
