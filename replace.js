const fs = require('fs');
const file = 'd:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/controllers/projectController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ 26\.5\. Xóa triệt để các bảng phụ trách khác.*?\} catch \(e\) \{\s*console\.log\('  - Error cleaning up extra tables', e\);\s*\}/s;

const newBlock = `// 26.5. Xóa triệt để các bảng phụ trách khác để chống dọn rác (zombie data)
        try { await connection.query("DELETE FROM purchase_request_items WHERE request_id IN (SELECT id FROM purchase_requests WHERE project_id = ?)", [id]); } catch(e) {}
        try { await connection.query("DELETE FROM material_request_items WHERE request_id IN (SELECT id FROM material_requests WHERE project_id = ?)", [id]); } catch(e) {}
        try { await connection.query("DELETE FROM export_slip_items WHERE slip_id IN (SELECT id FROM export_slips WHERE project_id = ?)", [id]); } catch(e) {}
        
        try {
            const extraTables = [
                'purchase_requests', 'material_requests', 'export_slips', 
                'project_activity_logs', 'product_completion', 'product_manufacturing', 
                'installation_progress', 'project_material_status', 'product_materials', 
                'handover_info', 'design_purchase_requests', 'design_inventory_reservations', 
                'aluminum_scraps', 'design_revisions', 'production_orders', 'production_order_doors', 'production_progress', 'decals', 'door_drawings', 'cutting_optimizations', 'customer_interactions'
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

        // 26.7. Xóa order_material_status (bảng này sử dụng order_id chứ không phải project_id)
        try {
            await connection.query("DELETE FROM order_material_status WHERE order_id = ?", [id]);
            console.log('  ✓ Deleted order_material_status tracking (Theo dõi dự án)');
        } catch(e) {
            console.log('  - Error cleaning order_material_status', e.message);
        }`;

if (regex.test(content)) {
    content = content.replace(regex, newBlock);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully replaced block!');
} else {
    console.log('Block not found using regex.');
}
