const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Modify item_name length
        console.log('Modifying quotation_items.item_name to TEXT...');
        await db.query(`ALTER TABLE quotation_items MODIFY COLUMN item_name TEXT NOT NULL;`);
        console.log('Successfully modified item_name.');

        // 2. Add accessory discount columns to quotations
        console.log('Checking for accessory discount columns in quotations...');
        const [columns] = await db.query(`SHOW COLUMNS FROM quotations LIKE 'accessory_discount_percent'`);

        if (columns.length === 0) {
            console.log('Adding accessory_discount_percent to quotations...');
            await db.query(`ALTER TABLE quotations ADD COLUMN accessory_discount_percent DECIMAL(5,2) DEFAULT 0 AFTER discount_percent;`);
            console.log('Adding accessory_discount_amount to quotations...');
            await db.query(`ALTER TABLE quotations ADD COLUMN accessory_discount_amount DECIMAL(15,2) DEFAULT 0 AFTER accessory_discount_percent;`);
            console.log('Successfully added columns.');
        } else {
            console.log('Accessory discount columns already exist.');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
