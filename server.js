const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend + uploads)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // change if you have a different MySQL user
  password: "ankit@54328",        // add your password if you set one
  database: "alumni_db"
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

// Multer storage for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ================= API ROUTES =================

// Add alumni
app.post("/api/alumni", upload.single("avatar"), (req, res) => {
  const { name, batch, university, email, course, job, contact, linkedin, notes } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `INSERT INTO alumni (name, batch, university, email, course, job, contact, linkedin, notes, avatar)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, batch, university, email, course, job, contact, linkedin, notes, avatar], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Alumni registered successfully!" });
  });
});

// Get alumni list
app.get("/api/alumni", (req, res) => {
  const sql = "SELECT * FROM alumni ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database fetch failed" });
    }
    res.json(results);
  });
});

// ================= SERVER START =================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
