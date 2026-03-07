const db = require('./config/db');

async function migrate() {
    try {
        console.log('🚀 Starting Phase 9 Database Fixes...');

        // 1. Fix notifications.type column (was ENUM, causing truncation)
        console.log('   - Altering notifications table...');
        await db.query(`
            ALTER TABLE notifications 
            MODIFY COLUMN type VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT 'info'
        `);
        console.log('   ✅ notifications.type is now VARCHAR(50).');

        // 2. Clear corrupted activity logs (optional, but good for clean start)
        // console.log('   - Cleaning up activity logs...');
        // await db.query('DELETE FROM activity_logs WHERE action_description IS NULL');

        console.log('✨ All database fixes applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
