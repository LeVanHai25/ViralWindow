const db = require('./backend/config/db');

async function fixFinal() {
    const connection = await db.getConnection();
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const [r1] = await connection.query(`
            DELETE FROM purchase_requests
            WHERE project_id IS NOT NULL
              AND project_id NOT IN (SELECT id FROM projects)
        `);
        console.log(`✅ purchase_requests: đã xóa ${r1.affectedRows} orphan rows`);

        const [r2] = await connection.query(`
            DELETE FROM material_requests
            WHERE project_id IS NOT NULL
              AND project_id NOT IN (SELECT id FROM projects)
        `);
        console.log(`✅ material_requests: đã xóa ${r2.affectedRows} orphan rows`);

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    } finally {
        connection.release();
    }
}
fixFinal();
