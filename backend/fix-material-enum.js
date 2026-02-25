// Fix material status table enum mismatch
const db = require('./config/db');

async function fix() {
    try {
        console.log('Fixing order_material_status table...\n');

        // 1. Alter material_type to VARCHAR to accept any value
        console.log('1. Changing material_type to VARCHAR...');
        await db.query(`ALTER TABLE order_material_status MODIFY material_type VARCHAR(50) NOT NULL`);
        console.log('   Done!\n');

        // 2. Alter status to VARCHAR
        console.log('2. Changing status to VARCHAR...');
        await db.query(`ALTER TABLE order_material_status MODIFY status VARCHAR(50) DEFAULT 'NONE'`);
        console.log('   Done!\n');

        // 3. Update existing records to new enum values
        console.log('3. Updating existing records...');
        await db.query(`UPDATE order_material_status SET material_type = 'GLASS' WHERE material_type = 'KINH'`);
        await db.query(`UPDATE order_material_status SET material_type = 'ALUMINUM' WHERE material_type = 'NHOM'`);
        await db.query(`UPDATE order_material_status SET material_type = 'HARDWARE' WHERE material_type = 'PHUKIEN'`);
        await db.query(`UPDATE order_material_status SET material_type = 'ACCESSORY' WHERE material_type = 'VATTUPHU'`);

        // Update status values
        await db.query(`UPDATE order_material_status SET status = 'READY' WHERE status = 'OK'`);
        await db.query(`UPDATE order_material_status SET status = 'ORDERED' WHERE status = 'ARRIVED'`);
        await db.query(`UPDATE order_material_status SET status = 'DELIVERED' WHERE status = 'ISSUED'`);
        console.log('   Done!\n');

        // 4. Initialize missing material records for all projects
        console.log('4. Initializing missing material records...');
        const [projects] = await db.query(`SELECT id FROM projects`);
        const groups = ['GLASS', 'ALUMINUM', 'HARDWARE', 'ACCESSORY'];

        let inserted = 0;
        for (const p of projects) {
            for (const g of groups) {
                try {
                    await db.query(`
                        INSERT IGNORE INTO order_material_status (order_id, material_type, status, note, updated_by)
                        VALUES (?, ?, 'NONE', '', 1)
                    `, [p.id, g]);
                    inserted++;
                } catch (e) {
                    // Ignore duplicates
                }
            }
        }
        console.log(`   Inserted ${inserted} records\n`);

        // 5. Verify
        console.log('5. Verification:');
        const [[{ count }]] = await db.query(`SELECT COUNT(*) as count FROM order_material_status`);
        console.log(`   Total records: ${count}`);

        const [sample] = await db.query(`SELECT * FROM order_material_status LIMIT 5`);
        console.table(sample);

        console.log('\n✅ Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fix();
