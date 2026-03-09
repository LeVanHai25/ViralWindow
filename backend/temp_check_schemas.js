const db = require('./config/db');

async function checkSchemas() {
    try {
        console.log('--- INVENTORY TABLE ---');
        const [invColumns] = await db.query('DESCRIBE inventory');
        console.log(JSON.stringify(invColumns, null, 2));

        console.log('\n--- ACCESSORIES TABLE ---');
        const [accColumns] = await db.query('DESCRIBE accessories');
        console.log(JSON.stringify(accColumns, null, 2));

        console.log('\n--- GLASS_ITEMS TABLE ---');
        const [glassColumns] = await db.query('DESCRIBE glass_items');
        console.log(JSON.stringify(glassColumns, null, 2));

        console.log('\n--- ALUMINUM_SYSTEMS TABLE ---');
        const [alsysColumns] = await db.query('DESCRIBE aluminum_systems');
        console.log(JSON.stringify(alsysColumns, null, 2));

        console.log('\n--- ALUMINUM TABLE (STOCK) ---');
        const [alColumns] = await db.query('DESCRIBE aluminum');
        console.log(JSON.stringify(alColumns, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

checkSchemas();
