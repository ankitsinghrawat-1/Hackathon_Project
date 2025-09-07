const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const secretKey = 'your_jwt_secret_key'; // Use a secure key

app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ankit@54328',
    database: 'alumni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // Replace with your email
        pass: 'your_app_password' // Replace with your app password
    }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public/uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Register Alumni
app.post('/api/alumni', upload.single('avatar'), async (req, res) => {
    try {
        const { name, email, password, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes } = req.body;
        const mentorship = req.body.mentorship === 'on' ? 1 : 0;
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const [existingUser] = await pool.query('SELECT alumni_id FROM alumni WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO alumni (name, email, password, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes, mentorship, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes, mentorship, avatar]
        );

        res.status(201).json({ message: 'Alumnus registered successfully!', alumniId: result.insertId });

    } catch (error) {
        console.error('Error during alumni registration:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await pool.query('SELECT alumni_id, password FROM alumni WHERE email = ?', [email]);
        const alumnus = rows[0];

        if (!alumnus || !await bcrypt.compare(password, alumnus.password)) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ alumniId: alumnus.alumni_id }, secretKey, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Get all alumni (Protected route)
app.get('/api/alumni', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT alumni_id AS id, name, email, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes, mentorship, avatar FROM alumni');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching alumni:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Update Alumni Profile
app.put('/api/alumni/:id', verifyToken, upload.single('avatar'), async (req, res) => {
    const alumniId = parseInt(req.params.id, 10);
    const authAlumniId = req.user.alumniId;
    const { name, email, password, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes, mentorship } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

    if (alumniId !== authAlumniId) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
    }

    try {
        let passwordUpdate = '';
        const params = [name, email, contact, batch, university, course, jobTitle, company, yoe, industry, linkedin, notes, mentorship, avatar];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            passwordUpdate = 'password = ?, ';
            params.splice(2, 0, hashedPassword);
        }

        const updateQuery = `UPDATE alumni SET name = ?, email = ?, ${passwordUpdate} contact = ?, batch = ?, university = ?, course = ?, jobTitle = ?, company = ?, yoe = ?, industry = ?, linkedin = ?, notes = ?, mentorship = ?, avatar = ? WHERE alumni_id = ?`;
        params.push(alumniId);

        const [result] = await pool.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumnus not found.' });
        }

        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating alumni profile:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Change Password Route
app.put('/api/change-password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const alumniId = req.user.alumniId;

    try {
        const [rows] = await pool.query('SELECT password FROM alumni WHERE alumni_id = ?', [alumniId]);
        const alumnus = rows[0];

        if (!alumnus || !await bcrypt.compare(currentPassword, alumnus.password)) {
            return res.status(401).json({ error: 'Incorrect current password.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE alumni SET password = ? WHERE alumni_id = ?', [hashedPassword, alumniId]);
        
        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Server error during password change:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// Delete Alumni Profile
app.delete('/api/alumni/:id', verifyToken, async (req, res) => {
    const alumniId = parseInt(req.params.id, 10);
    const authAlumniId = req.user.alumniId;

    if (alumniId !== authAlumniId) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own profile.' });
    }

    try {
        const [result] = await pool.query('DELETE FROM alumni WHERE alumni_id = ?', [alumniId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumnus not found.' });
        }
        
        res.json({ message: 'Alumnus profile deleted successfully.' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// New Endpoint for Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await pool.query('SELECT alumni_id FROM alumni WHERE email = ?', [email]);
        const alumnus = rows[0];

        if (!alumnus) {
            return res.status(404).json({ error: 'User with this email not found.' });
        }

        const resetToken = jwt.sign({ id: alumnus.alumni_id }, secretKey, { expiresIn: '1h' });
        await pool.query('UPDATE alumni SET reset_token = ? WHERE alumni_id = ?', [resetToken, alumnus.alumni_id]);

        const resetUrl = `http://localhost:3000/reset_password.html?token=${resetToken}`;
        const mailOptions = {
            to: email,
            from: 'your_email@gmail.com',
            subject: 'Alumni Directory Password Reset',
            html: `<p>You requested a password reset for your account.</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link is valid for 1 hour.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// New Endpoint to Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required.' });
    }

    try {
        const payload = jwt.verify(token, secretKey);
        const [rows] = await pool.query('SELECT alumni_id, reset_token FROM alumni WHERE alumni_id = ? AND reset_token = ?', [payload.id, token]);
        const alumnus = rows[0];

        if (!alumnus) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE alumni SET password = ?, reset_token = NULL WHERE alumni_id = ?', [hashedPassword, alumnus.alumni_id]);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
});

// Endpoint to truncate the table
app.post('/api/reset-data', verifyToken, async (req, res) => {
    // You might want to add a check here to ensure only an admin can perform this action
    try {
        await pool.query('TRUNCATE TABLE alumni');
        res.json({ message: 'Alumni data has been successfully cleared.' });
    } catch (error) {
        console.error('Error truncating table:', error);
        res.status(500).json({ error: 'Failed to clear data.' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});