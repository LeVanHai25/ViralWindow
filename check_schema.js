const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'viral_window_db'
    });

    const tables = ['product_catalog', 'quotation_items', 'product_groups'];

    for (const table of tables) {
        console.log(`--- ${table} ---`);
        const [rows] = await connection.query(`DESCRIBE ${table}`);
        console.table(rows);
    }

    await connection.end();
}

checkSchema().catch(console.error);
