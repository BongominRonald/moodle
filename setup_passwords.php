<?php
// ============================================================
// Run this file ONCE after importing database.sql
// It will hash all passwords properly
// URL: http://localhost/mvms/setup_passwords.php
// ============================================================
require_once 'config.php';

$admin_hash = password_hash('Admin@123', PASSWORD_DEFAULT);
$vendor_hash = password_hash('Vendor@123', PASSWORD_DEFAULT);

// Update admin
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE role = 'admin'");
$stmt->execute([$admin_hash]);

// Update all vendors
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE role = 'vendor'");
$stmt->execute([$vendor_hash]);

echo "<h2>Passwords Updated Successfully!</h2>";
echo "<p>Admin: admin@mbararamarket.ug / Admin@123</p>";
echo "<p>Vendors: vendor@mbararamarket.ug / Vendor@123</p>";
echo "<p><strong>Delete this file after running it!</strong></p>";
echo '<p><a href="index.php">Go to Login Page</a></p>';
?>
