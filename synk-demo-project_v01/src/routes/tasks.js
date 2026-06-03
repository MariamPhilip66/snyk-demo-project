const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/tasks - Get all tasks for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, priority, search } = req.query;

        // VULNERABILITY: SQL Injection via query parameter concatenation
        let query = "SELECT * FROM tasks WHERE owner_id = " + req.user.userId;

        if (status) {
            query += " AND status = '" + status + "'";
        }
        if (priority) {
            query += " AND priority = '" + priority + "'";
        }
        if (search) {
            // VULNERABILITY: SQL Injection in LIKE clause
            query += " AND (title LIKE '%" + search + "%' OR description LIKE '%" + search + "%')";
        }

        query += " ORDER BY created_at DESC";

        const [tasks] = await db.query(query);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tasks - Create a new task
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, priority, due_date, assignee_id } = req.body;

        // VULNERABILITY: SQL Injection in INSERT with template literals
        const query = `INSERT INTO tasks (title, description, priority, due_date, owner_id, assignee_id) 
                       VALUES ('${title}', '${description}', '${priority}', '${due_date}', ${req.user.userId}, ${assignee_id})`;

        const [result] = await db.query(query);

        res.status(201).json({ taskId: result.insertId, message: 'Task created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: SQL Injection in path parameter
        const query = "SELECT * FROM tasks WHERE id = " + req.params.id;
        const [tasks] = await db.query(query);

        if (tasks.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(tasks[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, status, priority } = req.body;

        // VULNERABILITY: SQL Injection
        const query = `UPDATE tasks SET title='${title}', description='${description}', 
                       status='${status}', priority='${priority}' WHERE id = ${req.params.id}`;
        await db.query(query);

        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: SQL Injection + No ownership check (IDOR)
        const query = "DELETE FROM tasks WHERE id = " + req.params.id;
        await db.query(query);

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tasks/:id/comment - Add comment to task
router.post('/:id/comment', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;

        // VULNERABILITY: Stored XSS - content not sanitized before storage
        const query = `INSERT INTO comments (task_id, user_id, content) 
                       VALUES (${req.params.id}, ${req.user.userId}, '${content}')`;
        await db.query(query);

        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tasks/:id/comments - Render comments (XSS vulnerable)
router.get('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const [comments] = await db.query(
            "SELECT * FROM comments WHERE task_id = " + req.params.id
        );

        // VULNERABILITY: Cross-Site Scripting - rendering user content without encoding
        let html = '<div class="comments">';
        comments.forEach(comment => {
            html += `<div class="comment">
                <p class="author">${comment.username}</p>
                <p class="content">${comment.content}</p>
            </div>`;
        });
        html += '</div>';

        res.send(html);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
