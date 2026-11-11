-- =============================================================================
-- BucharestEgyAgro - Hostinger MySQL Database Schema & Full Seed Data
-- Compatible with MySQL 5.7+ / 8.0+ and MariaDB (Standard Hostinger phpMyAdmin)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table: users (Admin accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(191) NOT NULL DEFAULT '',
  `role` ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: user_permissions (Module access permissions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_permissions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `module_key` VARCHAR(100) NOT NULL,
  `can_view` TINYINT(1) NOT NULL DEFAULT 0,
  `can_create` TINYINT(1) NOT NULL DEFAULT 0,
  `can_edit` TINYINT(1) NOT NULL DEFAULT 0,
  `can_delete` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_module` (`user_id`, `module_key`),
  CONSTRAINT `fk_perm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: product_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` VARCHAR(36) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `name_en` VARCHAR(191) NOT NULL DEFAULT '',
  `name_ar` VARCHAR(191) NOT NULL DEFAULT '',
  `sort_order` INT NOT NULL DEFAULT 1,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `trade` ENUM('export', 'import') NOT NULL DEFAULT 'export',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_category_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `trade` ENUM('export', 'import') NOT NULL DEFAULT 'export',
  `category_id` VARCHAR(36) DEFAULT NULL,
  `name_en` VARCHAR(255) NOT NULL DEFAULT '',
  `name_ar` VARCHAR(255) NOT NULL DEFAULT '',
  `intro_en` TEXT,
  `intro_ar` TEXT,
  `description_en` LONGTEXT,
  `description_ar` LONGTEXT,
  `specs_en` JSON DEFAULT NULL,
  `specs_ar` JSON DEFAULT NULL,
  `hidden_specs` JSON DEFAULT NULL,
  `main_image` VARCHAR(500) NOT NULL DEFAULT '',
  `gallery` JSON DEFAULT NULL,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_slug` (`slug`),
  KEY `idx_product_cat` (`category_id`),
  KEY `idx_product_trade` (`trade`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: news
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news` (
  `id` VARCHAR(36) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `title_ar` VARCHAR(255) NOT NULL DEFAULT '',
  `excerpt` TEXT,
  `excerpt_ar` TEXT,
  `content` LONGTEXT,
  `content_ar` LONGTEXT,
  `featured_image` VARCHAR(500) NOT NULL DEFAULT '',
  `gallery` JSON DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT '',
  `tags` JSON DEFAULT NULL,
  `author` VARCHAR(100) NOT NULL DEFAULT '',
  `video_url` VARCHAR(500) NOT NULL DEFAULT '',
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_news_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: partners
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `partners` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL DEFAULT '',
  `logo_url` VARCHAR(500) NOT NULL DEFAULT '',
  `logo_path` VARCHAR(255) NOT NULL DEFAULT '',
  `url` VARCHAR(500) NOT NULL DEFAULT '',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: site_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` VARCHAR(50) NOT NULL DEFAULT 'default',
  `company_name` VARCHAR(191) NOT NULL DEFAULT 'BucharestEgyAgro Import and Export',
  `phone` VARCHAR(100) NOT NULL DEFAULT '+20 107 003 3892',
  `email` VARCHAR(191) NOT NULL DEFAULT 'info@bucharestegyagro.com',
  `whatsapp` VARCHAR(100) NOT NULL DEFAULT '+20 107 003 3892',
  `address` TEXT,
  `maps_url` TEXT,
  `facebook` VARCHAR(255) NOT NULL DEFAULT '',
  `instagram` VARCHAR(255) NOT NULL DEFAULT '',
  `linkedin` VARCHAR(255) NOT NULL DEFAULT '',
  `twitter` VARCHAR(255) NOT NULL DEFAULT '',
  `seo_title` VARCHAR(255) NOT NULL DEFAULT 'BucharestEgyAgro | Fresh Egyptian Fruits & Vegetables Exporter',
  `seo_description` TEXT,
  `seo_keywords` TEXT,
  `seo_og_image` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Table: quote_requests
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quote_requests` (
  `id` VARCHAR(36) NOT NULL,
  `company` VARCHAR(191) NOT NULL DEFAULT '',
  `contact_person` VARCHAR(191) NOT NULL DEFAULT '',
  `email` VARCHAR(191) NOT NULL DEFAULT '',
  `country` VARCHAR(100) NOT NULL DEFAULT '',
  `product` VARCHAR(191) NOT NULL DEFAULT '',
  `quantity` VARCHAR(100) NOT NULL DEFAULT '',
  `status` ENUM('pending', 'sent', 'won', 'lost') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Table: contact_requests
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_requests` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(191) NOT NULL DEFAULT '',
  `company` VARCHAR(191) NOT NULL DEFAULT '',
  `country` VARCHAR(100) NOT NULL DEFAULT '',
  `email` VARCHAR(191) NOT NULL DEFAULT '',
  `phone` VARCHAR(100) NOT NULL DEFAULT '',
  `message` TEXT,
  `status` ENUM('new', 'in-progress', 'closed') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Table: invoices
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(36) NOT NULL,
  `number` VARCHAR(100) NOT NULL,
  `status` ENUM('draft', 'unpaid', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'draft',
  `finalized` TINYINT(1) NOT NULL DEFAULT 0,
  `invoice_data` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_invoice_number` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Initial Seed Data
-- -----------------------------------------------------------------------------

-- 1. Default Admin User (Password: admin123456)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `created_at`)
VALUES (
  'usr-admin-initial-01',
  'admin@bucharestegyagro.com',
  '$2y$10$wNqfNf37xGkWjD2bJ7qJreP54zZ5n6Jb9L0X4C6sH9Z7F.gY.b8qG',
  'BucharestEgyAgro Administrator',
  'super_admin',
  NOW()
) ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. Categories
INSERT INTO `product_categories` (`id`, `slug`, `name_en`, `name_ar`, `sort_order`, `active`, `trade`) VALUES
('cat-fruits', 'fruits', 'Fresh Fruits', 'فواكه طازجة', 1, 1, 'export'),
('cat-vegetables', 'vegetables', 'Fresh Vegetables', 'خضروات طازجة', 2, 1, 'export')
ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`);

-- 3. Products (All 12 Catalog Products Pre-Seeded in MySQL)
INSERT INTO `products` (`id`, `slug`, `trade`, `category_id`, `name_en`, `name_ar`, `intro_en`, `intro_ar`, `description_en`, `description_ar`, `specs_en`, `specs_ar`, `main_image`, `gallery`, `published`, `sort_order`) VALUES
('prod-oranges', 'oranges', 'export', 'cat-fruits',
 'Fresh Valencia & Navel Oranges', 'برتقال فالنسيا ونافيلا طازج',
 'World-renowned Egyptian citrus, perfectly balanced between sweetness and acidity.',
 'برتقال مصري فائق الجودة يجمع بين العصير الغزير والنكهة المنعشة واللون البرتقالي الزاهي.',
 'Egyptian oranges represent the pinnacle of Mediterranean citrus farming. Sourced from fertile Nile Delta and desert reclaimed groves, our Valencia and Navel oranges are carefully harvested at peak brix levels to ensure maximum juice content and long transit life.',
 'يمثل البرتقال المصري قمة زراعة الموالح في حوض البحر المتوسط. يتم حصاده بعناية فائقة عند وصول نسبة السكر والحموضة للتوازن المثالي.',
 '{"scientificName":"Citrus sinensis","variety":"Valencia, Navel, Baladi","season":"December - May","sizes":"48, 56, 64, 72, 80, 88, 100, 113, 125","color":"Bright natural orange","taste":"Sweet with balanced acidity, juice content > 45%","packaging":"15 kg telescopic / open-top cartons, 8 kg cartons","shelfLife":"60 - 90 days at 4 - 6°C","storageTemp":"4 - 6°C with 85-90% RH","transportation":"Reefer container at 4°C, ventilation 15-20 m3/h","moq":"1x 40ft High Cube Container","loading":"24 - 26 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Citrus sinensis","variety":"فالنسيا، أبو سرة، بلدي","season":"ديسمبر - مايو","sizes":"48, 56, 64, 72, 80, 88, 100, 113, 125","color":"برتقالي زاهي طبيعي","taste":"حلو غني بالعصير المتوازن","packaging":"كرتونة 15 كجم أو 8 كجم","shelfLife":"60 - 90 يوماً عند 4-6 درجات","storageTemp":"4 - 6 درجات مئوية","transportation":"حاويات مبردة مجهزة","moq":"حاوية 40 قدم","loading":"24 - 26 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/oranges.jpg', '["/assets/oranges.jpg", "/assets/gallery/oranges-2.jpg"]', 1, 1),

('prod-grapes', 'grapes', 'export', 'cat-fruits',
 'Superior & Flame Seedless Grapes', 'عنب سوبريور وفليم بدون بذور',
 'Crisp, sweet seedless grapes harvested early for prime European and Gulf arrivals.',
 'عنب مصري بدون بذور يتميز بحبات مقرمشة وسكر متوازن وجاذبية تجارية عالية.',
 'Early-season Egyptian table grapes are harvested between May and August, offering crisp textures and high brix levels in white, red and black seedless varieties.',
 'يتميز العنب المصري بموسمه المبكر وجودته العالية، مما يجعله الخيار الأول لكبرى سلاسل التوزيع العالمية.',
 '{"scientificName":"Vitis vinifera","variety":"Early Sweet, Superior, Flame, Crimson, Autumn Royal","season":"May - August","sizes":"16 - 22 mm diameter","color":"Translucent green, bright ruby red or deep black","taste":"Crunchy, highly sweet, brix 16 - 20°","packaging":"4.5 kg cartons loose or 5 kg in 10x500g carry bags/punnets","shelfLife":"45 - 60 days in cold storage","storageTemp":"-0.5 to 0°C, 90-95% RH with SO2 pads","transportation":"Reefer container at 0°C","moq":"1x 40ft Reefer Container","loading":"15 - 18 Metric Tons","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Vitis vinifera","variety":"إيرلي سويت، سوبريور، فليم، كريمسون","season":"مايو - أغسطس","sizes":"16 - 22 ملم","color":"أخضر شفاف، أحمر ياقوتي، أسود","taste":"مقرمش بنسبة سكريات 16-20 بريكس","packaging":"كراتين 4.5 كجم أو بانيتات 10x500 جم","shelfLife":"45 - 60 يوماً","storageTemp":"-0.5 إلى 0 درجة مئوية","transportation":"حاويات مبردة","moq":"حاوية 40 قدم","loading":"15 - 18 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/grapes.jpg', '["/assets/grapes.jpg", "/assets/gallery/grapes-2.jpg"]', 1, 2),

('prod-mangoes', 'mangoes', 'export', 'cat-fruits',
 'Mangoes', 'المانجو',
 'Intensely fragrant and smooth, featuring famous varieties like Keitt, Kent and Naomi.',
 'أفخر أصناف المانجو المصرية بطعمها العطري الغني وقوامها المخملي الخالي من الألياف.',
 'Egyptian mangoes are prized internationally for their intense sweetness, aromatic bouquet and low-fiber texture.',
 'تعتبر المانجو المصرية من أفضل فواكه التصدير الفاخرة بفضل طعمها الاستوائي المتميز.',
 '{"scientificName":"Mangifera indica","variety":"Keitt, Kent, Naomi, Heidi, Yasmina, Zebdia","season":"July - November","sizes":"Count 6, 7, 8, 9, 10, 12, 14 per 4 kg box","color":"Golden yellow blush with deep orange flesh","taste":"Rich, highly aromatic, sweet, brix 15 - 19°","packaging":"4 kg open top cartons / 5 kg boxes","shelfLife":"21 - 28 days controlled atmosphere","storageTemp":"10 - 12°C","transportation":"Air freight or reefer container at 11°C","moq":"1 Pallet by air / 1x 40ft container","loading":"18 - 20 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Mangifera indica","variety":"كيت، كينت، نعومي، هايدي، زبدية","season":"يوليو - نوفمبر","sizes":"العدد 6، 7، 8، 9، 10، 12 لكل كرتونة 4 كجم","color":"أصفر ذهبي مائل للأحمر","taste":"طعم استوائي مميز بنسبة سكر عالية","packaging":"كراتين 4 كجم أو 5 كجم","shelfLife":"21 - 28 يوماً","storageTemp":"10 - 12 درجة مئوية","transportation":"شحن جوي أو بحري مبرد","moq":"طبلية جواً / حاوية بحراً","loading":"18 - 20 طن متري","certifications":"شهادة صحة نباتية، شهادة منشأ، شهادة صلاحية تصديرية"}',
 '/assets/mangoes.jpg', '["/assets/mangoes.jpg", "/assets/gallery/mangoes-2.jpg"]', 1, 3),

('prod-pomegranates', 'pomegranates', 'export', 'cat-fruits',
 'Wonderful Pomegranates', 'رمان وندرفل مصري فاخر',
 'Deep crimson arils packed with sweet-tart juice and high antioxidant power.',
 'رمان مصري من صنف وندرفل بألوانه الحمراء الداكنة وحباته العصيرية الغنية بمضادات الأكسدة.',
 'Our Wonderful variety pomegranates are harvested in the sunny expanses of Upper Egypt and desert reclamation zones.',
 'يتميز الرمان المصري بحجمه الكبير وحبوبه الحمراء الغنية بالعصير ونسبة السكر الطبيعية المرتفعة.',
 '{"scientificName":"Punica granatum","variety":"Wonderful, 116, Baladi","season":"August - December","sizes":"Counts 6, 7, 8, 9, 10, 12, 14 per 4.5 kg carton","color":"Deep ruby red skin and arils","taste":"Sweet with delightful tart finish, brix > 16°","packaging":"4.5 kg carton or 5 kg bulk bins","shelfLife":"90 - 120 days at 5°C","storageTemp":"5 - 7°C, 90-95% RH","transportation":"Reefer container at 5°C","moq":"1x 40ft Reefer Container","loading":"20 Metric Tons per 40ft container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Punica granatum","variety":"وندرفل، 116، بلدي","season":"أغسطس - ديسمبر","sizes":"العدد 6، 7، 8، 9، 10، 12 لكل كرتونة 4.5 كجم","color":"أحمر ياقوتي داكن","taste":"عصيري حلو بنكهة غنية","packaging":"كرتونة 4.5 كجم أو حاويات خشبية","shelfLife":"90 - 120 يوماً","storageTemp":"5 - 7 درجات مئوية","transportation":"حاويات مبردة","moq":"حاوية 40 قدم","loading":"20 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/pomegranates.jpg', '["/assets/pomegranates.jpg", "/assets/gallery/pomegranates-2.jpg"]', 1, 4),

('prod-strawberries', 'strawberries', 'export', 'cat-fruits',
 'Fresh & IQF Strawberries', 'فراولة طازجة ومجمدة IQF',
 'Conical, intensely aromatic berries shipped fresh by air or frozen IQF for industry.',
 'فراولة مصرية حمراء ناصعة تشحن طازجة بالجو أو مجمدة بأحدث تقنيات الـ IQF.',
 'Egypt is one of the world leaders in strawberry export. Grown along the fertile Nile soils under mild winter sunshine, our Fortuna and Festival strawberries deliver outstanding appearance and flavor.',
 'تعتبر مصر من أكبر مصدري الفراولة عالمياً، وتتميز بثمارها المخروطية الصلبة ونكهتها العطرية الفواحة.',
 '{"scientificName":"Fragaria x ananassa","variety":"Festival, Fortuna, Sensation, Winter Star","season":"November - April (Fresh), Year-round (IQF)","sizes":"25 - 35 mm (A grade), > 35 mm (Jumbo)","color":"Uniform glossy deep red","taste":"Sweet, aromatic, brix > 8.5°","packaging":"10x 250g punnets per 2.5 kg carton, or IQF 10 kg bulk cartons","shelfLife":"7 - 10 days fresh, 24 months IQF","storageTemp":"0 - 2°C fresh, -18°C IQF","transportation":"Air cargo for fresh, reefer containers for IQF","moq":"500 kg air freight / 1x 40ft container IQF","loading":"22 - 24 Metric Tons in 40ft container (IQF)","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Fragaria x ananassa","variety":"فستيفال، فورتونا، سينسيشن","season":"نوفمبر - أبريل (طازج)، طوال العام (مجمد)","sizes":"25 - 35 ملم أو أكبر","color":"أحمر قاني لامع","taste":"نكهة عطرية لذيذة بنسبة بريكس ممتازة","packaging":"بانيتات 250 جم أو أكياس 10 كجم IQF","shelfLife":"7 - 10 أيام طازج / 24 شهراً مجمد","storageTemp":"0 - 2 درجة مئوية طازج / -18 مجمد","transportation":"شحن جوي أو بحري مجمد","moq":"500 كجم جواً / حاوية 40 قدم IQF","loading":"22 - 24 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/strawberries.jpg', '["/assets/strawberries.jpg", "/assets/gallery/strawberries-2.jpg"]', 1, 5),

('prod-lemons', 'lemons', 'export', 'cat-fruits',
 'Adalia & Eureka Fresh Lemons', 'ليمون أضاليا ويوريكا طازج',
 'Juicy, bright yellow lemons packed with natural citric acidity and protective oils.',
 'ليمون مصري عالي النقاوة غني بالعصير والزيوت العطرية الطبيعية بفترة صلاحية ممتدة.',
 'Cultivated in sandy reclaimed soils under controlled drip irrigation, Egyptian lemons provide excellent firmness, smooth skins and superior juice yields.',
 'يوفر الليمون المصري ثماراً متماسكة خالية من العيوب تلبي أعلى متطلبات التصدير لأسواق أوروبا والشرق الأقصى.',
 '{"scientificName":"Citrus limon","variety":"Adalia, Eureka, Verna","season":"October - March","sizes":"80, 88, 100, 113, 125, 138 per carton","color":"Bright vibrant yellow","taste":"High natural acidity, intense citrus aroma, juice > 35%","packaging":"15 kg telescopic / open-top cartons","shelfLife":"60 - 90 days at 10 - 12°C","storageTemp":"10 - 12°C, 85-90% RH","transportation":"Reefer container at 10°C, ventilation 15 m3/h","moq":"1x 40ft Reefer Container","loading":"24 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Citrus limon","variety":"أضاليا، يوريكا، فيرنا","season":"أكتوبر - مارس","sizes":"80، 88، 100، 113، 125، 138","color":"أصفر ساطع","taste":"حمضية طبيعية عالية وعصير وفير","packaging":"كرتونة 15 كجم تلسكوبية","shelfLife":"60 - 90 يوماً","storageTemp":"10 - 12 درجة مئوية","transportation":"حاويات مبردة","moq":"حاوية 40 قدم","loading":"24 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/lemons.jpg', '["/assets/lemons.jpg", "/assets/gallery/lemons-2.jpg"]', 1, 6),

('prod-potatoes', 'potatoes', 'export', 'cat-vegetables',
 'Fresh Table & Processing Potatoes', 'بطاطس طازجة للمائدة والتصنيع',
 'Spunta, Hermes & Lady Rosetta · 35–80+ mm calibres · Washed/brushed 10/25 kg mesh & big bags.',
 'سبونتا وهيرمس وليدي روزيتا · مقاسات 35–80+ ملم · أجولة 10/25 كجم وجامبو باج.',
 'Egypt is one of the premier potato exporters to Europe, Russia and Africa. Produced in brown-rot-free zones (PFA), our Spunta, Hermes and Lady Rosetta potatoes excel in both fresh market sales and industrial processing.',
 'تعتبر البطاطس المصرية رائدة في السوق الدولي بجودتها العالية وصلابتها المتميزة ونظافة قشرتها.',
 '{"scientificName":"Solanum tuberosum","variety":"Spunta, Hermes, Lady Rosetta, Cara, Mondial","season":"January - June","sizes":"35 - 55 mm, 45 - 65 mm, 55+ mm","color":"Bright golden yellow skin with light yellow flesh","taste":"Firm, clean, buttery taste, excellent dry matter 20 - 24%","packaging":"10 kg, 25 kg PP mesh bags or 1,250 kg jumbo bags","shelfLife":"4 - 6 months under proper storage","storageTemp":"6 - 8°C (table) / 8 - 10°C (processing)","transportation":"Reefer container or ventilated sea freight","moq":"1x 40ft Container","loading":"26 - 28 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Solanum tuberosum","variety":"سبونتا، هيرمس، ليدي روزيتا، كارا","season":"يناير - يونيو","sizes":"35 - 55 ملم، 45 - 65 ملم، 55+ ملم","color":"قشرة ذهبية نظيفة ولب متماسك","taste":"قوام صلب ممتاز للمائدة والرقائق","packaging":"أجولة شبكية 10 أو 25 كجم أو جامبو 1250 كجم","shelfLife":"4 - 6 أشهر","storageTemp":"6 - 8 درجات مئوية","transportation":"حاويات مبردة أو مهواة","moq":"حاوية 40 قدم","loading":"26 - 28 طن متري","certifications":"شهادة صحة نباتية، شهادة منشأ، شهادة صلاحية تصديرية"}',
 '/assets/potatoes.jpg', '["/assets/potatoes.jpg", "/assets/gallery/potatoes-2.jpg"]', 1, 7),

('prod-onions', 'onions', 'export', 'cat-vegetables',
 'Golden & Red Egyptian Onions', 'بصل ذهبي وأحمر مصري',
 'Giza 6, Golden Yellow & Red · Calibres 40–90 mm · Tight cured skin · 10/20/25 kg mesh bags.',
 'بصل مصري أصفر وأحمر عالي الجفاف والصلابة، يتميز بقدرته الفائقة على التخزين والشحن الطويل.',
 'Egyptian onions are internationally recognized for their firmness, dry paper skin and robust flavor profile. Sourced directly from trusted Delta and Upper Egypt farms.',
 'يتميز البصل المصري بقوة تحمله ونكهته القوية وقشرته الجافة التي تحميه أثناء الشحن الطويل لكافة الموانئ.',
 '{"scientificName":"Allium cepa","variety":"Golden Yellow, Red Globe, Giza 6","season":"February - September","sizes":"40 - 60 mm, 50 - 70 mm, 60 - 80 mm, 70 - 90 mm","color":"Golden bronze or deep reddish-purple","taste":"Strong, pungent, high dry matter > 14%","packaging":"10 kg, 25 kg red/yellow mesh bags or 1 ton jumbo bags","shelfLife":"6 - 9 months in ventilated conditions","storageTemp":"0 - 2°C with 65-70% RH or ambient ventilated","transportation":"Ventilated container or reefer container at 2°C","moq":"1x 40ft Container","loading":"26 - 28 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Allium cepa","variety":"أصفر ذهبي، أحمر جلوب، جيزة 6","season":"فبراير - سبتمبر","sizes":"40-60، 50-70، 60-80، 70-90 ملم","color":"برونزي ذهبي أو أرجواني أحمر","taste":"نكهة قوية ونسبة مادة جافة عالية","packaging":"أجولة شبكية 10 أو 25 كجم أو أكياس جامبو","shelfLife":"6 - 9 أشهر","storageTemp":"تهوية جيدة أو تبريد عند 2 درجة","transportation":"حاويات مهواة أو مبردة","moq":"حاوية 40 قدم","loading":"26 - 28 طن متري","certifications":"شهادة صحة نباتية، شهادة منشأ، شهادة صلاحية تصديرية"}',
 '/assets/onions.jpg', '["/assets/onions.jpg", "/assets/gallery/onions-2.jpg"]', 1, 8),

('prod-garlic', 'garlic', 'export', 'cat-vegetables',
 'Fresh & Dry Egyptian Garlic', 'ثوم مصري طازج وجاف',
 'White and purple garlic heads featuring tight cloves, intense aroma and high allicin content.',
 'ثوم مصري أبيض وبنفسجي برائحة عطرية قوية ونكهة حادة وفترة صلاحية ممتازة.',
 'Egyptian garlic is harvested in both green (fresh with stems) and dry forms. Our Giza and Chinese varieties are meticulously cleaned, graded by bulb diameter and dried naturally.',
 'يعد الثوم المصري من أفضل الأصناف المرغوبة في الأسواق العالمية بنكهته القوية وغناه بمادة الأليسين الصحية.',
 '{"scientificName":"Allium sativum","variety":"Egyptian White, Baladi, Red / Purple","season":"February - April (Fresh Green), May - August (Dry)","sizes":"40 mm, 45 mm, 50 mm, 55 mm, 60+ mm","color":"Pure white or purple-striped skin","taste":"Pungent, highly aromatic and spicy","packaging":"5 kg, 10 kg cartons or mesh bags; 1 kg loose braid","shelfLife":"6 - 8 months dry storage","storageTemp":"-1 to 0°C, 65-70% RH","transportation":"Reefer container at 0°C with ventilation","moq":"1x 40ft Container","loading":"24 - 26 Metric Tons","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Allium sativum","variety":"أبيض بلدي، أحمر / بنفسجي مصري","season":"فبراير - أبريل (أخضر)، مايو - أغسطس (جاف)","sizes":"40، 45، 50، 55، 60+ ملم","color":"أبيض ناصع أو مخطط بنفسجي","taste":"نفاذ وغني بالزيوت العطرية","packaging":"كراتين 5 و10 كجم أو شبك","shelfLife":"6 - 8 أشهر في ظروف جافة","storageTemp":"-1 إلى 0 درجة مئوية","transportation":"حاويات مبردة مع ضبط الرطوبة","moq":"حاوية 40 قدم","loading":"24 - 26 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/garlic.jpg', '["/assets/garlic.jpg", "/assets/gallery/garlic-2.jpg"]', 1, 9),

('prod-sweet-potatoes', 'sweet-potatoes', 'export', 'cat-vegetables',
 'Beauregard Sweet Potatoes', 'بطاطا حلوة بورجارد فاخرة',
 'Vibrant orange-fleshed sweet potatoes, carefully cured for high brix sweetness and silky texture.',
 'بطاطا حلوة مصرية صنف بورجارد بلونها البرتقالي الجذاب ونعومة قوامها بعد الطهي.',
 'Egypt has risen to become a leading European supplier of cured sweet potatoes. Our Beauregard and Bellevue varieties are grown in sandy soils, gently machine and hand-harvested, and cured in temperature-controlled facilities.',
 'تعتبر البطاطا الحلوة المصرية من أكثر المحاصيل طلباً في أوروبا بفضل طعمها السكري وقيمتها الغذائية العالية.',
 '{"scientificName":"Ipomoea batatas","variety":"Beauregard, Bellevue, Evangeline","season":"July - March","sizes":"S (150-300g), M (300-450g), L (450-600g), XL (600-800g)","color":"Copper-red skin with bright orange flesh","taste":"Naturally sweet, creamy texture, brix > 11°","packaging":"6 kg cartons, 10 kg cartons, or 500 kg wooden bins","shelfLife":"4 - 6 months properly cured","storageTemp":"13 - 15°C, 85-90% RH","transportation":"Reefer container at 14°C, ventilation 25 m3/h","moq":"1x 40ft Reefer Container","loading":"22 - 24 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Ipomoea batatas","variety":"بورجارد، بيلفيو، إيفانجلين","season":"يوليو - مارس","sizes":"S, M, L, XL (من 150 إلى 800 جم)","color":"قشرة نحاسية ولب برتقالي زاهي","taste":"حلو طبيعي وقوام كريمي ممتاز","packaging":"كراتين 6 كجم أو 10 كجم","shelfLife":"4 - 6 أشهر بعد المعالجة","storageTemp":"13 - 15 درجة مئوية","transportation":"حاويات مبردة عند 14 درجة","moq":"حاوية 40 قدم","loading":"22 - 24 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/sweet-potatoes.jpg', '["/assets/sweet-potatoes.jpg", "/assets/gallery/sweet-potatoes-2.jpg"]', 1, 10),

('prod-green-beans', 'green-beans', 'export', 'cat-vegetables',
 'Fine & Extra-Fine Green Beans', 'فاصوليا خضراء رفيعة وفاخرة',
 'Slender, stringless green pods picked daily and hydro-cooled to lock in field freshness.',
 'فاصوليا خضراء طازجة مقرمشة بدون خيوط، يتم جمعها وفرزها يومياً وتبريدها بالماء فور الحصاد.',
 'Egyptian green beans are harvested daily in climate-favored regions across the Nile Delta and desert oases. Immediately hydro-cooled post-harvest, our Paulista and Serengeti varieties maintain their vibrant green color and crisp snap.',
 'تتميز الفاصوليا الخضراء المصرية بلونها الأخضر النضر وقوامها المقرمش الخالي تماماً من الألياف.',
 '{"scientificName":"Phaseolus vulgaris","variety":"Paulista, Nomad, Serengeti, Bronco","season":"October - May","sizes":"Extra-fine (< 6 mm), Fine (6 - 9 mm), Bobby (9 - 12 mm)","color":"Bright uniform emerald green","taste":"Crisp, succulent, tender, completely stringless","packaging":"250g, 500g punnets in 3 kg cartons or 5 kg bulk cartons","shelfLife":"10 - 14 days fresh (air), 24 months IQF","storageTemp":"5 - 7°C fresh, -18°C IQF","transportation":"Air freight at 6°C or reefer container for IQF","moq":"500 kg air freight / 1x 40ft container IQF","loading":"Up to 22 Metric Tons in 40ft container (IQF)","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Phaseolus vulgaris","variety":"بوليستا، سيرينجيتي، نوماد","season":"أكتوبر - مايو","sizes":"إكسترا رفيع (< 6 ملم)، رفيع (6-9 ملم)","color":"أخضر زمردي متجانس","taste":"مقرمشة وطرية بدون أي ألياف","packaging":"بانيتات 250 و500 جم أو كراتين 5 كجم","shelfLife":"10 - 14 يوماً طازج","storageTemp":"5 - 7 درجات مئوية","transportation":"شحن جوي أو بحري سريع","moq":"500 كجم جواً / حاوية بحراً","loading":"22 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/green-beans.jpg', '["/assets/green-beans.jpg", "/assets/gallery/green-beans-2.jpg"]', 1, 11),

('prod-peppers', 'peppers', 'export', 'cat-vegetables',
 'Colored Bell & Chili Peppers', 'فلفل ألوان وفلفل حار',
 'Thick-walled, crunchy bell peppers in red, yellow, orange and green, plus spicy chilies.',
 'فلفل رومي ألوان وفلفل حار سميك الجدران ومقرمش، مزروع بأحدث تقنيات الصوب الزراعية.',
 'Our modern greenhouse and open-field bell peppers offer thick flesh, blocky shape and long shelf life in red, yellow, orange and green colors.',
 'يتم زراعة الفلفل الألوان تحت أحدث الصوب والبيوت المحمية لضمان ثمار ممتلئة ولامعة خالية من أي متبقيات.',
 '{"scientificName":"Capsicum annuum","variety":"California Wonder, Red Knight, Yellow Blocky, Hot Chili","season":"November - June","sizes":"G (70-85 mm), GG (85-100 mm), 5 kg bulk","color":"Bright red, yellow, orange or dark green","taste":"Sweet, crunchy, succulent and juicy","packaging":"5 kg carton loose, flow-pack trio (traffic light)","shelfLife":"18 - 24 days under recommended storage","storageTemp":"7 - 9°C, 90-95% RH","transportation":"Reefer container at 8°C, ventilation 15 m3/h","moq":"1x 40ft Reefer Container","loading":"20 - 22 Metric Tons per container","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '{"scientificName":"Capsicum annuum","variety":"كاليفورنيا وندر، أحمر وأصفر رومي، حار","season":"نوفمبر - يونيو","sizes":"G (70-85 ملم)، GG (85-100 ملم)","color":"أحمر، أصفر، برتقالي، أخضر","taste":"حلو مقرمش مليء بالعصارة","packaging":"كرتونة 5 كجم أو أكياس تريو ثلاثية","shelfLife":"18 - 24 يوماً","storageTemp":"7 - 9 درجات مئوية","transportation":"حاويات مبردة","moq":"حاوية 40 قدم","loading":"20 - 22 طن متري","certifications":"Phytosanitary Certificate, Certificate of Origin, Export Health Certificate"}',
 '/assets/peppers.jpg', '["/assets/peppers.jpg", "/assets/gallery/peppers-2.jpg"]', 1, 12)
ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`), `name_en` = VALUES(`name_en`);

-- 4. Default Site Settings
INSERT INTO `site_settings` (`id`, `company_name`, `phone`, `email`, `whatsapp`, `address`, `maps_url`, `facebook`, `instagram`, `linkedin`, `seo_title`, `seo_description`)
VALUES (
  'default',
  'BucharestEgyAgro Import and Export',
  '+20 107 003 3892',
  'info@bucharestegyagro.com',
  '+20 107 003 3892',
  'Cairo, Egypt — Export Head Office & Dispatch Desk',
  'https://maps.google.com/?q=Cairo',
  'https://facebook.com/bucharestegyagro',
  'https://instagram.com/bucharestegyagro',
  'https://linkedin.com/company/bucharestegyagro',
  'BucharestEgyAgro Import and Export | Fresh Fruits & Vegetables Exporter',
  'Egyptian exporter of fresh, carefully selected fruits and vegetables to international markets.'
) ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

-- 5. Default News Articles
INSERT INTO `news` (`id`, `slug`, `title`, `title_ar`, `excerpt`, `excerpt_ar`, `content`, `content_ar`, `featured_image`, `category`, `author`, `published`)
VALUES (
  'news-1',
  'bucharestegyagro-expands-citrus-exports-2026',
  'BucharestEgyAgro Expands Winter Citrus Export Programs for 2026',
  'بوخارست إيجي أجرو توسع برامج تصدير الموالح لموسم 2026',
  'With state-of-the-art sorting lines and expanded refrigerated logistics, we are ready for record citrus shipments.',
  'بخطوط فرز حديثة وشبكة لوجستية مبردة متطورة، نبدأ شحن أضخم كميات موالح للأسواق الأوروبية والعربية.',
  'BucharestEgyAgro is proud to announce the official launch of our expanded citrus export season for 2026, featuring premium Valencia and Navel oranges shipped directly from Egyptian orchards to European and global ports.',
  'تفخر شركة بوخارست إيجي أجرو بالإعلان عن انطلاق موسم تصدير الموالح لعام 2026 بأعلى معايير الجودة العالمية وفق اشتراطات التصدير الدولية ومعايير الجودة والرقابة الفعّالة.',
  '/assets/oranges.jpg',
  'Company News',
  'Executive Board',
  1
) ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`);

SET FOREIGN_KEY_CHECKS = 1;
