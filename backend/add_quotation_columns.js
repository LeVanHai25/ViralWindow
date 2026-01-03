// Add missing columns to quotation_items table
const db = require('./config/db');

async function addColumns() {
    try {
        console.log('=== Adding missing columns to quotation_items ===\n');

        // Check and add 'color' column
        console.log('1. Checking/adding color column...');
        try {
            await db.query('SELECT color FROM quotation_items LIMIT 1');
            console.log('   ✓ color column exists');
        } catch (e) {
            await db.query('ALTER TABLE quotation_items ADD COLUMN color VARCHAR(100) AFTER accessories');
            console.log('   ✓ Added color column');
        }

        // Check and add 'aluminum_system' column
        console.log('2. Checking/adding aluminum_system column...');
        try {
            await db.query('SELECT aluminum_system FROM quotation_items LIMIT 1');
            console.log('   ✓ aluminum_system column exists');
        } catch (e) {
            await db.query('ALTER TABLE quotation_items ADD COLUMN aluminum_system VARCHAR(100) AFTER color');
            console.log('   ✓ Added aluminum_system column');
        }

        // Check and add 'location' column
        console.log('3. Checking/adding location column...');
        try {
            await db.query('SELECT location FROM quotation_items LIMIT 1');
            console.log('   ✓ location column exists');
        } catch (e) {
            await db.query('ALTER TABLE quotation_items ADD COLUMN location VARCHAR(255) AFTER aluminum_system');
            console.log('   ✓ Added location column');
        }

        // Verify
        console.log('\n=== Verifying quotation_items structure ===');
        const [cols] = await db.query('DESCRIBE quotation_items');
        cols.forEach(c => console.log(`   ${c.Field}: ${c.Type}`));

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

addColumns();
