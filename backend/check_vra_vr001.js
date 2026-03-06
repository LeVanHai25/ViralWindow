const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            user: '2nLSNeKpvSaknDu.root',
            password: '2iJeOEAwQi5TsQNE',
            database: 'viral_window_db',
            port: 4000,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });

        const [rows] = await connection.execute('SELECT id, code, name, accessories_json FROM product_catalog WHERE code = "VRA_VR001"');
        console.log(JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Check Error:', err);
    }
}

check();
