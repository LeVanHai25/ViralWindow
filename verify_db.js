const mysql = require('mysql2/promise');

async function verify() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'viral_window_db'
        });

        console.log('--- Product Catalog Accessories Check ---');
        const [products] = await connection.execute('SELECT id, product_name, accessories_json FROM product_catalog WHERE accessories_json IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(products, null, 2));

        console.log('\n--- Quotation Items Accessory Name Check ---');
        const [qItems] = await connection.execute('SELECT id, quotation_id, item_name, accessory_name, accessory_price FROM quotation_items WHERE accessory_name IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(qItems, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verify();
