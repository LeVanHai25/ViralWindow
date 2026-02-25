// Check quotation_items in database
const db = require('./config/db');

async function check() {
    try {
        const [items] = await db.query(`
            SELECT id, item_name, code, color, glass, accessories, aluminum_system, location, quantity 
            FROM quotation_items 
            ORDER BY id
        `);

        console.log('=== quotation_items in DB ===');
        console.log('Total items:', items.length);
        items.forEach((item, idx) => {
            console.log(`\nItem ${idx + 1}:`);
            console.log('  id:', item.id);
            console.log('  item_name:', item.item_name);
            console.log('  code:', item.code);
            console.log('  color:', item.color);
            console.log('  glass:', item.glass);
            console.log('  accessories:', item.accessories);
            console.log('  aluminum_system:', item.aluminum_system);
            console.log('  location:', item.location);
            console.log('  quantity:', item.quantity);
        });

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

check();
