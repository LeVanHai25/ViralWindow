/**
 * Script chạy migration thêm cột handover vào bảng projects
 * Chạy: node run_migration.js
 */
const db = require('./config/db');

async function runMigration() {
    console.log('=== RUNNING HANDOVER COLUMNS MIGRATION ===\n');

    const alterQueries = [
        {
            name: 'handover_date',
            sql: `ALTER TABLE projects ADD COLUMN handover_date DATE NULL`
        },
        {
            name: 'handover_status',
            sql: `ALTER TABLE projects ADD COLUMN handover_status VARCHAR(32) DEFAULT 'pending'`
        },
        {
            name: 'handover_notes',
            sql: `ALTER TABLE projects ADD COLUMN handover_notes TEXT NULL`
        },
        {
            name: 'progress_percent',
            sql: `ALTER TABLE projects ADD COLUMN progress_percent INT DEFAULT 0`
        }
    ];

    for (const query of alterQueries) {
        try {
            await db.query(query.sql);
            console.log(`✅ Added column: ${query.name}`);
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log(`⏭️  Column ${query.name} already exists, skipping...`);
            } else {
                console.error(`❌ Error adding ${query.name}:`, error.message);
            }
        }
    }

    console.log('\n=== MIGRATION COMPLETED ===');
    process.exit(0);
}

runMigration();
