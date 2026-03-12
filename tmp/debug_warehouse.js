const pool = require('../backend/config/db');

async function debug() {
    try {
        console.log('--- Debugging Aluminum Warehouse ---');
        
        // 1. Check Tables
        const [tables] = await pool.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log('Tables in DB:', tableNames.join(', '));

        const requiredTables = ['inventory_warehouses', 'aluminum_warehouse_stock', 'aluminum_systems'];
        requiredTables.forEach(t => {
            if (tableNames.includes(t)) {
                console.log(`✅ Table ${t} exists.`);
            } else {
                console.log(`❌ Table ${t} is MISSING!`);
            }
        });

        // 2. Check Data
        if (tableNames.includes('inventory_warehouses')) {
            const [warehouses] = await pool.query("SELECT * FROM inventory_warehouses");
            console.log(`Warehouses (${warehouses.length}):`, warehouses);
        }

        if (tableNames.includes('aluminum_warehouse_stock')) {
            const [stock] = await pool.query("SELECT COUNT(*) as count FROM aluminum_warehouse_stock");
            console.log(`Stock records: ${stock[0].count}`);
        }

        if (tableNames.includes('aluminum_systems')) {
            const [systems] = await pool.query("SELECT COUNT(*) as count FROM aluminum_systems WHERE is_active = 1");
            console.log(`Active Aluminum systems: ${systems[0].count}`);
        }

        // 3. Test the failing query from aluminumController
        console.log('Testing aluminumController query...');
        try {
            const [stockRows] = await pool.query(
                `SELECT aws.*, iw.warehouse_name 
                 FROM aluminum_warehouse_stock aws
                 JOIN inventory_warehouses iw ON aws.warehouse_id = iw.id
                 WHERE iw.inventory_type = 'aluminum'`
            );
            console.log('Stock query successful, returned rows:', stockRows.length);
        } catch (queryErr) {
            console.error('❌ STOCK QUERY FAILED:', queryErr.message);
        }

        console.log('--- End Debug ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ DEBUG ERROR:', err);
        process.exit(1);
    }
}

debug();
