const db = require('./backend/config/db');
const fs = require('fs');

async function deepAudit() {
    let out = '';
    const log = (msg) => { out += msg + '\n'; };

    // Tables with data to check for orphans
    const tablesToCheck = [
        { table: 'export_slips', col: 'project_id' },
        { table: 'financial_transactions', col: 'project_id' },
        { table: 'installation_progress', col: 'project_id' },
        { table: 'material_requests', col: 'project_id' },
        { table: 'product_manufacturing', col: 'project_id' },
        { table: 'product_materials', col: 'project_id' },
        { table: 'project_activity_logs', col: 'project_id' },
        { table: 'project_material_status', col: 'project_id' },
        { table: 'project_materials', col: 'project_id' },
        { table: 'purchase_requests', col: 'project_id' },
        { table: 'quotations', col: 'project_id' },
        { table: 'stock_document_lines', col: 'project_id' },
        { table: 'stock_documents', col: 'project_id' },
    ];

    log('=== ORPHAN ROW AUDIT (rows where project no longer exists) ===\n');
    
    for (const { table, col } of tablesToCheck) {
        try {
            const [[total]] = await db.query(`SELECT COUNT(*) as cnt FROM \`${table}\` WHERE ${col} IS NOT NULL`);
            const [[orphan]] = await db.query(`
                SELECT COUNT(*) as cnt FROM \`${table}\`
                WHERE ${col} IS NOT NULL AND ${col} NOT IN (SELECT id FROM projects)
            `);
            const status = orphan.cnt > 0 ? '❌ HAS ORPHANS' : '✅ OK';
            log(`${status}  ${table}: total=${total.cnt}, orphan=${orphan.cnt}`);
        } catch(e) {
            log(`ERROR  ${table}: ${e.message}`);
        }
    }

    // Check order_material_status (uses order_id)
    try {
        const [[total]] = await db.query(`SELECT COUNT(*) as cnt FROM order_material_status`);
        const [[orphan]] = await db.query(`
            SELECT COUNT(*) as cnt FROM order_material_status
            WHERE order_id NOT IN (SELECT id FROM projects)
        `);
        const status = orphan.cnt > 0 ? '❌ HAS ORPHANS' : '✅ OK';
        log(`${status}  order_material_status (order_id): total=${total.cnt}, orphan=${orphan.cnt}`);
    } catch(e) { log(`ERROR  order_material_status: ${e.message}`); }

    // Show which tables are MISSING from delete function
    log('\n=== TABLES MISSING FROM DELETE FUNCTION ===');
    const deletedByFunction = [
        'door_bom_lines','door_bom_summary','door_structure_items','door_aluminum_calculations',
        'door_glass_calculations','cutting_details','cutting_optimizations','door_cutting_plan',
        'bom_items','item_bom_lines','item_bom_versions','door_drawings','door_designs',
        'quotation_items','quotations','production_order_bom','production_order_doors',
        'production_order_items','production_progress','production_orders',
        'project_items','project_items_v2','project_materials','stock_document_lines',
        'stock_documents','warehouse_export_items','warehouse_exports',
        'project_cutting_details','project_cutting_optimization',
        'project_aluminum_summary','project_glass_summary','project_gaskets_summary',
        'project_accessories_summary','project_finances','project_pricing',
        'debts','commissions','financial_transactions','inventory_out','inventory_transactions',
        'project_logs','projects_material_summary','design_files',
        'purchase_request_items','material_request_items','export_slip_items',
        'purchase_requests','material_requests','export_slips',
        'project_activity_logs','product_completion','product_manufacturing',
        'installation_progress','project_material_status','product_materials',
        'handover_info','design_purchase_requests','design_inventory_reservations',
        'aluminum_scraps','design_revisions','decals','door_drawings','customer_interactions',
        'order_material_status' // CHECK THIS
    ];

    const allTablesWithProjId = [
        'aluminum_scraps','debts','design_inventory_reservations','design_purchase_requests',
        'design_revisions','door_designs','door_drawings','export_slips','financial_transactions',
        'handover_info','installation_progress','inventory_out','inventory_transactions',
        'material_requests','product_completion','product_manufacturing','product_materials',
        'production_orders','project_accessories_summary','project_activity_logs',
        'project_aluminum_summary','project_cutting_optimization','project_finances',
        'project_gaskets_summary','project_glass_summary','project_items','project_items_v2',
        'project_logs','project_material_status','project_materials','project_pricing',
        'projects_material_summary','purchase_requests','quotations','stock_document_lines',
        'stock_documents'
    ];

    const missing = allTablesWithProjId.filter(t => !deletedByFunction.includes(t));
    if (missing.length === 0) {
        log('  All tables appear to be covered!');
    } else {
        missing.forEach(t => log(`  ❌ MISSING: ${t}`));
    }

    // Also check if order_material_status is cleared
    log('\n⚠️  order_material_status uses order_id (= project.id) - NOT project_id.');
    log('   Check if it is deleted in the delete function...');

    fs.writeFileSync('audit_tables.txt', out);
    process.exit(0);
}
deepAudit();
