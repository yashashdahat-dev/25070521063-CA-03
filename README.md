# SIT NEXUS — Campus Events & Hackathon Hub
### Continuous Assessment 3 (CA-03) Submission
**Student PRN / Roll Number:** `25070521063`  
**Student Name:** Yashash Dahat  
**Repository:** `https://github.com/yashashdahat-dev/25070521063-CA-03.git`

---

## 🚀 Overview
**SIT Nexus** is a full-stack web application designed for campus hackathons, technical symposia, and coding competitions. It features real-time event discovery, dynamic team registrations, instant pass generation with QR ticket styling, and an interactive storage diagnostic inspector.

---

## 📁 Repository Structure
```
25070521063/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── homeComp/           # Header, Footer, Hero content components
│   │   ├── about.jsx           # About SIT & Tech Societies
│   │   ├── contact.jsx         # Support & FAQ Desk
│   │   ├── home.jsx            # Event Discovery & Registration Modal
│   │   ├── nav.jsx             # Navigation Bar
│   │   ├── services.jsx        # Pass Manager & Storage Inspector
│   │   ├── App.css             # Glassmorphism Design System
│   │   ├── App.jsx             # React Router Setup
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Backend API & Database (Node.js + Express + MongoDB)
    ├── data/                   # Persistent local JSON data store
    │   ├── registrations.json  # Stored event registrations & passes
    │   └── students.json       # CA-03 student records
    ├── server.js               # Express Server & MongoDB API routes
    ├── package.json
    └── package-lock.json
```

---

## 🛠️ Tech Stack
* **Frontend:** React 18, Vite, React Router DOM, Glassmorphism UI, FontAwesome Icons
* **Backend:** Node.js, Express.js, MongoDB Driver, Bcrypt, JSON Web Token (JWT), CORS
* **Database & Persistence:**
  * **Primary:** MongoDB (`sitSecB` database, `student` & `event_registrations` collections)
  * **Persistent File Fallback:** Auto-saves to `server/data/registrations.json` and `server/data/students.json`

---

## ⚙️ How to Run Locally

### 1. Start the Backend Server
```bash
cd server
npm install
node server.js
```
*Backend runs on:* `http://localhost:5000`

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5174` (or `http://localhost:5173`)

---

## 🌐 API Endpoints & Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/getall` | Retrieve all student records |
| `GET` | `/get/:id` | Retrieve student by ID |
| `POST` | `/create` | Register/Add a new student |
| `POST` | `/login` | Authenticate student (JWT + Bcrypt) |
| `PUT` | `/update/:id` | Update student status |
| `DELETE` | `/delete/:id` | Delete student record |
| `POST` | `/api/events/register` | Register a team for an event |
| `GET` | `/api/events/registrations` | Get all registered event passes |
| `GET` | `/api/events/registrations/:rollNumber` | Filter passes by student roll number |
| `GET` | `/api/status` | Diagnostic server health & data summary |

---

## 💾 Where is Information Stored?
1. **Local Persistent JSON Files:**
   * `server/data/registrations.json` — Stores all team passes and registrations.
   * `server/data/students.json` — Stores student logins and profiles.
2. **Web App Inspector:**
   * Go to `/services` -> Click **"Where is Data Stored? (Inspector)"** tab for real-time diagnostics and live raw JSON viewing.
3. **MongoDB:**
   * Database: `sitSecB`
   * Collections: `event_registrations`, `student`
