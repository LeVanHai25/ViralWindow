const db = require('./backend/config/db');
const fs = require('fs');
async function check() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; };
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT l.item_type, l.item_code, l.item_name, l.qty
            FROM stock_document_lines l
            JOIN stock_documents d ON l.document_id = d.id
            WHERE d.doc_type = 'export' AND d.status = 'posted'
              AND COALESCE(l.project_id, d.project_id) = 17
            ORDER BY l.item_type
        `);
        log('=== Export lines for project 17 ===');
        rows.forEach(r => log(`  type: ${r.item_type}, code: ${r.item_code}, name: ${r.item_name}, qty: ${r.qty}`));

        const [pmRows] = await db.query(`
            SELECT material_type, COUNT(*) as cnt
            FROM project_materials
            WHERE project_id = 17
            GROUP BY material_type
        `);
        log('\n=== project_materials groups for project 17 ===');
        pmRows.forEach(r => log(`  type: ${r.material_type}, count: ${r.cnt}`));

        const [statusRows] = await db.query(`
            SELECT material_type, status, source_type, actual_date
            FROM order_material_status
            WHERE order_id = 17
        `);
        log('\n=== order_material_status for project 17 ===');
        statusRows.forEach(r => log(`  type: ${r.material_type}, status: ${r.status}, source: ${r.source_type}, date: ${r.actual_date}`));

        // Check BOM required quantities per material_type
        const [bomReq] = await db.query(`
            SELECT material_type, SUM(quantity) as total_qty, COUNT(*) as item_count
            FROM project_materials
            WHERE project_id = 17
            GROUP BY material_type
        `);
        log('\n=== BOM required quantities for project 17 ===');
        bomReq.forEach(r => log(`  type: ${r.material_type}, total_qty: ${r.total_qty}, items: ${r.item_count}`));

        fs.writeFileSync('diag_output.txt', output);
        process.exit(0);
    } catch(e) {
        fs.writeFileSync('diag_output.txt', output + '\nERROR: ' + e.message);
        process.exit(1);
    }
}
check();
