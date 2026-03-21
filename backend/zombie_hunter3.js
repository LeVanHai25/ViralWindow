const fs = require('fs');
const db = require('./config/db');

async function hunt() {
    try {
        const [tables] = await db.query("SELECT TABLE_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME = 'project_id' AND TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT LIKE '%view%'");
        const results = [];
        let totalZombies = 0;
        for (const row of tables) {
            try {
                const [res] = await db.query(`SELECT COUNT(*) as count FROM ${row.TABLE_NAME} WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM projects)`);
                if (res[0].count > 0) {
                    results.push({table: row.TABLE_NAME, count: res[0].count});
                    totalZombies += res[0].count;
                }
            } catch (err) {}
        }
        fs.writeFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/zombies_out.json', JSON.stringify({results, totalZombies}, null, 2), 'utf8');
        console.log('Done hunting zombies');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

hunt();
