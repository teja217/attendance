# RINL STAFF MANAGEMENT SYSTEM (ATTENDANCE PORTAL)
## Software Requirements Specification and Validation Document

**Project type:**
Staff Attendance and Management Web Application

**Confidentiality Statement:**
This document contains the software requirements, specifications, validations, and implementation details of the RINL Staff Management System application. The document is intended for developers, testers, project managers, and stakeholders involved in the development and maintenance of the system.

---

## 1. INTRODUCTION

### 1.1 Purpose
The RINL Staff Management System is a web-based attendance application designed to provide users with a convenient and efficient platform for tracking daily staff attendance. The application enables employees to mark attendance and view history, and allows administrators to manage users, monitor all staff attendance, and ensure smooth operational workflows.

The purpose of this Software Requirements Specification (SRS) document is to define the functional requirements, non-functional requirements, validations, business rules, and system behavior of the application. This document serves as a complete reference for developers, testers, project managers, and future team members.

### 1.2 Scope
The system aims to digitize the attendance process by providing an online platform where employees can log their attendance digitally without relying on manual registers.

The system provides the following capabilities:
* User Authentication (Login & Authorization)
* Admin Dashboard (User and overall attendance management)
* Employee Dashboard (Personal attendance logging and history)
* Automated Attendance Seeding and Reporting
* Secure API Communication

The application is intended for staff and administrators within the organization to manage daily attendance effectively.

### 1.3 Objectives
**Business Objectives:**
* Provide a digital attendance platform.
* Improve administrative convenience.
* Reduce dependency on physical registers.

**Technical Objectives:**
* Develop a scalable web application.
* Implement secure authentication mechanisms.
* Maintain efficient user and attendance data management.

**User Objectives:**
* Allow employees to quickly log their daily attendance.
* Enable administrators to oversee the workforce easily.
* Reduce the time required for administrative tasks.

### 1.4 Intended Audience
* **Developers:** To understand application requirements, business rules, and future development expectations.
* **Testers:** To validate application functionality against defined requirements.
* **Project Managers:** To track project scope and deliverables.
* **Future Team Members:** To understand the application architecture and business logic.

### 1.5 Definitions and Acronyms
| Term | Meaning |
|---|---|
| **SRS** | Software Requirements Specification |
| **UI** | User Interface |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token |
| **DB** | Database |
| **CRUD** | Create, Read, Update, Delete |
| **Employee** | Standard user marking attendance |
| **Admin** | System administrator managing data |

### 1.6 Document Organization
This document is organized into multiple chapters covering business requirements, user requirements, system requirements, validations, error handling, testing procedures, and future enhancements.

---

## 2. PROJECT OVERVIEW

### 2.1 Project Description
The RINL Staff Management System is a web-based attendance application developed to simplify the process of tracking employee presence. The application enables staff to securely log in, mark their daily presence, and review their history, while admins can manage personnel.

### 2.2 Problem Statement
Traditional attendance tracking involves physical registers or outdated biometric systems that are often inefficient, difficult to audit, and prone to human error. Managing these records manually consumes significant administrative time.

### 2.3 Existing System
In traditional systems:
* Employees physically sign registers.
* Attendance calculations are done manually.
* Auditing and report generation require substantial effort.
**Limitations:** Time-consuming, lack of real-time visibility, and prone to data loss.

### 2.4 Proposed System
The proposed digital system addresses these limitations by allowing users to:
* Log in securely using credentials.
* Mark attendance digitally.
* View personal or organization-wide attendance history based on roles.
* Manage user accounts (Admin only).

### 2.5 Advantages of Proposed System
* **Convenience & Time Saving:** Quick daily logins and attendance marking.
* **Improved User Experience:** Simple and intuitive interfaces tailored for specific roles.
* **Accessibility:** Available through web browsers on different devices.

### 2.6 System Workflow
User Login -> Role Check -> (Admin Dashboard / Employee Dashboard) -> Mark/View Attendance -> System Logs Data

### 2.7 System Context & Architecture
**External Entities:** Employee, Admin, MongoDB Database
**Internal Components:** React Frontend, Node.js Backend, Express APIs

---

## 3. BUSINESS REQUIREMENTS

### 3.1 Business Objective
The primary objective is to provide a digital platform that enables efficient staff attendance tracking, reducing administrative overhead and ensuring accurate record-keeping.

### 3.2 Business Goals
* **BG-001 – Improve Tracking Efficiency:** Enable quick digital attendance logging.
* **BG-002 – Secure Data Access:** Ensure role-based access control.
* **BG-003 – Simplify Management:** Provide admins with centralized oversight.

