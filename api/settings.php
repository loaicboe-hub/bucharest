<?php
/**
 * BucharestEgyAgro - Site Settings API
 * Manages phone, WhatsApp, email, address, and social links in Hostinger MySQL.
 */
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - Load site settings
if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM site_settings WHERE id = 'default' LIMIT 1");
        $row = $stmt->fetch();

        if ($row) {
            if (empty($row['phone']) || $row['phone'] === '+20 100 000 0000') {
                $officialNum = '+20 107 003 3892';
                $db->prepare("UPDATE site_settings SET phone = ?, whatsapp = ? WHERE id = 'default'")->execute([$officialNum, $officialNum]);
                $row['phone'] = $officialNum;
                $row['whatsapp'] = $officialNum;
            }
        }

        if (!$row) {
            $default = [
                'companyName' => 'BucharestEgyAgro Import and Export',
                'company_name' => 'BucharestEgyAgro Import and Export',
                'phone' => '+20 107 003 3892',
                'email' => 'info@bucharestegyagro.com',
                'whatsapp' => '+20 107 003 3892',
                'address' => 'Cairo, Egypt — Export Head Office & Dispatch Desk',
                'maps' => 'https://maps.google.com/?q=Cairo',
                'maps_url' => 'https://maps.google.com/?q=Cairo',
                'facebook' => 'https://facebook.com/bucharestegyagro',
                'instagram' => 'https://instagram.com/bucharestegyagro',
                'linkedin' => 'https://linkedin.com/company/bucharestegyagro',
                'twitter' => '',
                'seoTitle' => 'BucharestEgyAgro Import and Export | Fresh Produce Exporter',
                'seo_title' => 'BucharestEgyAgro Import and Export | Fresh Produce Exporter',
                'seoDescription' => 'Egyptian exporter of fresh, carefully selected fruits and vegetables to international importers.',
                'seo_description' => 'Egyptian exporter of fresh, carefully selected fruits and vegetables to international importers.',
                'seoKeywords' => 'Fresh Fruits, Export, Egypt, BucharestEgyAgro',
                'seo_keywords' => 'Fresh Fruits, Export, Egypt, BucharestEgyAgro',
                'seoOgImage' => '',
                'seo_og_image' => ''
            ];
            sendJson(['success' => true, 'data' => $default, 'settings' => $default]);
        }

        $res = [
            'companyName' => $row['company_name'] ?: 'BucharestEgyAgro Import and Export',
            'company_name' => $row['company_name'] ?: 'BucharestEgyAgro Import and Export',
            'phone' => $row['phone'] ?: '',
            'email' => $row['email'] ?: '',
            'whatsapp' => $row['whatsapp'] ?: '',
            'address' => $row['address'] ?: '',
            'maps' => sanitizeSafeUrl((string)($row['maps_url'] ?: ''), false),
            'maps_url' => sanitizeSafeUrl((string)($row['maps_url'] ?: ''), false),
            'facebook' => sanitizeSafeUrl((string)($row['facebook'] ?: ''), false),
            'instagram' => sanitizeSafeUrl((string)($row['instagram'] ?: ''), false),
            'linkedin' => sanitizeSafeUrl((string)($row['linkedin'] ?: ''), false),
            'twitter' => sanitizeSafeUrl((string)($row['twitter'] ?: ''), false),
            'seoTitle' => $row['seo_title'] ?: '',
            'seo_title' => $row['seo_title'] ?: '',
            'seoDescription' => $row['seo_description'] ?: '',
            'seo_description' => $row['seo_description'] ?: '',
            'seoKeywords' => $row['seo_keywords'] ?: '',
            'seo_keywords' => $row['seo_keywords'] ?: '',
            'seoOgImage' => sanitizeSafeUrl((string)($row['seo_og_image'] ?: ''), true),
            'seo_og_image' => sanitizeSafeUrl((string)($row['seo_og_image'] ?: ''), true)
        ];

        sendJson([
            'success' => true,
            'data' => $res,
            'settings' => $res
        ]);
    } catch (PDOException $e) {
        error_log('Settings get DB error: ' . $e->getMessage());
        sendError('Failed to fetch settings', 500);
    }
}

// 2. POST / PUT - Update site settings (Admin only)
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    $companyName = substr(trim((string)($input['companyName'] ?? $input['company_name'] ?? 'BucharestEgyAgro Import and Export')), 0, 191);
    $phone = substr(trim((string)($input['phone'] ?? '')), 0, 100);
    $email = substr(trim((string)($input['email'] ?? '')), 0, 191);
    $whatsapp = substr(trim((string)($input['whatsapp'] ?? '')), 0, 100);
    $address = substr(trim((string)($input['address'] ?? '')), 0, 500);
    $maps = substr(sanitizeSafeUrl((string)($input['maps'] ?? $input['maps_url'] ?? ''), false), 0, 500);
    $facebook = substr(sanitizeSafeUrl((string)($input['facebook'] ?? ''), false), 0, 255);
    $instagram = substr(sanitizeSafeUrl((string)($input['instagram'] ?? ''), false), 0, 255);
    $linkedin = substr(sanitizeSafeUrl((string)($input['linkedin'] ?? ''), false), 0, 255);
    $twitter = substr(sanitizeSafeUrl((string)($input['twitter'] ?? ''), false), 0, 255);
    $seoTitle = substr(trim((string)($input['seoTitle'] ?? $input['seo_title'] ?? '')), 0, 255);
    $seoDescription = substr(trim((string)($input['seoDescription'] ?? $input['seo_description'] ?? '')), 0, 1000);
    $seoKeywords = substr(trim((string)($input['seoKeywords'] ?? $input['seo_keywords'] ?? '')), 0, 1000);
    $seoOgImage = substr(sanitizeSafeUrl((string)($input['seoOgImage'] ?? $input['seo_og_image'] ?? ''), true), 0, 500);

    try {
        $stmt = $db->prepare("
            INSERT INTO site_settings (
                id, company_name, phone, email, whatsapp, address,
                maps_url, facebook, instagram, linkedin, twitter,
                seo_title, seo_description, seo_keywords, seo_og_image
            ) VALUES (
                'default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE
                company_name = VALUES(company_name),
                phone = VALUES(phone),
                email = VALUES(email),
                whatsapp = VALUES(whatsapp),
                address = VALUES(address),
                maps_url = VALUES(maps_url),
                facebook = VALUES(facebook),
                instagram = VALUES(instagram),
                linkedin = VALUES(linkedin),
                twitter = VALUES(twitter),
                seo_title = VALUES(seo_title),
                seo_description = VALUES(seo_description),
                seo_keywords = VALUES(seo_keywords),
                seo_og_image = VALUES(seo_og_image)
        ");

        $stmt->execute([
            $companyName,
            $phone,
            $email,
            $whatsapp,
            $address,
            $maps,
            $facebook,
            $instagram,
            $linkedin,
            $twitter,
            $seoTitle,
            $seoDescription,
            $seoKeywords,
            $seoOgImage
        ]);

        sendJson(['success' => true]);
    } catch (PDOException $e) {
        error_log('Settings save DB error: ' . $e->getMessage());
        sendError('Failed to save site settings', 500);
    }
}

sendError('Method not allowed', 405);
