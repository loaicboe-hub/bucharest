<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - List categories
if ($method === 'GET') {
    try {
        $onlyActive = isset($_GET['onlyActive']) && $_GET['onlyActive'] === 'true';
        $sql = "SELECT * FROM product_categories " . ($onlyActive ? "WHERE active = 1 " : "") . "ORDER BY sort_order ASC, created_at ASC";
        $stmt = $db->query($sql);
        $categories = array_map(function($c) {
            $c['active'] = (bool)$c['active'];
            $c['sort_order'] = intval($c['sort_order']);
            return $c;
        }, $stmt->fetchAll());

        sendJson(['success' => true, 'categories' => $categories]);
    } catch (PDOException $e) {
        sendError('Failed to fetch categories: ' . $e->getMessage(), 500);
    }
}

// 2. POST / PUT - Create or update category
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    try {
        $rawId = trim($input['id'] ?? $_GET['id'] ?? '');
        if ($rawId === '') {
            $id = 'cat-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'cat-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $rawSlug = trim($input['slug'] ?? '');
        if ($rawSlug === '') {
            $rawSlug = trim($input['name_en'] ?? '');
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/i', '-', strtolower($rawSlug)), '-');
        if ($slug === '') {
            $slug = 'cat-' . bin2hex(random_bytes(3));
        }

        $trade = ($input['trade'] ?? 'export') === 'import' ? 'import' : 'export';
        $nameEn = trim($input['name_en'] ?? '');
        $nameAr = trim($input['name_ar'] ?? '');
        $sortOrder = intval($input['sort_order'] ?? 1);
        $active = isset($input['active']) ? ($input['active'] ? 1 : 0) : 1;

        if ($nameEn === '' && $nameAr === '') {
            sendError('Category name is required', 400);
        }

        // Check if updating an existing category or creating a new one
        $checkIdStmt = $db->prepare("SELECT id FROM product_categories WHERE id = ? LIMIT 1");
        $checkIdStmt->execute([$id]);
        $exists = (bool)$checkIdStmt->fetch();

        // Ensure slug is unique across other rows so we never collide or overwrite another category
        $checkSlugStmt = $db->prepare("SELECT id FROM product_categories WHERE slug = ? AND id != ? LIMIT 1");
        $checkSlugStmt->execute([$slug, $id]);
        if ($checkSlugStmt->fetch()) {
            $slug = substr($slug, 0, 175) . '-' . bin2hex(random_bytes(2));
        }

        if ($exists) {
            $stmt = $db->prepare("
                UPDATE product_categories SET
                    slug = ?,
                    name_en = ?,
                    name_ar = ?,
                    sort_order = ?,
                    active = ?,
                    trade = ?
                WHERE id = ?
            ");
            $stmt->execute([$slug, $nameEn, $nameAr, $sortOrder, $active, $trade, $id]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO product_categories (id, slug, name_en, name_ar, sort_order, active, trade)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$id, $slug, $nameEn, $nameAr, $sortOrder, $active, $trade]);
        }

        sendJson([
            'success' => true,
            'id' => $id,
            'slug' => $slug,
            'category' => [
                'id' => $id,
                'slug' => $slug,
                'name_en' => $nameEn,
                'name_ar' => $nameAr,
                'sort_order' => $sortOrder,
                'active' => (bool)$active,
                'trade' => $trade,
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Database error while saving category: ' . $e->getMessage(), 500);
    }
}

// 3. DELETE - Delete category
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }
    if (!$id) sendError('Category ID is required', 400);

    try {
        $stmt = $db->prepare("DELETE FROM product_categories WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true]);
    } catch (PDOException $e) {
        sendError('Database error while deleting category: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
