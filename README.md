# onlinevehicleservicebooking

## Overview

The Online Vehicle Service Booking System is a MERN Stack web application designed to simplify vehicle maintenance and service management. The platform allows users to register, book vehicle services, track service progress, receive notifications, and manage their bookings through a user-friendly interface.

---

## Features

* User Registration and Authentication
* Vehicle Service Booking
* Service Center Management
* Real-Time Service Status Tracking
* Email Notifications and Updates
* Secure Payment Integration
* User Dashboard for Booking History
* Admin Dashboard for Service Management

---

## Technology Stack

### Frontend

* React.js
* Vite
* HTML5
* CSS3
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Development Tools

* Visual Studio Code
* Git & GitHub

---

## Installation Guide

### Prerequisites

Make sure the following software is installed:

* Node.js
* npm
* MongoDB

### Clone the Repository

```bash
git clone <repository-url>
cd online-vehicle-service-booking
```

### Install Dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory and configure the required variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Start the Application

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm start
```

The application will be available at:

```text
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

---

## User Registration Instructions

1. Open the application.
2. Click on **Register**.
3. Enter your:

   * Full Name
   * Email Address
   * Password
4. Use a valid email address during registration.
5. Create your own secure password.
6. Submit the registration form.
7. Log in using the registered email and password.

### Important Note

Users are encouraged to register with their own email addresses. This allows them to receive:

* Booking Confirmations
* Service Status Updates
* Payment Notifications
* Appointment Reminders
* Future Platform Announcements

---

## Test Credentials (For Demonstration)

### Admin Account

```text
Email: admin@example.com
Password: Admin@123
```

### Test User Account

```text
Email: user@example.com
Password: User@123
```

> Note: For the best experience, new users should create their own account using a valid email address to receive all notifications and service updates.

---

## Project Workflow

1. User Registration/Login
2. Vehicle Information Submission
3. Service Selection
4. Appointment Booking
5. Online Payment
6. Service Processing
7. Status Tracking
8. Service Completion Notification

---

## Future Enhancements

* AI-Based Service Recommendations
* Live Chat Support
* Mobile Application Integration
* Multi-Service Center Support
* Advanced Analytics Dashboard
* Vehicle Maintenance History Tracking

---

## Conclusion

The Online Vehicle Service Booking System provides a modern solution for managing vehicle service appointments digitally. By leveraging the MERN Stack, the platform ensures scalability, reliability, and a seamless user experience for customers and service providers alike.
