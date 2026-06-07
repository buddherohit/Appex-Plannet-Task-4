# Student Career & Placement Portal

A complete, production-ready, Full Stack Web Application designed to support students accessing academic courses, sharing study resources, showcasing development projects, and applying for placement jobs and internships. The platform also provides administrators with aggregate statistics metrics, time-series trends using **Chart.js**, and centralized CRUD access for portal modules.

---

## 🚀 Technology Stack

### Frontend
- **React.js 18 (Vite)**
- **Bootstrap 5 & Bootstrap Icons** (Responsive, glassmorphic themes)
- **Chart.js & React Chartjs 2** (Interactive analytics charts)
- **React Router DOM** (Single Page App routing)
- **Axios** (REST API integration client with automatic authorization request interceptor)

### Backend
- **PHP 8+** (Object-oriented architecture with structured endpoint controllers)
- **REST API** (Strict JSON responses, cross-origin resource sharing, CORS middleware)

### Database & Server
- **MySQL** (Structured relationships, indices for search optimization, foreign key constraints)
- **XAMPP Server** (Apache & MariaDB local environments)

---

## 🛠️ Key Security Controls
- **Prepared Statements**: Strict usage of PDO prepared parameters in all queries preventing SQL Injection.
- **Password Hashing**: Secure user password encryption via standard Blowfish `password_hash($pwd, PASSWORD_BCRYPT)` algorithm.
- **API Token Verification**: Database-backed secure session tokens matching custom authorization headers (`Authorization: Bearer <token>`) preventing CSRF threats.
- **Input Sanitization**: Multi-level sanitization filters applying `htmlspecialchars(strip_tags(...))` preventing Cross-Site Scripting (XSS).
- **Strict File Validation**: Double-barrier mime type matching and file extension verification (enforcing PDF, DOC, DOCX, PPT, PPTX) with a strict size limit of 10MB.
- **Randomized File Naming**: Avoids directory traversal and execution of malicious scripts (e.g. uploading `.php` scripts) by renaming all uploads with secure random hex ids.

---

## 📂 Project Structure

```text
Appex Plannet/
├── backend/
│   ├── api/
│   │   ├── auth.php         # Registration, login, profile, password recoveries
│   │   ├── courses.php      # Course CRUD with search & category filters
│   │   ├── notes.php        # Resource upload with type/size checks & delete rules
│   │   ├── projects.php     # Student showcase projects registry
│   │   ├── jobs.php         # Placements board CRUD & application redirectors
│   │   └── dashboard.php    # Aggregated metrics counters & Chart.js data streams
│   ├── config/
│   │   ├── database.php     # PDO connection initializer
│   │   └── helpers.php      # Common functions, CORS headers, auth validation
│   ├── uploads/             # Notes, thumbnails, and profile images storage
│   └── schema.sql           # Database structures initialization script
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, Footer, ProtectedRoute guards
│   │   ├── context/         # AuthContext (login, register, logout, profiles, themes)
│   │   ├── pages/           # Landing, About, Login, Register, Dashboards, Resources
│   │   ├── services/        # Central api.js Axios client
│   │   ├── App.jsx          # Route declarations mapping
│   │   ├── index.css        # Glassmorphic themes & dark mode stylesheet
│   │   └── main.jsx         # App entry mounting point
│   ├── index.html           # Main HTML index with font loader
│   └── package.json         # Node dependency lock
└── README.md                # System documentation
```

---

## 💻 Installation & Setup

