const process = require('process');
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // ⚠️ AJOUTE LE PORT (Indispensable pour Aiven)
    port: process.env.DB_PORT || 3306, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // ⚠️ AJOUTE LE SSL (Obligatoire pour Aiven en ligne)
    // On l'active seulement si on n'est pas sur ton PC (localhost)
    ssl: process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: false
    } : null
});

module.exports = pool;