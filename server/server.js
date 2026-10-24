const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2500 });
const port = 5000;
let isMongoConnected = false;
let myDb = null;

// In-memory fallback dataset in case local MongoDB service is offline
let inMemoryStudents = [
  {
    _id: "67192a01b1a23c4d5e6f7a81",
    name: "Yashash Dahat",
    age: 20,
    status: "Lead Developer (Team Algorists)",
    email: "25070521063@sit.edu"
  }
];

let inMemoryRegistrations = [
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
    status: "Confirmed"
  }
];

// Initialize and Start Server
async function startServer() {
  try {
    await client.connect();
    isMongoConnected = true;
    myDb = client.db("sitSecB");
    console.log(">>> [MongoDB] Successfully connected to mongodb://localhost:27017 (db: sitSecB)");
  } catch (error) {
    isMongoConnected = false;
    console.warn(">>> [MongoDB] Note: Local MongoDB service is offline (" + error.message + ").");
    console.log(">>> [Server] Running in resilient mode with auto-fallback in-memory store.");
  }

  app.listen(port, () => {
    console.log(`>>> [Express] Server started successfully at http://localhost:${port}`);
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

  if (isMongoConnected && myDb) {
    try {
      const response = await myDb.collection("student").insertOne({
        name,
        age: Number(age) || 20,
        status,
        password: hashedPass,
        email
      });
      return res.json(response);
    } catch (err) {
      console.error(err);
    }
  }

  const newStudent = {
    _id: "mem_" + Date.now(),
    name,
    age: Number(age) || 20,
    status,
    email,
    password: hashedPass
  };
  inMemoryStudents.push(newStudent);
  return res.json({ acknowledged: true, insertedId: newStudent._id, student: newStudent });
});

// POST login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let student = null;

  if (isMongoConnected && myDb) {
    student = await myDb.collection("student").findOne({ email: email });
  } else {
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
      const response = await myDb.collection("student").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } }
      );
      return res.json(response);
    } catch (err) {
      console.error(err);
    }
  }

  const student = inMemoryStudents.find(s => String(s._id) === id);
  if (student) {
    student.status = status;
    return res.json({ acknowledged: true, modifiedCount: 1 });
  }
  return res.status(404).json({ msg: "Student Id Invalid" });
});

// DELETE remove student
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  if (isMongoConnected && myDb) {
    try {
      const response = await myDb.collection("student").deleteOne({ _id: new ObjectId(id) });
      return res.json(response);
    } catch (err) {
      console.error(err);
    }
  }

  const prevLen = inMemoryStudents.length;
  inMemoryStudents = inMemoryStudents.filter(s => String(s._id) !== id);
  return res.json({ acknowledged: true, deletedCount: prevLen - inMemoryStudents.length });
});

// ==========================================
// 2. CAMPUS EVENTS & REGISTRATION ROUTES
// ==========================================

// POST register team for event
app.post("/api/events/register", async (req, res) => {
  const regData = {
    id: "TICKET-" + Math.floor(100000 + Math.random() * 900000),
    ...req.body,
    registeredAt: new Date().toISOString(),
    status: "Confirmed"
  };

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("event_registrations").insertOne(regData);
    } catch (err) {
      console.error(err);
    }
  }

  inMemoryRegistrations.unshift(regData);
  return res.json({ success: true, pass: regData });
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
