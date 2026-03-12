const pool = require('../backend/config/db');

async function verify() {
    try {
        console.log('--- Final Global Verification (VIRAL & YANGLY) ---');
        
        // 1. Warehouse 1 (VIRAL) 
        const [stock1] = await pool.query("SELECT COUNT(*) as count, SUM(quantity) as total FROM aluminum_warehouse_stock WHERE warehouse_id = 1");
        console.log('Warehouse 1 (VIRAL):', stock1[0].count, 'items,', stock1[0].total, 'bars');

        // 2. Warehouse 2 (YANGLY)
        const [stock2] = await pool.query("SELECT COUNT(*) as count, SUM(quantity) as total FROM aluminum_warehouse_stock WHERE warehouse_id = 2");
        console.log('Warehouse 2 (YANGLY):', stock2[0].count, 'items,', stock2[0].total, 'bars');

        // 3. Confirm 118 items are present in Warehouse 2
        if (stock2[0].count >= 118) {
            console.log('✅ Warehouse 2 import confirmed (at least 118 items).');
        } else {
            console.warn('⚠️ Warehouse 2 item count mismatch.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
