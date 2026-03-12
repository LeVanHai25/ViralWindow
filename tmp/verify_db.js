const pool = require('../backend/config/db');

async function verifyTables() {
    try {
        console.log('--- Verifying Database Schema ---');
        
        const [warehousesTable] = await pool.query("SHOW TABLES LIKE 'inventory_warehouses'");
        if (warehousesTable.length > 0) {
            console.log('✅ Found inventory_warehouses table.');
            const [warehouses] = await pool.query("SELECT * FROM inventory_warehouses");
            console.log(`📊 Number of warehouses found: ${warehouses.length}`);
            warehouses.forEach(w => console.log(`   - [${w.warehouse_code}] ${w.warehouse_name}`));
        } else {
            console.log('❌ inventory_warehouses table NOT found.');
        }

        const [stockTable] = await pool.query("SHOW TABLES LIKE 'aluminum_warehouse_stock'");
        if (stockTable.length > 0) {
            console.log('✅ Found aluminum_warehouse_stock table.');
        } else {
            console.log('❌ aluminum_warehouse_stock table NOT found.');
        }

        console.log('--- End Verification ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during verification:', err.message);
        process.exit(1);
    }
}

verifyTables();
