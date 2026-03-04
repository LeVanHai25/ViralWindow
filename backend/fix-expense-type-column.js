// fix-expense-type-column.js - Sửa cột expense_type từ ENUM sang VARCHAR
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined
    });

    try {
        // Check current column type
        const [cols] = await connection.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'financial_transactions' 
            AND COLUMN_NAME = 'expense_type'
            AND TABLE_SCHEMA = ?
        `, [process.env.DB_NAME]);

        console.log('Current expense_type column:', cols[0]);

        // ALTER to VARCHAR(255) to allow any value
        await connection.query(`
            ALTER TABLE financial_transactions 
            MODIFY COLUMN expense_type VARCHAR(255) NULL 
            COMMENT 'Loại chi phí: material, labor, transport, Xuất vật tư, Mua nhôm, etc.'
        `);
        console.log('✅ Changed expense_type to VARCHAR(255)');

        // Verify
        const [after] = await connection.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'financial_transactions' 
            AND COLUMN_NAME = 'expense_type'
            AND TABLE_SCHEMA = ?
        `, [process.env.DB_NAME]);
        console.log('After fix:', after[0]);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

fix();
