# Blood Donation Platform

A production-ready full-stack Blood Donation Platform application built using a clean MVC architecture.

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA, JWT Authentication, Hibernate, Maven
- **Frontend**: HTML5, CSS3 (Vanilla), Bootstrap 5, Javascript (Vanilla ES6 modules)
- **Database**: MySQL

---

## Features

- **Role-Based Access Control**: Admins, Donors, and Seekers get custom-tailored layouts and dashboards.
- **Admin Dashboard**: Complete overview of platform statistics (counters, trends) with user management options, donor verification, and request deletion capabilities.
- **Donor Directory**: Search engine allowing patients to find donors by blood group, availability, and city.
- **Request Workflows**: Seekers can create, edit, or cancel blood requests. Donors can accept requests, contact patients, and complete donations.
- **Secure Authentication**: Passwords stored using BCrypt encryption; session persistence powered by JWT tokens.
- **Profile Photo Upload**: Local file system storage setup for profile photo uploads.

---

## Setup & Run Instructions

### 1. Database Setup
1. Open your MySQL client and run the DDL schema file:
   [database/schema.sql](file:///c:/Blood%20Donation%20Platform/database/schema.sql)
2. Seed the initial mock data by executing:
   [database/data.sql](file:///c:/Blood%20Donation%20Platform/database/data.sql)

### 2. Run Spring Boot Backend
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
2. The server will start on port `8080` (base context `/`).
3. Note: The application seeds a default Admin user on startup:
   - **Username**: `admin@blooddonation.com`
   - **Password**: `Admin@123`

### 3. Open Frontend UI
1. Launch a local web server in the workspace root or direct to:
   [frontend/index.html](file:///c:/Blood%20Donation%20Platform/frontend/index.html)
2. Log in using default seeded accounts or register new donor/seeker profiles to test the full lifecycle.

---

## Credentials for Seeded Users
- **Admin**: `admin@blooddonation.com` / `Admin@123`
- **Donor 1**: `donor1@example.com` / `Donor@123` (City: Mumbai, Blood: O+)
- **Donor 2**: `donor2@example.com` / `Donor@123` (City: Delhi, Blood: A+)
- **Seeker 1**: `seeker1@example.com` / `Seeker@123`
- **Seeker 2**: `seeker2@example.com` / `Seeker@123`
