-- =============================================
-- Blood Donation Platform - Database Schema
-- MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS blood_donation_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE blood_donation_db;

-- =============================================
-- Table: roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name ENUM('ROLE_ADMIN', 'ROLE_DONOR', 'ROLE_SEEKER') NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    phone      VARCHAR(15),
    active     TINYINT(1) NOT NULL DEFAULT 1,
    role_id    BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_email (email),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table: donors
-- =============================================
CREATE TABLE IF NOT EXISTS donors (
    id                 BIGINT NOT NULL AUTO_INCREMENT,
    user_id            BIGINT NOT NULL UNIQUE,
    blood_group        VARCHAR(5) NOT NULL,
    age                INT,
    gender             VARCHAR(10),
    city               VARCHAR(100),
    address            TEXT,
    available          TINYINT(1) NOT NULL DEFAULT 1,
    last_donation_date DATE,
    profile_photo      VARCHAR(255),
    total_donations    INT DEFAULT 0,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_donor_blood_group (blood_group),
    INDEX idx_donor_city (city),
    INDEX idx_donor_available (available),
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table: blood_requests
-- =============================================
CREATE TABLE IF NOT EXISTS blood_requests (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    seeker_id        BIGINT NOT NULL,
    donor_id         BIGINT,
    patient_name     VARCHAR(100) NOT NULL,
    blood_group      VARCHAR(5) NOT NULL,
    units_required   INT NOT NULL,
    hospital_name    VARCHAR(150) NOT NULL,
    hospital_address TEXT,
    city             VARCHAR(100) NOT NULL,
    contact_number   VARCHAR(15) NOT NULL,
    urgency          ENUM('CRITICAL','HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
    status           ENUM('PENDING','ACCEPTED','REJECTED','COMPLETED') NOT NULL DEFAULT 'PENDING',
    notes            TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_request_status (status),
    INDEX idx_request_blood_group (blood_group),
    INDEX idx_request_city (city),
    CONSTRAINT fk_request_seeker FOREIGN KEY (seeker_id) REFERENCES users(id),
    CONSTRAINT fk_request_donor  FOREIGN KEY (donor_id)  REFERENCES donors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Table: donations
-- =============================================
CREATE TABLE IF NOT EXISTS donations (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    donor_id         BIGINT NOT NULL,
    blood_request_id BIGINT NOT NULL UNIQUE,
    donation_date    DATE NOT NULL,
    units_donated    INT,
    notes            TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_donation_donor   FOREIGN KEY (donor_id)         REFERENCES donors(id),
    CONSTRAINT fk_donation_request FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
