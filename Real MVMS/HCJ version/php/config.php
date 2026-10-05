<?php
// MVMS Database Configuration and Connection
// Mbarara City Market Vendor Management System

class Database {
    private $host = 'localhost';
    private $db_name = 'mvms_db';
    private $username = 'root'; // Change this to your database username
    private $password = ''; // Change this to your database password
    private $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}

// Authentication class
class Auth {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    // Login function
    public function login($email, $password, $role) {
        try {
            // Get user from database
            $query = "SELECT id, name, email, password, role FROM users WHERE email = :email AND role = :role";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':role', $role);
            $stmt->execute();

            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Remove password from response
                unset($user['password']);

                // Start session
                session_start();
                $_SESSION['user'] = $user;

                return [
                    'success' => true,
                    'user' => $user,
                    'message' => 'Login successful'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Invalid email or password'
                ];
            }
        } catch(PDOException $e) {
            return [
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ];
        }
    }

    // Check if user is logged in
    public function isLoggedIn() {
        session_start();
        return isset($_SESSION['user']);
    }

    // Get current user
    public function getCurrentUser() {
        session_start();
        return $_SESSION['user'] ?? null;
    }

    // Logout
    public function logout() {
        session_start();
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }

    // Check if user has specific role
    public function hasRole($role) {
        $user = $this->getCurrentUser();
        return $user && $user['role'] === $role;
    }
}

// Utility functions
function formatUGX($amount) {
    return 'UGX ' . number_format($amount);
}

function formatDate($date) {
    return date('M j, Y', strtotime($date));
}

function sendJsonResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function requireLogin() {
    $auth = new Auth();
    if (!$auth->isLoggedIn()) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Authentication required',
            'redirect' => '../index.html'
        ]);
    }
}

function requireRole($role) {
    $auth = new Auth();
    if (!$auth->hasRole($role)) {
        sendJsonResponse([
            'success' => false,
            'message' => 'Access denied',
            'redirect' => '../index.html'
        ]);
    }
}
?>