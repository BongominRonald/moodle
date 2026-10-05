============================================================
  MVMS - Market Vendor Management System
  Mbarara City, Uganda
  Setup Guide
============================================================

REQUIREMENTS:
- XAMPP, WAMP, or LAMP (PHP 7.4+, MySQL 5.7+)
- A web browser

SETUP STEPS:

1. COPY FILES
   Copy the entire "mvms" folder to your web server root:
   - XAMPP: C:\xampp\htdocs\mvms\
   - WAMP:  C:\wamp64\www\mvms\
   - Linux: /var/www/html/mvms/

2. CREATE DATABASE
   a. Open phpMyAdmin: http://localhost/phpmyadmin
   b. Click "Import" tab
   c. Choose the file: mvms/database.sql
   d. Click "Go" to import

3. CONFIGURE DATABASE CONNECTION
   Open config.php and update if needed:
   - $host = 'localhost';
   - $dbname = 'mvms_db';
   - $username = 'root';
   - $password = '';    (empty for XAMPP default)

4. SETUP PASSWORDS
   Open your browser and go to:
   http://localhost/mvms/setup_passwords.php
   
   This will hash the default passwords properly.
   DELETE this file after running it!

5. LOGIN
   Open: http://localhost/mvms/
   
   Admin Login:
   - Email: admin@mbararamarket.ug
   - Password: Admin@123
   - Role: Market Admin
   
   Vendor Login:
   - Email: vendor@mbararamarket.ug
   - Password: Vendor@123
   - Role: Market Vendor

FILE STRUCTURE:
   mvms/
   ├── index.php              (Login page)
   ├── config.php             (Database connection)
   ├── logout.php             (Logout handler)
   ├── setup_passwords.php    (Run once, then delete)
   ├── database.sql           (Import into phpMyAdmin)
   ├── README.txt             (This file)
   ├── css/
   │   └── style.css          (All styling)
   ├── js/
   │   └── main.js            (All JavaScript)
   ├── admin/
   │   └── dashboard.php      (Admin dashboard - all sections)
   ├── vendor/
   │   └── dashboard.php      (Vendor dashboard - all sections)
   └── includes/
       └── header.php         (Shared header)

FEATURES:
- Role-based login (Admin / Vendor) with radio buttons
- Admin: Dashboard, Vendor Management (approve/reject), 
  Stall Management (add/delete), Payments, Compliance, 
  Announcements, Financial Reports with print
- Vendor: Dashboard, Profile editing, Stall booking with 
  fee calculation, My Bookings, Payment receipts with print,
  Announcements
- Responsive design (works on mobile)
- Print reports and receipts
- Search and filter vendors
- All data stored in MySQL

TECHNOLOGIES USED:
- HTML5
- CSS3
- JavaScript (Vanilla)
- PHP (PDO for database)
- MySQL

============================================================
