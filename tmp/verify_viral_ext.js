const pool = require('../backend/config/db');

async function verify() {
    try {
        console.log('--- Final Data Verification (VIRAL Extended) ---');
        
        // Check warehouse
        const [warehouses] = await pool.query("SELECT id, warehouse_name FROM inventory_warehouses WHERE id = 1");
        console.log('Target Warehouse:', warehouses[0]?.warehouse_name);
        
        // Check total KOSO/VIRAL items
        const [counts] = await pool.query(`
            SELECT brand, COUNT(*) as count 
            FROM aluminum_systems 
            GROUP BY brand
        `);
        console.log('Item counts by brand:', counts);
        
        // Check specific updated item
        const [item] = await pool.query("SELECT * FROM aluminum_systems WHERE code = 'AL5506'");
        console.log('Sample item (AL5506):', item[0]);

        // Check stock for AL5506 in Warehouse 1
        const [stock] = await pool.query("SELECT quantity FROM aluminum_warehouse_stock WHERE aluminum_system_id = ? AND warehouse_id = 1", [item[0].id]);
        console.log('Stock for AL5506 in VIRAL Warehouse:', stock[0]?.quantity);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
