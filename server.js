// server.js

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// === MySQL connection ===
// Update user/password/database if needed
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "ankit@54328",       // your MySQL password
  database: "alumni_db"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// === API: Add Alumni ===
app.post("/add-alumni", (req, res) => {
  const { name, batch, contact, job, university, email, course } = req.body;

  const query = `
    INSERT INTO alumni 
    (name, batch, contact, job, university, email, course)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, batch, contact, job, university, email, course], (err, result) => {
    if (err) {
      console.error("❌ Error inserting data:", err);
      return res.status(500).send("Database insert failed");
    }
    res.send({ message: "✅ Alumni added successfully", id: result.insertId });
  });
});

// === API: Get All Alumni ===
app.get("/alumni", (req, res) => {
  db.query("SELECT * FROM alumni", (err, rows) => {
    if (err) {
      console.error("❌ Error fetching data:", err);
      return res.status(500).send("Database fetch failed");
    }
    res.send(rows);
  });
});

// === Start Server ===
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
