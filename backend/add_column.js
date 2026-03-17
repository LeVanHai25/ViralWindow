const db = require('./config/db');
async function run() {
    try {
        console.log('Adding cleared_at column...');
        await db.query('ALTER TABLE conversation_members ADD COLUMN cleared_at TIMESTAMP NULL DEFAULT NULL');
        console.log('Successfully added cleared_at column.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column cleared_at already exists.');
        } else {
            console.error('Error adding column:', e);
        }
    } finally {
        process.exit(0);
    }
}
run();
