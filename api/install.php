<?php
/**
 * BucharestEgyAgro - Automated Database Installer
 * Run once by visiting: https://yourdomain.com/api/install.php
 */
require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=UTF-8');

try {
    $db = getDB();
    
    // Find database.sql file
    $sqlFile = null;
    $possiblePaths = [
        __DIR__ . '/database.sql',
        __DIR__ . '/../database.sql',
        __DIR__ . '/../hostinger/database.sql',
        __DIR__ . '/../public/database.sql'
    ];
    
    foreach ($possiblePaths as $p) {
        if (file_exists($p)) {
            $sqlFile = $p;
            break;
        }
    }
    
    if (!$sqlFile) {
        throw new Exception("database.sql file not found on server.");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute multiple statements
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
    $db->exec($sql);
    
    echo "<div style='font-family:sans-serif;max-width:600px;margin:50px auto;padding:30px;background:#f0fdf4;border:1px solid #86efac;border-radius:12px;color:#166534;direction:rtl;text-align:right;'>";
    echo "<h2 style='margin-top:0;'>✅ تم تثبيت قاعدة البيانات بنجاح!</h2>";
    echo "<p>تم إنشاء جميع الجداول وملؤها بـ <strong>12 منتجاً</strong>، والتصنيفات، وإعدادات الموقع، والمستخدم الأدمن.</p>";
    echo "<p><strong>بيانات دخول لوحة التحكم:</strong></p>";
    echo "<ul><li>البريد: <code>admin@bucharestegyagro.com</code></li><li>كلمة السر: <code>admin123456</code></li></ul>";
    echo "<p style='margin-bottom:0;'><a href='/' style='display:inline-block;padding:10px 20px;background:#15803d;color:#fff;text-decoration:none;border-radius:6px;'>الذهاب للموقع الرئيسي &larr;</a></p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='font-family:sans-serif;max-width:600px;margin:50px auto;padding:30px;background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;color:#991b1b;direction:rtl;text-align:right;'>";
    echo "<h2 style='margin-top:0;'>❌ فشل الاتصال بقاعدة البيانات</h2>";
    echo "<p>الخطأ: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>تأكد من كتابة <code>DB_NAME</code> و <code>DB_USER</code> و <code>DB_PASS</code> الصحيحة في ملف <code>config.php</code>.</p>";
    echo "</div>";
}
