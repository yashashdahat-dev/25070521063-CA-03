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

### Option 1: 1-Command Full Stack Startup (Recommended)
From the project root directory:
```bash
npm start
```
*(Or `npm run dev`, or double-click `start.bat` on Windows)*.  
This launches both the Express backend (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) concurrently.

---

### Option 2: Run in Two Terminals

#### 1. Backend Server
```bash
cd server
npm start
```
*Backend runs on:* `http://localhost:5000`

#### 2. Frontend Client
```bash
cd client
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🌐 API Endpoints & Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/signup` or `/create` | Register a new student account (Bcrypt + JWT) |
| `POST` | `/login` or `/api/auth/login` | Authenticate by Email OR Roll Number + Password |
| `GET` | `/api/auth/me` | Fetch authenticated student profile from JWT |
| `GET` | `/getall` | Retrieve all student records |
| `GET` | `/get/:id` | Retrieve student by ID |
| `PUT` | `/update/:id` | Update student status |
| `DELETE` | `/delete/:id` | Delete student record |
| `POST` | `/api/events/register` | Register a team pass (prevents duplicate rolls) |
| `GET` | `/api/events/registrations` | Get all registered event passes |
| `GET` | `/api/events/registrations/:rollNumber` | Filter passes by student roll number |
| `GET` | `/api/events` | Fetch all campus and hosted events |
| `POST` | `/api/events` | Host and persist a new campus event |
| `POST` | `/api/contact` | Submit student support ticket |
| `GET` | `/api/contact` | Retrieve support tickets |
| `GET` | `/api/status` | Diagnostic server health & data summary |

---

## 🔐 Authentication Features
- **Frontend Auth Gate:** Users must Sign In or Register before accessing the platform.
- **Dynamic Navbar:** Displays student name avatar, roll number badge, live MongoDB status badge, and one-click Sign Out button.
- **Auto-Fill Integration:** Event registration modal pre-populates team leader details automatically.
- **Pass Management:** "My Passes" button in `services.jsx` filters passes belonging to the authenticated student.

---

## 💾 Where is Information Stored?
1. **MongoDB Compass (Primary):**
   * Connection URI: `mongodb://127.0.0.1:27017`
   * Database: `sitSecB`
   * Collections:
     * `student` — Student credentials & profile details.
     * `event_registrations` — Generated passes and ticket entries.
     * `events` — Custom hosted events.
     * `contacts` — Submitted support inquiries.
2. **Local Persistent JSON Files (Fallback):**
   * `server/data/students.json`
   * `server/data/registrations.json`
   * `server/data/events.json`
   * `server/data/contacts.json`
