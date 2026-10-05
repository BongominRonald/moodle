-- ============================================================
-- MVMS - Market Vendor Management System
-- Database Script for Mbarara City, Uganda
-- Import this file into phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS mvms_db;
USE mvms_db;

-- Users table (both vendors and admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('vendor','admin') NOT NULL DEFAULT 'vendor',
    business_name VARCHAR(150),
    business_type VARCHAR(100),
    id_number VARCHAR(50),
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    approval_date DATE,
    compliance_status ENUM('compliant','non-compliant') DEFAULT 'compliant',
    license_expiry DATE,
    health_cert_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stalls table
CREATE TABLE stalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    status ENUM('available','booked','maintenance') DEFAULT 'available'
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    stall_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid','paid') DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    vendor_id INT NOT NULL,
    booking_id INT NOT NULL,
    stall_number VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status ENUM('completed','pending','failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('general','closure','rules','event') DEFAULT 'general',
    author VARCHAR(100) DEFAULT 'Market Administration',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track which announcements each vendor has read
CREATE TABLE announcement_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_announcement (user_id, announcement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (name, email, phone, password, role, status) VALUES
('Mbarara Admin', 'admin@mbararamarket.ug', '+256700000001', '$2y$10$YourHashHere', 'admin', 'approved');

-- Vendor users (password: Vendor@123)
INSERT INTO users (name, email, phone, password, role, business_name, business_type, id_number, status, approval_date, compliance_status, license_expiry, health_cert_expiry) VALUES
('Nakamya Grace', 'vendor@mbararamarket.ug', '+256701234567', '$2y$10$YourHashHere', 'vendor', 'Grace Fresh Produce', 'Fruits & Vegetables', 'CM-2024-001', 'approved', '2024-01-15', 'compliant', '2025-06-30', '2025-03-15'),
('Tumusiime Robert', 'robert@email.com', '+256702345678', '$2y$10$YourHashHere', 'vendor', 'Robert Textiles', 'Clothing & Textiles', 'CM-2024-002', 'approved', '2024-02-20', 'compliant', '2025-08-15', '2025-05-20'),
('Ainembabazi Doreen', 'doreen@email.com', '+256703456789', '$2y$10$YourHashHere', 'vendor', 'Doreen Electronics', 'Electronics', 'CM-2024-003', 'pending', NULL, 'non-compliant', '2024-12-01', '2024-11-30'),
('Byamugisha James', 'james@email.com', '+256704567890', '$2y$10$YourHashHere', 'vendor', 'James Hardware', 'Hardware & Tools', 'CM-2024-004', 'approved', '2024-03-10', 'non-compliant', '2025-01-15', '2024-12-20');

-- Stalls
INSERT INTO stalls (number, location, size, daily_rate, status) VALUES
('A-01', 'Section A - Ground Floor', 'Small (2x3m)', 5000, 'available'),
('A-02', 'Section A - Ground Floor', 'Small (2x3m)', 5000, 'booked'),
('B-01', 'Section B - Ground Floor', 'Medium (3x4m)', 8000, 'available'),
('B-02', 'Section B - Ground Floor', 'Medium (3x4m)', 8000, 'available'),
('C-01', 'Section C - First Floor', 'Large (4x5m)', 12000, 'booked'),
('C-02', 'Section C - First Floor', 'Large (4x5m)', 12000, 'maintenance'),
('D-01', 'Section D - Open Air', 'Small (2x2m)', 3000, 'available'),
('D-02', 'Section D - Open Air', 'Small (2x2m)', 3000, 'available');

-- Bookings
INSERT INTO bookings (vendor_id, stall_id, start_date, end_date, days, daily_rate, total_amount, status, payment_status, payment_method, payment_date) VALUES
(2, 2, '2025-01-20', '2025-01-31', 11, 5000, 55000, 'confirmed', 'paid', 'MTN Mobile Money', '2025-01-19'),
(3, 5, '2025-01-15', '2025-02-15', 31, 12000, 372000, 'confirmed', 'paid', 'Bank Transfer', '2025-01-14'),
(5, 3, '2025-02-01', '2025-02-28', 28, 8000, 224000, 'pending', 'unpaid', NULL, NULL);

-- Payments
INSERT INTO payments (receipt_number, vendor_id, booking_id, stall_number, amount, method, date, status) VALUES
('RCT-2025-001', 2, 1, 'A-02', 55000, 'MTN Mobile Money', '2025-01-19', 'completed'),
('RCT-2025-002', 3, 2, 'C-01', 372000, 'Bank Transfer', '2025-01-14', 'completed');

-- Announcements
INSERT INTO announcements (title, message, type, date) VALUES
('Market Cleaning Exercise', 'The market will be closed on Saturday 25th January 2025 for a general cleaning exercise. All vendors are required to remove their goods by Friday evening.', 'closure', '2025-01-20'),
('New Stall Rates Effective February', 'Please note that revised stall rates will take effect from 1st February 2025. Check the updated rate card on the stalls page.', 'general', '2025-01-18'),
('Health Inspection Reminder', 'All food vendors must ensure their health certificates are up to date. Inspections will be conducted next week.', 'rules', '2025-01-15');

-- ============================================================
-- UPDATE PASSWORDS (run this after import)
-- Admin@123 and Vendor@123
-- ============================================================
-- You can update passwords by running this PHP script once:
-- See setup_passwords.php
