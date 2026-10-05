-- Market Vendor Management System (MVMS) Database
-- For Mbarara City Market Authority
-- Created: April 2026

CREATE DATABASE IF NOT EXISTS mvms_db;
USE mvms_db;

-- Users table (for login - both admins and vendors)
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    role ENUM('admin', 'vendor') NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vendors table (detailed vendor information)
CREATE TABLE vendors (
    id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10),
    business_name VARCHAR(100) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    stall_no VARCHAR(10),
    registration_date DATE NOT NULL,
    compliance_status ENUM('compliant', 'noncompliant', 'expiring') DEFAULT 'compliant',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stalls table
CREATE TABLE stalls (
    id VARCHAR(10) PRIMARY KEY,
    number VARCHAR(10) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL,
    size VARCHAR(20) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    vendor_id VARCHAR(10),
    section VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Bookings table
CREATE TABLE bookings (
    id VARCHAR(10) PRIMARY KEY,
    vendor_id VARCHAR(10) NOT NULL,
    stall_id VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    id VARCHAR(10) PRIMARY KEY,
    booking_id VARCHAR(10) NOT NULL,
    vendor_id VARCHAR(10) NOT NULL,
    stall_no VARCHAR(10) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('verified', 'pending', 'failed') DEFAULT 'pending',
    receipt_no VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE announcements (
    id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    announcement_date DATE NOT NULL,
    type ENUM('notice', 'closure', 'event', 'rule') NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vendor documents table
CREATE TABLE vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id VARCHAR(10) NOT NULL,
    document_name VARCHAR(100) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('valid', 'expiring', 'expired') DEFAULT 'valid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Insert demo users (passwords are hashed versions of the demo passwords)
INSERT INTO users (id, name, email, password, role, phone) VALUES
('ADM001', 'John Mugisha', 'admin@mbararamarket.ug', '$2y$10$hashedAdminPassword123', 'admin', '0770000000'),
('VND001', 'Sarah Nakato', 'vendor@mbararamarket.ug', '$2y$10$hashedVendorPassword123', 'vendor', '0771234567');

-- Insert demo vendors
INSERT INTO vendors (id, user_id, business_name, business_type, id_number, license_number, phone, email, status, stall_no, registration_date, compliance_status) VALUES
('VND001', 'VND001', 'Nakato Fresh Produce', 'Vegetables & Fruits', 'CM90020001234A', 'BL-2024-001', '0771234567', 'sarah@gmail.com', 'approved', 'A-12', '2024-01-15', 'compliant'),
('VND002', NULL, 'Tumwine Electronics', 'Electronics', 'CM90020005678B', 'BL-2024-002', '0782345678', 'robert@gmail.com', 'pending', NULL, '2025-03-01', 'expiring'),
('VND003', NULL, 'Grace Clothing', 'Clothing & Textiles', 'CM90020009012C', 'BL-2023-003', '0753456789', 'grace@gmail.com', 'approved', 'B-07', '2023-11-20', 'noncompliant'),
('VND004', NULL, 'Moses Hardware', 'Hardware & Tools', 'CM90020003456D', 'BL-2024-004', '0764567890', 'moses@gmail.com', 'approved', 'C-03', '2024-03-10', 'compliant'),
('VND005', NULL, 'Kemigisha Bakery', 'Food & Beverages', 'CM90020007890E', 'BL-2025-005', '0775678901', 'beatrice@gmail.com', 'rejected', NULL, '2025-02-14', 'noncompliant'),
('VND006', NULL, 'Turyamureeba Crafts', 'Crafts & Artwork', 'CM90020002345F', 'BL-2025-006', '0786789012', 'emma@gmail.com', 'pending', NULL, '2025-03-10', 'compliant');

-- Insert demo stalls
INSERT INTO stalls (id, number, location, size, daily_rate, status, vendor_id, section) VALUES
('S01', 'A-01', 'Main Block, Row A', '3x4m', 15000.00, 'available', NULL, 'Block A'),
('S02', 'A-12', 'Main Block, Row A', '3x4m', 15000.00, 'occupied', 'VND001', 'Block A'),
('S03', 'B-07', 'East Wing, Row B', '4x5m', 20000.00, 'occupied', 'VND003', 'Block B'),
('S04', 'B-15', 'East Wing, Row B', '4x5m', 20000.00, 'available', NULL, 'Block B'),
('S05', 'C-03', 'West Wing, Row C', '5x6m', 25000.00, 'occupied', 'VND004', 'Block C'),
('S06', 'C-08', 'West Wing, Row C', '3x4m', 15000.00, 'maintenance', NULL, 'Block C'),
('S07', 'D-01', 'North Block, Row D', '6x8m', 35000.00, 'available', NULL, 'Block D'),
('S08', 'D-09', 'North Block, Row D', '4x5m', 20000.00, 'available', NULL, 'Block D');

-- Insert demo bookings
INSERT INTO bookings (id, vendor_id, stall_id, start_date, end_date, days, total_amount, status, payment_method, payment_id) VALUES
('BK001', 'VND001', 'S02', '2025-03-01', '2025-03-31', 30, 450000.00, 'confirmed', 'MTN Mobile Money', 'PAY001'),
('BK002', 'VND001', 'S02', '2025-02-01', '2025-02-28', 28, 420000.00, 'confirmed', 'MTN Mobile Money', 'PAY005');

-- Insert demo payments
INSERT INTO payments (id, booking_id, vendor_id, stall_no, amount, payment_date, payment_method, status, receipt_no) VALUES
('PAY001', 'BK001', 'VND001', 'A-12', 450000.00, '2025-03-01', 'MTN Mobile Money', 'verified', 'RCT-2025-001'),
('PAY002', 'BK001', 'VND004', 'C-03', 750000.00, '2025-03-05', 'Airtel Money', 'verified', 'RCT-2025-002'),
('PAY003', 'BK001', 'VND003', 'B-07', 200000.00, '2025-03-10', 'Bank Transfer', 'pending', 'RCT-2025-003'),
('PAY004', 'BK001', 'VND002', 'A-05', 75000.00, '2025-03-12', 'MTN Mobile Money', 'pending', 'RCT-2025-004'),
('PAY005', 'BK002', 'VND001', 'A-12', 420000.00, '2025-02-01', 'Cash', 'verified', 'RCT-2025-005');

-- Insert demo announcements
INSERT INTO announcements (id, title, content, announcement_date, type, author) VALUES
('ANN001', 'Market Closure — Good Friday', 'The market will be closed on 18th April 2025 in observance of Good Friday. All vendors are advised to plan accordingly. The market will resume normal operations on Saturday 19th April.', '2025-03-15', 'closure', 'Market Administrator'),
('ANN002', 'New Sanitation Rules Effective April 2025', 'All vendors must maintain clean stalls at all times. Garbage must be disposed in the designated collection points. Failure to comply will attract a fine of UGX 10,000 per day.', '2025-03-10', 'rule', 'Market Administrator'),
('ANN003', 'Annual Market Day — April 30th 2025', 'We are pleased to announce our Annual Market Day on April 30th. Special activities, entertainment, and discounts for customers. All vendors are encouraged to participate.', '2025-03-08', 'event', 'Market Administrator');

-- Insert demo vendor documents
INSERT INTO vendor_documents (vendor_id, document_name, document_number, expiry_date, status) VALUES
('VND001', 'Business License', 'BL-2024-001', '2025-12-31', 'valid'),
('VND001', 'Health Certificate', 'HC-2024-089', '2025-06-15', 'expiring'),
('VND001', 'Government ID', 'CM90020001234A', '2030-01-01', 'valid');

-- Create indexes for better performance
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_stalls_status ON stalls(status);
CREATE INDEX idx_stalls_section ON stalls(section);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_vendor ON payments(vendor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_date ON announcements(announcement_date);

-- Note: In a real application, you would hash the passwords properly
-- For demo purposes, these are placeholder hashed passwords
-- Use PHP's password_hash() function for real password hashing