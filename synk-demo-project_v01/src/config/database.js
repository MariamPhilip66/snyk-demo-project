const mysql = require('mysql2');

// VULNERABILITY: Hardcoded database credentials
const pool = mysql.createPool({
    host: 'db.taskflow-prod.internal',
    user: 'admin',
    password: 'TaskFlow$ecure2024!',
    database: 'taskflow_production',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();
