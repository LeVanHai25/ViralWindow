const mysql = require('mysql2/promise');

async function testUpdate() {
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

        const id = 37;
        const accessories = [
            { name: 'Viralwindow', price: 120000 },
            { name: 'Cmech', price: 150000 }
        ];

        console.log(`--- Updating Product ${id} with 2 accessories ---`);
        const [result] = await connection.execute(
            'UPDATE product_catalog SET accessories_json = ? WHERE id = ?',
            [JSON.stringify(accessories), id]
        );

        console.log('Update Result:', result.affectedRows);

        const [rows] = await connection.execute('SELECT id, name, accessories_json FROM product_catalog WHERE id = ?', [id]);
        console.log('After Update:', JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Test Error:', err);
    }
}

testUpdate();
