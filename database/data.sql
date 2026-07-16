-- =============================================
-- Blood Donation Platform - Sample Data
-- Run AFTER schema.sql
-- =============================================

USE blood_donation_db;

-- =============================================
-- Roles
-- =============================================
INSERT IGNORE INTO roles (name) VALUES
('ROLE_ADMIN'),
('ROLE_DONOR'),
('ROLE_SEEKER');

-- =============================================
-- Users
-- Passwords are BCrypt encoded (cost=12)
-- Plain text passwords:
--   admin@blooddonation.com  -> Admin@123
--   donor1@example.com       -> Donor@123
--   donor2@example.com       -> Donor@123
--   donor3@example.com       -> Donor@123
--   seeker1@example.com      -> Seeker@123
--   seeker2@example.com      -> Seeker@123
--   seeker3@example.com      -> Seeker@123
-- =============================================
INSERT IGNORE INTO users (name, email, password, phone, active, role_id) VALUES
-- Admin
('System Administrator', 'admin@blooddonation.com',
 '$2a$12$Y3eHsNEA/ypMk4dSnI1JH.7RrI.Bh4aSPgIlhG63mxmF2tCMBSBvy',
 '9999999999', 1, (SELECT id FROM roles WHERE name='ROLE_ADMIN')),

-- Donors
('Rahul Sharma', 'donor1@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543210', 1, (SELECT id FROM roles WHERE name='ROLE_DONOR')),

('Priya Patel', 'donor2@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543211', 1, (SELECT id FROM roles WHERE name='ROLE_DONOR')),

('Amit Kumar', 'donor3@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543212', 1, (SELECT id FROM roles WHERE name='ROLE_DONOR')),

-- Seekers
('Anjali Singh', 'seeker1@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543213', 1, (SELECT id FROM roles WHERE name='ROLE_SEEKER')),

('Vikram Mehta', 'seeker2@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543214', 1, (SELECT id FROM roles WHERE name='ROLE_SEEKER')),

('Sunita Reddy', 'seeker3@example.com',
 '$2a$12$fVq6m3fT2Y4K.ORvN9V.xeCF3sOdnAMhZxP6RnAJCqt7tJQ0LJ.Sa',
 '9876543215', 1, (SELECT id FROM roles WHERE name='ROLE_SEEKER'));

-- =============================================
-- Donors
-- =============================================
INSERT IGNORE INTO donors (user_id, blood_group, age, gender, city, address, available, last_donation_date, total_donations)
VALUES
((SELECT id FROM users WHERE email='donor1@example.com'), 'O+', 28, 'Male',
 'Mumbai', '12, Andheri West, Mumbai, Maharashtra', 1, '2024-11-15', 5),

((SELECT id FROM users WHERE email='donor2@example.com'), 'A+', 25, 'Female',
 'Delhi', '45, Connaught Place, New Delhi, Delhi', 1, '2024-12-01', 3),

((SELECT id FROM users WHERE email='donor3@example.com'), 'B+', 32, 'Male',
 'Bangalore', '78, Koramangala, Bangalore, Karnataka', 0, '2025-01-10', 7);

-- =============================================
-- Blood Requests
-- =============================================
INSERT INTO blood_requests
  (seeker_id, donor_id, patient_name, blood_group, units_required,
   hospital_name, hospital_address, city, contact_number, urgency, status, notes)
VALUES
-- Pending request
((SELECT id FROM users WHERE email='seeker1@example.com'), NULL,
 'Ramesh Singh', 'O+', 2, 'Apollo Hospital',
 'Sahar Road, Andheri East, Mumbai', 'Mumbai',
 '9123456780', 'HIGH', 'PENDING', 'Patient needs blood urgently for surgery'),

-- Accepted request
((SELECT id FROM users WHERE email='seeker2@example.com'),
 (SELECT id FROM donors WHERE user_id=(SELECT id FROM users WHERE email='donor2@example.com')),
 'Meera Patel', 'A+', 1, 'Fortis Hospital',
 'Vasant Kunj, New Delhi', 'Delhi',
 '9123456781', 'CRITICAL', 'ACCEPTED', 'Accident victim needs immediate blood'),

-- Completed request
((SELECT id FROM users WHERE email='seeker3@example.com'),
 (SELECT id FROM donors WHERE user_id=(SELECT id FROM users WHERE email='donor1@example.com')),
 'Suresh Reddy', 'O+', 2, 'Manipal Hospital',
 'Old Airport Road, Bangalore', 'Bangalore',
 '9123456782', 'MEDIUM', 'COMPLETED', 'Post-surgery blood transfusion'),

-- Rejected request
((SELECT id FROM users WHERE email='seeker1@example.com'), NULL,
 'Kavita Sharma', 'B-', 1, 'KEM Hospital',
 'Acharya Donde Marg, Parel, Mumbai', 'Mumbai',
 '9123456783', 'LOW', 'REJECTED', 'Rare blood group required'),

-- Another pending
((SELECT id FROM users WHERE email='seeker2@example.com'), NULL,
 'Arjun Mehta', 'AB+', 3, 'AIIMS',
 'Ansari Nagar, New Delhi', 'Delhi',
 '9123456784', 'HIGH', 'PENDING', 'Chemotherapy patient');

-- =============================================
-- Donations (completed ones)
-- =============================================
INSERT INTO donations (donor_id, blood_request_id, donation_date, units_donated, notes)
VALUES
(
 (SELECT id FROM donors WHERE user_id=(SELECT id FROM users WHERE email='donor1@example.com')),
 (SELECT id FROM blood_requests WHERE patient_name='Suresh Reddy' AND status='COMPLETED'),
 '2025-03-15', 2, 'Successful donation - donor was cooperative and healthy'
);
