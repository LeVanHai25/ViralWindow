// Script to delete door_templates data
require('dotenv').config();
const db = require('./config/db');

async function deleteDoorTemplates() {
    try {
        // Disable foreign key checks temporarily
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        // Delete all door_templates
        const [result] = await db.query('DELETE FROM door_templates');
        console.log('✅ Deleted', result.affectedRows, 'door templates');

        // Reset AUTO_INCREMENT
        await db.query('ALTER TABLE door_templates AUTO_INCREMENT = 1');
        console.log('✅ Reset AUTO_INCREMENT');

        // Re-enable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // Verify
        const [count] = await db.query('SELECT COUNT(*) as count FROM door_templates');
        console.log('📊 Remaining door templates:', count[0].count);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteDoorTemplates();
