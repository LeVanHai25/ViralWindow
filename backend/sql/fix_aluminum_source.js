
const fs = require('fs');
const path = 'd:\\ViralWindow_Phan_Mem_Nhom_Kinh\\backend\\controllers\\projectMaterialController.js';
let content = fs.readFileSync(path, 'utf8');

// Use regex to find the block to replace to be more robust
const targetPattern = /case 'aluminum':[\s\S]*?break;/;

const replacement = `case 'aluminum':
                // ✅ SWITCHED: Lấy từ Tổng kho nhôm (inventory) thay vì Hệ nhôm
                query = \`SELECT i.id, 
                         i.item_code as code, 
                         i.item_name as name, 
                         s.aluminum_system, 
                         i.unit, 
                         i.unit_price as price, 
                         COALESCE(i.quantity, 0) as stock,
                         COALESCE(i.quantity, 0) as quantity,
                         COALESCE(i.quantity, 0) as total_stock_cay,
                         COALESCE(i.quantity * s.length_m, 0) as total_stock_m,
                         s.length_m,
                         s.density
                         FROM inventory i
                         LEFT JOIN aluminum_systems s ON i.item_code = s.code
                         WHERE i.item_type = 'aluminum'
                         ORDER BY i.item_name\`;
                break;`;

if (targetPattern.test(content)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ Successfully updated aluminum inventory logic to Total Warehouse');
} else {
    console.log('❌ Could not find the aluminum case block in the file');
}
