// Debug script to check material status data
const db = require('./config/db');

async function debug() {
    try {
        console.log('=== Checking order_material_status table ===\n');

        // Check if table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'order_material_status'");
        console.log('Table exists:', tables.length > 0);

        if (tables.length === 0) {
            console.log('\n❌ Table order_material_status does not exist!');
            console.log('Run: node run-production-excel-migration.js');
            process.exit(1);
        }

        // Check table structure
        console.log('\n=== Table structure ===');
        const [columns] = await db.query("DESCRIBE order_material_status");
        columns.forEach(c => console.log(`  ${c.Field}: ${c.Type}`));

        // Count records
        const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM order_material_status");
        console.log('\n=== Total records:', count);

        // Sample data
        console.log('\n=== Sample records ===');
        const [samples] = await db.query("SELECT * FROM order_material_status LIMIT 10");
        console.table(samples);

        // Check for specific order
        console.log('\n=== Projects with status ===');
        const [projects] = await db.query(`
            SELECT p.id, p.project_code, 
                   (SELECT COUNT(*) FROM order_material_status oms WHERE oms.order_id = p.id) as mat_count
            FROM projects p
            LIMIT 10
        `);
        console.table(projects);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debug();
