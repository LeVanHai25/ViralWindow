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

        const id = 1;
        const code = 'VRA_VR001';
        const group_code = 'VRA';
        const group_name = 'Vách kính cố định';
        const name = 'TEST PRODUCT NAME';
        const accessory = 'ViralWindow';
        const accessory_price = 120000;
        const prices = { "0-0.25": 1000 };
        const accessories = [
            { "name": "ViralWindow", "price": 120000 },
            { "name": "Cmech", "price": 2000000 }
        ];

        const sql = 'UPDATE product_catalog SET code = ?, group_code = ?, group_name = ?, name = ?, accessory = ?, accessory_price = ?, prices_json = ?, accessories_json = ? WHERE id = ?';
        const params = [
            code,
            group_code,
            group_name,
            name,
            accessory,
            accessory_price,
            JSON.stringify(prices),
            JSON.stringify(accessories),
            id
        ];

        console.log('Executing SQL with params:', JSON.stringify(params, null, 2));
        const [result] = await connection.execute(sql, params);
        console.log('Update Result:', result);

        const [rows] = await connection.execute('SELECT id, accessories_json FROM product_catalog WHERE id = ?', [id]);
        console.log('Post-Update Data:', JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Test Error:', err);
    }
}

testUpdate();