### 1. Database & Backend Configuration (XAMPP)
1. Start **XAMPP Control Panel** and run **Apache** and **MySQL**.
2. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Click on the **SQL** tab.
4. Open the SQL schema script file [schema.sql](file:///e:/Appex%20Plannet/backend/schema.sql), copy its SQL contents, paste it into the phpMyAdmin SQL query area, and click **Go** to create the `placement_portal` database.
5. Create a folder named `backend` inside your local XAMPP `htdocs` folder (e.g. `C:\xampp\htdocs\backend`).
6. Copy all files from the project's [backend/](file:///e:/Appex%20Plannet/backend/) folder into `C:\xampp\htdocs\backend\`.
   > [!IMPORTANT]
   > Make sure the folder `C:\xampp\htdocs\backend\uploads` exists. If not, create it and ensure write permissions.

### 2. Frontend Configuration & Execution
1. Open a terminal inside the [frontend/](file:///e:/Appex%20Plannet/frontend/) folder.
2. Verify dependencies are installed:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the portal in your browser at: `http://localhost:5173`.

---

## 🔑 Default Accounts (For Evaluation)

### 1. Admin Account
- **Email**: `admin@placement.com`
- **Password**: `admin123`
- *Privileges*: Access to the statistical graphs, global activity audit table, and complete control over inserting, updating, and deleting courses, notes, projects, and job postings.

### 2. Student Account
- Create one using the registration page (`/register`), or log in using any student details you set up.
- *Privileges*: Access to study resource tables (upload own notes, download notes), register developer projects in the showcase, view active course categories, and search the placements board for internships.

---

## 📡 REST API Documentation

All API requests pass user credentials in the headers:
`Authorization: Bearer <token_string>`

### 1. Authentication (`backend/api/auth.php`)
- **POST** `?action=register`: Register student accounts.
  - *Payload*: `{ "full_name", "email", "mobile", "password" }`
- **POST** `?action=login`: Log in to retrieve tokens.
  - *Payload*: `{ "email", "password" }`
- **GET** `?action=verify`: Verify token active state.
- **POST** `?action=forgot`: Password recovery trigger.
  - *Payload*: `{ "email" }`
- **POST** `?action=reset`: Change password using token code.
  - *Payload*: `{ "email", "token", "password" }`
- **POST** `?action=update_profile`: Update account details (multipart form-data).
  - *Payload*: `{ "full_name", "email", "mobile", "profile_image" (File) }`
- **POST** `?action=change_password`: Password rotation.
  - *Payload*: `{ "current_password", "new_password" }`

### 2. Dashboard (`backend/api/dashboard.php`)
- **GET**: Aggregated metric logs and time-series statistics.

### 3. Courses (`backend/api/courses.php`)
- **GET**: Read paginated list. Filter by query search or categories.
- **POST**: Admin only. Insert course card (multipart form-data).
- **POST** `?action=update`: Admin only. Edit details (multipart form-data).
- **DELETE** `?id=<id>`: Admin only. Delete course.

### 4. Notes (`backend/api/notes.php`)
- **GET**: Fetch resource table list. Filter by subjects.
- **POST**: Upload study notes (multipart form-data). Max size: 10MB.
- **DELETE** `?id=<id>`: Delete notes file (restricted to note uploader or admin).

### 5. Projects (`backend/api/projects.php`)
- **GET**: Read student project list.
- **POST**: Create project registry.
- **PUT**: Update project card details.
- **DELETE** `?id=<id>`: Delete project record.

### 6. Jobs (`backend/api/jobs.php`)
- **GET**: Read vacancies board. Filter by company and location.
- **POST**: Admin only. Create job opening details.
- **PUT**: Admin only. Edit job details.
- **DELETE** `?id=<id>`: Admin only. Delete vacancy listing.

---

## 📺 Demonstration Flow (10-Minute Guide)
1. **Registration**: Go to `/register` and register a new student account.
2. **Login**: Authenticate with the created student account or use the default Admin account.
3. **Student Dashboard**: Explore the profile cards, quick action links, and local activity log panel.
4. **Courses Manage**: Log in as Admin and click **Create Course**. Upload a custom thumbnail image. Log in as Student to view the course card.
5. **Notes Upload**: Click **Upload Resource**, browse and select a `.pdf`, `.docx`, or `.pptx` file under 10MB. Validate that the document icon updates dynamically.
6. **Project Showcase**: Go to Projects. Add a title, description, and copy-paste GitHub and demo URLs. View the click redirects.
7. **Placement Job Board**: Log in as Admin, create a job opening details sheet, and save. Log in as Student, query by company or location, and view details.
8. **Forgot / Reset Password**: Try logging out, go to `/forgot-password`, trigger email recovery, copy the simulated token, and reset password successfully.
9. **Analytics Graphs**: Log in as Admin and view Chart.js registrations, course categories bar charts, and job timeline graphs.
10. **Profile Settings**: Go to Profile, upload a customized avatar image, edit contact details, and rotate account password.
