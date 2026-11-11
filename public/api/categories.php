<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

function ensureCategoryLocaleColumns(PDO $db): array {
    static $cols = null;
    if ($cols !== null) {
        return $cols;
    }

    $cols = [];
    try {
        $stmt = $db->query("SHOW COLUMNS FROM product_categories");
        foreach ($stmt->fetchAll() as $col) {
            $cols[$col['Field']] = true;
        }

        $missing = [];
        if (empty($cols['name_fr'])) {
            $missing[] = "ADD COLUMN `name_fr` VARCHAR(191) NULL DEFAULT NULL AFTER `name_en`";
        }
        if (empty($cols['name_ru'])) {
            $missing[] = "ADD COLUMN `name_ru` VARCHAR(191) NULL DEFAULT NULL AFTER `name_ar`";
        }

        if (!empty($missing)) {
            try {
                $db->exec("ALTER TABLE `product_categories` " . implode(', ', $missing));
                $stmt = $db->query("SHOW COLUMNS FROM product_categories");
                $cols = [];
                foreach ($stmt->fetchAll() as $col) {
                    $cols[$col['Field']] = true;
                }
            } catch (PDOException $e) {
                error_log('Categories schema migration skipped: ' . $e->getMessage());
            }
        }
    } catch (PDOException $e) {
        error_log('Categories SHOW COLUMNS error: ' . $e->getMessage());
    }

    return $cols;
}

// 1. GET - List categories
if ($method === 'GET') {
    try {
        ensureCategoryLocaleColumns($db);
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
        error_log('Categories list DB error: ' . $e->getMessage());
        sendError('Failed to fetch categories', 500);
    }
}

// 2. POST / PUT - Create or update category
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    try {
        $cols = ensureCategoryLocaleColumns($db);

        $rawId = trim((string)($input['id'] ?? $_GET['id'] ?? ''));
        if ($rawId === '') {
            $id = 'cat-' . bin2hex(random_bytes(6));
        } elseif (strlen($rawId) > 36) {
            $id = 'cat-' . substr(md5($rawId), 0, 12);
        } else {
            $id = $rawId;
        }

        $nameEn = substr(trim((string)($input['name_en'] ?? '')), 0, 191);
        $nameFr = substr(trim((string)($input['name_fr'] ?? '')), 0, 191);
        $nameAr = substr(trim((string)($input['name_ar'] ?? '')), 0, 191);
        $nameRu = substr(trim((string)($input['name_ru'] ?? '')), 0, 191);

        if ($nameEn === '' && $nameFr === '' && $nameAr === '' && $nameRu === '') {
            sendError('Category name is required', 400);
        }

        $rawSlug = trim((string)($input['slug'] ?? ''));
        if ($rawSlug === '') {
            $rawSlug = $nameEn !== '' ? $nameEn : ($nameFr !== '' ? $nameFr : ($nameAr !== '' ? $nameAr : $nameRu));
        }
        $slug = trim(preg_replace('/[^a-z0-9]+/i', '-', strtolower($rawSlug)), '-');
        if ($slug === '') {
            $slug = 'cat-' . bin2hex(random_bytes(3));
        }

        $trade = ($input['trade'] ?? 'export') === 'import' ? 'import' : 'export';
        $sortOrder = intval($input['sort_order'] ?? 1);
        $active = isset($input['active']) ? ($input['active'] ? 1 : 0) : 1;

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

        $fields = [
            'slug' => $slug,
            'name_en' => $nameEn,
            'name_ar' => $nameAr,
            'sort_order' => $sortOrder,
            'active' => $active,
            'trade' => $trade,
        ];
        if (!empty($cols['name_fr'])) {
            $fields['name_fr'] = $nameFr;
        }
        if (!empty($cols['name_ru'])) {
            $fields['name_ru'] = $nameRu;
        }

        if ($exists) {
            $setParts = [];
            $params = [];
            foreach ($fields as $col => $val) {
                $setParts[] = "`$col` = ?";
                $params[] = $val;
            }
            $params[] = $id;
            $stmt = $db->prepare("UPDATE product_categories SET " . implode(', ', $setParts) . " WHERE id = ?");
            $stmt->execute($params);
        } else {
            $insertCols = array_merge(['id'], array_keys($fields));
            $placeholders = array_fill(0, count($insertCols), '?');
            $params = array_merge([$id], array_values($fields));
            $colSql = implode(', ', array_map(function($col) { return "`$col`"; }, $insertCols));
            $stmt = $db->prepare("INSERT INTO product_categories ($colSql) VALUES (" . implode(', ', $placeholders) . ")");
            $stmt->execute($params);
        }

        sendJson([
            'success' => true,
            'id' => $id,
            'slug' => $slug,
            'category' => [
                'id' => $id,
                'slug' => $slug,
                'name_en' => $nameEn,
                'name_fr' => $nameFr,
                'name_ar' => $nameAr,
                'name_ru' => $nameRu,
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
