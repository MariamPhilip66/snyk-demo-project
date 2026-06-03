const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// VULNERABILITY: No file type validation, dangerous storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/uploads/');
    },
    filename: (req, file, cb) => {
        // VULNERABILITY: Using original filename without sanitization
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// POST /api/files/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        // VULNERABILITY: SQL Injection when storing file metadata
        const query = `INSERT INTO files (filename, path, uploaded_by, task_id) 
                       VALUES ('${file.originalname}', '${file.path}', ${req.user.userId}, ${req.body.taskId})`;
        await db.query(query);

        res.status(201).json({
            message: 'File uploaded',
            filename: file.originalname,
            path: file.path
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/files/download
router.get('/download', authenticateToken, async (req, res) => {
    const { filename } = req.query;

    // VULNERABILITY: Path Traversal - attacker can download any file on server
    const filePath = path.join('/uploads', filename);

    // No check if file is within allowed directory
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// GET /api/files/preview
router.get('/preview', authenticateToken, async (req, res) => {
    const { filepath } = req.query;

    // VULNERABILITY: Path Traversal + potential SSRF
    const content = fs.readFileSync(filepath, 'utf8');

    // VULNERABILITY: XSS - rendering file content directly in HTML response
    res.send(`
        <html>
            <head><title>File Preview</title></head>
            <body>
                <h1>Preview: ${req.query.filename}</h1>
                <pre>${content}</pre>
            </body>
        </html>
    `);
});

// DELETE /api/files/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: SQL Injection + IDOR (no ownership check)
        const [files] = await db.query("SELECT * FROM files WHERE id = " + req.params.id);

        if (files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // VULNERABILITY: Path Traversal in file deletion
        fs.unlinkSync(files[0].path);

        await db.query("DELETE FROM files WHERE id = " + req.params.id);
        res.json({ message: 'File deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
