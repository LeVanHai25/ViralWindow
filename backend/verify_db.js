const mysql = require('mysql2/promise');

async function verify() {
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

        console.log('--- Product Catalog Accessories Check (Vách kính cố định) ---');
        const [products] = await connection.execute('SELECT id, name, accessories_json FROM product_catalog WHERE name LIKE "%VÁCH KÍNH CỐ ĐỊNH%"');
        console.log(JSON.stringify(products, null, 2));

        console.log('\n--- Quotation Items Accessory Name Check ---');
        // Note: accessory_name might be null for old items
        const [qItems] = await connection.execute('SELECT id, quotation_id, item_name, accessory_name, accessory_price FROM quotation_items WHERE accessory_name IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(qItems, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verify();
