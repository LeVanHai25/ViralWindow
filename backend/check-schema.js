// check-schema.js - Kiểm tra schema bảng
const pool = require('./config/db');

async function checkSchema() {
    try {
        console.log('=== QUOTATIONS TABLE ===');
        const [qCols] = await pool.query('DESCRIBE quotations');
        console.log(qCols.map(c => c.Field).join(', '));

        console.log('\n=== CUSTOMERS TABLE ===');
        const [cCols] = await pool.query('DESCRIBE customers');
        console.log(cCols.map(c => c.Field).join(', '));

        console.log('\n=== PROJECTS TABLE ===');
        const [pCols] = await pool.query('DESCRIBE projects');
        console.log(pCols.map(c => c.Field).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkSchema();
