// MVMS Admin Dashboard JavaScript
// Handles dashboard functionality, data loading, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Check authentication
    const userData = JSON.parse(sessionStorage.getItem('mvms_user') || '{}');
    if (!userData.id || userData.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    // Update user info
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userAvatar').textContent = userData.name.charAt(0);

    // Set current date
    const now = new Date();
    document.getElementById('currentDate').textContent =
        now.toLocaleDateString('en-UG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // Update navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Update content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabName + 'Tab').classList.add('active');

            // Load tab data
            loadTabData(tabName);
        });
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('mvms_user');
        window.location.href = '../index.html';
    });

    // Load initial data
    loadDashboardData();

    // Toast system
    window.showToast = function(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-fade-in`;
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                    <div class="flex-shrink-0 mt-0.5">
                        ${type === 'success' ? '<i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>' :
                          type === 'error' ? '<i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>' :
                          '<i data-lucide="bell" style="width: 16px; height: 16px;"></i>'}
                    </div>
                </div>
                <span class="flex-1 text-sm">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="opacity-60 hover:opacity-100">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `;
        toastContainer.appendChild(toast);
        lucide.createIcons();
        setTimeout(() => toast.remove(), 3500);
    };

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full';
        document.body.appendChild(container);
        return container;
    }
});

// Sample data (in a real app, this would come from the database)
let vendors = [
    { id: "VND001", name: "Sarah Nakato", email: "sarah@gmail.com", phone: "0771234567", businessName: "Nakato Fresh Produce", businessType: "Vegetables & Fruits", status: "approved", stallNo: "A-12", registrationDate: "2024-01-15", idNumber: "CM90020001234A", license: "BL-2024-001", compliance: "compliant" },
    { id: "VND002", name: "Robert Tumwine", email: "robert@gmail.com", phone: "0782345678", businessName: "Tumwine Electronics", businessType: "Electronics", status: "pending", registrationDate: "2025-03-01", idNumber: "CM90020005678B", license: "BL-2024-002", compliance: "expiring" },
    { id: "VND003", name: "Grace Asiimwe", email: "grace@gmail.com", phone: "0753456789", businessName: "Grace Clothing", businessType: "Clothing & Textiles", status: "approved", stallNo: "B-07", registrationDate: "2023-11-20", idNumber: "CM90020009012C", license: "BL-2023-003", compliance: "noncompliant" },
    { id: "VND004", name: "Moses Byamugisha", email: "moses@gmail.com", phone: "0764567890", businessName: "Moses Hardware", businessType: "Hardware & Tools", status: "approved", stallNo: "C-03", registrationDate: "2024-03-10", idNumber: "CM90020003456D", license: "BL-2024-004", compliance: "compliant" },
    { id: "VND005", name: "Beatrice Kemigisha", email: "beatrice@gmail.com", phone: "0775678901", businessName: "Kemigisha Bakery", businessType: "Food & Beverages", status: "rejected", registrationDate: "2025-02-14", idNumber: "CM90020007890E", license: "BL-2025-005", compliance: "noncompliant", rejectionReason: "Incomplete health certificate submitted." },
    { id: "VND006", name: "Emmanuel Turyamureeba", email: "emma@gmail.com", phone: "0786789012", businessName: "Turyamureeba Crafts", businessType: "Crafts & Artwork", status: "pending", registrationDate: "2025-03-10", idNumber: "CM90020002345F", license: "BL-2025-006", compliance: "compliant" },
];

