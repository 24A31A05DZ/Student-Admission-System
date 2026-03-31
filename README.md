# 1. Project Title
**Student Admission System**

# 2. Project Description (in 2 - 3 lines)
A responsive front-end student admission portal built using **HTML, CSS, and JavaScript**.  
It supports **Student** and **School (Admin)** roles with dashboards, and stores all data in the browser using **localStorage** (no backend).

# 3. Problem Statement of the project
Traditional admission processes are time-consuming and paper-heavy, making it difficult to track applications and status updates.  
This project provides a simple web-based admission workflow where students can apply online and schools can review and manage applications in one place.

# 4. Features of the Project
- **Role-based login**: Student and School (Admin) authentication.
- **Responsive UI**: Works on desktop, tablet, and mobile screens.
- **Student dashboard**: View applications, status, and apply to schools.
- **School dashboard**: Review applications and update admission status.
- **School listing & details**: Browse schools, open details, and apply online.
- **Multi-step admission form**: Client-side validation and file upload fields.
- **Modern UI/UX**: Card-based layout, consistent spacing, shadows, and smooth interactions.
- **Client-only storage**: Data persisted using browser `localStorage`.

# 5. Technology used in the project ( mention all tools and programming languages)
- **Programming / Markup / Styling**: HTML5, CSS3, JavaScript (ES6+)
- **UI framework**: Bootstrap (responsive grid & components)
- **Storage**: Browser `localStorage`
- **Tools**: Git, GitHub (version control), Any modern browser (Chrome/Edge/Firefox) for running

# 6. Project Structure
```
Student-Admission-System/
├─ index.html
├─ schools.html
├─ style.css
├─ script.js
├─ config.js
├─ pages/
│  ├─ login.html
│  ├─ student-dashbord.html
│  ├─ school-dashboard.html
│  ├─ school-details.html
│  ├─ admission.html
│  └─ profile.html
└─ README.md
```

# 7. Installation/Setup of the project
1. Download or clone the repository:
   - `git clone <repo-url>`
2. Open the project folder.
3. Run it using either method:
   - **Quick run**: Double-click `index.html`
   - **Recommended**: Use a local server (example: VS Code “Live Server”) and open `index.html`

# 8. Usage of the Project
1. Open `index.html`.
2. Go to **Login** and sign in as:
   - **Student**: Register/login to apply for admission
   - **School (Admin)**: Register/login to manage applications
3. Browse schools from `schools.html` and open details.
4. Submit an application using the admission form (`pages/admission.html`).
5. Track application status in the **Student Dashboard**.
6. Review and update application statuses in the **School Dashboard**.

> Note: All records (accounts, schools, applications) are stored in `localStorage`. Clearing browser data will reset the app.

# 9. Sample Output of the project
- **Homepage (`index.html`)**: Navbar, entry to login, and navigation to schools/dashboards.
- **Schools listing (`schools.html`)**: Cards listing schools; click to view details.
- **Login (`pages/login.html`)**: Select role (Student/School) and authenticate.
- **Student Dashboard (`pages/student-dashbord.html`)**: Shows submitted applications and their status (e.g., Pending/Approved/Rejected).
- **School Dashboard (`pages/school-dashboard.html`)**: View incoming applications and update statuses.

Sample credentials (if enabled in your UI/data):
- **School (UDISE)**: `UD1000`
- **Password**: `password`

# 10. Future Improvements
- Add a real backend (Node.js/Express or Django) and database (MySQL/MongoDB).
- Use JWT/session-based authentication instead of `localStorage`.
- Add email/SMS notifications for application status updates.
- Add admin analytics (charts, exports) and audit logs.
- Add file upload persistence (server storage / cloud storage).

# 11. Author
- **Name**: Gurram Chandini  
- **Role**: Frontend  
- **LinkedIn URL**: `https://www.linkedin.com/in/chandini-gurram-790b95317/`


