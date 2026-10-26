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
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

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

// Load all four collections from seed files
let inMemoryStudents = loadJson(STUDENTS_FILE, []);
let inMemoryRegistrations = loadJson(REGISTRATIONS_FILE, []);
let inMemoryEvents = loadJson(EVENTS_FILE, []);
let inMemoryContacts = loadJson(CONTACTS_FILE, []);

// Use IPv4 explicitly so Node.js v18+ does not ECONNREFUSE on localhost DNS resolution
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2500 });
const port = process.env.PORT || 5000;
let isMongoConnected = false;
let myDb = null;

// Helper to query documents by either string ID or BSON ObjectId
function buildIdQuery(id) {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }
  return { _id: id };
}

// Convert string _id to a safe form for MongoDB (keep as string if not valid ObjectId)
function normaliseDoc(doc) {
  const d = { ...doc };
  if (d._id && ObjectId.isValid(d._id) && String(new ObjectId(d._id)) === d._id) {
    d._id = new ObjectId(d._id);
  }
  return d;
}

async function connectToMongo() {
  try {
    await client.connect();
    isMongoConnected = true;
    myDb = client.db("sitSecB");
    console.log(`>>> [MongoDB] Connected successfully to ${mongoUri}/sitSecB`);

    // Auto-seed student collection if empty
    const sCount = await myDb.collection("student").countDocuments();
    if (sCount === 0 && inMemoryStudents.length > 0) {
      const docs = inMemoryStudents.map(normaliseDoc);
      await myDb.collection("student").insertMany(docs);
      console.log(`>>> [Seed] Inserted ${docs.length} students into MongoDB`);
    }

    // Auto-seed event_registrations collection if empty
    const rCount = await myDb.collection("event_registrations").countDocuments();
    if (rCount === 0 && inMemoryRegistrations.length > 0) {
      const docs = inMemoryRegistrations.map(normaliseDoc);
      await myDb.collection("event_registrations").insertMany(docs);
      console.log(`>>> [Seed] Inserted ${docs.length} registrations into MongoDB`);
    }

    // Ensure events and contacts collections exist (touch them)
    await myDb.createCollection("events").catch(() => {});
    await myDb.createCollection("contacts").catch(() => {});

    return true;
  } catch (error) {
    isMongoConnected = false;
    console.log(">>> [Storage Mode] Local file + in-memory store active at:", DATA_DIR);
    console.log(">>> [Notice] MongoDB is offline, auto-persisting to JSON files in server/data/");
    return false;
  }
}

async function startServer() {
  await connectToMongo();
  app.listen(port, () => {
    console.log(`>>> [Express] SIT Nexus Server running on http://localhost:${port}`);
  });
}

startServer();

// Reconnect trigger endpoint for frontend inspector
app.post("/api/mongo/reconnect", async (req, res) => {
  const connected = await connectToMongo();
  return res.json({
    connected,
    uri: mongoUri,
    database: "sitSecB",
    msg: connected ? "Connected to MongoDB Compass instance" : "MongoDB service is not reachable on 127.0.0.1:27017"
  });
});

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
      const student = await myDb.collection("student").findOne(buildIdQuery(id));
      if (student) return res.json(student);
    } catch (err) {
      console.error(err);
    }
  }
  const student = inMemoryStudents.find(s => String(s._id) === id);
  return res.json(student || { msg: "Student not found" });
});

const JWT_SECRET = process.env.JWT_SECRET || "MY_SECRET_TOKEN";

// Helper to sanitize student document (strip sensitive fields)
function sanitizeStudent(student) {
  if (!student) return null;
  const safe = { ...student };
  delete safe.password;
  return safe;
}

// Middleware: verify JWT token from Authorization header
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided. Please sign in." });
  }
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  try {
    const decoded = jwtToken.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please sign in again." });
  }
}

