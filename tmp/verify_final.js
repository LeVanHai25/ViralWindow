const pool = require('../backend/config/db');

async function verify() {
    try {
        console.log('--- Final Data Verification ---');
        
        // Check systems
        const [catalog] = await pool.query("SELECT * FROM aluminum_warehouse_catalog_systems WHERE system_name LIKE '%KOSO%'");
        console.log('KOSO Catalog entries:', catalog.length);
        
        // Check items
        const [items] = await pool.query("SELECT COUNT(*) as count FROM aluminum_systems WHERE brand = 'KOSO'");
        console.log('KOSO Aluminum items:', items[0].count);
        
        // Check stock
        const [stock] = await pool.query("SELECT SUM(aws.quantity) as total FROM aluminum_warehouse_stock aws JOIN aluminum_systems asy ON aws.aluminum_system_id = asy.id WHERE asy.brand = 'KOSO' AND aws.warehouse_id = 1");
        console.log('Total KOSO stock in Warehouse 1 (bars):', stock[0].total);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
