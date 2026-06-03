const jwt = require('jsonwebtoken');

// VULNERABILITY: Hardcoded secret (same as in auth.js - but hardcoded secrets shouldn't exist at all)
const JWT_SECRET = 'my-super-secret-jwt-key-taskflow-2024';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        // Using the hardcoded secret to verify
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// VULNERABILITY: Weak authorization - only checks if token is valid, not if user has permission
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRole };
