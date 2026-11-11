<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function ensureNewsLocaleColumns(PDO $db): array {
    static $cols = null;
    if ($cols !== null) {
        return $cols;
    }

    $cols = [];
    try {
        $stmt = $db->query("SHOW COLUMNS FROM news");
        foreach ($stmt->fetchAll() as $col) {
            $cols[$col['Field']] = true;
        }

        $missing = [];
        if (empty($cols['title_fr'])) {
            $missing[] = "ADD COLUMN `title_fr` VARCHAR(255) NULL DEFAULT NULL AFTER `title`";
        }
        if (empty($cols['title_ru'])) {
            $missing[] = "ADD COLUMN `title_ru` VARCHAR(255) NULL DEFAULT NULL AFTER `title_ar`";
        }
        if (empty($cols['excerpt_fr'])) {
            $missing[] = "ADD COLUMN `excerpt_fr` TEXT NULL DEFAULT NULL AFTER `excerpt`";
        }
        if (empty($cols['excerpt_ru'])) {
            $missing[] = "ADD COLUMN `excerpt_ru` TEXT NULL DEFAULT NULL AFTER `excerpt_ar`";
        }
        if (empty($cols['content_fr'])) {
            $missing[] = "ADD COLUMN `content_fr` LONGTEXT NULL DEFAULT NULL AFTER `content`";
        }
        if (empty($cols['content_ru'])) {
            $missing[] = "ADD COLUMN `content_ru` LONGTEXT NULL DEFAULT NULL AFTER `content_ar`";
        }

        if (!empty($missing)) {
            try {
                $db->exec("ALTER TABLE `news` " . implode(', ', $missing));
                $stmt = $db->query("SHOW COLUMNS FROM news");
                $cols = [];
                foreach ($stmt->fetchAll() as $col) {
                    $cols[$col['Field']] = true;
                }
            } catch (PDOException $e) {
                error_log('News schema migration skipped: ' . $e->getMessage());
            }
        }
    } catch (PDOException $e) {
        error_log('News SHOW COLUMNS error: ' . $e->getMessage());
    }

    return $cols;
}

function formatNewsRow(array $r): array {
    $gallery = json_decode($r['gallery'] ?: '[]', true);
    $r['gallery'] = is_array($gallery) ? $gallery : [];
    $tags = json_decode($r['tags'] ?: '[]', true);
    $r['tags'] = is_array($tags) ? $tags : [];
    $r['content'] = sanitizeSafeHtml((string)($r['content'] ?? ''));
    $r['content_ar'] = sanitizeSafeHtml((string)($r['content_ar'] ?? ''));
    if (array_key_exists('content_fr', $r) && $r['content_fr'] !== null) {
        $r['content_fr'] = sanitizeSafeHtml((string)$r['content_fr']);
    }
    if (array_key_exists('content_ru', $r) && $r['content_ru'] !== null) {
        $r['content_ru'] = sanitizeSafeHtml((string)$r['content_ru']);
    }
    $r['published'] = (bool)$r['published'];
    return $r;
}

