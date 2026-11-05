<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET - Load site settings
if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM site_settings WHERE id = 'default' LIMIT 1");
    $row = $stmt->fetch();

    if (!$row) {
        // Return default fallback
        sendJson([
            'success' => true,
            'settings' => [
                'companyName' => 'BucharestEgyAgro Import and Export',
                'phone' => '+20 100 000 0000',
                'email' => 'info@bucharestegyagro.com',
                'whatsapp' => '+20 100 000 0000',
                'address' => 'Cairo, Egypt',
                'maps' => 'https://maps.google.com/?q=Cairo',
                'facebook' => 'https://facebook.com/bucharestegyagro',
                'instagram' => 'https://instagram.com/bucharestegyagro',
                'linkedin' => 'https://linkedin.com/company/bucharestegyagro',
                'twitter' => '',
                'seoTitle' => 'BucharestEgyAgro | Premium Produce Exporter',
                'seoDescription' => 'Premium fresh fruits and vegetables exporter.',
                'seoKeywords' => 'Fresh Fruits, Export, Egypt, BucharestEgyAgro',
                'seoOgImage' => ''
            ]
        ]);
    }

    sendJson([
        'success' => true,
        'settings' => [
            'companyName' => $row['company_name'],
            'phone' => $row['phone'],
            'email' => $row['email'],
            'whatsapp' => $row['whatsapp'],
            'address' => $row['address'],
            'maps' => $row['maps_url'],
            'facebook' => $row['facebook'],
            'instagram' => $row['instagram'],
            'linkedin' => $row['linkedin'],
            'twitter' => $row['twitter'],
            'seoTitle' => $row['seo_title'],
            'seoDescription' => $row['seo_description'],
            'seoKeywords' => $row['seo_keywords'],
            'seoOgImage' => $row['seo_og_image']
        ]
    ]);
}

// 2. POST / PUT - Update site settings (Admin only)
if ($method === 'POST' || $method === 'PUT') {
    requireAuth();
    $input = getJsonInput();

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
        $input['companyName'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['whatsapp'] ?? '',
        $input['address'] ?? '',
        $input['maps'] ?? '',
        $input['facebook'] ?? '',
        $input['instagram'] ?? '',
        $input['linkedin'] ?? '',
        $input['twitter'] ?? '',
        $input['seoTitle'] ?? '',
        $input['seoDescription'] ?? '',
        $input['seoKeywords'] ?? '',
        $input['seoOgImage'] ?? ''
    ]);

    sendJson(['success' => true]);
}

sendError('Method not allowed', 405);
