// Script to run SQL file for resetting product categories
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSQL() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viral_window_db',
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true // Important for running multiple SQL statements
    });

    try {
        console.log('📂 Reading SQL file...');
        const sqlFilePath = path.join(__dirname, 'sql', 'reset_product_categories.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('🚀 Executing SQL...');
        const [results] = await connection.query(sqlContent);

        console.log('✅ SQL executed successfully!');
        console.log('Results:', results);

        // Show summary
        const [summary] = await connection.query('SELECT product_type, COUNT(*) as count FROM product_templates GROUP BY product_type');
        console.log('\n📊 Product Summary:');
        summary.forEach(row => {
            console.log(`   ${row.product_type}: ${row.count} sản phẩm`);
        });

        const [total] = await connection.query('SELECT COUNT(*) as total FROM product_templates');
        console.log(`\n🎉 Total: ${total[0].total} sản phẩm`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

runSQL();
