const db = require('./config/db');

async function hunt() {
    try {
        const [tables] = await db.query("SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME = 'project_id' AND TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT LIKE '%view%'");
        let totalZombies = 0;
        console.log(`Checking ${tables.length} tables...`);
        for (const row of tables) {
            const table = row.TABLE_NAME;
            try {
                const [res] = await db.query(`SELECT COUNT(*) as count FROM ${table} WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects)`);
                if (res[0].count > 0) {
                    console.log(`Zombie alert! Table ${table} has ${res[0].count} orphaned records.`);
                    totalZombies += res[0].count;
                }
            } catch (err) {
                // ignore errors like table doesn't exist
            }
        }
        console.log(`Hunt complete. Total zombies found: ${totalZombies}`);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

hunt();