let stalls = [
    { id: "S01", number: "A-01", location: "Main Block, Row A", size: "3x4m", dailyRate: 15000, status: "available", section: "Block A" },
    { id: "S02", number: "A-12", location: "Main Block, Row A", size: "3x4m", dailyRate: 15000, status: "occupied", vendor: "Sarah Nakato", section: "Block A" },
    { id: "S03", number: "B-07", location: "East Wing, Row B", size: "4x5m", dailyRate: 20000, status: "occupied", vendor: "Grace Asiimwe", section: "Block B" },
    { id: "S04", number: "B-15", location: "East Wing, Row B", size: "4x5m", dailyRate: 20000, status: "available", section: "Block B" },
    { id: "S05", number: "C-03", location: "West Wing, Row C", size: "5x6m", dailyRate: 25000, status: "occupied", vendor: "Moses Byamugisha", section: "Block C" },
    { id: "S06", number: "C-08", location: "West Wing, Row C", size: "3x4m", dailyRate: 15000, status: "maintenance", section: "Block C" },
    { id: "S07", number: "D-01", location: "North Block, Row D", size: "6x8m", dailyRate: 35000, status: "available", section: "Block D" },
    { id: "S08", number: "D-09", location: "North Block, Row D", size: "4x5m", dailyRate: 20000, status: "available", section: "Block D" },
];

let payments = [
    { id: "PAY001", vendorName: "Sarah Nakato", stallNo: "A-12", amount: 450000, date: "2025-03-01", method: "MTN Mobile Money", status: "verified", bookingId: "BK001", days: 30 },
    { id: "PAY002", vendorName: "Moses Byamugisha", stallNo: "C-03", amount: 750000, date: "2025-03-05", method: "Airtel Money", status: "verified", bookingId: "BK002", days: 30 },
    { id: "PAY003", vendorName: "Grace Asiimwe", stallNo: "B-07", amount: 200000, date: "2025-03-10", method: "Bank Transfer", status: "pending", bookingId: "BK003", days: 10 },
    { id: "PAY004", vendorName: "Robert Tumwine", stallNo: "A-05", amount: 75000, date: "2025-03-12", method: "MTN Mobile Money", status: "pending", bookingId: "BK004", days: 5 },
    { id: "PAY005", vendorName: "Sarah Nakato", stallNo: "A-12", amount: 300000, date: "2025-02-01", method: "Cash", status: "verified", bookingId: "BK005", days: 20 },
];

let announcements = [
    { id: "ANN001", title: "Market Closure — Good Friday", content: "The market will be closed on 18th April 2025 in observance of Good Friday. All vendors are advised to plan accordingly. The market will resume normal operations on Saturday 19th April.", date: "2025-03-15", type: "closure", author: "Market Administrator" },
    { id: "ANN002", title: "New Sanitation Rules Effective April 2025", content: "All vendors must maintain clean stalls at all times. Garbage must be disposed in the designated collection points. Failure to comply will attract a fine of UGX 10,000 per day.", date: "2025-03-10", type: "rule", author: "Market Administrator" },
    { id: "ANN003", title: "Annual Market Day — April 30th 2025", content: "We are pleased to announce our Annual Market Day on April 30th. Special activities, entertainment, and discounts for customers. All vendors are encouraged to participate.", date: "2025-03-08", type: "event", author: "Market Administrator" },
];

// Utility functions
function formatUGX(amount) {
    return 'UGX ' + amount.toLocaleString();
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function loadDashboardData() {
    // Update stats
    const approved = vendors.filter(v => v.status === 'approved').length;
    const pending = vendors.filter(v => v.status === 'pending').length;
    const totalRevenue = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
    const occupied = stalls.filter(s => s.status === 'occupied').length;
    const nonCompliant = vendors.filter(v => v.compliance === 'noncompliant' && v.status === 'approved').length;

    document.getElementById('activeVendors').textContent = approved;
    document.getElementById('pendingCount').textContent = `${pending} pending approval`;
    document.getElementById('occupiedStalls').textContent = `${occupied}/${stalls.length}`;
    document.getElementById('totalRevenue').textContent = `UGX ${(totalRevenue / 1000000).toFixed(1)}M`;
    document.getElementById('nonCompliant').textContent = nonCompliant;

    // Update pending badge
    document.getElementById('pendingBadge').textContent = pending;

    // Load pending approvals
    loadPendingApprovals();

    // Load recent payments
    loadRecentPayments();

    // Update compliance badge
    document.getElementById('complianceBadge').textContent = nonCompliant;
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'overview':
            loadDashboardData();
            break;
        case 'vendors':
            loadVendorsData();
            break;
        case 'stalls':
            loadStallsData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'compliance':
            loadComplianceData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'announcements':
            loadAnnouncementsData();
            break;
    }
}

