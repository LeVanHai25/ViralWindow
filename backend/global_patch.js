const fs = require('fs');
let content = fs.readFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/controllers/projectController.js', 'utf8');

const startStr = '// 27.';
const startIdx = content.indexOf(startStr);

if (startIdx !== -1) {
    const patch = `// 26.5. Xóa triệt để các bảng phụ trách khác để chống dọn rác (zombie data)
        try {
            await connection.query("DELETE FROM purchase_request_items WHERE request_id IN (SELECT id FROM purchase_requests WHERE project_id = ?)", [id]);
            await connection.query("DELETE FROM material_request_items WHERE request_id IN (SELECT id FROM material_requests WHERE project_id = ?)", [id]);
            await connection.query("DELETE FROM export_slip_items WHERE slip_id IN (SELECT id FROM export_slips WHERE project_id = ?)", [id]);
            
            const extraTables = [
                'purchase_requests', 'material_requests', 'export_slips', 
                'project_activity_logs', 'product_completion', 'product_manufacturing', 
                'installation_progress', 'project_material_status', 'product_materials', 
                'handover_info', 'design_purchase_requests', 'design_inventory_reservations', 
                'aluminum_scraps', 'design_revisions'
            ];
            for (const t of extraTables) {
                try {
                    await connection.query(\`DELETE FROM \${t} WHERE project_id = ?\`, [id]);
                } catch(err) {}
            }
            console.log('  ✓ Deleted all extra system tracking tables (zombie prevention)');
        } catch (e) {
            console.log('  - Error cleaning up extra tables', e);
        }

        `;
        
    // Prevent double patch
    if (!content.includes('// 26.5. Xóa triệt để các bảng phụ trách khác')) {
        content = content.substring(0, startIdx) + patch + content.substring(startIdx);
        fs.writeFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/controllers/projectController.js', content, 'utf8');
        console.log('Patch successfully applied before step 27.');
    } else {
        console.log('Patch already exists!');
    }
} else {
    console.log('Step 27 marker not found in file!');
}