// 1. GET - List articles or single
if ($method === 'GET') {
    try {
        ensureNewsLocaleColumns($db);
        $slug = $_GET['slug'] ?? null;
        $id = $_GET['id'] ?? null;
        $all = isset($_GET['all']); // for admin

        if ($slug || $id) {
            $sql = "SELECT * FROM news WHERE " . ($slug ? "slug = ?" : "id = ?");
            $stmt = $db->prepare($sql);
            $stmt->execute([$slug ?: $id]);
            $row = $stmt->fetch();
            if (!$row) sendError('Article not found', 404);

            sendJson(['success' => true, 'article' => formatNewsRow($row)]);
        }

        $where = $all ? "" : "WHERE published = 1";
        $stmt = $db->query("SELECT * FROM news $where ORDER BY published_at DESC, created_at DESC LIMIT 200");
        $articles = array_map('formatNewsRow', $stmt->fetchAll());

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
        $cols = ensureNewsLocaleColumns($db);

        $rawId = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        if ($rawId === '') {
            $id = 'news-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'news-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $title = substr(trim((string)($input['title'] ?? '')), 0, 255);
        $titleFr = substr(trim((string)($input['title_fr'] ?? '')), 0, 255);
        $titleAr = substr(trim((string)($input['title_ar'] ?? '')), 0, 255);
        $titleRu = substr(trim((string)($input['title_ru'] ?? '')), 0, 255);
        if ($title === '' && $titleFr === '' && $titleAr === '' && $titleRu === '') {
            sendError('Article title is required', 400);
        }

        $rawSlug = trim((string)($input['slug'] ?? ''));
        if ($rawSlug === '') {
            $rawSlug = $title !== '' ? $title : ($titleFr !== '' ? $titleFr : ($titleAr !== '' ? $titleAr : $titleRu));
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
        $rawDate = trim((string)($input['published_at'] ?? ''));
        $ts = $rawDate !== '' ? strtotime($rawDate) : false;
        $publishedAt = $ts !== false ? date('Y-m-d H:i:s', $ts) : date('Y-m-d H:i:s');

        $excerpt = sanitizeSafeHtml((string)($input['excerpt'] ?? ''));
        $excerptFr = sanitizeSafeHtml((string)($input['excerpt_fr'] ?? ''));
        $excerptAr = sanitizeSafeHtml((string)($input['excerpt_ar'] ?? ''));
        $excerptRu = sanitizeSafeHtml((string)($input['excerpt_ru'] ?? ''));
        $content = sanitizeSafeHtml((string)($input['content'] ?? ''));
        $contentFr = sanitizeSafeHtml((string)($input['content_fr'] ?? ''));
        $contentAr = sanitizeSafeHtml((string)($input['content_ar'] ?? ''));
        $contentRu = sanitizeSafeHtml((string)($input['content_ru'] ?? ''));
        $featuredImage = substr(sanitizeSafeUrl((string)($input['featured_image'] ?? ''), true), 0, 500);
        $category = substr(trim((string)($input['category'] ?? '')), 0, 100);
        $author = substr(trim((string)($input['author'] ?? 'BucharestEgyAgro')), 0, 100);
        $videoUrl = substr(sanitizeSafeUrl((string)($input['video_url'] ?? ''), false), 0, 500);

        $fields = [
            'slug' => $slug,
            'title' => $title,
            'title_ar' => $titleAr,
            'excerpt' => $excerpt,
            'excerpt_ar' => $excerptAr,
            'content' => $content,
            'content_ar' => $contentAr,
            'featured_image' => $featuredImage,
            'gallery' => $gallery,
            'category' => $category,
            'tags' => $tags,
            'author' => $author,
            'video_url' => $videoUrl,
            'published' => $published,
            'published_at' => $publishedAt,
        ];
        if (!empty($cols['title_fr'])) $fields['title_fr'] = $titleFr;
        if (!empty($cols['title_ru'])) $fields['title_ru'] = $titleRu;
        if (!empty($cols['excerpt_fr'])) $fields['excerpt_fr'] = $excerptFr;
        if (!empty($cols['excerpt_ru'])) $fields['excerpt_ru'] = $excerptRu;
        if (!empty($cols['content_fr'])) $fields['content_fr'] = $contentFr;
        if (!empty($cols['content_ru'])) $fields['content_ru'] = $contentRu;

        if ($exists) {
            $setParts = [];
            $params = [];
            foreach ($fields as $col => $val) {
                $setParts[] = "`$col` = ?";
                $params[] = $val;
            }
            $params[] = $id;
            $stmt = $db->prepare("UPDATE news SET " . implode(', ', $setParts) . " WHERE id = ?");
            $stmt->execute($params);
        } else {
            $insertCols = array_merge(['id'], array_keys($fields));
            $placeholders = array_fill(0, count($insertCols), '?');
            $params = array_merge([$id], array_values($fields));
            $colSql = implode(', ', array_map(function($col) { return "`$col`"; }, $insertCols));
            $stmt = $db->prepare("INSERT INTO news ($colSql) VALUES (" . implode(', ', $placeholders) . ")");
            $stmt->execute($params);
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
