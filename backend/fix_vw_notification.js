const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'ViralWindow_Phan_Mem_Nhom_Kinh', 'FontEnd', 'js', 'attendance.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/VWNotification/g, 'VWModal');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced VWNotification with VWModal globally.');
} catch (err) {
    console.error(err);
}
