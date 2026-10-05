<?php
require_once 'config.php';

// If already logged in, redirect
if (isLoggedIn()) {
    if (getUserRole() === 'admin') {
        header('Location: admin/dashboard.php');
    } else {
        header('Location: vendor/dashboard.php');
    }
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';

    if (empty($email) || empty($password) || empty($role)) {
        $error = 'Please fill in all fields and select your role.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = ?");
        $stmt->execute([$email, $role]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['business_name'] = $user['business_name'] ?? '';

            if ($role === 'admin') {
                header('Location: admin/dashboard.php');
            } else {
                header('Location: vendor/dashboard.php');
            }
            exit;
        } else {
            $error = 'Invalid email, password, or role. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MVMS - Market Vendor Management System</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="login-wrapper">
    <!-- Left Hero -->
    <div class="login-hero">
        <div class="login-hero-content">
            <div class="logo-icon">🏪</div>
            <h1>MVMS</h1>
            <p>Market Vendor Management System</p>
            <p style="font-size:0.85rem; opacity:0.7;">Mbarara City, Uganda</p>
            <div class="info-box">
                Streamlining vendor registration, stall allocation, payment tracking, 
                and market administration for Mbarara's traditional markets.
            </div>
            <div class="login-hero-stats">
                <div class="stat"><strong>240+</strong><span>Vendors</span></div>
                <div class="stat"><strong>180</strong><span>Stalls</span></div>
                <div class="stat"><strong>3</strong><span>Markets</span></div>
            </div>
        </div>
    </div>

    <!-- Right Login Form -->
    <div class="login-form-side">
        <div class="login-form-container">
            <!-- Mobile header -->
            <div style="text-align:center; margin-bottom:1.5rem;" class="mobile-only">
                <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#d4a843,#e8c468);display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:0.5rem;">🏪</div>
                <h2 style="font-size:1.3rem;">MVMS</h2>
                <p class="text-muted text-sm">Mbarara City, Uganda</p>
            </div>

            <h2>Welcome Back</h2>
            <p class="subtitle">Sign in to access your market dashboard</p>

            <?php if ($error): ?>
                <div style="background:var(--danger-light);color:var(--danger);padding:0.75rem 1rem;border-radius:8px;font-size:0.85rem;margin-bottom:1rem;">
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.5rem;">Select Your Role</label>
                <div class="role-selector">
                    <div class="role-option active" data-role="vendor" onclick="selectRole('vendor')">
                        <input type="radio" name="role" value="vendor" id="role-vendor" checked>
                        <div class="role-icon">🏪</div>
                        <div class="role-name">Market Vendor</div>
                        <div class="role-desc">Sell & manage stalls</div>
                    </div>
                    <div class="role-option" data-role="admin" onclick="selectRole('admin')">
                        <input type="radio" name="role" value="admin" id="role-admin">
                        <div class="role-icon">🛡️</div>
                        <div class="role-name">Market Admin</div>
                        <div class="role-desc">Manage all operations</div>
                    </div>
                </div>
                <input type="hidden" id="role-input" name="role" value="vendor">

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required
                           value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" name="password" placeholder="Enter your password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword(this)">👁</button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">🔐 Sign In</button>
            </form>

            <div class="demo-box">
                <h4>Demo Credentials</h4>
                <div class="cred"><span class="badge-admin">Admin</span> admin@mbararamarket.ug / Admin@123</div>
                <div class="cred"><span class="badge-vendor">Vendor</span> vendor@mbararamarket.ug / Vendor@123</div>
            </div>

            <div class="login-footer">Mbarara City Market Authority — &copy; <?= date('Y') ?></div>
        </div>
    </div>
</div>

<script src="js/main.js"></script>
<script>
// Fix role selector to also update hidden input
function selectRole(role) {
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
    document.querySelector('.role-option[data-role="'+role+'"]').classList.add('active');
    document.getElementById('role-input').value = role;
    document.getElementById('role-'+role).checked = true;
}
</script>
</body>
</html>
