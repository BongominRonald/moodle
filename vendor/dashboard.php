<?php
require_once __DIR__ . '/../config.php';
requireVendor();

$uid = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

// Fetch user data
$user = $pdo->prepare("SELECT * FROM users WHERE id=?");
$user->execute([$uid]);
$user = $user->fetch();

$stalls = $pdo->query("SELECT * FROM stalls WHERE status='available' ORDER BY number")->fetchAll();
$allStalls = $pdo->query("SELECT * FROM stalls ORDER BY number")->fetchAll();

$bookings = $pdo->prepare("SELECT b.*, s.number as stall_number FROM bookings b JOIN stalls s ON b.stall_id=s.id WHERE b.vendor_id=? ORDER BY b.created_at DESC");
$bookings->execute([$uid]);
$bookings = $bookings->fetchAll();

$payments = $pdo->prepare("SELECT * FROM payments WHERE vendor_id=? ORDER BY date DESC");
$payments->execute([$uid]);
$payments = $payments->fetchAll();

$announcements = $pdo->query("SELECT * FROM announcements ORDER BY date DESC")->fetchAll();
$pdo->exec("CREATE TABLE IF NOT EXISTS announcement_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_announcement (user_id, announcement_id)
)");
$readStmt = $pdo->prepare("SELECT announcement_id FROM announcement_reads WHERE user_id=?");
$readStmt->execute([$uid]);
$readIds = array_map('intval', array_column($readStmt->fetchAll(), 'announcement_id'));
$unreadAnnouncements = count(array_filter($announcements, fn($a) => !in_array((int)$a['id'], $readIds, true)));

