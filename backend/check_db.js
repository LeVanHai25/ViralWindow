const db = require('./config/db');

async function checkSchema() {
    try {
        const tables = ['product_catalog', 'quotation_items', 'product_groups'];
        const schema = {};

        for (const table of tables) {
            const [rows] = await db.query(`DESCRIBE ${table}`);
            schema[table] = rows;
        }
        console.log(JSON.stringify(schema, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
