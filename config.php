<?php
// ============================================================
// MVMS - Database Configuration
// Update these values to match your local setup
// ============================================================

$host = 'localhost';
$dbname = 'mvms_db';
$username = 'root';       // Change to your MySQL username
$password = '';            // Change to your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

session_start();

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to check user role
function getUserRole() {
    return $_SESSION['role'] ?? null;
}

// Redirect if not logged in
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /mvms/index.php');
        exit;
    }
}

// Redirect if not admin
function requireAdmin() {
    requireLogin();
    if (getUserRole() !== 'admin') {
        header('Location: /mvms/index.php');
        exit;
    }
}

// Redirect if not vendor
function requireVendor() {
    requireLogin();
    if (getUserRole() !== 'vendor') {
        header('Location: /mvms/index.php');
        exit;
    }
}
?>
