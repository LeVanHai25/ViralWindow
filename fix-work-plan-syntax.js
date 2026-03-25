const fs = require('fs');
const filepath = 'd:/ViralWindow_Phan_Mem_Nhom_Kinh/FontEnd/js/work-plan.js';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(filepath, content);
console.log('Successfully fixed syntax errors in ' + filepath);