function loadPendingApprovals() {
    const pendingVendors = vendors.filter(v => v.status === 'pending');
    const container = document.getElementById('pendingApprovals');

    if (pendingVendors.length === 0) {
        container.innerHTML = '<p class="text-sm text-muted-foreground text-center py-4 flex items-center justify-center gap-2"><i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> All applications have been reviewed</p>';
        lucide.createIcons();
        return;
    }

    container.innerHTML = pendingVendors.map(vendor => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-3 flex-wrap">
            <div>
                <p class="font-semibold text-sm text-foreground">${vendor.name}</p>
                <p class="text-xs text-muted-foreground">${vendor.businessName} · ${vendor.businessType}</p>
                <p class="text-xs text-muted-foreground">Applied: ${formatDate(vendor.registrationDate)}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="approveVendor('${vendor.id}')" class="btn-primary py-1.5 px-3 text-xs">
                    <i data-lucide="check" style="width: 13px; height: 13px;"></i> Approve
                </button>
                <button onclick="rejectVendor('${vendor.id}')" class="btn-danger py-1.5 px-3 text-xs">
                    <i data-lucide="x" style="width: 13px; height: 13px;"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function loadRecentPayments() {
    const recentPayments = payments.slice(0, 4);
    const tbody = document.getElementById('recentPayments');

    tbody.innerHTML = recentPayments.map(payment => `
        <tr class="table-row-hover border-b border-border/50">
            <td class="py-3 px-3 font-medium">${payment.vendorName}</td>
            <td class="py-3 px-3 text-muted-foreground">${payment.stallNo}</td>
            <td class="py-3 px-3 font-semibold text-primary">${formatUGX(payment.amount)}</td>
            <td class="py-3 px-3 text-muted-foreground hidden md:table-cell text-xs">${payment.method}</td>
            <td class="py-3 px-3">
                <span class="badge-${payment.status === 'verified' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}">${payment.status}</span>
            </td>
            <td class="py-3 px-3">
                <button onclick="viewReceipt('${payment.id}')" class="text-xs text-primary hover:underline font-medium">View Receipt</button>
            </td>
        </tr>
    `).join('');
}

// Vendor Management Functions
function loadVendorsData() {
    // Update stats
    document.getElementById('totalVendors').textContent = vendors.length;
    document.getElementById('approvedVendors').textContent = vendors.filter(v => v.status === 'approved').length;
    document.getElementById('pendingVendors').textContent = vendors.filter(v => v.status === 'pending').length;
    document.getElementById('rejectedVendors').textContent = vendors.filter(v => v.status === 'rejected').length;

    renderVendorsTable();
}

function renderVendorsTable(filteredVendors = vendors) {
    const tbody = document.getElementById('vendorsTableBody');
    const noVendorsMsg = document.getElementById('noVendorsMessage');

    if (filteredVendors.length === 0) {
        tbody.innerHTML = '';
        noVendorsMsg.classList.remove('hidden');
        return;
    }

    noVendorsMsg.classList.add('hidden');
    tbody.innerHTML = filteredVendors.map(vendor => `
        <tr class="table-row-hover border-b border-border/50">
            <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                        ${vendor.name.charAt(0)}
                    </div>
                    <div>
                        <p class="font-semibold text-foreground">${vendor.name}</p>
                        <p class="text-xs text-muted-foreground">${vendor.email}</p>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4 hidden md:table-cell">
                <p class="font-medium text-foreground">${vendor.businessName}</p>
                <p class="text-xs text-muted-foreground">${vendor.businessType}</p>
            </td>
            <td class="py-3 px-4 hidden sm:table-cell">
                <span class="font-mono text-sm font-bold text-primary">${vendor.stallNo || '—'}</span>
            </td>
            <td class="py-3 px-4">
                <span class="badge-${vendor.status === 'approved' ? 'success' : vendor.status === 'pending' ? 'warning' : 'danger'}">${vendor.status}</span>
            </td>
            <td class="py-3 px-4 hidden lg:table-cell">
                <span class="badge-${vendor.compliance === 'compliant' ? 'success' : vendor.compliance === 'expiring' ? 'warning' : 'danger'}">${vendor.compliance}</span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-1.5">
                    <button onclick="viewVendor('${vendor.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Details">
                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                    </button>
                    <button onclick="editVendor('${vendor.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                        <i data-lucide="edit" style="width: 15px; height: 15px;"></i>
                    </button>
                    ${vendor.status === 'pending' ? `
                        <button onclick="approveVendor('${vendor.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Approve">
                            <i data-lucide="user-check" style="width: 15px; height: 15px;"></i>
                        </button>
                        <button onclick="rejectVendor('${vendor.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Reject">
                            <i data-lucide="x-circle" style="width: 15px; height: 15px;"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteVendor('${vendor.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                        <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function filterVendors(status) {
    const buttons = document.querySelectorAll('#vendorsTab .grid button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (status === 'all') {
        filtered = vendors;
    } else {
        filtered = vendors.filter(v => v.status === status);
    }
    renderVendorsTable(filtered);
}

function searchVendors(query) {
    const filtered = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(query.toLowerCase()) ||
        vendor.businessName.toLowerCase().includes(query.toLowerCase()) ||
        vendor.id.toLowerCase().includes(query.toLowerCase())
    );
    renderVendorsTable(filtered);
}

function approveVendor(id) {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
        vendor.status = 'approved';
        showToast(`Vendor ${vendor.name} approved! Login credentials sent to vendor.`, 'success');
        loadVendorsData();
        loadDashboardData();
    }
}

function rejectVendor(id) {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            vendor.status = 'rejected';
            vendor.rejectionReason = reason;
            showToast(`Application rejected. Notification sent to ${vendor.name}.`, 'error');
            loadVendorsData();
            loadDashboardData();
        }
    }
}

