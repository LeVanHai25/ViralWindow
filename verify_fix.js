const db = require('./backend/config/db');
const fs = require('fs');
async function verify() {
    let out = '';
    const log = (msg) => { out += msg + '\n'; };
    try {
        // Simulate getExportStatusForProjects logic for project 17
        const projectIds = [17];
        const MATERIAL_GROUPS = ['GLASS', 'ALUMINUM', 'HARDWARE', 'ACCESSORY'];
        const map = {};
        projectIds.forEach(pid => {
            map[pid] = {};
            MATERIAL_GROUPS.forEach(g => { map[pid][g] = { exported: 0, required: 0, itemCount: 0, exportedItems: 0 }; });
        });

        // 1. BOM required (with 'other' fix)
        const [bomRows] = await db.query(`
            SELECT project_id, material_type, COUNT(*) as item_count, SUM(COALESCE(quantity, 0)) as total_qty
            FROM project_materials
            WHERE project_id IN (?) AND material_type IN ('aluminum', 'glass', 'accessory', 'phukien', 'other')
            GROUP BY project_id, material_type
        `, [projectIds]);

        const typeToGroup = { aluminum: 'ALUMINUM', glass: 'GLASS', phukien: 'HARDWARE', accessory: 'ACCESSORY', other: 'ACCESSORY' };
        bomRows.forEach(row => {
            const g = typeToGroup[row.material_type];
            if (g && map[row.project_id]) {
                map[row.project_id][g].required += parseFloat(row.total_qty) || 0;
                map[row.project_id][g].itemCount += parseInt(row.item_count) || 0;
            }
        });

        // 2. Exported quantities (with 'other' fix)
        const [exportRows] = await db.query(`
            SELECT COALESCE(l.project_id, d.project_id) as project_id, l.item_type,
                   SUM(l.qty) as total_exported, COUNT(DISTINCT l.item_code) as exported_items
            FROM stock_document_lines l
            JOIN stock_documents d ON l.document_id = d.id
            WHERE d.doc_type = 'export' AND d.status = 'posted'
              AND COALESCE(l.project_id, d.project_id) IN (?)
            GROUP BY COALESCE(l.project_id, d.project_id), l.item_type
        `, [projectIds]);

        const itemTypeToGroup = {
            'aluminum': 'ALUMINUM', 'profile': 'ALUMINUM', 'frame': 'ALUMINUM',
            'glass': 'GLASS',
            'accessory': 'HARDWARE', 'hardware': 'HARDWARE',
            'consumable': 'ACCESSORY', 'gasket': 'ACCESSORY', 'glue': 'ACCESSORY', 'sealant': 'ACCESSORY',
            'other': 'ACCESSORY'
        };

        exportRows.forEach(row => {
            const g = itemTypeToGroup[(row.item_type || '').toLowerCase()];
            if (g && map[17]) {
                map[17][g].exported += parseFloat(row.total_exported) || 0;
                map[17][g].exportedItems = (map[17][g].exportedItems || 0) + (parseInt(row.exported_items) || 0);
            }
        });

        log('=== Export Status Results for Project 17 ===');
        for (const g of MATERIAL_GROUPS) {
            const d = map[17][g];
            const status = d.required <= 0 && d.exported <= 0 ? 'NONE' :
                          d.exported >= d.required && d.required > 0 ? 'FULL' :
                          d.exported > 0 ? 'PARTIAL' : 'NONE';
            log(`  ${g}: required=${d.required}, exported=${d.exported}, items=${d.itemCount}/${d.exportedItems}, status=${status}`);
        }

        fs.writeFileSync('verify_output.txt', out);
        process.exit(0);
    } catch(e) {
        fs.writeFileSync('verify_output.txt', out + '\nERROR: ' + e.message + '\n' + e.stack);
        process.exit(1);
    }
}
verify();
