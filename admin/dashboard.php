<?php
require_once __DIR__ . '/../config.php';
requireAdmin();

$user_name = $_SESSION['user_name'];
$user_role = $_SESSION['role'];

// Fetch data
$vendors = $pdo->query("SELECT * FROM users WHERE role='vendor'")->fetchAll();
$stalls = $pdo->query("SELECT * FROM stalls ORDER BY number")->fetchAll();
$bookings = $pdo->query("SELECT b.*, u.name as vendor_name, s.number as stall_number FROM bookings b JOIN users u ON b.vendor_id=u.id JOIN stalls s ON b.stall_id=s.id ORDER BY b.created_at DESC")->fetchAll();
$payments = $pdo->query("SELECT p.*, u.name as vendor_name FROM payments p JOIN users u ON p.vendor_id=u.id ORDER BY p.date DESC")->fetchAll();
$announcements = $pdo->query("SELECT * FROM announcements ORDER BY date DESC")->fetchAll();

$totalRevenue = array_sum(array_column($payments, 'amount'));
$availableStalls = count(array_filter($stalls, fn($s) => $s['status'] === 'available'));
$pendingVendors = count(array_filter($vendors, fn($v) => $v['status'] === 'pending'));

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'approve_vendor') {
        $vid = (int)$_POST['vendor_id'];
        $pdo->prepare("UPDATE users SET status='approved', approval_date=CURDATE() WHERE id=?")->execute([$vid]);
        header('Location: dashboard.php?msg=Vendor+approved'); exit;
    }
    if ($action === 'reject_vendor') {
        $vid = (int)$_POST['vendor_id'];
        $pdo->prepare("UPDATE users SET status='rejected' WHERE id=?")->execute([$vid]);
        header('Location: dashboard.php?msg=Vendor+rejected'); exit;
    }
    if ($action === 'add_vendor') {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role, business_name, business_type, id_number, status, compliance_status, license_expiry, health_cert_expiry) VALUES (?,?,?,?, 'vendor',?,?,?,?,?,?,?)");
        $stmt->execute([
            $_POST['name'],
            $_POST['email'],
            $_POST['phone'],
            password_hash('Vendor@123', PASSWORD_DEFAULT),
            $_POST['business_name'],
            $_POST['business_type'],
            $_POST['id_number'],
            'pending',
            'compliant',
            $_POST['license_expiry'] ?: null,
            $_POST['health_cert_expiry'] ?: null
        ]);
        header('Location: dashboard.php?msg=Vendor+added+successfully'); exit;
    }
    if ($action === 'delete_vendor') {
        $vid = (int)($_POST['vendor_id'] ?? 0);
        $pdo->prepare("DELETE FROM users WHERE id=? AND role='vendor'")->execute([$vid]);
        header('Location: dashboard.php?msg=Vendor+deleted'); exit;
    }
    if ($action === 'add_stall') {
        $stmt = $pdo->prepare("INSERT INTO stalls (number, location, size, daily_rate, status) VALUES (?,?,?,?,'available')");
        $stmt->execute([$_POST['stall_number'], $_POST['location'], $_POST['size'], $_POST['daily_rate']]);
        header('Location: dashboard.php?msg=Stall+added'); exit;
    }
    if ($action === 'delete_stall') {
        $pdo->prepare("DELETE FROM stalls WHERE id=?")->execute([(int)$_POST['stall_id']]);
        header('Location: dashboard.php?msg=Stall+deleted'); exit;
    }
    if ($action === 'add_announcement') {
        $stmt = $pdo->prepare("INSERT INTO announcements (title, message, type, date) VALUES (?,?,?,CURDATE())");
        $stmt->execute([$_POST['title'], $_POST['message'], $_POST['type']]);
        header('Location: dashboard.php?msg=Announcement+published'); exit;
    }
    if ($action === 'delete_announcement') {
        $aid = (int)($_POST['announcement_id'] ?? 0);
        $pdo->prepare("DELETE FROM announcements WHERE id=?")->execute([$aid]);
        header('Location: dashboard.php?msg=Announcement+deleted'); exit;
    }
    if ($action === 'update_payment_status') {
        $pid = (int)($_POST['payment_id'] ?? 0);
        $status = $_POST['payment_status'] ?? '';
        if (in_array($status, ['completed', 'failed'], true)) {
            $pdo->prepare("UPDATE payments SET status=? WHERE id=?")->execute([$status, $pid]);
            header('Location: dashboard.php?msg=Payment+status+updated'); exit;
        }
    }
    if ($action === 'toggle_stall_maintenance') {
        $sid = (int)($_POST['stall_id'] ?? 0);
        $status = $_POST['stall_status'] ?? 'available';
        $next = $status === 'maintenance' ? 'available' : 'maintenance';
        $pdo->prepare("UPDATE stalls SET status=? WHERE id=? AND status!='booked'")->execute([$next, $sid]);
        header('Location: dashboard.php?msg=Stall+status+updated'); exit;
    }
    if ($action === 'update_compliance') {
        $vid = (int)($_POST['vendor_id'] ?? 0);
        $status = $_POST['compliance_status'] ?? '';
        if (in_array($status, ['compliant', 'non-compliant'], true)) {
            $pdo->prepare("UPDATE users SET compliance_status=? WHERE id=?")->execute([$status, $vid]);
            header('Location: dashboard.php?msg=Compliance+status+updated'); exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - MVMS</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="dashboard">
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" onclick="closeSidebar()"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="logo">🏪</div>
            <div class="logo-text">
                <h3>MVMS</h3>
                <span>Mbarara City</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="#" data-section="sec-dashboard" onclick="showSection('sec-dashboard');return false;" class="active">
                <span class="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" data-section="sec-vendors" onclick="showSection('sec-vendors');return false;">
                <span class="nav-icon">👥</span> Vendor Management
            </a>
            <a href="#" data-section="sec-stalls" onclick="showSection('sec-stalls');return false;">
                <span class="nav-icon">📍</span> Stall Management
            </a>
            <a href="#" data-section="sec-payments" onclick="showSection('sec-payments');return false;">
                <span class="nav-icon">💳</span> Payments & Revenue
            </a>
            <a href="#" data-section="sec-compliance" onclick="showSection('sec-compliance');return false;">
                <span class="nav-icon">🛡️</span> Compliance
            </a>
            <a href="#" data-section="sec-announcements" onclick="showSection('sec-announcements');return false;">
                <span class="nav-icon">📢</span> Announcements
            </a>
            <a href="#" data-section="sec-reports" onclick="showSection('sec-reports');return false;">
                <span class="nav-icon">📄</span> Reports
            </a>
        </nav>
        <div class="sidebar-user">
            <div class="user-info">
                <div class="avatar"><?= strtoupper(substr($user_name,0,1)) ?></div>
                <div>
                    <div class="user-name"><?= htmlspecialchars($user_name) ?></div>
                    <div class="user-role"><?= $user_role ?></div>
                </div>
            </div>
            <a href="../logout.php" class="logout-btn">🚪 Logout</a>
        </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
        <header class="topbar">
            <button class="hamburger" onclick="openSidebar()">☰</button>
            <h2 id="page-title">Dashboard</h2>
        </header>

        <div class="content-area">
            <?php if (isset($_GET['msg'])): ?>
                <script>document.addEventListener('DOMContentLoaded',()=>showToast('<?= htmlspecialchars($_GET['msg']) ?>'));</script>
            <?php endif; ?>

            <!-- ===== DASHBOARD ===== -->
            <div id="sec-dashboard" class="section active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info"><p>Total Vendors</p><h3><?= count($vendors) ?></h3></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📍</div>
                        <div class="stat-info"><p>Available Stalls</p><h3><?= $availableStalls ?>/<?= count($stalls) ?></h3></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info"><p>Total Revenue</p><h3>UGX <?= number_format($totalRevenue) ?></h3></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-info"><p>Pending Approvals</p><h3><?= $pendingVendors ?></h3></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Recent Bookings</div>
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Booking ID</th><th>Vendor</th><th>Stall</th><th>Amount (UGX)</th><th>Status</th></tr></thead>
                            <tbody>
                            <?php foreach(array_slice($bookings,0,5) as $b): ?>
                                <tr>
                                    <td><strong>#<?= $b['id'] ?></strong></td>
                                    <td><?= htmlspecialchars($b['vendor_name']) ?></td>
                                    <td><?= htmlspecialchars($b['stall_number']) ?></td>
                                    <td><?= number_format($b['total_amount']) ?></td>
                                    <td><span class="badge <?= $b['status']==='confirmed'?'badge-success':($b['status']==='pending'?'badge-warning':'badge-danger') ?>"><?= $b['status'] ?></span></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ===== VENDOR MANAGEMENT ===== -->
            <div id="sec-vendors" class="section">
                <div class="flex-between mb-md">
                    <p class="text-muted">Manage vendors, onboarding and approval workflow</p>
                    <button class="btn btn-primary" style="width:auto" onclick="toggleAddForm('add-vendor-form')">➕ Add Vendor</button>
                </div>
                <div id="add-vendor-form" class="add-form card mb-md">
                    <div class="card-body">
                        <h4 class="mb-md">Add New Vendor</h4>
                        <form method="POST">
                            <input type="hidden" name="action" value="add_vendor">
                            <div class="form-row mb-md">
                                <div class="form-group"><label>Full Name</label><input name="name" required></div>
                                <div class="form-group"><label>Email</label><input type="email" name="email" required></div>
                            </div>
                            <div class="form-row mb-md">
                                <div class="form-group"><label>Phone</label><input name="phone" required></div>
                                <div class="form-group"><label>National ID</label><input name="id_number" required></div>
                            </div>
                            <div class="form-row mb-md">
                                <div class="form-group"><label>Business Name</label><input name="business_name" required></div>
                                <div class="form-group"><label>Business Type</label><input name="business_type" required></div>
                            </div>
                            <div class="form-row mb-md">
                                <div class="form-group"><label>License Expiry</label><input type="date" name="license_expiry"></div>
                                <div class="form-group"><label>Health Cert Expiry</label><input type="date" name="health_cert_expiry"></div>
                            </div>
                            <p class="text-muted text-sm mb-md">Default password for this vendor will be <strong>Vendor@123</strong>.</p>
                            <div class="flex gap-sm">
                                <button type="submit" class="btn btn-primary" style="width:auto">Save Vendor</button>
                                <button type="button" class="btn btn-outline" onclick="toggleAddForm('add-vendor-form')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="filters">
                    <input type="text" id="vendor-search" placeholder="🔍 Search vendors..." oninput="filterTable('vendor-search','vendor-table')">
                    <select id="vendor-filter" onchange="filterByStatus('vendor-filter','vendor-table')">
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div class="card">
                    <div class="table-wrapper">
                        <table id="vendor-table">
                            <thead><tr><th>ID</th><th>Name</th><th>Business</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                            <?php foreach($vendors as $v): ?>
                                <tr>
                                    <td><strong><?= $v['id'] ?></strong></td>
                                    <td><?= htmlspecialchars($v['name']) ?></td>
                                    <td><?= htmlspecialchars($v['business_name']) ?></td>
                                    <td><?= htmlspecialchars($v['phone']) ?></td>
                                    <td><span class="badge <?= $v['status']==='approved'?'badge-success':($v['status']==='pending'?'badge-warning':'badge-danger') ?>"><?= $v['status'] ?></span></td>
                                    <td>
                                        <div class="flex gap-sm">
                                            <button class="btn-icon" title="View" onclick="showVendorDetail('<?= htmlspecialchars($v['name'],ENT_QUOTES) ?>','<?= htmlspecialchars($v['id_number'] ?? '',ENT_QUOTES) ?>','<?= htmlspecialchars($v['email'],ENT_QUOTES) ?>','<?= htmlspecialchars($v['phone'],ENT_QUOTES) ?>','<?= htmlspecialchars($v['business_name'] ?? '',ENT_QUOTES) ?>','<?= htmlspecialchars($v['business_type'] ?? '',ENT_QUOTES) ?>','<?= $v['status'] ?>','<?= $v['license_expiry'] ?>','<?= $v['health_cert_expiry'] ?>')">👁</button>
                                            <?php if($v['status']==='pending'): ?>
                                                <form method="POST" style="display:inline"><input type="hidden" name="action" value="approve_vendor"><input type="hidden" name="vendor_id" value="<?= $v['id'] ?>"><button class="btn-icon" style="color:var(--primary)" title="Approve">✅</button></form>
                                                <form method="POST" style="display:inline"><input type="hidden" name="action" value="reject_vendor"><input type="hidden" name="vendor_id" value="<?= $v['id'] ?>"><button class="btn-icon" style="color:var(--danger)" title="Reject">❌</button></form>
                                            <?php endif; ?>
                                            <form method="POST" style="display:inline" onsubmit="return confirm('Delete this vendor account?')">
                                                <input type="hidden" name="action" value="delete_vendor">
                                                <input type="hidden" name="vendor_id" value="<?= (int)$v['id'] ?>">
                                                <button class="btn-icon" style="color:var(--danger)" title="Delete">🗑️</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Vendor Detail Modal -->
                <div id="vendor-detail-modal" class="modal-overlay" onclick="closeModal('vendor-detail-modal')">
                    <div class="modal" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h3 id="modal-vendor-name"></h3>
                            <button class="modal-close" onclick="closeModal('vendor-detail-modal')">&times;</button>
                        </div>
                        <div class="modal-grid">
                            <div><span class="label">ID Number:</span></div><div id="modal-vendor-id"></div>
                            <div><span class="label">Email:</span></div><div id="modal-vendor-email"></div>
                            <div><span class="label">Phone:</span></div><div id="modal-vendor-phone"></div>
                            <div><span class="label">Business:</span></div><div id="modal-vendor-business"></div>
                            <div><span class="label">Type:</span></div><div id="modal-vendor-type"></div>
                            <div><span class="label">Status:</span></div><div id="modal-vendor-status"></div>
                            <div><span class="label">License Expiry:</span></div><div id="modal-vendor-license"></div>
                            <div><span class="label">Health Cert:</span></div><div id="modal-vendor-health"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== STALL MANAGEMENT ===== -->
            <div id="sec-stalls" class="section">
                <div class="flex-between mb-md">
                    <p class="text-muted"><?= count($stalls) ?> stalls total</p>
                    <button class="btn btn-primary" style="width:auto" onclick="toggleAddForm('add-stall-form')">➕ Add Stall</button>
                </div>
                <div class="filters mb-md">
                    <select id="stall-filter" onchange="filterByStatus('stall-filter','stall-status-table')">
                        <option value="all">All Stall Statuses</option>
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <div id="add-stall-form" class="add-form card" style="margin-bottom:1rem;">
                    <div class="card-body">
                        <h4 class="mb-md">Add New Stall</h4>
                        <form method="POST">
                            <input type="hidden" name="action" value="add_stall">
                            <div class="form-row mb-md">
                                <div class="form-group"><label>Stall Number</label><input name="stall_number" placeholder="e.g. E-01" required></div>
                                <div class="form-group"><label>Location</label><input name="location" placeholder="e.g. Section E - Ground Floor" required></div>
                            </div>
                            <div class="form-row mb-md">
                                <div class="form-group">
                                    <label>Size</label>
                                    <select name="size">
                                        <option>Small (2x2m)</option><option>Small (2x3m)</option><option>Medium (3x4m)</option><option>Large (4x5m)</option>
                                    </select>
                                </div>
                                <div class="form-group"><label>Daily Rate (UGX)</label><input type="number" name="daily_rate" value="5000" required></div>
                            </div>
                            <div class="flex gap-sm">
                                <button type="submit" class="btn btn-primary" style="width:auto">Save</button>
                                <button type="button" class="btn btn-outline" onclick="toggleAddForm('add-stall-form')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="stall-grid" id="stall-status-table">
                    <?php foreach($stalls as $s): ?>
                        <div class="stall-card" data-status="<?= htmlspecialchars($s['status']) ?>">
                            <div class="stall-header">
                                <span class="stall-number">📍 <?= htmlspecialchars($s['number']) ?></span>
                                <span class="badge <?= $s['status']==='available'?'badge-success':($s['status']==='booked'?'badge-warning':'badge-danger') ?>"><?= $s['status'] ?></span>
                            </div>
                            <div class="stall-details">
                                <p><?= htmlspecialchars($s['location']) ?></p>
                                <p><?= htmlspecialchars($s['size']) ?></p>
                            </div>
                            <div class="stall-rate">UGX <?= number_format($s['daily_rate']) ?>/day</div>
                            <div class="stall-actions">
                                <?php if($s['status'] !== 'booked'): ?>
                                    <form method="POST">
                                        <input type="hidden" name="action" value="toggle_stall_maintenance">
                                        <input type="hidden" name="stall_id" value="<?= (int)$s['id'] ?>">
                                        <input type="hidden" name="stall_status" value="<?= htmlspecialchars($s['status']) ?>">
                                        <button class="btn-icon" style="color:var(--warning)" title="Toggle maintenance">🛠️</button>
                                    </form>
                                <?php endif; ?>
                                <form method="POST" onsubmit="return confirm('Delete this stall?')">
                                    <input type="hidden" name="action" value="delete_stall">
                                    <input type="hidden" name="stall_id" value="<?= $s['id'] ?>">
                                    <button class="btn-icon" style="color:var(--danger)" title="Delete" <?= $s['status']==='booked' ? 'disabled' : '' ?>>🗑️</button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- ===== PAYMENTS ===== -->
            <div id="sec-payments" class="section">
                <div class="flex-between mb-md">
                    <div class="flex gap-sm" style="align-items:center">
                        <span>💳</span>
                        <strong class="text-lg">Total Revenue: UGX <?= number_format($totalRevenue) ?></strong>
                    </div>
                    <button class="btn btn-primary" style="width:auto" onclick="printReport('Payment Report')">🖨️ Print Report</button>
                </div>
                <div class="filters mb-md">
                    <input type="text" id="payment-search" placeholder="🔍 Search payments..." oninput="filterTable('payment-search','payment-table')">
                    <select id="payment-filter" onchange="filterByStatus('payment-filter','payment-table')">
                        <option value="all">All Payment Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div id="report-content">
                    <div class="card">
                        <div class="table-wrapper">
                            <table id="payment-table">
                                <thead><tr><th>Receipt #</th><th>Vendor</th><th>Stall</th><th>Amount (UGX)</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                <?php foreach($payments as $p): ?>
                                    <tr>
                                        <td><strong><?= htmlspecialchars($p['receipt_number']) ?></strong></td>
                                        <td><?= htmlspecialchars($p['vendor_name']) ?></td>
                                        <td><?= htmlspecialchars($p['stall_number']) ?></td>
                                        <td><?= number_format($p['amount']) ?></td>
                                        <td><?= htmlspecialchars($p['method']) ?></td>
                                        <td><?= $p['date'] ?></td>
                                        <td><span class="badge <?= $p['status']==='completed' ? 'badge-success' : ($p['status']==='pending' ? 'badge-warning' : 'badge-danger') ?>"><?= $p['status'] ?></span></td>
                                        <td>
                                            <?php if ($p['status'] === 'pending'): ?>
                                                <div class="flex gap-sm">
                                                    <form method="POST" style="display:inline">
                                                        <input type="hidden" name="action" value="update_payment_status">
                                                        <input type="hidden" name="payment_id" value="<?= (int)$p['id'] ?>">
                                                        <input type="hidden" name="payment_status" value="completed">
                                                        <button class="btn-icon" style="color:var(--primary)" title="Verify">✅</button>
                                                    </form>
                                                    <form method="POST" style="display:inline">
                                                        <input type="hidden" name="action" value="update_payment_status">
                                                        <input type="hidden" name="payment_id" value="<?= (int)$p['id'] ?>">
                                                        <input type="hidden" name="payment_status" value="failed">
                                                        <button class="btn-icon" style="color:var(--danger)" title="Reject">❌</button>
                                                    </form>
                                                </div>
                                            <?php else: ?>
                                                <span class="text-muted text-sm">-</span>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== COMPLIANCE ===== -->
            <div id="sec-compliance" class="section">
                <?php
                $approved = array_filter($vendors, fn($v) => $v['status'] === 'approved');
                $compliant = count(array_filter($approved, fn($v) => $v['compliance_status'] === 'compliant'));
                $nonCompliant = count($approved) - $compliant;
                ?>
                <div class="stats-grid" style="grid-template-columns:1fr 1fr;">
                    <div class="stat-card"><div class="stat-icon">🛡️</div><div class="stat-info"><p>Compliant</p><h3><?= $compliant ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon" style="background:var(--danger-light);color:var(--danger)">⚠️</div><div class="stat-info"><p>Non-Compliant</p><h3><?= $nonCompliant ?></h3></div></div>
                </div>
                <div class="card">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Vendor</th><th>Business</th><th>License Expiry</th><th>Health Cert Expiry</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                            <?php foreach($approved as $v): ?>
                                <tr>
                                    <td><strong><?= htmlspecialchars($v['name']) ?></strong></td>
                                    <td><?= htmlspecialchars($v['business_name']) ?></td>
                                    <td><?= $v['license_expiry'] ?></td>
                                    <td><?= $v['health_cert_expiry'] ?></td>
                                    <td><span class="badge <?= $v['compliance_status']==='compliant'?'badge-success':'badge-danger' ?>"><?= $v['compliance_status'] ?></span></td>
                                    <td>
                                        <form method="POST" style="display:inline-flex;gap:0.4rem;align-items:center;">
                                            <input type="hidden" name="action" value="update_compliance">
                                            <input type="hidden" name="vendor_id" value="<?= (int)$v['id'] ?>">
                                            <select name="compliance_status" style="padding:0.3rem;border:1px solid var(--border);border-radius:6px;">
                                                <option value="compliant" <?= $v['compliance_status']==='compliant'?'selected':'' ?>>Compliant</option>
                                                <option value="non-compliant" <?= $v['compliance_status']==='non-compliant'?'selected':'' ?>>Non-Compliant</option>
                                            </select>
                                            <button type="submit" class="btn btn-outline btn-sm">Update</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ===== ANNOUNCEMENTS ===== -->
            <div id="sec-announcements" class="section">
                <div class="flex-end mb-md">
                    <button class="btn btn-primary" style="width:auto" onclick="toggleAddForm('add-ann-form')">➕ New Announcement</button>
                </div>

                <div id="add-ann-form" class="add-form card mb-md">
                    <div class="card-body">
                        <h4 class="mb-md">Create Announcement</h4>
                        <form method="POST">
                            <input type="hidden" name="action" value="add_announcement">
                            <div class="form-group"><label>Title</label><input name="title" placeholder="Announcement title" required></div>
                            <div class="form-group"><label>Message</label><textarea name="message" rows="3" placeholder="Write your announcement..." required></textarea></div>
                            <div class="form-group">
                                <label>Type</label>
                                <select name="type">
                                    <option value="general">General</option>
                                    <option value="closure">Market Closure</option>
                                    <option value="rules">Rules & Guidelines</option>
                                    <option value="event">Event</option>
                                </select>
                            </div>
                            <div class="flex gap-sm">
                                <button type="submit" class="btn btn-primary" style="width:auto">Publish</button>
                                <button type="button" class="btn btn-outline" onclick="toggleAddForm('add-ann-form')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <?php
                $typeIcons = ['general'=>'ℹ️','closure'=>'🚫','rules'=>'📋','event'=>'🎉'];
                $typeBadges = ['general'=>'badge-info','closure'=>'badge-danger','rules'=>'badge-warning','event'=>'badge-success'];
                foreach($announcements as $a): ?>
                    <div class="announcement-card">
                        <div class="ann-header">
                            <div class="ann-title">
                                <span><?= $typeIcons[$a['type']] ?? '📢' ?></span>
                                <?= htmlspecialchars($a['title']) ?>
                                <span class="badge <?= $typeBadges[$a['type']] ?? 'badge-info' ?>"><?= $a['type'] ?></span>
                            </div>
                            <div class="flex gap-sm" style="align-items:center;">
                                <div class="ann-date">📅 <?= $a['date'] ?></div>
                                <form method="POST" style="display:inline">
                                    <input type="hidden" name="action" value="delete_announcement">
                                    <input type="hidden" name="announcement_id" value="<?= (int)$a['id'] ?>">
                                    <button class="btn-icon" style="color:var(--danger)" title="Delete">🗑️</button>
                                </form>
                            </div>
                        </div>
                        <p class="ann-message"><?= htmlspecialchars($a['message']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- ===== REPORTS ===== -->
            <div id="sec-reports" class="section">
                <div class="flex-end mb-md">
                    <button class="btn btn-primary" style="width:auto" onclick="printReport('MVMS Financial Report')">🖨️ Print Financial Report</button>
                </div>
                <div id="report-content">
                    <div class="stats-grid" style="grid-template-columns:1fr 1fr 1fr;">
                        <div class="stat-card" style="flex-direction:column;text-align:center;">
                            <div style="font-size:2rem;margin-bottom:0.5rem;">📈</div>
                            <p class="text-muted text-sm">Total Revenue</p>
                            <h3>UGX <?= number_format($totalRevenue) ?></h3>
                        </div>
                        <div class="stat-card" style="flex-direction:column;text-align:center;">
                            <div style="font-size:2rem;margin-bottom:0.5rem;">👥</div>
                            <p class="text-muted text-sm">Active Vendors</p>
                            <h3><?= count(array_filter($vendors, fn($v) => $v['status']==='approved')) ?></h3>
                        </div>
                        <div class="stat-card" style="flex-direction:column;text-align:center;">
                            <div style="font-size:2rem;margin-bottom:0.5rem;">📋</div>
                            <p class="text-muted text-sm">Total Bookings</p>
                            <h3><?= count($bookings) ?></h3>
                        </div>
                    </div>

                    <div class="card mb-md">
                        <div class="card-header">Revenue by Payment Method</div>
                        <div class="card-body">
                            <?php
                            $byMethod = [];
                            foreach($payments as $p) { $byMethod[$p['method']] = ($byMethod[$p['method']] ?? 0) + $p['amount']; }
                            foreach($byMethod as $method => $amount): ?>
                                <div class="flex-between" style="padding:0.5rem 0;border-bottom:1px solid var(--border);">
                                    <span><?= htmlspecialchars($method) ?></span>
                                    <strong>UGX <?= number_format($amount) ?></strong>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">Vendor Payment History</div>
                        <div class="table-wrapper">
                            <table>
                                <thead><tr><th>Vendor</th><th>Total Paid (UGX)</th><th>Bookings</th><th>Last Payment</th></tr></thead>
                                <tbody>
                                <?php foreach(array_filter($vendors, fn($v)=>$v['status']==='approved') as $v):
                                    $vPayments = array_filter($payments, fn($p)=>$p['vendor_id']==$v['id']);
                                    $vTotal = array_sum(array_column($vPayments,'amount'));
                                    $vBookings = array_filter($bookings, fn($b)=>$b['vendor_id']==$v['id']);
                                    $lastPay = !empty($vPayments) ? end($vPayments)['date'] : 'N/A';
                                ?>
                                    <tr>
                                        <td><strong><?= htmlspecialchars($v['name']) ?></strong></td>
                                        <td><?= number_format($vTotal) ?></td>
                                        <td><?= count($vBookings) ?></td>
                                        <td><?= $lastPay ?></td>
                                    </tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
<script src="../js/main.js"></script>
</body>
</html>
