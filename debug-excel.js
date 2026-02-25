const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Đọc file Excel
const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

let output = `Total rows: ${data.length}\n\n`;

// In chi tiết từng row để xem format
output += '=== DETAILED ROWS 1-50 ===\n';
for (let i = 0; i < Math.min(50, data.length); i++) {
    const row = data[i];
    output += `\nRow ${i + 1}:\n`;
    if (row) {
        for (let j = 0; j < Math.min(8, row.length); j++) {
            const val = row[j];
            if (val !== null && val !== undefined) {
                const display = typeof val === 'string' ? val.substring(0, 100).replace(/\r\n/g, '\\n') : val;
                output += `  Col ${String.fromCharCode(65 + j)}: ${display}\n`;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'excel-debug.txt'), output);
console.log('Đã xuất ra excel-debug.txt');
