const pool = require('../backend/config/db');

async function verify() {
    try {
        console.log('--- Final Data Verification (YANGLY) ---');
        
        // Check warehouse
        const [warehouses] = await pool.query("SELECT id, warehouse_name FROM inventory_warehouses WHERE id = 2");
        console.log('Target Warehouse:', warehouses[0]?.warehouse_name);
        
        // Check items in warehouse 2
        const [stock] = await pool.query(`
            SELECT COUNT(*) as count, SUM(quantity) as total 
            FROM aluminum_warehouse_stock 
            WHERE warehouse_id = 2
        `);
        console.log('Total items with stock in YANGLY:', stock[0].count);
        console.log('Total bars in YANGLY:', stock[0].total);

        // Check if catalog systems correctly include YANGLY data
        const [catalog] = await pool.query(`
            SELECT system_name FROM aluminum_warehouse_catalog_systems 
            WHERE system_name IN ('VRA-Hệ 55 Mở quay', 'HỆ LÙA 94 KOSO')
        `);
        console.log('Catalog entries confirmed:', catalog.map(c => c.system_name));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
