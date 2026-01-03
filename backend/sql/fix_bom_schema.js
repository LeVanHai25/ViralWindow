// =====================================================
// Migration script: Add missing columns to bom_items
// =====================================================

const db = require('../config/db');

const MISSING_COLUMNS = [
    { name: 'area_m2', type: 'DECIMAL(10,4) NULL', after: 'accessory_id' },
    { name: 'project_item_id', type: 'INT NULL', after: 'design_id', index: true },
];

async function runMigration() {
    try {
        console.log('🚀 Starting migration: Fix bom_items schema');

        // Check existing columns
        const [existingCols] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'bom_items'
        `);

        const existingColNames = existingCols.map(row => row.COLUMN_NAME);
        console.log('   Existing columns:', existingColNames.join(', '));

        for (const col of MISSING_COLUMNS) {
            if (existingColNames.includes(col.name)) {
                console.log(`✅ Column ${col.name} already exists`);
                continue;
            }

            console.log(`📝 Adding column ${col.name}...`);

            try {
                await db.query(`
                    ALTER TABLE bom_items 
                    ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}
                `);
                console.log(`✅ Added column ${col.name}`);

                if (col.index) {
                    try {
                        await db.query(`
                            ALTER TABLE bom_items 
                            ADD INDEX idx_${col.name} (${col.name})
                        `);
                        console.log(`✅ Added index idx_${col.name}`);
                    } catch (e) {
                        console.log(`⚠️ Index may already exist: ${e.message}`);
                    }
                }
            } catch (e) {
                console.error(`❌ Error adding column ${col.name}: ${e.message}`);
            }
        }

        // Also fix door_designs if needed
        console.log('\n📝 Checking door_designs table...');

        const [designCols] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'door_designs'
        `);

        const designColNames = designCols.map(row => row.COLUMN_NAME);

        if (!designColNames.includes('project_item_id')) {
            console.log('📝 Adding project_item_id to door_designs...');
            try {
                await db.query(`
                    ALTER TABLE door_designs 
                    ADD COLUMN project_item_id INT NULL
                `);
                await db.query(`
                    ALTER TABLE door_designs 
                    ADD INDEX idx_project_item_id (project_item_id)
                `);
                console.log('✅ Added project_item_id to door_designs');
            } catch (e) {
                console.log(`⚠️ May already exist: ${e.message}`);
            }
        } else {
            console.log('✅ project_item_id already exists in door_designs');
        }

        console.log('\n✅ Migration completed successfully!');
        return { success: true };

    } catch (err) {
        console.error('❌ Migration failed:', err);
        return { success: false, message: err.message };
    }
}

// Run if called directly
if (require.main === module) {
    runMigration().then(result => {
        console.log('Result:', result);
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = runMigration;
