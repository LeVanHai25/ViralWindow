const mysql = require('mysql2/promise');

async function checkColumns() {
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

        const [rows] = await connection.execute('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = "viral_window_db" AND TABLE_NAME = "product_catalog" ORDER BY ORDINAL_POSITION');
        console.log(JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Check Error:', err);
    }
}

checkColumns();
