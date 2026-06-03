const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT * FROM users WHERE id = " + req.user.userId
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // VULNERABILITY: Sensitive data exposure - sending full user object including password
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/:id/avatar
router.get('/:id/avatar', async (req, res) => {
    const filename = req.query.filename;

    // VULNERABILITY: Path Traversal - user controls file path
    const filePath = path.join('/uploads/avatars/', filename);
    res.sendFile(filePath);
});

// POST /api/users/export
router.post('/export', authenticateToken, async (req, res) => {
    try {
        const { format, userId } = req.body;

        // VULNERABILITY: Command Injection - user input passed to shell command
        const command = `python3 export_tool.py --format ${format} --user ${userId} --output /tmp/export_${userId}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: 'Export failed' });
            }
            res.json({ message: 'Export complete', file: `/tmp/export_${userId}.${format}` });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/users/report
router.post('/report', authenticateToken, async (req, res) => {
    try {
        const { reportType, dateRange } = req.body;

        // VULNERABILITY: Command Injection via reportType
        exec(`generate-report --type=${reportType} --range="${dateRange}"`, (error, stdout) => {
            if (error) {
                return res.status(500).json({ error: 'Report generation failed' });
            }
            res.json({ report: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/search
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;

        // VULNERABILITY: SQL Injection in search
        const query = `SELECT id, username, email FROM users WHERE username LIKE '%${q}%' OR email LIKE '%${q}%'`;
        const [users] = await db.query(query);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/users/settings
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const { theme, notifications, language } = req.body;

        // VULNERABILITY: Prototype pollution potential + SQL Injection
        const updates = Object.keys(req.body).map(key => `${key} = '${req.body[key]}'`).join(', ');
        const query = `UPDATE user_settings SET ${updates} WHERE user_id = ${req.user.userId}`;
        await db.query(query);

        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/logs
router.get('/logs', authenticateToken, async (req, res) => {
    const { date } = req.query;

    // VULNERABILITY: Path Traversal in log file access
    const logPath = `/var/log/taskflow/${date}.log`;
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.send(data);
    });
});

module.exports = router;
