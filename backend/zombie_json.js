const db = require('./config/db');

async function hunt() {
    try {
        const [tables] = await db.query("SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME = 'project_id' AND TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT LIKE '%view%'");
        let totalZombies = 0;
        let results = [];
        for (const row of tables) {
            const table = row.TABLE_NAME;
            try {
                const [res] = await db.query(`SELECT COUNT(*) as count FROM ${table} WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects)`);
                if (res[0].count > 0) {
                    results.push({table, count: res[0].count});
                    totalZombies += res[0].count;
                }
            } catch (err) {}
        }
        console.log(JSON.stringify({results, totalZombies}));
        process.exit(0);
    } catch(e) {
        process.exit(1);
    }
}

hunt();
