
const fs = require('fs');
const path = 'd:\\ViralWindow_Phan_Mem_Nhom_Kinh\\backend\\controllers\\projectMaterialController.js';
let content = fs.readFileSync(path, 'utf8');

// Target the aluminum price loading block in getExportedMaterials
const targetPattern = /const \[aluminum\] = await db\.query\(`SELECT code, name, unit_price, quantity FROM aluminum_systems`\);/;
const replacement = `const [aluminum] = await db.query("SELECT item_code as code, item_name as name, unit_price, quantity FROM inventory WHERE item_type = 'aluminum'");`;

if (targetPattern.test(content)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('✅ Successfully updated aluminum price source in getExportedMaterials');
} else {
    console.log('❌ Could not find the aluminum price query in getExportedMaterials');
}
