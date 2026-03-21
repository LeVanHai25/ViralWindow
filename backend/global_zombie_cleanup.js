const db = require('./config/db');

async function cleanup() {
    const connection = await db.getConnection();
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Starting global zombie data cleanup...');
        
        let totalDeleted = 0;

        // Purchase Request Items
        try {
            const [pri] = await connection.query(`
                DELETE FROM purchase_request_items 
                WHERE request_id IN (
                    SELECT id FROM purchase_requests 
                    WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects)
                )
            `);
            console.log(`Deleted ${pri.affectedRows} orphaned purchase_request_items`);
        } catch(e) {}

        // 2. Dynamically clean all tables with project_id
        const [tables] = await connection.query("SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME = 'project_id' AND TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT LIKE '%view%'");
        
        for (const row of tables) {
            const table = row.TABLE_NAME;
            try {
                const [res] = await connection.query(`
                    DELETE FROM ${table} 
                    WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects)
                `);
                if (res.affectedRows > 0) {
                    console.log(`Deleted ${res.affectedRows} zombies from ${table}`);
                    totalDeleted += res.affectedRows;
                }
            } catch (err) {
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log(`\nGlobal Cleanup Complete! Total parent zombies deleted: ${totalDeleted}`);
        process.exit(0);

    } catch (e) {
        console.error('Error during cleanup:', e);
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch(err) {}
        process.exit(1);
    } finally {
        connection.release();
    }
}

cleanup();
