const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       
  password: "ankit@54328", 
  database: "alumni_db"
});

// API route to insert alumni
app.post("/add-alumni", (req, res) => {
  const { name, batch, contact, job } = req.body;
  db.query(
    "INSERT INTO alumni (name, batch, contact, job) VALUES (?, ?, ?, ?)",
    [name, batch, contact, job],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Alumni added successfully", id: result.insertId });
    }
  );
});

// API route to fetch alumni
app.get("/alumni", (req, res) => {
  db.query("SELECT * FROM alumni", (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
