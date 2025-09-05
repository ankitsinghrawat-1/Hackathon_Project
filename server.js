const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use("/uploads", express.static(uploadDir));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ankit@54328", // update if necessary
  database: "alumni_db"
});

db.connect(err => {
  if (err) return console.error("DB Connection Error:", err);
  console.log("✅ Connected to MySQL");
});

// Multer config for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique);
  }
});
const upload = multer({ storage });

// Add Alumni endpoint
app.post("/add-alumni", upload.single("avatar"), (req, res) => {
  const { name, batch, contact, job, university, email, course, linkedin, notes } = req.body;
  const avatar = req.file ? "/uploads/" + req.file.filename : "/uploads/default.png";

  const query = `
    INSERT INTO alumni
    (name, batch, contact, job, university, email, course, linkedin, avatar, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, batch, contact, job, university, email, course, linkedin, avatar, notes], (err, result) => {
    if (err) return res.status(500).send("DB Insert Failed: " + err);
    res.send({ message: "Alumni added successfully", id: result.insertId });
  });
});

// Get All Alumni
app.get("/alumni", (req, res) => {
  db.query("SELECT * FROM alumni ORDER BY added_on DESC", (err, rows) => {
    if (err) return res.status(500).send("DB Fetch Failed: " + err);
    res.send(rows);
  });
});

app.listen(5000, () => console.log("Server running at http://localhost:5000"));
