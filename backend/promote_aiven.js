const mysql = require('mysql2/promise');

async function promoteOnAiven() {
    console.log('🚀 Connecting to Aiven Database...');
    const config = {
        host: 'viralwindow-db-hai2504le-a1e8.k.aivencloud.com',
        port: 23742,
        user: 'avnadmin',
        password: process.env.AIVEN_PASSWORD || 'REMOVED_FOR_SECURITY',
        database: 'viral_window_db',
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
        connectTimeout: 15000
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to Aiven!');
        
        const emails = ['hai2504le@gmail.com', 'hai2504@gmail.com'];
        
        // 1. Check current state
        const [users] = await connection.execute(
            'SELECT id, email, full_name, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Current Users:', users);
        
        if (users.length === 0) {
            console.warn('⚠️ No users found with these emails on Aiven.');
        } else {
            console.log('🆙 Promoting users to Super Admin...');
            // Note: role_id = 1 is Super Admin according to create_rbac_tables.sql
            const [res] = await connection.execute(
                `UPDATE users 
                 SET user_type = 'admin', 
                     role_id = 1, 
                     is_active = 1 
                 WHERE email IN (?, ?)`,
                emails
            );
            console.log('Update Result:', res.affectedRows, 'rows updated.');
        }
        
        // 2. Final check
        const [final] = await connection.execute(
            'SELECT id, email, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Final Users:', final);
        
        await connection.end();
        console.log('👋 Done.');
    } catch (err) {
        console.error('❌ Aiven Error:', err.message);
    }
}

promoteOnAiven();
