const db = require('../backend/config/db');

async function verifySync() {
    const connection = await db.getConnection();
    try {
        console.log('--- Verifying Catalog-Inventory Sync ---');

        // 1. Find a test system or create one
        const [systems] = await connection.query('SELECT * FROM aluminum_warehouse_catalog_systems LIMIT 1');
        if (systems.length === 0) {
            console.log('No catalog systems found to test.');
            process.exit(0);
        }

        const testId = systems[0].id;
        const oldName = systems[0].system_name;
        const newName = `Test Sync ${Date.now()}`;

        console.log(`Testing rename: "${oldName}" -> "${newName}" for ID ${testId}`);

        // 2. Mock related data if none exists
        const [relatedBefore] = await connection.query(
            'SELECT COUNT(*) as count FROM aluminum_systems WHERE aluminum_system = ?',
            [oldName]
        );
        console.log(`Inventory items with old name: ${relatedBefore[0].count}`);

        // 3. Update via SQL (simulating the controller logic)
        await connection.beginTransaction();
        
        // Update catalog
        await connection.query(
            'UPDATE aluminum_warehouse_catalog_systems SET system_name = ? WHERE id = ?',
            [newName, testId]
        );

        // Update inventory (Cascading)
        await connection.query(
            'UPDATE aluminum_systems SET aluminum_system = ? WHERE aluminum_system = ?',
            [newName, oldName]
        );

        await connection.commit();
        console.log('✅ Transactions committed.');

        // 4. Verify results
        const [catalogAfter] = await connection.query(
            'SELECT system_name FROM aluminum_warehouse_catalog_systems WHERE id = ?',
            [testId]
        );
        const [inventoryAfter] = await connection.query(
            'SELECT COUNT(*) as count FROM aluminum_systems WHERE aluminum_system = ?',
            [newName]
        );

        console.log(`Catalog Name After: "${catalogAfter[0].system_name}"`);
        console.log(`Inventory items with new name: ${inventoryAfter[0].count}`);

        if (catalogAfter[0].system_name === newName && inventoryAfter[0].count >= relatedBefore[0].count) {
            console.log('✅ SYNC VERIFIED SUCCESSFUL!');
        } else {
            console.log('❌ SYNC VERIFICATION FAILED!');
        }

        // 5. Cleanup (Restore old name)
        await connection.query(
            'UPDATE aluminum_warehouse_catalog_systems SET system_name = ? WHERE id = ?',
            [oldName, testId]
        );
        await connection.query(
            'UPDATE aluminum_systems SET aluminum_system = ? WHERE aluminum_system = ?',
            [oldName, newName]
        );
        console.log('Cleanup: Restored original names.');

        console.log('--- Verification Finished ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ VERIFICATION ERROR:', err);
        if (connection) await connection.rollback();
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

verifySync();
