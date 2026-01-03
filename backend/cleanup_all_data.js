// Script to delete all customers, projects and related data
require('dotenv').config();
const db = require('./config/db');

async function cleanupDatabase() {
    try {
        console.log('🚀 Starting database cleanup...\n');

        // Disable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✅ Disabled foreign key checks');

        // Tables to clean (in order of dependencies)
        const tablesToClean = [
            // Project related
            'warehouse_export_items',
            'warehouse_exports',
            'project_materials',
            'project_cutting_details',
            'project_cutting_optimization',
            'project_accessories_summary',
            'project_aluminum_summary',
            'project_glass_summary',
            'project_gaskets_summary',
            'project_finances',
            'project_pricing',
            'project_logs',
            'project_items_v2',
            'project_items',

            // Production related
            'production_progress',
            'production_order_bom',
            'production_order_doors',
            'production_orders',

            // BOM related
            'item_bom_lines',
            'item_bom_versions',
            'bom_items',
            'door_bom_lines',
            'door_bom_summary',

            // Door related
            'door_cutting_plan',
            'door_designs',
            'door_designs_compat',
            'door_drawings',
            'door_structure_items',
            'door_aluminum_calculations',
            'door_glass_calculations',
            'cutting_details',
            'cutting_optimizations',

            // Quotation related
            'quotation_items',
            'quotations',

            // Financial
            'financial_transactions',
            'debts',

            // Customer related
            'customer_appointments',
            'customer_interactions',

            // Finally projects and customers
            'projects',
            'customers',
        ];

        let deletedCount = 0;
        for (const table of tablesToClean) {
            try {
                const [result] = await db.query(`DELETE FROM ${table}`);
                if (result.affectedRows > 0) {
                    console.log(`  ✅ Deleted ${result.affectedRows} rows from ${table}`);
                    deletedCount += result.affectedRows;
                }
            } catch (error) {
                // Table might not exist, skip it
                if (!error.message.includes("doesn't exist")) {
                    console.log(`  ⚠️ Error cleaning ${table}: ${error.message}`);
                }
            }
        }

        // Reset AUTO_INCREMENT for main tables
        const tablesWithAutoIncrement = ['customers', 'projects', 'quotations', 'production_orders'];
        for (const table of tablesWithAutoIncrement) {
            try {
                await db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
            } catch (error) {
                // Ignore errors
            }
        }
        console.log('\n✅ Reset AUTO_INCREMENT for main tables');

        // Re-enable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Re-enabled foreign key checks');

        // Verify cleanup
        console.log('\n📊 Verification:');
        const [customers] = await db.query('SELECT COUNT(*) as count FROM customers');
        const [projects] = await db.query('SELECT COUNT(*) as count FROM projects');
        const [quotations] = await db.query('SELECT COUNT(*) as count FROM quotations');

        console.log(`   - Customers: ${customers[0].count}`);
        console.log(`   - Projects: ${projects[0].count}`);
        console.log(`   - Quotations: ${quotations[0].count}`);

        console.log(`\n🎉 Cleanup complete! Deleted ${deletedCount} total rows.`);
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        // Re-enable foreign key checks
        try {
            await db.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) { }
        process.exit(1);
    }
}

cleanupDatabase();
