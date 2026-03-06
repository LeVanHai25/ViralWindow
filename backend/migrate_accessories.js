const db = require('./config/db');

async function migrate() {
    try {
        console.log('--- Migrating product_catalog table ---');

        // Add accessories_json if not exists
        const [columns] = await db.query('SHOW COLUMNS FROM product_catalog');
        const hasAccessoriesJson = columns.some(c => c.Field === 'accessories_json');

        if (!hasAccessoriesJson) {
            console.log('Adding accessories_json column...');
            await db.query('ALTER TABLE product_catalog ADD COLUMN accessories_json LONGTEXT');
            console.log('Column added successfully.');
        } else {
            console.log('accessories_json column already exists.');
        }

        // Initialize accessories_json for existing products if they have accessory/accessory_price
        const [products] = await db.query('SELECT id, accessory, accessory_price, accessories_json FROM product_catalog');

        for (const product of products) {
            if (!product.accessories_json && product.accessory) {
                const initialAccessory = [{
                    name: product.accessory,
                    price: parseFloat(product.accessory_price) || 0
                }];
                await db.query('UPDATE product_catalog SET accessories_json = ? WHERE id = ?', [JSON.stringify(initialAccessory), product.id]);
                console.log(`Initialized accessories_json for product ID: ${product.id}`);
            }
        }

        // Also check quotation_items for accessory_name or similar if we need to store it there
        // The implementation plan says we will store the selection in the quotation.
        // Let's check quotation_items schema for accessory_name column.
        const [qiColumns] = await db.query('SHOW COLUMNS FROM quotation_items');
        const hasAccessoryName = qiColumns.some(c => c.Field === 'accessory_name');
        if (!hasAccessoryName) {
            console.log('Adding accessory_name column to quotation_items...');
            await db.query('ALTER TABLE quotation_items ADD COLUMN accessory_name VARCHAR(255)');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
