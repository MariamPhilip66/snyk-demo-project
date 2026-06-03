const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');

// VULNERABILITY: Hardcoded JWT secret
const JWT_SECRET = 'my-super-secret-jwt-key-taskflow-2024';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // VULNERABILITY: SQL Injection - string concatenation in query
        const checkQuery = "SELECT * FROM users WHERE email = '" + email + "'";
        const [existing] = await db.query(checkQuery);

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // VULNERABILITY: SQL Injection in INSERT
        const insertQuery = `INSERT INTO users (username, email, password, role) 
                             VALUES ('${username}', '${email}', '${hashedPassword}', '${role}')`;
        const [result] = await db.query(insertQuery);

        const token = jwt.sign(
            { userId: result.insertId, email, role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // VULNERABILITY: SQL Injection
        const query = "SELECT * FROM users WHERE email = '" + email + "'";
        const [users] = await db.query(query);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // VULNERABILITY: Sensitive data exposure - returning password hash
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // VULNERABILITY: No token verification / weak validation
        const decoded = jwt.decode(token); // Using decode instead of verify!

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // VULNERABILITY: SQL Injection
        const query = `UPDATE users SET password = '${hashedPassword}' WHERE id = ${decoded.userId}`;
        await db.query(query);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
