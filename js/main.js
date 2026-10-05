// ============================================================
// MVMS - Main JavaScript
// ============================================================

// Toggle password visibility
function togglePassword(btn) {
    const input = btn.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// Role selection on login
function selectRole(role) {
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('active'));
    document.querySelector(`.role-option[data-role="${role}"]`).classList.add('active');
    document.getElementById('role-input').value = role;
}

// ======== DASHBOARD NAVIGATION ========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
    
    const link = document.querySelector(`.sidebar-nav a[data-section="${sectionId}"]`);
    if (link) link.classList.add('active');
    
    // Update topbar title
    const topTitle = document.getElementById('page-title');
    if (topTitle && link) topTitle.textContent = link.textContent.trim();
    
    // Close mobile sidebar
    closeSidebar();
}

// Mobile sidebar
function openSidebar() {
    document.querySelector('.sidebar').classList.add('open');
    document.querySelector('.sidebar-overlay').classList.add('active');
}

function closeSidebar() {
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');
}

// ======== TOAST NOTIFICATIONS ========
function showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ======== MODAL ========
function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

// ======== TOGGLE ADD FORM ========
function toggleAddForm(id) {
    const form = document.getElementById(id);
    if (form) form.classList.toggle('active');
}

// ======== STALL BOOKING CALCULATION ========
function calculateBookingFee() {
    const rate = parseFloat(document.getElementById('booking-rate')?.value || 0);
    const start = document.getElementById('booking-start')?.value;
    const end = document.getElementById('booking-end')?.value;
    
    if (start && end && rate) {
        const days = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1);
        const total = rate * days;
        
        document.getElementById('booking-days').textContent = days;
        document.getElementById('booking-total').textContent = 'UGX ' + total.toLocaleString();
        document.getElementById('booking-rate-display').textContent = 'UGX ' + rate.toLocaleString();
        document.getElementById('fee-breakdown').style.display = 'block';
    }
}

// ======== SELECT STALL FOR BOOKING ========
function selectStall(id, number, rate) {
    document.querySelectorAll('.stall-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.stall-card[data-id="${id}"]`)?.classList.add('selected');
    
    document.getElementById('selected-stall-id').value = id;
    document.getElementById('booking-stall-name').textContent = number;
    document.getElementById('booking-rate').value = rate;
    document.getElementById('booking-form-section').style.display = 'block';
    
    calculateBookingFee();
}

// ======== PRINT RECEIPT ========
function printReceipt(receiptNum, date, vendor, stall, method, amount) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
        <html><head><title>Receipt ${receiptNum}</title>
        <style>
            body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;padding:20px;border:2px solid #2d6a4f;border-radius:12px}
            h2{color:#2d6a4f;text-align:center;margin-bottom:5px}
            .header{text-align:center;border-bottom:2px dashed #ddd;padding-bottom:15px;margin-bottom:15px}
            .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
            .total{font-size:18px;font-weight:bold;color:#2d6a4f;border-top:2px solid #2d6a4f;padding-top:10px;margin-top:10px}
            .footer{text-align:center;font-size:11px;color:#999;margin-top:20px}
        </style></head><body>
        <div class="header">
            <h2>🏪 MVMS Receipt</h2>
            <p style="color:#666;font-size:12px">Mbarara City Market</p>
            <p style="font-weight:bold;color:#2d6a4f;font-size:16px">${receiptNum}</p>
        </div>
        <div class="row"><span>Date:</span><span>${date}</span></div>
        <div class="row"><span>Vendor:</span><span>${vendor}</span></div>
        <div class="row"><span>Stall:</span><span>${stall}</span></div>
        <div class="row"><span>Payment Method:</span><span>${method}</span></div>
        <div class="row total"><span>Total Paid:</span><span>UGX ${parseInt(amount).toLocaleString()}</span></div>
        <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Market Vendor Management System</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        </body></html>
    `);
    win.document.close();
    win.print();
}

// ======== PRINT REPORT ========
function printReport(title) {
    const content = document.getElementById('report-content');
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
        <html><head><title>${title} - MVMS Mbarara</title>
        <style>
            body{font-family:Arial,sans-serif;padding:20px;color:#333}
            h1{color:#2d6a4f}
            h2{color:#444;border-bottom:2px solid #2d6a4f;padding-bottom:5px}
            table{width:100%;border-collapse:collapse;margin:15px 0}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#f5f5f5}
            .stat-box{display:inline-block;margin:10px 20px 10px 0;padding:10px 15px;background:#f0f7f4;border-radius:8px}
            .stat-box strong{display:block;font-size:20px;color:#2d6a4f}
        </style></head><body>
        <h1>📊 ${title}</h1>
        <p>Mbarara City Market Administration</p>
        <p>Report Date: ${new Date().toLocaleDateString()}</p>
        <hr>
        ${content.innerHTML}
        <hr style="margin-top:30px">
        <p style="font-size:12px;color:#666">Auto-generated by MVMS on ${new Date().toLocaleString()}</p>
        </body></html>
    `);
    win.document.close();
    win.print();
}

// ======== SEARCH/FILTER ========
function filterTable(inputId, tableId) {
    const query = document.getElementById(inputId).value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function filterByStatus(selectId, tableId) {
    const status = document.getElementById(selectId).value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    if (rows.length > 0) {
        rows.forEach(row => {
            if (status === 'all') {
                row.style.display = '';
            } else {
                const badge = row.querySelector('.badge');
                row.style.display = badge && badge.textContent.toLowerCase().trim() === status ? '' : 'none';
            }
        });
        return;
    }

    // Support status filtering for card grids (e.g. stalls)
    const cards = document.querySelectorAll(`#${tableId} .stall-card`);
    cards.forEach(card => {
        if (status === 'all') {
            card.style.display = '';
        } else {
            const cardStatus = (card.getAttribute('data-status') || '').toLowerCase();
            card.style.display = cardStatus === status ? '' : 'none';
        }
    });
}

// ======== VENDOR DETAIL MODAL ========
function showVendorDetail(name, idNum, email, phone, business, type, status, license, health) {
    document.getElementById('modal-vendor-name').textContent = name;
    document.getElementById('modal-vendor-id').textContent = idNum;
    document.getElementById('modal-vendor-email').textContent = email;
    document.getElementById('modal-vendor-phone').textContent = phone;
    document.getElementById('modal-vendor-business').textContent = business;
    document.getElementById('modal-vendor-type').textContent = type;
    document.getElementById('modal-vendor-status').textContent = status;
    document.getElementById('modal-vendor-license').textContent = license || 'N/A';
    document.getElementById('modal-vendor-health').textContent = health || 'N/A';
    openModal('vendor-detail-modal');
}

// ======== INIT ========
document.addEventListener('DOMContentLoaded', function() {
    // Default section
    const firstNav = document.querySelector('.sidebar-nav a');
    if (firstNav) {
        const section = firstNav.getAttribute('data-section');
        if (section) showSection(section);
    }
});
