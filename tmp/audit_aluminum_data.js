const db = require('../backend/config/db');

async function audit() {
    try {
        console.log('--- Aluminum Systems Audit ---');
        
        // Find duplicate codes
        const [duplicates] = await db.query(`
            SELECT code, COUNT(*) as count 
            FROM aluminum_systems 
            WHERE is_active = 1 
            GROUP BY code 
            HAVING count > 1
        `);

        if (duplicates.length === 0) {
            console.log('✅ No duplicate codes found in aluminum_systems.');
        } else {
            console.warn('⚠️ Found duplicate codes:', duplicates);
            for (const dup of duplicates) {
                const [rows] = await db.query("SELECT id, code, name FROM aluminum_systems WHERE code = ? AND is_active = 1", [dup.code]);
                console.log(`- Code: ${dup.code}`, rows);
            }
        }

        // Check stock aggregation
        const [stockCheck] = await db.query(`
            SELECT asy.code, asy.name, SUM(aws.quantity) as calc_total, asy.quantity as legacy_qty
            FROM aluminum_systems asy
            JOIN aluminum_warehouse_stock aws ON asy.id = aws.aluminum_system_id
            GROUP BY asy.id
            LIMIT 5
        `);
        console.log('Stock Sample (Calc vs Legacy):', stockCheck);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