// POST create / sign up student
// Validates name, email, password, rollNumber
// Checks for duplicate email or rollNumber in sitSecB.student (HTTP 409)
// Hashes password, saves to DB, signs JWT, returns { jwtToken, user }
const handleRegister = async (req, res) => {
  const { name, email, password, rollNumber, branch, age } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password || !rollNumber || !String(rollNumber).trim()) {
    return res.status(400).json({ error: "Name, email, password, and roll number are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cleanRoll = String(rollNumber).trim();

  // Check if email or rollNumber already exists in sitSecB.student
  let existing = null;
  if (isMongoConnected && myDb) {
    try {
      existing = await myDb.collection("student").findOne({
        $or: [
          { email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } },
          { rollNumber: { $regex: new RegExp(`^${cleanRoll}$`, "i") } }
        ]
      });
    } catch (err) {
      console.error("Error checking existing student:", err);
    }
  }
  if (!existing) {
    existing = inMemoryStudents.find(
      s => (s.email && s.email.toLowerCase() === normalizedEmail) ||
           (s.rollNumber && String(s.rollNumber).toLowerCase() === cleanRoll.toLowerCase())
    );
  }

  if (existing) {
    return res.status(409).json({ error: "Account with this email or roll number already exists. Please sign in." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const newStudent = {
    _id: "sid_" + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    rollNumber: cleanRoll,
    branch: branch || "Computer Science",
    age: Number(age) || 20,
    status: "Active Student",
    password: hashedPassword,
    createdAt: now,
    updatedAt: now
  };

  if (isMongoConnected && myDb) {
    try {
      const insertRes = await myDb.collection("student").insertOne({ ...newStudent });
      if (insertRes.insertedId) {
        newStudent._id = insertRes.insertedId;
      }
    } catch (err) {
      console.error("Error inserting student into MongoDB:", err);
    }
  }

  inMemoryStudents.unshift(newStudent);
  saveJson(STUDENTS_FILE, inMemoryStudents);

  const sanitizedStudent = sanitizeStudent(newStudent);
  const token = jwtToken.sign(
    { id: newStudent._id, email: newStudent.email, rollNumber: newStudent.rollNumber, name: newStudent.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return res.json({
    jwtToken: token,
    user: sanitizedStudent
  });
};

app.post("/create", handleRegister);
app.post("/signup", handleRegister);
app.post("/api/auth/register", handleRegister);

// POST login
// Accepts { email, password } (email can be email or rollNumber)
// Verifies password via bcrypt.compare
// Returns HTTP 401 on mismatch, or { jwtToken, user } on success
const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide both email/roll number and password." });
  }

  const query = String(email).trim().toLowerCase();
  let student = null;

  if (isMongoConnected && myDb) {
    try {
      student = await myDb.collection("student").findOne({
        $or: [
          { email: { $regex: new RegExp(`^${query}$`, "i") } },
          { rollNumber: { $regex: new RegExp(`^${query}$`, "i") } }
        ]
      });
    } catch (err) {
      console.error("Error finding student in login:", err);
    }
  }
  if (!student) {
    student = inMemoryStudents.find(
      s => (s.email && s.email.toLowerCase() === query) ||
           (s.rollNumber && String(s.rollNumber).toLowerCase() === query)
    );
  }

  if (!student) {
    return res.status(401).json({ error: "Invalid email/roll number or password" });
  }

  const isCorrect = student.password ? await bcrypt.compare(password, student.password) : true;
  if (!isCorrect) {
    return res.status(401).json({ error: "Invalid email/roll number or password" });
  }

  const sanitizedStudent = sanitizeStudent(student);
  const token = jwtToken.sign(
    { id: student._id, email: student.email, rollNumber: student.rollNumber, name: student.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return res.json({
    jwtToken: token,
    user: sanitizedStudent
  });
};

app.post("/login", handleLogin);
app.post("/api/auth/login", handleLogin);

// GET /api/auth/me: verifies JWT token, fetches current student from sitSecB.student,
// and returns { user: sanitizedStudent }
app.get("/api/auth/me", verifyToken, async (req, res) => {
  const { email, rollNumber, id } = req.user;
  let student = null;

  if (isMongoConnected && myDb) {
    try {
      student = await myDb.collection("student").findOne({
        $or: [
          { email: { $regex: new RegExp(`^${email}$`, "i") } },
          { rollNumber: rollNumber },
          buildIdQuery(id)
        ]
      });
    } catch (err) {
      console.error("Error in /api/auth/me:", err);
    }
  }

  if (!student) {
    student = inMemoryStudents.find(
      s => (s.email && s.email.toLowerCase() === email?.toLowerCase()) ||
           (s.rollNumber && String(s.rollNumber) === String(rollNumber)) ||
           String(s._id) === String(id)
    );
  }

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  return res.json({ user: sanitizeStudent(student) });
});

// PUT update status
app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("student").updateOne(buildIdQuery(id), { $set: { status } });
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
      await myDb.collection("student").deleteOne(buildIdQuery(id));
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
// 2. CAMPUS EVENTS CRUD ROUTES
// ==========================================

// GET all hosted events (merges MongoDB events with local fallback)
app.get("/api/events", async (req, res) => {
  if (isMongoConnected && myDb) {
    try {
      const data = await myDb.collection("events").find().toArray();
      return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  return res.json(inMemoryEvents);
});

// POST create a new hosted event (persists to MongoDB events collection)
app.post("/api/events", async (req, res) => {
  const { title, category, date, time, venue, prize, teamSize, desc, organizer, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: "Event title is required" });
  }

  const newEvent = {
    id: "evt-hosted-" + Date.now(),
    title: title.trim(),
    category: category || "Hackathons",
    date: date || "",
    time: time || "",
    venue: venue || "",
    prize: prize || "TBD",
    teamSize: teamSize || "2 - 4 Members",
    desc: desc || "",
    organizer: organizer || "Student Technical Cell",
    tags: Array.isArray(tags) ? tags : ["Innovation", "Campus"],
    badge: "Open",
    badgeClass: "badge-open",
    registeredTeams: 0,
    maxTeams: 50,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("events").insertOne({ ...newEvent });
    } catch (err) {
      console.error(err);
    }
  }

  inMemoryEvents.unshift(newEvent);
  saveJson(EVENTS_FILE, inMemoryEvents);

  return res.json({ success: true, event: newEvent });
});

// ==========================================
// 3. EVENT REGISTRATIONS ROUTES
// ==========================================

// POST register team for event — validates required fields and blocks duplicate roll+event combos
app.post("/api/events/register", async (req, res) => {
  const { eventId, eventTitle, teamName, leaderName, rollNumber, email } = req.body;

  // Validate required fields
  if (!eventId || !eventTitle || !teamName || !leaderName || !rollNumber || !email) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: eventId, eventTitle, teamName, leaderName, rollNumber, email"
    });
  }

  // Check for duplicate: same rollNumber already registered for this eventId
  if (isMongoConnected && myDb) {
    try {
      const duplicate = await myDb.collection("event_registrations").findOne({
        eventId,
        rollNumber
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: "This Roll Number is already registered for this event."
        });
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    // Fallback: check in-memory
    const duplicate = inMemoryRegistrations.find(r => r.eventId === eventId && r.rollNumber === rollNumber);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: "This Roll Number is already registered for this event."
      });
    }
  }

  const regData = {
    id: req.body.id || ("TICKET-" + Math.floor(100000 + Math.random() * 900000)),
    ...req.body,
    registeredAt: req.body.registeredAt || new Date().toISOString(),
    status: "Confirmed"
  };

  const newStatus = `Registered: ${eventTitle} (Team: ${teamName})`;

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("event_registrations").insertOne({ ...regData });
      await myDb.collection("student").updateOne(
        { email: { $regex: new RegExp(`^${email.trim()}$`, "i") } },
        { $set: { status: newStatus, updatedAt: new Date().toISOString() } }
      );
    } catch (err) {
      console.error("Error inserting registration or updating student status:", err);
    }
  }

  // Remove existing with same ID if any, and add to start
  inMemoryRegistrations = inMemoryRegistrations.filter(r => r.id !== regData.id);
  inMemoryRegistrations.unshift(regData);
  saveJson(REGISTRATIONS_FILE, inMemoryRegistrations);

  // Sync in-memory student status
  const std = inMemoryStudents.find(s => s.email && s.email.toLowerCase() === email.trim().toLowerCase());
  if (std) {
    std.status = newStatus;
    std.updatedAt = new Date().toISOString();
    saveJson(STUDENTS_FILE, inMemoryStudents);
  }

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