function deleteVendor(id) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        vendors = vendors.filter(v => v.id !== id);
        showToast('Vendor removed from system.', 'info');
        loadVendorsData();
        loadDashboardData();
    }
}

// Stall Management Functions
function loadStallsData() {
    updateStallFilterButtons();
    renderStallsGrid();
}

function updateStallFilterButtons() {
    const buttons = document.querySelectorAll('#stallsTab .flex button');
    buttons.forEach((btn, index) => {
        const filters = ['all', 'available', 'occupied', 'maintenance'];
        const filter = filters[index];
        const count = filter === 'all' ? stalls.length : stalls.filter(s => s.status === filter).length;
        btn.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${count})`;
        btn.onclick = () => filterStalls(filter);
    });
}

function renderStallsGrid(filteredStalls = stalls) {
    const grid = document.getElementById('stallsGrid');
    grid.innerHTML = filteredStalls.map(stall => `
        <div class="section-card hover:shadow-md transition-all duration-200">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <p class="font-bold text-xl text-foreground">${stall.number}</p>
                    <p class="text-xs text-muted-foreground">${stall.section}</p>
                </div>
                <span class="badge-${stall.status === 'available' ? 'success' : stall.status === 'occupied' ? 'info' : 'warning'}">${stall.status}</span>
            </div>
            <div class="space-y-1.5 text-xs mb-3">
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Location</span>
                    <span class="font-medium text-foreground text-right max-w-[60%]">${stall.location}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Size</span>
                    <span class="font-medium">${stall.size}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted-foreground">Daily Rate</span>
                    <span class="font-bold text-primary">${formatUGX(stall.dailyRate)}</span>
                </div>
                ${stall.vendor ? `
                    <div class="flex justify-between border-t border-border/50 pt-1.5">
                        <span class="text-muted-foreground">Vendor</span>
                        <span class="font-medium text-foreground">${stall.vendor}</span>
                    </div>
                ` : ''}
            </div>
            <div class="flex gap-2 pt-3 border-t border-border">
                <button onclick="editStall('${stall.id}')" class="flex-1 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <i data-lucide="edit" style="width: 11px; height: 11px;"></i> Edit
                </button>
                <button onclick="toggleMaintenance('${stall.id}')" class="flex-1 py-1.5 rounded-lg text-xs font-medium border border-warning/40 text-warning hover:bg-warning/10 transition-colors flex items-center justify-center gap-1">
                    ${stall.status === 'maintenance' ? '<i data-lucide="check" style="width: 11px; height: 11px;"></i> Activate' : '<i data-lucide="alert-triangle" style="width: 11px; height: 11px;"></i> Maintain'}
                </button>
                <button onclick="deleteStall('${stall.id}')" class="py-1.5 px-2 rounded-lg text-xs border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
                    <i data-lucide="trash-2" style="width: 11px; height: 11px;"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function filterStalls(status) {
    const buttons = document.querySelectorAll('#stallsTab .flex button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (status === 'all') {
        filtered = stalls;
    } else {
        filtered = stalls.filter(s => s.status === status);
    }
    renderStallsGrid(filtered);
}

function toggleMaintenance(id) {
    const stall = stalls.find(s => s.id === id);
    if (stall) {
        stall.status = stall.status === 'maintenance' ? 'available' : 'maintenance';
        showToast(`Stall ${stall.number} set to ${stall.status}.`, 'info');
        loadStallsData();
    }
}

function deleteStall(id) {
    const stall = stalls.find(s => s.id === id);
    if (stall && stall.status === 'occupied') {
        showToast('Cannot delete an occupied stall. Unassign vendor first.', 'error');
        return;
    }
    if (confirm(`Remove stall ${stall.number} (${stall.section})?`)) {
        stalls = stalls.filter(s => s.id !== id);
        showToast(`Stall ${stall.number} removed.`, 'info');
        loadStallsData();
    }
}

// Payment Management Functions
function loadPaymentsData() {
    // Update stats
    const totalRevenue = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const verifiedCount = payments.filter(p => p.status === 'verified').length;

    document.getElementById('totalRevenue').textContent = `UGX ${(totalRevenue / 1000000).toFixed(1)}M`;
    document.getElementById('pendingPayments').textContent = pendingCount;
    document.getElementById('verifiedPayments').textContent = verifiedCount;

    updatePaymentFilterButtons();
    renderPaymentsTable();
}

function updatePaymentFilterButtons() {
    const buttons = document.querySelectorAll('#paymentsTab .flex button');
    buttons.forEach((btn, index) => {
        const filters = ['all', 'verified', 'pending', 'failed'];
        const filter = filters[index];
        const count = filter === 'all' ? payments.length : payments.filter(p => p.status === filter).length;
        btn.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${count})`;
    });
}

function renderPaymentsTable(filteredPayments = payments) {
    const tbody = document.getElementById('paymentsTableBody');
    const noPaymentsMsg = document.getElementById('noPaymentsMessage');

    if (filteredPayments.length === 0) {
        tbody.innerHTML = '';
        noPaymentsMsg.classList.remove('hidden');
        return;
    }

    noPaymentsMsg.classList.add('hidden');
    tbody.innerHTML = filteredPayments.map(payment => `
        <tr class="table-row-hover border-b border-border/50">
            <td class="py-3 px-4 font-mono text-xs font-bold text-primary">${payment.id}</td>
            <td class="py-3 px-4 font-medium">${payment.vendorName}</td>
            <td class="py-3 px-4 font-mono">${payment.stallNo}</td>
            <td class="py-3 px-4 font-bold text-success">${formatUGX(payment.amount)}</td>
            <td class="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">${payment.method}</td>
            <td class="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">${formatDate(payment.date)}</td>
            <td class="py-3 px-4">
                <span class="badge-${payment.status === 'verified' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}">${payment.status}</span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-1.5">
                    <button onclick="viewReceipt('${payment.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Receipt">
                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                    </button>
                    ${payment.status === 'pending' ? `
                        <button onclick="verifyPayment('${payment.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Verify Payment">
                            <i data-lucide="check-circle" style="width: 15px; height: 15px;"></i>
                        </button>
                        <button onclick="rejectPayment('${payment.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Reject Payment">
                            <i data-lucide="x-circle" style="width: 15px; height: 15px;"></i>
                        </button>
                    ` : ''}
                    <button onclick="printReceipt('${payment.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Print Receipt">
                        <i data-lucide="printer" style="width: 15px; height: 15px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function filterPayments(status) {
    const buttons = document.querySelectorAll('#paymentsTab .flex button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (status === 'all') {
        filtered = payments;
    } else {
        filtered = payments.filter(p => p.status === status);
    }
    renderPaymentsTable(filtered);
}

function searchPayments(query) {
    const filtered = payments.filter(payment =>
        payment.vendorName.toLowerCase().includes(query.toLowerCase()) ||
        payment.id.toLowerCase().includes(query.toLowerCase()) ||
        payment.stallNo.toLowerCase().includes(query.toLowerCase())
    );
    renderPaymentsTable(filtered);
}

function verifyPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        payment.status = 'verified';
        showToast('Payment verified successfully!', 'success');
        loadPaymentsData();
        loadDashboardData();
    }
}

function rejectPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        payment.status = 'failed';
        showToast('Payment marked as failed.', 'error');
        loadPaymentsData();
        loadDashboardData();
    }
}