### 3.3 Business Success Criteria
* Users can log in securely.
* Attendance is recorded accurately.
* Admins can view and manage all users.

### 3.4 Constraints
* Budget Constraints: Use open-source technologies.
* Technology Constraints: MERN stack (MongoDB, Express, React, Node.js).
* Internet Dependency: Requires an active internet connection.

---

## 4. STAKEHOLDERS

### 4.1 Stakeholder Identification
* **SH-001 Employee:** Uses the application to mark attendance.
* **SH-002 Administrator:** Manages users and oversees system operations.
* **SH-003 Developer:** Develops and maintains the system.

### 4.2 Administrator Role
**Responsibilities:** Manage users, monitor attendance logs, resolve operational issues.
**Expectations:** Reliable system performance, easy administration.

### 4.3 Employee Role
**Responsibilities:** Log in daily, mark attendance accurately.
**Expectations:** Easy-to-use interface, secure login, quick response times.

---

## 5. USER REQUIREMENTS

### 5.1 User Requirements Summary
| Requirement ID | Requirement Description |
|---|---|
| **UR-001** | User shall be able to log into the system securely. |
| **UR-002** | Employee shall be able to mark daily attendance. |
| **UR-003** | Employee shall be able to view their attendance history. |
| **UR-004** | Admin shall be able to view all users' attendance. |
| **UR-005** | Admin shall be able to create new user accounts. |

---

## 6. USER STORIES

* **US-001:** As an employee, I want to log in securely so that my attendance data is protected.
* **US-002:** As an employee, I want to mark my attendance with a single click so that it is quick and efficient.
* **US-003:** As an admin, I want to view a list of all staff so that I can monitor the workforce.
* **US-004:** As an admin, I want to add new employees to the system so that they can begin tracking their attendance.

---

## 7. FUNCTIONAL REQUIREMENTS

### FR-001 LOGIN MODULE
* **Purpose:** Allows registered users to access the application securely.
* **Components:** Email Field, Password Field, Login Button.
* **Validation:** Both fields required. Must match stored database records.

### FR-002 EMPLOYEE DASHBOARD
* **Purpose:** Primary interface for standard staff.
* **Components:** Attendance Status, "Mark Present" Button, History Table.
* **Workflow:** User clicks "Mark Present" -> API validates time/date -> Database updated -> Success message displayed.

### FR-003 ADMIN DASHBOARD
* **Purpose:** Management interface for administrators.
* **Components:** Add User Form, Employee List, Organization Attendance Logs.

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Performance Requirements
* **NFR-001:** Dashboards should load within 3 seconds.
* **NFR-002:** Attendance marking should reflect immediately on the UI.

### 8.2 Security Requirements
* **NFR-003:** Passwords must be encrypted using bcrypt.
* **NFR-004:** APIs must be protected using JWT authentication.

### 8.3 Reliability & Availability
* **NFR-005:** The system should securely fallback to local JSON storage if MongoDB fails to ensure zero data loss.

---

## 9. VALIDATION RULES

### 9.1 Login Validation
* Email must be a valid format.
* Password cannot be empty.
* Unauthenticated users are redirected to the login page.

### 9.2 Admin Operations Validation
* Only Admins can access the `/api/users` creation routes.
* Duplicate emails cannot be registered.

---

## 10. ERROR HANDLING REQUIREMENTS

* **Database Failure:** If the primary database is unavailable, the application gracefully falls back to a local JSON database without crashing.
* **Authentication Errors:** Displays clear messages like "Invalid credentials".
* **Data Integrity:** Operations that fail halfway should not corrupt existing valid data.

---

## 11. BACKEND REQUIREMENTS

### 11.1 Architecture
The application uses a robust MERN stack architecture with a Node.js/Express.js backend and a MongoDB database.

### 11.2 APIs
* **Auth APIs:** `/api/auth/login`, `/api/auth/me`
* **User APIs (Admin):** `/api/users` (GET, POST, DELETE)
* **Attendance APIs:** `/api/attendance/mark`, `/api/attendance/my`, `/api/attendance/all`

---

## 12. FUTURE SCOPE

### 12.1 Enhancements
* **Leave Management:** Integration of leave requests and approvals.
* **Reporting & Exports:** Ability for admins to export attendance data to PDF/Excel.
* **Biometric/Location Integration:** Geo-fencing or biometric API integrations for stricter attendance verification.
