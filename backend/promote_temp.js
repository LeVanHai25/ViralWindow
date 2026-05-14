const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

async function testTiDB() {
    console.log('Testing TiDB Cloud Connection...');
    
    // Load .env.tidb specifically
    const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../backend/.env.tidb')));
    
    const config = {
        host: envConfig.DB_HOST,
        user: envConfig.DB_USER,
        password: envConfig.DB_PASS,
        database: envConfig.DB_NAME,
        port: parseInt(envConfig.DB_PORT),
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: false
        }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to TiDB!');
        
        const emails = ['hai2504le@gmail.com', 'hai2504@gmail.com'];
        const [users] = await connection.execute(
            'SELECT id, email, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Current Users:', users);
        
        console.log('Updating to Super Admin...');
        const [res] = await connection.execute(
            'UPDATE users SET user_type = "admin", role_id = 1, is_active = 1 WHERE email IN (?, ?)',
            emails
        );
        console.log('Update Result:', res.affectedRows, 'rows affected.');
        
        const [final] = await connection.execute(
            'SELECT id, email, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Final Users:', final);
        
        await connection.end();
    } catch (err) {
        console.error('❌ TiDB Error:', err.message);
    }
}

testTiDB();
