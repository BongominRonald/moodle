// MVMS Vendor Dashboard JavaScript
// Handles dashboard functionality, data loading, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Check authentication
    const userData = JSON.parse(sessionStorage.getItem('mvms_user') || '{}');
    if (!userData.id || userData.role !== 'vendor') {
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
                <div class="mt-0.5">
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
let bookings = [
    { id: "BK001", stallNo: "A-12", startDate: "2025-03-01", endDate: "2025-03-31", days: 30, amount: 450000, status: "active", paymentStatus: "verified" },
    { id: "BK002", stallNo: "A-12", startDate: "2025-02-01", endDate: "2025-02-28", days: 28, amount: 420000, status: "completed", paymentStatus: "verified" },
    { id: "BK003", stallNo: "A-12", startDate: "2025-01-01", endDate: "2025-01-31", days: 31, amount: 465000, status: "completed", paymentStatus: "verified" },
];

let payments = [
    { id: "PAY001", bookingId: "BK001", amount: 450000, date: "2025-03-01", method: "MTN Mobile Money", status: "verified", receipt: "REC001" },
    { id: "PAY002", bookingId: "BK002", amount: 420000, date: "2025-02-01", method: "Airtel Money", status: "verified", receipt: "REC002" },
    { id: "PAY003", bookingId: "BK003", amount: 465000, date: "2025-01-01", method: "Bank Transfer", status: "verified", receipt: "REC003" },
];

let documents = [
    { id: "DOC001", type: "Business License", fileName: "business_license.pdf", uploadDate: "2024-01-15", status: "approved", expiryDate: "2025-12-31" },
    { id: "DOC002", type: "Health Certificate", fileName: "health_certificate.pdf", uploadDate: "2024-01-15", status: "approved", expiryDate: "2025-06-30" },
    { id: "DOC003", type: "ID Document", fileName: "national_id.pdf", uploadDate: "2024-01-15", status: "approved", expiryDate: "2030-01-15" },
    { id: "DOC004", type: "Tax Certificate", fileName: "tax_certificate.pdf", uploadDate: "2024-01-15", status: "pending", expiryDate: "2025-12-31" },
];

let announcements = [
    { id: "ANN001", title: "Market Closure — Good Friday", content: "The market will be closed on 18th April 2025 in observance of Good Friday. All vendors are advised to plan accordingly. The market will resume normal operations on Saturday 19th April.", date: "2025-03-15", type: "closure", read: false },
    { id: "ANN002", title: "New Sanitation Rules Effective April 2025", content: "All vendors must maintain clean stalls at all times. Garbage must be disposed in the designated collection points. Failure to comply will attract a fine of UGX 10,000 per day.", date: "2025-03-10", type: "rule", read: true },
    { id: "ANN003", title: "Annual Market Day — April 30th 2025", content: "We are pleased to announce our Annual Market Day on April 30th. Special activities, entertainment, and discounts for customers. All vendors are encouraged to participate.", date: "2025-03-08", type: "event", read: true },
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
    const activeBookings = bookings.filter(b => b.status === 'active').length;
    const totalPaid = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const unreadAnnouncements = announcements.filter(a => !a.read).length;

    document.getElementById('activeBookings').textContent = activeBookings;
    document.getElementById('totalPaid').textContent = `UGX ${(totalPaid / 1000000).toFixed(1)}M`;
    document.getElementById('pendingPayments').textContent = pendingPayments;
    document.getElementById('unreadAnnouncements').textContent = unreadAnnouncements;

    // Load recent bookings
    loadRecentBookings();

    // Load upcoming payments
    loadUpcomingPayments();

    // Load recent announcements
    loadRecentAnnouncements();
}

function loadTabData(tabName) {
    switch(tabName) {
        case 'overview':
            loadDashboardData();
            break;
        case 'bookings':
            loadBookingsData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'documents':
            loadDocumentsData();
            break;
        case 'announcements':
            loadAnnouncementsData();
            break;
    }
}

function loadRecentBookings() {
    const recentBookings = bookings.slice(0, 3);
    const container = document.getElementById('recentBookings');

    container.innerHTML = recentBookings.map(booking => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-3 flex-wrap">
            <div>
                <p class="font-semibold text-sm text-foreground">Stall ${booking.stallNo}</p>
                <p class="text-xs text-muted-foreground">${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</p>
                <p class="text-xs text-muted-foreground">${booking.days} days · ${formatUGX(booking.amount)}</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="badge-${booking.status === 'active' ? 'success' : 'info'}">${booking.status}</span>
                <button onclick="viewBooking('${booking.id}')" class="text-xs text-primary hover:underline font-medium">View</button>
            </div>
        </div>
    `).join('');
}

function loadUpcomingPayments() {
    const upcomingPayments = payments.filter(p => p.status === 'pending').slice(0, 3);
    const container = document.getElementById('upcomingPayments');

    if (upcomingPayments.length === 0) {
        container.innerHTML = '<p class="text-sm text-muted-foreground text-center py-4">No pending payments</p>';
        return;
    }

    container.innerHTML = upcomingPayments.map(payment => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-secondary/50 gap-3 flex-wrap">
            <div>
                <p class="font-semibold text-sm text-foreground">Booking ${payment.bookingId}</p>
                <p class="text-xs text-muted-foreground">${formatUGX(payment.amount)} · ${payment.method}</p>
                <p class="text-xs text-muted-foreground">Due: ${formatDate(payment.date)}</p>
            </div>
            <button onclick="makePayment('${payment.id}')" class="btn-primary py-1.5 px-3 text-xs">
                Pay Now
            </button>
        </div>
    `).join('');
}

function loadRecentAnnouncements() {
    const recentAnnouncements = announcements.slice(0, 2);
    const container = document.getElementById('recentAnnouncements');

    container.innerHTML = recentAnnouncements.map(announcement => `
        <div class="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 ${!announcement.read ? 'border-l-4 border-primary' : ''}">
            <div class="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i data-lucide="bell" style="width: 16px; height: 16px; color: hsl(var(--primary));"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-foreground truncate">${announcement.title}</p>
                <p class="text-xs text-muted-foreground">${formatDate(announcement.date)} · ${announcement.type}</p>
                <p class="text-xs text-muted-foreground mt-1 line-clamp-2">${announcement.content}</p>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// Bookings Functions
function loadBookingsData() {
    renderBookingsTable();
}

function renderBookingsTable(filteredBookings = bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    const noBookingsMsg = document.getElementById('noBookingsMessage');

    if (filteredBookings.length === 0) {
        tbody.innerHTML = '';
        noBookingsMsg.classList.remove('hidden');
        return;
    }

    noBookingsMsg.classList.add('hidden');
    tbody.innerHTML = filteredBookings.map(booking => `
        <tr class="table-row-hover border-b border-border/50">
            <td class="py-3 px-4 font-mono text-xs font-bold text-primary">${booking.id}</td>
            <td class="py-3 px-4 font-mono font-bold">${booking.stallNo}</td>
            <td class="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</td>
            <td class="py-3 px-4 font-bold text-primary">${booking.days} days</td>
            <td class="py-3 px-4 font-bold text-success">${formatUGX(booking.amount)}</td>
            <td class="py-3 px-4">
                <span class="badge-${booking.status === 'active' ? 'success' : booking.status === 'completed' ? 'info' : 'warning'}">${booking.status}</span>
            </td>
            <td class="py-3 px-4">
                <span class="badge-${booking.paymentStatus === 'verified' ? 'success' : 'warning'}">${booking.paymentStatus}</span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-1.5">
                    <button onclick="viewBooking('${booking.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Details">
                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                    </button>
                    <button onclick="extendBooking('${booking.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Extend Booking">
                        <i data-lucide="calendar-plus" style="width: 15px; height: 15px;"></i>
                    </button>
                    ${booking.status === 'active' ? `
                        <button onclick="cancelBooking('${booking.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Cancel Booking">
                            <i data-lucide="x-circle" style="width: 15px; height: 15px;"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function filterBookings(status) {
    const buttons = document.querySelectorAll('#bookingsTab .grid button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (status === 'all') {
        filtered = bookings;
    } else {
        filtered = bookings.filter(b => b.status === status);
    }
    renderBookingsTable(filtered);
}

function searchBookings(query) {
    const filtered = bookings.filter(booking =>
        booking.id.toLowerCase().includes(query.toLowerCase()) ||
        booking.stallNo.toLowerCase().includes(query.toLowerCase())
    );
    renderBookingsTable(filtered);
}

function viewBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        showBookingModal(booking);
    }
}

function extendBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        const additionalDays = parseInt(prompt('How many additional days?', '7'));
        if (additionalDays && additionalDays > 0) {
            const additionalAmount = additionalDays * (booking.amount / booking.days);
            if (confirm(`Extend booking by ${additionalDays} days for ${formatUGX(additionalAmount)}?`)) {
                booking.days += additionalDays;
                booking.amount += additionalAmount;
                booking.endDate = new Date(new Date(booking.endDate).getTime() + additionalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                showToast(`Booking extended by ${additionalDays} days.`, 'success');
                loadBookingsData();
                loadDashboardData();
            }
        }
    }
}

function cancelBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        if (confirm('Cancel this booking? This action cannot be undone.')) {
            booking.status = 'cancelled';
            showToast('Booking cancelled.', 'error');
            loadBookingsData();
            loadDashboardData();
        }
    }
}

// Payments Functions
function loadPaymentsData() {
    renderPaymentsTable();
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
            <td class="py-3 px-4 font-mono">${payment.bookingId}</td>
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
                        <button onclick="makePayment('${payment.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Make Payment">
                            <i data-lucide="credit-card" style="width: 15px; height: 15px;"></i>
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
    const buttons = document.querySelectorAll('#paymentsTab .grid button');
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
        payment.id.toLowerCase().includes(query.toLowerCase()) ||
        payment.bookingId.toLowerCase().includes(query.toLowerCase())
    );
    renderPaymentsTable(filtered);
}

function makePayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        showPaymentModal(payment);
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

// Documents Functions
function loadDocumentsData() {
    renderDocumentsTable();
}

function renderDocumentsTable(filteredDocuments = documents) {
    const tbody = document.getElementById('documentsTableBody');
    const noDocumentsMsg = document.getElementById('noDocumentsMessage');

    if (filteredDocuments.length === 0) {
        tbody.innerHTML = '';
        noDocumentsMsg.classList.remove('hidden');
        return;
    }

    noDocumentsMsg.classList.add('hidden');
    tbody.innerHTML = filteredDocuments.map(document => `
        <tr class="table-row-hover border-b border-border/50">
            <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                        <i data-lucide="file-text" style="width: 16px; height: 16px; color: hsl(var(--primary));"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-foreground">${document.type}</p>
                        <p class="text-xs text-muted-foreground">${document.fileName}</p>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">${formatDate(document.uploadDate)}</td>
            <td class="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">${formatDate(document.expiryDate)}</td>
            <td class="py-3 px-4">
                <span class="badge-${document.status === 'approved' ? 'success' : document.status === 'pending' ? 'warning' : 'danger'}">${document.status}</span>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-1.5">
                    <button onclick="viewDocument('${document.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10 transition-colors" title="View Document">
                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                    </button>
                    <button onclick="downloadDocument('${document.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Download">
                        <i data-lucide="download" style="width: 15px; height: 15px;"></i>
                    </button>
                    <button onclick="replaceDocument('${document.id}')" class="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors" title="Replace">
                        <i data-lucide="refresh-ccw" style="width: 15px; height: 15px;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function filterDocuments(status) {
    const buttons = document.querySelectorAll('#documentsTab .grid button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (status === 'all') {
        filtered = documents;
    } else {
        filtered = documents.filter(d => d.status === status);
    }
    renderDocumentsTable(filtered);
}

function searchDocuments(query) {
    const filtered = documents.filter(document =>
        document.type.toLowerCase().includes(query.toLowerCase()) ||
        document.fileName.toLowerCase().includes(query.toLowerCase())
    );
    renderDocumentsTable(filtered);
}

function viewDocument(id) {
    const document = documents.find(d => d.id === id);
    if (document) {
        showDocumentModal(document);
    }
}

function downloadDocument(id) {
    const document = documents.find(d => d.id === id);
    if (document) {
        showToast(`Downloading ${document.fileName}...`, 'info');
    }
}

function replaceDocument(id) {
    const document = documents.find(d => d.id === id);
    if (document) {
        showToast('Document replacement feature coming soon.', 'info');
    }
}

// Announcements Functions
function loadAnnouncementsData() {
    renderAnnouncements();
}

function renderAnnouncements(filteredAnnouncements = announcements) {
    const list = document.getElementById('announcementsList');
    const noAnnouncementsMsg = document.getElementById('noAnnouncementsMessage');

    if (filteredAnnouncements.length === 0) {
        list.innerHTML = '';
        noAnnouncementsMsg.classList.remove('hidden');
        return;
    }

    noAnnouncementsMsg.classList.add('hidden');
    list.innerHTML = filteredAnnouncements.map(announcement => `
        <div class="section-card ${!announcement.read ? 'border-l-4 border-primary' : ''}">
            <div class="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i data-lucide="megaphone" style="width: 18px; height: 18px; color: hsl(var(--primary));"></i>
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-foreground truncate">${announcement.title}</h4>
                        <p class="text-xs text-muted-foreground">${formatDate(announcement.date)} · ${announcement.type}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="badge-${announcement.type === 'notice' ? 'info' : announcement.type === 'closure' ? 'danger' : announcement.type === 'event' ? 'success' : 'warning'}">${announcement.type}</span>
                    ${!announcement.read ? '<span class="w-2 h-2 rounded-full bg-primary"></span>' : ''}
                </div>
            </div>
            <p class="text-sm text-muted-foreground leading-relaxed pl-11">${announcement.content}</p>
            ${!announcement.read ? `
                <div class="flex justify-end mt-3 pl-11">
                    <button onclick="markAsRead('${announcement.id}')" class="text-xs text-primary hover:underline font-medium">
                        Mark as read
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
    lucide.createIcons();
}

function filterAnnouncements(type) {
    const buttons = document.querySelectorAll('#announcementsTab .flex button');
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.target.classList.add('active-filter');

    let filtered;
    if (type === 'all') {
        filtered = announcements;
    } else {
        filtered = announcements.filter(a => a.type === type);
    }
    renderAnnouncements(filtered);
}

function markAsRead(id) {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
        announcement.read = true;
        showToast('Marked as read.', 'info');
        loadAnnouncementsData();
        loadDashboardData();
    }
}

// Modal functions
function showBookingModal(booking) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-card rounded-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto max-w-lg">
            <div class="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
                <h3 class="font-bold text-foreground">Booking Details</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            <div class="p-5 space-y-4">
                <div class="text-center">
                    <div class="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
                        <i data-lucide="store" style="width: 28px; height: 28px; color: hsl(var(--primary));"></i>
                    </div>
                    <h2 class="font-bold text-xl text-foreground">Stall ${booking.stallNo}</h2>
                    <div class="mt-2 inline-block bg-${booking.status === 'active' ? 'success' : 'info'}/10 border border-${booking.status === 'active' ? 'success' : 'info'}/30 text-${booking.status === 'active' ? 'success' : 'info'} px-4 py-1 rounded-full text-sm font-bold">
                        ${booking.status.toUpperCase()}
                    </div>
                </div>
                <div class="space-y-3">
                    ${[
                        ["Booking ID", booking.id],
                        ["Start Date", formatDate(booking.startDate)],
                        ["End Date", formatDate(booking.endDate)],
                        ["Duration", `${booking.days} days`],
                        ["Total Amount", formatUGX(booking.amount)],
                        ["Payment Status", booking.paymentStatus.toUpperCase()],
                    ].map(([l, v]) => `
                        <div class="flex justify-between items-center py-2 border-b border-dashed border-border">
                            <span class="text-muted-foreground">${l}</span>
                            <span class="font-semibold text-foreground">${v}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-3 mt-4 pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="btn-outline flex-1">
                        <i data-lucide="x" style="width: 15px; height: 15px;"></i> Close
                    </button>
                    ${booking.status === 'active' ? `
                        <button onclick="extendBooking('${booking.id}'); this.closest('.fixed').remove()" class="btn-primary flex-1">
                            <i data-lucide="calendar-plus" style="width: 15px; height: 15px;"></i> Extend
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

function showPaymentModal(payment) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-card rounded-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto max-w-lg">
            <div class="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
                <h3 class="font-bold text-foreground">Make Payment</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            <div class="p-5 space-y-4">
                <div class="text-center">
                    <div class="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-2">
                        <i data-lucide="credit-card" style="width: 28px; height: 28px; color: hsl(var(--success));"></i>
                    </div>
                    <h2 class="font-bold text-xl text-foreground">Payment Required</h2>
                    <p class="text-muted-foreground">Booking ${payment.bookingId}</p>
                </div>
                <div class="bg-muted/40 p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-muted-foreground">Amount Due</span>
                        <span class="font-bold text-2xl text-success">${formatUGX(payment.amount)}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-muted-foreground">Due Date</span>
                        <span class="font-semibold">${formatDate(payment.date)}</span>
                    </div>
                </div>
                <div class="space-y-3">
                    <label class="block">
                        <span class="text-sm font-medium text-foreground">Payment Method</span>
                        <select class="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                            <option>MTN Mobile Money</option>
                            <option>Airtel Money</option>
                            <option>Bank Transfer</option>
                            <option>Cash</option>
                        </select>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium text-foreground">Reference Number (Optional)</span>
                        <input type="text" class="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter reference number">
                    </label>
                </div>
                <div class="flex gap-3 mt-4 pt-4 border-t">
                    <button onclick="this.closest('.fixed').remove()" class="btn-outline flex-1">
                        <i data-lucide="x" style="width: 15px; height: 15px;"></i> Cancel
                    </button>
                    <button onclick="processPayment('${payment.id}'); this.closest('.fixed').remove()" class="btn-success flex-1">
                        <i data-lucide="check-circle" style="width: 15px; height: 15px;"></i> Pay Now
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

function processPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        payment.status = 'verified';
        showToast('Payment processed successfully!', 'success');
        loadPaymentsData();
        loadDashboardData();
    }
}

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
                            ["Stall Number", bookings.find(b => b.id === payment.bookingId)?.stallNo || 'N/A'],
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

function showDocumentModal(document) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-card rounded-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto max-w-lg">
            <div class="flex items-center justify-between p-5 border-b sticky top-0 bg-card z-10">
                <h3 class="font-bold text-foreground">Document Details</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
            <div class="p-5 space-y-4">
                <div class="text-center">
                    <div class="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
                        <i data-lucide="file-text" style="width: 28px; height: 28px; color: hsl(var(--primary));"></i>
                    </div>
                    <h2 class="font-bold text-xl text-foreground">${document.type}</h2>
                    <div class="mt-2 inline-block bg-${document.status === 'approved' ? 'success' : document.status === 'pending' ? 'warning' : 'danger'}/10 border border-${document.status === 'approved' ? 'success' : document.status === 'pending' ? 'warning' : 'danger'}/30 text-${document.status === 'approved' ? 'success' : document.status === 'pending' ? 'warning' : 'danger'} px-4 py-1 rounded-full text-sm font-bold">
                        ${document.status.toUpperCase()}
                    </div>
                </div>
                <div class="space-y-3">
                    ${[
                        ["File Name", document.fileName],
                        ["Upload Date", formatDate(document.uploadDate)],
                        ["Expiry Date", formatDate(document.expiryDate)],
                        ["Status", document.status.toUpperCase()],
                    ].map(([l, v]) => `
                        <div class="flex justify-between items-center py-2 border-b border-dashed border-border">
                            <span class="text-muted-foreground">${l}</span>
                            <span class="font-semibold text-foreground">${v}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="flex gap-3 mt-4 pt-4 border-t">
                    <button onclick="downloadDocument('${document.id}'); this.closest('.fixed').remove()" class="btn-outline flex-1">
                        <i data-lucide="download" style="width: 15px; height: 15px;"></i> Download
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="btn-primary flex-1">
                        <i data-lucide="x" style="width: 15px; height: 15px;"></i> Close
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
