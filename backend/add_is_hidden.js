const db = require('./config/db');
async function run() {
    try {
        console.log('Adding is_hidden column...');
        await db.query('ALTER TABLE conversation_members ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE');
        console.log('Successfully added is_hidden column.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column is_hidden already exists.');
        } else {
            console.error('Error adding column:', e);
        }
    } finally {
        process.exit(0);
    }
}
run();