function viewReceipt(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        showReceiptModal(payment);
    }
}

function printReceipt(id) {
    viewReceipt(id);
    setTimeout(() => window.print(), 300);
}

// Compliance Functions
function loadComplianceData() {
    const compliant = vendors.filter(v => v.compliance === 'compliant').length;
    const expiring = vendors.filter(v => v.compliance === 'expiring').length;
    const nonCompliant = vendors.filter(v => v.compliance === 'noncompliant').length;

    document.getElementById('compliantVendors').textContent = compliant;
    document.getElementById('expiringVendors').textContent = expiring;
    document.getElementById('nonCompliantVendors').textContent = nonCompliant;

    renderComplianceList();
}

function renderComplianceList() {
    const list = document.getElementById('complianceList');
    const approvedVendors = vendors.filter(v => v.status === 'approved');

    list.innerHTML = approvedVendors.map(vendor => `
        <div class="flex items-center justify-between p-4 rounded-xl border border-border flex-wrap gap-3">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-sm text-primary">
                    ${vendor.name.charAt(0)}
                </div>
                <div>
                    <p class="font-semibold text-foreground">${vendor.name}</p>
                    <p class="text-xs text-muted-foreground">${vendor.businessName} · ${vendor.idNumber}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
                <span class="badge-${vendor.compliance === 'compliant' ? 'success' : vendor.compliance === 'expiring' ? 'warning' : 'danger'}">${vendor.compliance}</span>
                <button onclick="updateCompliance('${vendor.id}')" class="btn-outline py-1.5 px-3 text-xs">
                    <i data-lucide="edit" style="width: 12px; height: 12px;"></i> Update Status
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function updateCompliance(id) {
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
        const newStatus = prompt('Update compliance status (compliant/expiring/noncompliant):', vendor.compliance);
        if (newStatus && ['compliant', 'expiring', 'noncompliant'].includes(newStatus)) {
            vendor.compliance = newStatus;
            showToast(`Compliance status updated to "${newStatus}".`, newStatus === 'compliant' ? 'success' : 'info');
            loadComplianceData();
            loadDashboardData();
        }
    }
}

// Reports Functions
function loadReportsData() {
    switchReportType('daily');
}

function switchReportType(type) {
    const buttons = document.querySelectorAll('#reportsTab .flex button');
    const contents = document.querySelectorAll('.report-content');

    buttons.forEach(btn => btn.classList.remove('active-tab'));
    contents.forEach(content => content.classList.remove('active'));

    event.target.classList.add('active-tab');
    document.getElementById(type + 'Report').classList.add('active');

    if (type === 'daily') loadDailyReport();
    else if (type === 'vendor') loadVendorReport();
    else if (type === 'monthly') loadMonthlyReport();
}

function loadDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').textContent = formatDate(today);

    const verifiedPayments = payments.filter(p => p.status === 'verified');
    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

    document.getElementById('dailyTotalRevenue').textContent = formatUGX(totalRevenue);
    document.getElementById('dailyVerifiedPayments').textContent = verifiedPayments.length;
    document.getElementById('dailyPendingPayments').textContent = payments.filter(p => p.status === 'pending').length;
    document.getElementById('dailyTotalBookings').textContent = payments.length;

    // Payment methods chart
    const methods = {};
    verifiedPayments.forEach(p => {
        methods[p.method] = (methods[p.method] || 0) + p.amount;
    });

    const chart = document.getElementById('paymentMethodsChart');
    chart.innerHTML = Object.entries(methods).map(([method, amount]) => `
        <div class="flex items-center justify-between py-2.5 border-b border-border/50 text-sm">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary"></div>
                <span class="text-muted-foreground">${method}</span>
            </div>
            <span class="font-bold text-primary">${formatUGX(amount)}</span>
        </div>
    `).join('');

    // Verified payments list
    const list = document.getElementById('verifiedPaymentsList');
    list.innerHTML = verifiedPayments.slice(0, 5).map(payment => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-sm flex-wrap gap-2">
            <div>
                <span class="font-semibold">${payment.vendorName}</span>
                <span class="text-muted-foreground mx-2">·</span>
                <span class="text-muted-foreground">Stall ${payment.stallNo} · ${payment.days} days</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">${formatDate(payment.date)}</span>
                <span class="font-bold text-success">${formatUGX(payment.amount)}</span>
            </div>
        </div>
    `).join('');
}