// DELETE event registration
app.delete("/api/events/registrations/:id", async (req, res) => {
  const id = req.params.id;
  const idQuery = buildIdQuery(id);

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("event_registrations").deleteOne({
        $or: [{ id }, idQuery]
      });
    } catch (err) {
      console.error(err);
    }
  }

  const prevLen = inMemoryRegistrations.length;
  inMemoryRegistrations = inMemoryRegistrations.filter(r => r.id !== id && String(r._id) !== id);
  saveJson(REGISTRATIONS_FILE, inMemoryRegistrations);

  return res.json({ success: true, deletedCount: prevLen - inMemoryRegistrations.length });
});

// ==========================================
// 4. CONTACT / SUPPORT TICKET ROUTES
// ==========================================

// POST submit a support ticket
app.post("/api/contact", async (req, res) => {
  const { name, roll, email, category, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "name, email, and message are required" });
  }

  const ticket = {
    id: "TKT-" + Date.now(),
    name: name.trim(),
    roll: roll || "",
    email: email.trim().toLowerCase(),
    category: category || "General Support",
    message: message.trim(),
    submittedAt: new Date().toISOString(),
    status: "Open"
  };

  if (isMongoConnected && myDb) {
    try {
      await myDb.collection("contacts").insertOne({ ...ticket });
    } catch (err) {
      console.error(err);
    }
  }

  inMemoryContacts.unshift(ticket);
  saveJson(CONTACTS_FILE, inMemoryContacts);

  return res.json({ success: true, ticket });
});

// GET all support tickets
app.get("/api/contact", async (req, res) => {
  if (isMongoConnected && myDb) {
    try {
      const data = await myDb.collection("contacts").find().toArray();
      return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  return res.json(inMemoryContacts);
});

// ==========================================
// 5. SERVER STATUS ROUTE
// ==========================================

app.get("/api/status", async (req, res) => {
  let studentCount = inMemoryStudents.length;
  let registrationCount = inMemoryRegistrations.length;
  let eventCount = inMemoryEvents.length;
  let contactCount = inMemoryContacts.length;

  if (isMongoConnected && myDb) {
    try {
      [studentCount, registrationCount, eventCount, contactCount] = await Promise.all([
        myDb.collection("student").countDocuments(),
        myDb.collection("event_registrations").countDocuments(),
        myDb.collection("events").countDocuments(),
        myDb.collection("contacts").countDocuments()
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  return res.json({
    online: true,
    server: "SIT NEXUS CA-03 Backend",
    port,
    status: "ONLINE",
    mongoConnected: isMongoConnected,
    dbName: "sitSecB",
    counts: {
      students: studentCount,
      registrations: registrationCount,
      events: eventCount,
      contacts: contactCount
    }
  });
});
