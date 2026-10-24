const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.join(__dirname, "data");
const STUDENTS_FILE = path.join(DATA_DIR, "students.json");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers to read/write JSON files safely
function loadJson(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading " + filePath, err);
  }
  saveJson(filePath, defaultData);
  return defaultData;
}

function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing " + filePath, err);
  }
}

// Default initial datasets
const initialStudents = [
  {
    _id: "67192a01b1a23c4d5e6f7a81",
    name: "Yashash Dahat",
    age: 20,
    status: "Lead Developer (Team Algorists)",
    email: "25070521063@sit.edu"
  }
];

const initialRegistrations = [
  {
    id: "TICKET-250705",
    eventId: "evt-1",
    eventTitle: "HackSIT 2026: 36-Hour National Hackathon",
    eventDate: "Nov 14 - 16, 2026",
    venue: "Campus Tech Audi & Computing Labs",
    teamName: "Team Algorists",
    leaderName: "Yashash Dahat",
    rollNumber: "25070521063",
    email: "25070521063@sit.edu",
    teamSize: "4",
    registeredAt: "Oct 24, 2026",
    status: "Confirmed"
  }
];

let inMemoryStudents = loadJson(STUDENTS_FILE, initialStudents);
let inMemoryRegistrations = loadJson(REGISTRATIONS_FILE, initialRegistrations);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
const port = 5000;
let isMongoConnected = false;
let myDb = null;

async function startServer() {
  try {
    await client.connect();
    isMongoConnected = true;
    myDb = client.db("sitSecB");
    console.log(">>> [MongoDB] Connected successfully to mongodb://localhost:27017/sitSecB");

    // Sync file data into mongo if collection is empty
    const sCount = await myDb.collection("student").countDocuments();
    if (sCount === 0) {
      await myDb.collection("student").insertMany(inMemoryStudents);
    }
    const rCount = await myDb.collection("event_registrations").countDocuments();
    if (rCount === 0) {
      await myDb.collection("event_registrations").insertMany(inMemoryRegistrations);
    }
  } catch (error) {
    isMongoConnected = false;
    console.log(">>> [Storage Mode] Local file + in-memory store active at:", DATA_DIR);
    console.log(">>> [Notice] MongoDB is offline, auto-persisting to JSON files in server/data/");
  }

  app.listen(port, () => {
    console.log(`>>> [Express] SIT Nexus Server running on http://localhost:${port}`);
  });
}

startServer();

// ==========================================
// 1. STUDENT MANAGEMENT ROUTES (Original CA-03)
// ==========================================

// GET all students
app.get("/getall", async (req, res) => {
  if (isMongoConnected && myDb) {
    try {
      const data = await myDb.collection("student").find().toArray();
      return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  return res.json(inMemoryStudents);
});

// GET student by ID
app.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  if (isMongoConnected && myDb) {
    try {
      const student = await myDb.collection("student").findOne({ _id: new ObjectId(id) });
      return res.json(student);
    } catch (err) {
      console.error(err);
    }
  }
  const student = inMemoryStudents.find(s => String(s._id) === id);
  return res.json(student || { msg: "Student not found" });
});

// POST create student
app.post("/create", async (req, res) => {
  const { name, age, status, password, email } = req.body;
  const hashedPass = password ? await bcrypt.hash(password, 10) : "";

  const newStudent = {
    _id: "sid_" + Date.now(),
    name,
    age: Number(age) || 20,
    status,
    email,
    password: hashedPass,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("student").insertOne(newStudent);
    } catch (err) {
      console.error(err);
    }
  }

  inMemoryStudents.unshift(newStudent);
  saveJson(STUDENTS_FILE, inMemoryStudents);

  return res.json({ acknowledged: true, insertedId: newStudent._id, student: newStudent });
});

