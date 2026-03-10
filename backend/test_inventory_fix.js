const db = require('./config/db');

async function testInventory() {
    try {
        console.log('--- Testing Accessory ---');
        const [accRows] = await db.query(`
            SELECT category, COUNT(*) as count 
            FROM accessories 
            WHERE is_active = 1 
            GROUP BY category
        `);
        console.log('Active Accessories by Category:', accRows);

        console.log('\n--- Testing Glass from Inventory table ---');
        const [glassRows] = await db.query(`
            SELECT item_code, item_name, quantity, unit_price 
            FROM inventory 
            WHERE item_type = 'glass' 
            LIMIT 5
        `);
        console.log('Glass items in inventory table:', glassRows);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testInventory();
