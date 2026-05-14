const mysql = require('mysql2/promise');

async function promoteOnNewTiDB() {
    console.log('🚀 Connecting to NEW TiDB (Alicloud)...');
    const config = {
        host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
        port: 4000,
        user: '3LmszoG1PiqurSq.root',
        password: 'Lym4NIfWcVyhJt2V',
        database: 'viral_window_db',
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
        connectTimeout: 60000
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to NEW TiDB!');
        
        const emails = ['hai2504le@gmail.com', 'hai2504@gmail.com'];
        
        const [users] = await connection.execute(
            'SELECT id, email, full_name, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Current Users:', users);
        
        if (users.length === 0) {
            console.warn('⚠️ No users found on this TiDB.');
        } else {
            console.log('🆙 Promoting users to Super Admin...');
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
        
        const [final] = await connection.execute(
            'SELECT id, email, user_type, role_id FROM users WHERE email IN (?, ?)',
            emails
        );
        console.log('Final Users:', final);
        
        await connection.end();
        console.log('👋 Done.');
    } catch (err) {
        console.error('❌ NEW TiDB Error:', err.message);
    }
}

promoteOnNewTiDB();
