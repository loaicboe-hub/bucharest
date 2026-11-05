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
            'address' => 'Cairo, Egypt',
            'maps' => 'https://maps.google.com/?q=Cairo',
            'maps_url' => 'https://maps.google.com/?q=Cairo',
            'facebook' => 'https://facebook.com/bucharestegyagro',
            'instagram' => 'https://instagram.com/bucharestegyagro',
            'linkedin' => 'https://linkedin.com/company/bucharestegyagro',
            'twitter' => '',
            'seoTitle' => 'BucharestEgyAgro | Premium Produce Exporter',
            'seo_title' => 'BucharestEgyAgro | Premium Produce Exporter',
            'seoDescription' => 'Premium fresh fruits and vegetables exporter.',
            'seo_description' => 'Premium fresh fruits and vegetables exporter.',
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
        'maps' => $row['maps_url'] ?: '',
        'maps_url' => $row['maps_url'] ?: '',
        'facebook' => $row['facebook'] ?: '',
        'instagram' => $row['instagram'] ?: '',
        'linkedin' => $row['linkedin'] ?: '',
        'twitter' => $row['twitter'] ?: '',
        'seoTitle' => $row['seo_title'] ?: '',
        'seo_title' => $row['seo_title'] ?: '',
        'seoDescription' => $row['seo_description'] ?: '',
        'seo_description' => $row['seo_description'] ?: '',
        'seoKeywords' => $row['seo_keywords'] ?: '',
        'seo_keywords' => $row['seo_keywords'] ?: '',
        'seoOgImage' => $row['seo_og_image'] ?: '',
        'seo_og_image' => $row['seo_og_image'] ?: ''
    ];

    sendJson([
        'success' => true,
        'data' => $res,
        'settings' => $res
    ]);
}

// 2. POST / PUT - Update site settings (Admin only)
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

    $companyName = $input['companyName'] ?? $input['company_name'] ?? 'BucharestEgyAgro Import and Export';
    $phone = $input['phone'] ?? '';
    $email = $input['email'] ?? '';
    $whatsapp = $input['whatsapp'] ?? '';
    $address = $input['address'] ?? '';
    $maps = $input['maps'] ?? $input['maps_url'] ?? '';
    $facebook = $input['facebook'] ?? '';
    $instagram = $input['instagram'] ?? '';
    $linkedin = $input['linkedin'] ?? '';
    $twitter = $input['twitter'] ?? '';
    $seoTitle = $input['seoTitle'] ?? $input['seo_title'] ?? '';
    $seoDescription = $input['seoDescription'] ?? $input['seo_description'] ?? '';
    $seoKeywords = $input['seoKeywords'] ?? $input['seo_keywords'] ?? '';
    $seoOgImage = $input['seoOgImage'] ?? $input['seo_og_image'] ?? '';

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
}

sendError('Method not allowed', 405);
