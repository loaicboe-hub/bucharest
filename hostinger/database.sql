-- =============================================================================
-- BucharestEgyAgro - Hostinger MySQL Database Schema
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
  `phone` VARCHAR(100) NOT NULL DEFAULT '+20 100 000 0000',
  `email` VARCHAR(191) NOT NULL DEFAULT 'info@bucharestegyagro.com',
  `whatsapp` VARCHAR(100) NOT NULL DEFAULT '+20 100 000 0000',
  `address` TEXT,
  `maps_url` TEXT,
  `facebook` VARCHAR(255) NOT NULL DEFAULT '',
  `instagram` VARCHAR(255) NOT NULL DEFAULT '',
  `linkedin` VARCHAR(255) NOT NULL DEFAULT '',
  `twitter` VARCHAR(255) NOT NULL DEFAULT '',
  `seo_title` VARCHAR(255) NOT NULL DEFAULT 'BucharestEgyAgro | Premium Fresh Fruits & Vegetables Exporter',
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

-- 1. Default Admin User:
-- Email: admin@bucharestegyagro.com
-- Default Password: AdminPassword2026!
-- Hash generated via password_hash('AdminPassword2026!', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `created_at`)
VALUES (
  'usr-admin-initial-01',
  'admin@bucharestegyagro.com',
  '$2y$10$wNqfNf37xGkWjD2bJ7qJreP54zZ5n6Jb9L0X4C6sH9Z7F.gY.b8qG',
  'BucharestEgyAgro Administrator',
  'super_admin',
  NOW()
) ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

-- 2. Default Categories
INSERT INTO `product_categories` (`id`, `slug`, `name_en`, `name_ar`, `sort_order`, `active`, `trade`) VALUES
('cat-fruits', 'fruits', 'Fresh Fruits', 'فواكه طازجة', 1, 1, 'export'),
('cat-vegetables', 'vegetables', 'Fresh Vegetables', 'خضروات طازجة', 2, 1, 'export')
ON DUPLICATE KEY UPDATE `slug` = VALUES(`slug`);

-- 3. Default Site Settings
INSERT INTO `site_settings` (`id`, `company_name`, `phone`, `email`, `whatsapp`, `address`, `maps_url`, `facebook`, `instagram`, `linkedin`, `seo_title`, `seo_description`)
VALUES (
  'default',
  'BucharestEgyAgro Import and Export',
  '+20 100 000 0000',
  'info@bucharestegyagro.com',
  '+20 100 000 0000',
  'Industrial Zone, Cairo, Egypt',
  'https://maps.google.com/?q=Cairo',
  'https://facebook.com/bucharestegyagro',
  'https://instagram.com/bucharestegyagro',
  'https://linkedin.com/company/bucharestegyagro',
  'BucharestEgyAgro Import and Export | Premium Fresh Fruits & Vegetables Exporter',
  'Leading exporter of premium fresh fruits and vegetables since 2011. ISO 9001 certified produce export.'
) ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

SET FOREIGN_KEY_CHECKS = 1;
