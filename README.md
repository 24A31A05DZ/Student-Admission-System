# Student Admission System

A professional, fully functional front‑end student admission portal built with HTML, CSS and JavaScript.

## Features

- Responsive navigation bar with centered links and a unified login/logout button.
- Login modal (or dedicated page) supporting **student** and **school** roles.
- LocalStorage based authentication and data storage (no backend required).
- Student dashboard showing applications, stats and ability to apply to new schools.
- School dashboard for administrators with application management and status updates.
- Browse top 10 schools in Kakinada, view details, and apply online.
- Multi-step admission form with client-side validation and file uploads.
- Modern UI/UX: glassmorphism, card lift effects, consistent spacing, shadows.
- Fully responsive layout (desktop/tablet/mobile) using Bootstrap grid.

## Usage

1. Open `index.html` in a browser.
2. Click **Login** in the navbar to open the authentication modal.
3. Register as a student or school, or use sample school credentials (UDISE `UD1000`/`password`).
4. After login, navigate to your dashboard via the **Dashboard** link.
5. Students can apply to schools, view application status, and submit confirmation letters.
6. Schools can review incoming applications, change statuses, and send confirmations.

All records (accounts, schools, applications) are saved in the browser's `localStorage`.

## Folder structure

```
index.html             ← homepage
schools.html           ← school cards listing
style.css              ← common styles
script.js              ← application logic
pages/                 ← auxiliary pages (login, dashboards, forms)
  login.html
  student-dashbord.html
  school-dashboard.html
  school-details.html
  admission.html
```

This project is meant for demonstration and educational purposes. No sensitive data should
be stored in localStorage in a production environment.

