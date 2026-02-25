// Simplified check
const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viral_window_db'
    });

    const [users] = await conn.query(`
        SELECT u.id, u.full_name, u.role_id, r.name as role_name
        FROM users u LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = 1
    `);

    console.log('DATABASE USERS:');
    users.forEach(u => {
        console.log('  ID=' + u.id + ', Name=' + u.full_name + ', role_id=' + u.role_id + ', role_name=' + (u.role_name || 'NULL'));
    });

    await conn.end();
}

check().catch(e => { console.error(e.message); process.exit(1); });
