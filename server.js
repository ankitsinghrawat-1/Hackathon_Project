// Install the required packages: npm install express mysql2 multer dotenv
require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mysql = require("mysql2/promise"); // Use the promise-based version
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// ================= DATABASE CONNECTION =================
let db;
(async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "alumni_db",
        });
        console.log("✅ Connected to MySQL");
    } catch (err) {
        console.error("❌ Failed to connect to MySQL:", err.message);
        process.exit(1); // Exit the process if the connection fails
    }
})();

// ================= MULTER SETUP =================
// Configure multer storage and file filter for security
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
      cb(null, true);
  } else {
      // You can add an error message here for better user feedback
      cb(new Error("File format not supported. Please upload a JPG, PNG, or WEBP image."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } }); // 5MB file size limit

// ================= API ROUTES =================

// Add alumni
app.post("/api/alumni", upload.single("avatar"), async (req, res) => {
    try {
        const {
            name, batch, university, email, course, contact, linkedin, notes,
            jobTitle, company, industry, yoe, city, specialization, github, website, mentorship
        } = req.body;
        
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;
        const mentorshipBool = mentorship === 'true'; // Convert 'true' string to boolean

        const sql = `
            INSERT INTO alumni (
                name, batch, university, email, course, contact, linkedin, notes,
                jobTitle, company, industry, yoe, city, specialization, github, website, mentorship, avatar
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name, batch, university, email, course, contact, linkedin, notes,
            jobTitle, company, industry, yoe, city, specialization, github, website, mentorshipBool, avatar
        ];

        if (!name || !batch || !email || !university || !course) {
            return res.status(400).json({ error: "Missing required fields (name, batch, email, university, course)." });
        }

        await db.execute(sql, values);
        
        res.status(201).json({ message: "Alumni registered successfully!" });
    } catch (error) {
        console.error("Database insert failed:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

// Get alumni list
app.get("/api/alumni", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM alumni ORDER BY name ASC");
        res.json(rows);
    } catch (error) {
        console.error("Database fetch failed:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

// ================= SERVER START =================
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});