function loadVendorReport() {
    const report = document.getElementById('vendorPaymentsReport');
    const approvedVendors = vendors.filter(v => v.status === 'approved');

    report.innerHTML = approvedVendors.map(vendor => {
        const vendorPayments = payments.filter(p => p.vendorName === vendor.name);
        const total = vendorPayments.reduce((sum, p) => sum + p.amount, 0);

        return `
            <div class="mb-4 p-4 rounded-xl border border-border">
                <div class="flex justify-between items-start flex-wrap gap-2 mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                            ${vendor.name.charAt(0)}
                        </div>
                        <div>
                            <p class="font-bold text-foreground">${vendor.name}</p>
                            <p class="text-xs text-muted-foreground">${vendor.businessName} · Stall ${vendor.stallNo || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-success">${formatUGX(total)}</p>
                        <p class="text-xs text-muted-foreground">${vendorPayments.length} payment(s)</p>
                    </div>
                </div>
                ${vendorPayments.length > 0 ? `
                    <div class="space-y-1.5">
                        ${vendorPayments.map(p => `
                            <div class="flex justify-between text-xs bg-muted/40 px-3 py-2 rounded-lg">
                                <span class="text-muted-foreground">${formatDate(p.date)} · ${p.method} · ${p.stallNo}</span>
                                <div class="flex items-center gap-2">
                                    <span class="badge-${p.status === 'verified' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}">${p.status}</span>
                                    <span class="font-semibold">${formatUGX(p.amount)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-xs text-muted-foreground">No payments recorded</p>'}
            </div>
        `;
    }).join('');
}

function loadMonthlyReport() {
    const totalRevenue = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
    const activeVendors = vendors.filter(v => v.status === 'approved').length;
    const availableStalls = stalls.filter(s => s.status === 'available').length;
    const nonCompliant = vendors.filter(v => v.compliance === 'noncompliant').length;

    document.getElementById('monthlyRevenue').textContent = formatUGX(totalRevenue);
    document.getElementById('monthlyBookings').textContent = payments.length;
    document.getElementById('monthlyActiveVendors').textContent = activeVendors;
    document.getElementById('monthlyAvailableStalls').textContent = availableStalls;
    document.getElementById('monthlyAvgRevenue').textContent = formatUGX(Math.floor(totalRevenue / 30));
    document.getElementById('monthlyNonCompliant').textContent = nonCompliant;

    // Top stalls
    const occupiedStalls = stalls.filter(s => s.status === 'occupied').sort((a, b) => b.dailyRate - a.dailyRate);
    const topStalls = document.getElementById('topStallsList');
    topStalls.innerHTML = occupiedStalls.slice(0, 5).map((stall, index) => `
        <div class="flex items-center gap-3 py-2.5 border-b border-border/50 text-sm">
            <span class="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center">${index + 1}</span>
            <span class="font-mono font-bold text-primary">${stall.number}</span>
            <span class="text-muted-foreground flex-1">${stall.vendor}</span>
            <span class="font-bold">${formatUGX(stall.dailyRate)}/day</span>
        </div>
    `).join('');
}

// Announcements Functions
function loadAnnouncementsData() {
    renderAnnouncements();
}

function renderAnnouncements(filteredAnnouncements = announcements) {
    const list = document.getElementById('announcementsList');
    const noAnnouncements = document.getElementById('noAnnouncementsMessage');

    if (filteredAnnouncements.length === 0) {
        list.innerHTML = '';
        noAnnouncements.classList.remove('hidden');
        return;
    }

    noAnnouncements.classList.add('hidden');
    list.innerHTML = filteredAnnouncements.map(announcement => `
        <div class="section-card">
            <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i data-lucide="megaphone" style="width: 18px; height: 18px; color: hsl(var(--primary));"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-foreground truncate">${announcement.title}</h4>
                        <p class="text-xs text-muted-foreground">${formatDate(announcement.date)} · ${announcement.author}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="badge-${announcement.type === 'notice' ? 'info' : announcement.type === 'closure' ? 'danger' : announcement.type === 'event' ? 'success' : 'warning'}">${announcement.type}</span>
                    <button onclick="deleteAnnouncement('${announcement.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                        <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                    </button>
                </div>
            </div>
            <p class="text-sm text-muted-foreground leading-relaxed pl-11">${announcement.content}</p>
        </div>
    `).join('');
    lucide.createIcons();
}

function deleteAnnouncement(id) {
    if (confirm('Delete this announcement?')) {
        announcements = announcements.filter(a => a.id !== id);
        showToast('Announcement deleted.', 'info');
        loadAnnouncementsData();
    }
}

// Modal functions
function showReceiptModal(payment) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-card rounded-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto max-w-lg">
            <div class="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
                <h3 class="font-bold text-foreground">Payment Receipt</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            <div class="p-5">
                <div id="receipt-content" class="space-y-4">
                    <div class="text-center border-b pb-4">
                        <div class="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
                            <i data-lucide="store" style="width: 28px; height: 28px; color: hsl(var(--primary));"></i>
                        </div>
                        <h2 class="font-bold text-xl text-foreground">MBARARA CITY MARKET</h2>
                        <p class="text-sm text-muted-foreground">Market Vendor Management System</p>
                        <div class="mt-2 inline-block bg-success/10 border border-success/30 text-success px-4 py-1 rounded-full text-sm font-bold">
                            OFFICIAL RECEIPT
                        </div>
                    </div>
                    <div class="space-y-2 text-sm">
                        ${[
                            ["Receipt / Payment ID", payment.id],
                            ["Booking ID", payment.bookingId],
                            ["Date & Time", formatDate(payment.date)],
                            ["Vendor Name", payment.vendorName],
                            ["Stall Number", payment.stallNo],
                            ["Days Booked", `${payment.days} days`],
                            ["Payment Method", payment.method],
                            ["Payment Status", payment.status.toUpperCase()],
                        ].map(([l, v]) => `
                            <div class="flex justify-between items-center py-2 border-b border-dashed border-border">
                                <span class="text-muted-foreground">${l}</span>
                                <span class="font-semibold text-foreground">${v}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex justify-between items-center p-4 rounded-xl bg-success/10 border border-success/30">
                        <span class="font-bold text-lg text-foreground">TOTAL PAID</span>
                        <span class="font-bold text-2xl text-success">${formatUGX(payment.amount)}</span>
                    </div>
                    <p class="text-center text-xs text-muted-foreground">
                        Thank you for your payment. This is an official receipt. Keep for your records.<br />
                        Mbarara City Market Authority — © 2025
                    </p>
                </div>
                <div class="flex gap-3 mt-4 pt-4 border-t">
                    <button onclick="window.print()" class="btn-outline flex-1">
                        <i data-lucide="printer" style="width: 15px; height: 15px;"></i> Print
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="btn-primary flex-1">
                        <i data-lucide="check" style="width: 15px; height: 15px;"></i> Done
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

// Mobile sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}