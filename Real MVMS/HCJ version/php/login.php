<?php
// MVMS Login API
// Handles user authentication

require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Invalid request data'
    ]);
}

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$role = $input['role'] ?? '';

if (empty($email) || empty($password) || empty($role)) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Email, password, and role are required'
    ]);
}

if (!in_array($role, ['admin', 'vendor'])) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Invalid role specified'
    ]);
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJsonResponse([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
}

// Attempt login
$auth = new Auth();
$result = $auth->login($email, $password, $role);

sendJsonResponse($result);
?>