// POST login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let student = null;

  if (isMongoConnected && myDb) {
    try {
      student = await myDb.collection("student").findOne({ email: email });
    } catch (err) {
      console.error(err);
    }
  }
  if (!student) {
    student = inMemoryStudents.find(s => s.email === email);
  }

  if (student != null) {
    const isCorrect = student.password ? await bcrypt.compare(password, student.password) : true;
    if (isCorrect) {
      const payload = {
        subject: student.name,
        role: student.status
      };
      const token = jwtToken.sign(payload, "MY_SECRET_TOKEN", { expiresIn: "24h" });
      return res.json({ jwtToken: token, user: student });
    }
    return res.status(401).json({ msg: "Incorrect Password" });
  } else {
    return res.status(422).json({ msg: "Invalid Email" });
  }
});

// PUT update status
app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("student").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } }
      );
    } catch (err) {
      console.error(err);
    }
  }

  const student = inMemoryStudents.find(s => String(s._id) === id);
  if (student) {
    student.status = status;
    saveJson(STUDENTS_FILE, inMemoryStudents);
    return res.json({ acknowledged: true, modifiedCount: 1 });
  }
  return res.status(404).json({ msg: "Student Id Invalid" });
});

// DELETE remove student
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("student").deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.error(err);
    }
  }

  const prevLen = inMemoryStudents.length;
  inMemoryStudents = inMemoryStudents.filter(s => String(s._id) !== id);
  saveJson(STUDENTS_FILE, inMemoryStudents);
  return res.json({ acknowledged: true, deletedCount: prevLen - inMemoryStudents.length });
});

// ==========================================
// 2. CAMPUS EVENTS & REGISTRATION ROUTES
// ==========================================

// POST register team for event
app.post("/api/events/register", async (req, res) => {
  const regData = {
    id: req.body.id || ("TICKET-" + Math.floor(100000 + Math.random() * 900000)),
    ...req.body,
    registeredAt: req.body.registeredAt || new Date().toISOString(),
    status: "Confirmed"
  };

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("event_registrations").insertOne(regData);
    } catch (err) {
      console.error(err);
    }
  }

  // Remove existing with same ID if any, and add to start
  inMemoryRegistrations = inMemoryRegistrations.filter(r => r.id !== regData.id);
  inMemoryRegistrations.unshift(regData);
  saveJson(REGISTRATIONS_FILE, inMemoryRegistrations);

  return res.json({ success: true, pass: regData, storedAt: REGISTRATIONS_FILE });
});

// GET registrations by roll number
app.get("/api/events/registrations/:rollNumber", async (req, res) => {
  const roll = req.params.rollNumber;
  if (isMongoConnected && myDb) {
    try {
      const list = await myDb.collection("event_registrations").find({ rollNumber: roll }).toArray();
      return res.json(list);
    } catch (err) {
      console.error(err);
    }
  }

  const list = inMemoryRegistrations.filter(r => r.rollNumber === roll);
  return res.json(list);
});

// GET all registrations
app.get("/api/events/registrations", async (req, res) => {
  if (isMongoConnected && myDb) {
    try {
      const data = await myDb.collection("event_registrations").find().toArray();
      return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  return res.json(inMemoryRegistrations);
});

// GET server status & diagnostic data info
app.get("/api/status", async (req, res) => {
  let studentCount = inMemoryStudents.length;
  let registrationCount = inMemoryRegistrations.length;
  let storageMode = "Local JSON Persistent File (" + REGISTRATIONS_FILE + ")";

  if (isMongoConnected && myDb) {
    try {
      studentCount = await myDb.collection("student").countDocuments();
      registrationCount = await myDb.collection("event_registrations").countDocuments();
      storageMode = "MongoDB (mongodb://localhost:27017/sitSecB) + JSON Backup";
    } catch (err) {
      console.error(err);
    }
  }

  return res.json({
    server: "SIT NEXUS CA-03 Backend",
    port: port,
    status: "ONLINE",
    mongoConnected: isMongoConnected,
    storageMode: storageMode,
    files: {
      registrationsFile: REGISTRATIONS_FILE,
      studentsFile: STUDENTS_FILE
    },
    counts: {
      students: studentCount,
      registrations: registrationCount
    },
    students: inMemoryStudents,
    registrations: inMemoryRegistrations
  });
});