$totalSpent = array_sum(array_column($payments, 'amount'));
$activeBookings = count(array_filter($bookings, fn($b) => $b['status'] === 'confirmed'));
$paymentsPaidCount = count(array_filter($payments, fn($p) => $p['status'] === 'completed'));
$paymentsPendingCount = count(array_filter($payments, fn($p) => $p['status'] === 'pending'));

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $stmt = $pdo->prepare("UPDATE users SET phone=?, email=?, business_name=? WHERE id=?");
        $stmt->execute([$_POST['phone'], $_POST['email'], $_POST['business_name'], $uid]);
        $_SESSION['user_name'] = $user['name'];
        header('Location: dashboard.php?msg=Profile+updated'); exit;
    }
    
    if ($action === 'book_stall') {
        $stallId = (int)$_POST['stall_id'];
        $start = $_POST['start_date'];
        $end = $_POST['end_date'];
        $method = $_POST['payment_method'];
        
        $stallInfo = $pdo->prepare("SELECT * FROM stalls WHERE id=?");
        $stallInfo->execute([$stallId]);
        $stallInfo = $stallInfo->fetch();
        
        if ($stallInfo) {
            $days = max(1, ceil((strtotime($end) - strtotime($start)) / 86400) + 1);
            $total = $stallInfo['daily_rate'] * $days;
            $receipt = 'RCT-' . date('Y') . '-' . str_pad(rand(1,9999), 4, '0', STR_PAD_LEFT);
            
            // Create booking
            $stmt = $pdo->prepare("INSERT INTO bookings (vendor_id, stall_id, start_date, end_date, days, daily_rate, total_amount, status, payment_status, payment_method, payment_date) VALUES (?,?,?,?,?,?,?,'confirmed','paid',?,CURDATE())");
            $stmt->execute([$uid, $stallId, $start, $end, $days, $stallInfo['daily_rate'], $total, $method]);
            $bookingId = $pdo->lastInsertId();
            
            // Create payment
            $stmt = $pdo->prepare("INSERT INTO payments (receipt_number, vendor_id, booking_id, stall_number, amount, method, date, status) VALUES (?,?,?,?,?,?,CURDATE(),'completed')");
            $stmt->execute([$receipt, $uid, $bookingId, $stallInfo['number'], $total, $method]);
            
            // Update stall status
            $pdo->prepare("UPDATE stalls SET status='booked' WHERE id=?")->execute([$stallId]);
            
            header('Location: dashboard.php?msg=Stall+booked+successfully'); exit;
        }
    }
    if ($action === 'mark_announcement_read') {
        $aid = (int)($_POST['announcement_id'] ?? 0);
        if ($aid > 0) {
            $stmt = $pdo->prepare("INSERT IGNORE INTO announcement_reads (user_id, announcement_id) VALUES (?, ?)");
            $stmt->execute([$uid, $aid]);
        }
        header('Location: dashboard.php?msg=Announcement+marked+as+read'); exit;
    }
    if ($action === 'mark_all_announcements_read') {
        $stmt = $pdo->prepare("INSERT IGNORE INTO announcement_reads (user_id, announcement_id) VALUES (?, ?)");
        foreach ($announcements as $a) {
            $stmt->execute([$uid, (int)$a['id']]);
        }
        header('Location: dashboard.php?msg=All+announcements+marked+as+read'); exit;
    }
    if ($action === 'renew_compliance_doc') {
        $docType = $_POST['doc_type'] ?? '';
        if ($docType === 'license') {
            $pdo->prepare("UPDATE users SET license_expiry = DATE_ADD(CURDATE(), INTERVAL 1 YEAR), compliance_status='compliant' WHERE id=?")->execute([$uid]);
            header('Location: dashboard.php?msg=Business+license+renewal+submitted'); exit;
        }
        if ($docType === 'health') {
            $pdo->prepare("UPDATE users SET health_cert_expiry = DATE_ADD(CURDATE(), INTERVAL 1 YEAR), compliance_status='compliant' WHERE id=?")->execute([$uid]);
            header('Location: dashboard.php?msg=Health+certificate+renewal+submitted'); exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Dashboard - MVMS</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="dashboard">
    <div class="sidebar-overlay" onclick="closeSidebar()"></div>

    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="logo">🏪</div>
            <div class="logo-text"><h3>MVMS</h3><span>Mbarara City</span></div>
        </div>
        <nav class="sidebar-nav">
            <a href="#" data-section="sec-dashboard" onclick="showSection('sec-dashboard');return false;" class="active">
                <span class="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" data-section="sec-profile" onclick="showSection('sec-profile');return false;">
                <span class="nav-icon">👤</span> My Profile
            </a>
            <a href="#" data-section="sec-stalls" onclick="showSection('sec-stalls');return false;">
                <span class="nav-icon">📍</span> Book a Stall
            </a>
            <a href="#" data-section="sec-bookings" onclick="showSection('sec-bookings');return false;">
                <span class="nav-icon">📋</span> My Bookings
            </a>
            <a href="#" data-section="sec-payments" onclick="showSection('sec-payments');return false;">
                <span class="nav-icon">💳</span> Payments & Receipts
            </a>
            <a href="#" data-section="sec-announcements" onclick="showSection('sec-announcements');return false;">
                <span class="nav-icon">📢</span> Announcements
            </a>
            <a href="#" data-section="sec-compliance" onclick="showSection('sec-compliance');return false;">
                <span class="nav-icon">🛡️</span> My Compliance
            </a>
        </nav>
        <div class="sidebar-user">
            <div class="user-info">
                <div class="avatar"><?= strtoupper(substr($user_name,0,1)) ?></div>
                <div>
                    <div class="user-name"><?= htmlspecialchars($user_name) ?></div>
                    <div class="user-role">vendor</div>
                </div>
            </div>
            <a href="../logout.php" class="logout-btn">🚪 Logout</a>
        </div>
    </aside>

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
                <div class="card mb-lg">
                    <div class="card-body">
                        <h2 style="margin-bottom:0.3rem;">Welcome, <?= htmlspecialchars($user['name']) ?>!</h2>
                        <p class="text-muted text-sm"><?= htmlspecialchars($user['business_name']) ?> &bull; <?= htmlspecialchars($user['business_type']) ?></p>
                        <div style="margin-top:0.75rem;">
                            <span class="badge <?= $user['compliance_status']==='compliant'?'badge-success':'badge-danger' ?>">
                                <?= $user['compliance_status']==='compliant'?'✓ Compliant':'⚠ Non-Compliant' ?>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-icon">📍</div><div class="stat-info"><p>Active Bookings</p><h3><?= $activeBookings ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><p>Total Bookings</p><h3><?= count($bookings) ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><p>Total Spent</p><h3>UGX <?= number_format($totalSpent) ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">📢</div><div class="stat-info"><p>Announcements</p><h3><?= count($announcements) ?></h3></div></div>
                </div>

                <div class="card">
                    <div class="card-header">Latest Announcements</div>
                    <div class="card-body">
                        <?php foreach(array_slice($announcements,0,2) as $a): ?>
                            <div style="background:var(--bg);padding:0.75rem;border-radius:8px;margin-bottom:0.5rem;">
                                <strong class="text-sm"><?= htmlspecialchars($a['title']) ?></strong>
                                <p class="text-muted text-sm" style="margin-top:0.25rem;"><?= htmlspecialchars(substr($a['message'],0,100)) ?>...</p>
                                <p class="text-muted" style="font-size:0.75rem;margin-top:0.25rem;"><?= $a['date'] ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- ===== PROFILE ===== -->
            <div id="sec-profile" class="section">
                <div style="max-width:600px;">
                    <div class="card mb-lg">
                        <div class="card-body">
                            <div class="profile-header">
                                <div class="profile-avatar"><?= strtoupper(substr($user['name'],0,1)) ?></div>
                                <div class="profile-info">
                                    <h3><?= htmlspecialchars($user['name']) ?></h3>
                                    <p>ID: <?= htmlspecialchars($user['id_number'] ?? 'N/A') ?></p>
                                    <span class="badge <?= $user['status']==='approved'?'badge-success':'badge-warning' ?>"><?= $user['status'] ?></span>
                                </div>
                            </div>
                            <form method="POST">
                                <input type="hidden" name="action" value="update_profile">
                                <div class="form-group">
                                    <label>Full Name (read-only)</label>
                                    <input value="<?= htmlspecialchars($user['name']) ?>" readonly style="background:var(--bg);cursor:not-allowed;">
                                </div>
                                <div class="form-group">
                                    <label>National ID (read-only)</label>
                                    <input value="<?= htmlspecialchars($user['id_number'] ?? '') ?>" readonly style="background:var(--bg);cursor:not-allowed;">
                                </div>
                                <div class="form-group"><label>Phone Number</label><input name="phone" value="<?= htmlspecialchars($user['phone']) ?>"></div>
                                <div class="form-group"><label>Email</label><input name="email" value="<?= htmlspecialchars($user['email']) ?>"></div>
                                <div class="form-group"><label>Business Name</label><input name="business_name" value="<?= htmlspecialchars($user['business_name'] ?? '') ?>"></div>
                                <div class="form-group">
                                    <label>Business Type (read-only)</label>
                                    <input value="<?= htmlspecialchars($user['business_type'] ?? '') ?>" readonly style="background:var(--bg);cursor:not-allowed;">
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:auto">💾 Save Changes</button>
                            </form>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">Compliance Documents</div>
                        <div class="card-body">
                            <div class="compliance-grid">
                                <div class="compliance-box"><div class="label">Business License Expiry</div><div class="value"><?= $user['license_expiry'] ?? 'N/A' ?></div></div>
                                <div class="compliance-box"><div class="label">Health Certificate Expiry</div><div class="value"><?= $user['health_cert_expiry'] ?? 'N/A' ?></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ===== BOOK A STALL ===== -->
            <div id="sec-stalls" class="section">
                <h3 class="mb-md">Available Stalls</h3>
                <div class="stall-grid mb-lg">
                    <?php foreach($stalls as $s): ?>
                        <div class="stall-card" data-id="<?= $s['id'] ?>" onclick="selectStall(<?= $s['id'] ?>,'<?= htmlspecialchars($s['number']) ?>',<?= $s['daily_rate'] ?>)">
                            <div class="stall-header">
                                <span class="stall-number">📍 <?= htmlspecialchars($s['number']) ?></span>
                            </div>
                            <div class="stall-details">
                                <p><?= htmlspecialchars($s['location']) ?></p>
                                <p><?= htmlspecialchars($s['size']) ?></p>
                            </div>
                            <div class="stall-rate">UGX <?= number_format($s['daily_rate']) ?>/day</div>
                        </div>
                    <?php endforeach; ?>
                    <?php if(empty($stalls)): ?>
                        <div class="empty-state">No stalls available at the moment.</div>
                    <?php endif; ?>
                </div>

                <div id="booking-form-section" class="booking-form" style="display:none;">
                    <h4 class="mb-md">Book Stall <strong id="booking-stall-name"></strong></h4>
                    <form method="POST">
                        <input type="hidden" name="action" value="book_stall">
                        <input type="hidden" name="stall_id" id="selected-stall-id">
                        <input type="hidden" id="booking-rate" value="0">
                        <div class="form-row mb-md">
                            <div class="form-group"><label>Start Date</label><input type="date" name="start_date" id="booking-start" onchange="calculateBookingFee()" required></div>
                            <div class="form-group"><label>End Date</label><input type="date" name="end_date" id="booking-end" onchange="calculateBookingFee()" required></div>
                        </div>
                        <div class="form-group mb-md">
                            <label>Payment Method</label>
                            <select name="payment_method">
                                <option>MTN Mobile Money</option>
                                <option>Airtel Money</option>
                                <option>Bank Transfer</option>
                                <option>Credit/Debit Card</option>
                            </select>
                        </div>
                        <div id="fee-breakdown" class="fee-breakdown" style="display:none;">
                            <div class="fee-row"><span class="text-muted">Daily Rate:</span><span id="booking-rate-display"></span></div>
                            <div class="fee-row"><span class="text-muted">Number of Days:</span><span id="booking-days"></span></div>
                            <div class="fee-row total"><span>Total:</span><span id="booking-total"></span></div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:auto">💳 Confirm & Pay</button>
                    </form>
                </div>
            </div>

            <!-- ===== MY BOOKINGS ===== -->
            <div id="sec-bookings" class="section">
                <?php if(empty($bookings)): ?>
                    <div class="card"><div class="card-body empty-state">No bookings yet. Visit "Book a Stall" to get started.</div></div>
                <?php else: ?>
                    <div class="card">
                        <div class="table-wrapper">
                            <table>
                                <thead><tr><th>Booking ID</th><th>Stall</th><th>Dates</th><th>Days</th><th>Total (UGX)</th><th>Status</th><th>Payment</th></tr></thead>
                                <tbody>
                                <?php foreach($bookings as $b): ?>
                                    <tr>
                                        <td><strong>#<?= $b['id'] ?></strong></td>
                                        <td><?= htmlspecialchars($b['stall_number']) ?></td>
                                        <td><?= $b['start_date'] ?> → <?= $b['end_date'] ?></td>
                                        <td><?= $b['days'] ?></td>
                                        <td><?= number_format($b['total_amount']) ?></td>
                                        <td><span class="badge <?= $b['status']==='confirmed'?'badge-success':'badge-warning' ?>"><?= $b['status'] ?></span></td>
                                        <td><span class="badge <?= $b['payment_status']==='paid'?'badge-success':'badge-danger' ?>"><?= $b['payment_status'] ?></span></td>
                                    </tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <!-- ===== PAYMENTS & RECEIPTS ===== -->
            <div id="sec-payments" class="section">
                <div class="stats-grid" style="grid-template-columns:1fr 1fr 1fr;">
                    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><p>Total Paid</p><h3>UGX <?= number_format($totalSpent) ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><p>Completed Payments</p><h3><?= $paymentsPaidCount ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><p>Pending Payments</p><h3><?= $paymentsPendingCount ?></h3></div></div>
                </div>
                <?php if(empty($payments)): ?>
                    <div class="card"><div class="card-body empty-state">No payment records found.</div></div>
                <?php else: ?>
                    <?php foreach($payments as $p): ?>
                        <div class="payment-card">
                            <div class="pay-header">
                                <div>
                                    <strong><?= htmlspecialchars($p['receipt_number']) ?></strong>
                                    <p class="text-muted" style="font-size:0.75rem;"><?= $p['date'] ?></p>
                                </div>
                                <span class="badge <?= $p['status']==='completed' ? 'badge-success' : ($p['status']==='pending' ? 'badge-warning' : 'badge-danger') ?>"><?= $p['status'] ?></span>
                            </div>
                            <div class="pay-details">
                                <div><span class="label">Stall:</span> <?= htmlspecialchars($p['stall_number']) ?></div>
                                <div><span class="label">Method:</span> <?= htmlspecialchars($p['method']) ?></div>
                                <div style="grid-column:span 2"><span class="label">Amount:</span> <strong class="text-primary">UGX <?= number_format($p['amount']) ?></strong></div>
                            </div>
                            <div class="flex gap-sm">
                                <button class="btn btn-outline btn-sm" onclick="printReceipt('<?= htmlspecialchars($p['receipt_number']) ?>','<?= $p['date'] ?>','<?= htmlspecialchars($user['name'],ENT_QUOTES) ?>','<?= htmlspecialchars($p['stall_number']) ?>','<?= htmlspecialchars($p['method']) ?>','<?= $p['amount'] ?>')">
                                    🖨️ Print Receipt
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="showToast('Receipt download prepared: <?= htmlspecialchars($p['receipt_number'], ENT_QUOTES) ?>')">
                                    ⬇️ Download
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- ===== ANNOUNCEMENTS ===== -->
            <div id="sec-announcements" class="section">
                <div class="flex-between mb-md">
                    <p class="text-muted"><?= $unreadAnnouncements > 0 ? $unreadAnnouncements . ' unread' : 'All read' ?></p>
                    <?php if ($unreadAnnouncements > 0): ?>
                        <form method="POST">
                            <input type="hidden" name="action" value="mark_all_announcements_read">
                            <button class="btn btn-outline btn-sm">Mark All Read</button>
                        </form>
                    <?php endif; ?>
                </div>
                <?php
                $typeIcons = ['general'=>'ℹ️','closure'=>'🚫','rules'=>'📋','event'=>'🎉'];
                $typeBadges = ['general'=>'badge-info','closure'=>'badge-danger','rules'=>'badge-warning','event'=>'badge-success'];
                foreach($announcements as $a): ?>
                    <div class="announcement-card" style="<?= !in_array((int)$a['id'], $readIds, true) ? 'border-left:4px solid var(--warning);' : '' ?>">
                        <div class="ann-header">
                            <div class="ann-title">
                                <span><?= $typeIcons[$a['type']] ?? '📢' ?></span>
                                <?= htmlspecialchars($a['title']) ?>
                                <span class="badge <?= $typeBadges[$a['type']] ?? 'badge-info' ?>"><?= $a['type'] ?></span>
                                <?php if (!in_array((int)$a['id'], $readIds, true)): ?><span class="badge badge-warning">new</span><?php endif; ?>
                            </div>
                            <div class="flex gap-sm" style="align-items:center;">
                                <div class="ann-date">📅 <?= $a['date'] ?></div>
                                <?php if (!in_array((int)$a['id'], $readIds, true)): ?>
                                    <form method="POST" style="display:inline">
                                        <input type="hidden" name="action" value="mark_announcement_read">
                                        <input type="hidden" name="announcement_id" value="<?= (int)$a['id'] ?>">
                                        <button class="btn btn-outline btn-sm">Open</button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </div>
                        <p class="ann-message"><?= htmlspecialchars($a['message']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- ===== COMPLIANCE ===== -->
            <div id="sec-compliance" class="section">
                <?php
                $today = date('Y-m-d');
                $license = $user['license_expiry'] ?? null;
                $health = $user['health_cert_expiry'] ?? null;
                $licenseStatus = !$license ? 'missing' : ($license < $today ? 'expired' : (($license <= date('Y-m-d', strtotime('+30 days'))) ? 'expiring' : 'valid'));
                $healthStatus = !$health ? 'missing' : ($health < $today ? 'expired' : (($health <= date('Y-m-d', strtotime('+30 days'))) ? 'expiring' : 'valid'));
                ?>
                <div class="stats-grid" style="grid-template-columns:1fr 1fr;">
                    <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-info"><p>Business License</p><h3><?= strtoupper($licenseStatus) ?></h3></div></div>
                    <div class="stat-card"><div class="stat-icon">🏥</div><div class="stat-info"><p>Health Certificate</p><h3><?= strtoupper($healthStatus) ?></h3></div></div>
                </div>
                <div class="card mb-md">
                    <div class="card-header">Renew / Upload Compliance Documents</div>
                    <div class="card-body">
                        <p class="text-muted text-sm mb-md">Submit renewal requests. The admin will review and validate them.</p>
                        <div class="flex gap-sm" style="flex-wrap:wrap;">
                            <form method="POST">
                                <input type="hidden" name="action" value="renew_compliance_doc">
                                <input type="hidden" name="doc_type" value="license">
                                <button class="btn btn-outline">Renew Business License</button>
                            </form>
                            <form method="POST">
                                <input type="hidden" name="action" value="renew_compliance_doc">
                                <input type="hidden" name="doc_type" value="health">
                                <button class="btn btn-outline">Renew Health Certificate</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Document</th><th>Expiry Date</th><th>Status</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td><strong>Business License</strong></td>
                                    <td><?= htmlspecialchars($license ?? 'N/A') ?></td>
                                    <td><span class="badge <?= $licenseStatus==='valid' ? 'badge-success' : 'badge-warning' ?>"><?= $licenseStatus ?></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Health Certificate</strong></td>
                                    <td><?= htmlspecialchars($health ?? 'N/A') ?></td>
                                    <td><span class="badge <?= $healthStatus==='valid' ? 'badge-success' : 'badge-warning' ?>"><?= $healthStatus ?></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
<script src="../js/main.js"></script>
</body>
</html>
