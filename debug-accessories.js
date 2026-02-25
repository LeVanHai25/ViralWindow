const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Đọc file Excel
const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

let output = `Total rows: ${data.length}\n\n`;

// In chi tiết từng row để xem format - tập trung vào các cột phụ kiện
output += '=== COLUMN STRUCTURE (Row 2-3) ===\n';
for (let i = 0; i < Math.min(3, data.length); i++) {
    const row = data[i];
    output += `\nRow ${i + 1}:\n`;
    if (row) {
        for (let j = 0; j < row.length; j++) {
            const val = row[j];
            if (val !== null && val !== undefined) {
                const display = typeof val === 'string' ? val.substring(0, 60).replace(/\r\n/g, '\\n') : val;
                output += `  Col ${j} (${String.fromCharCode(65 + (j < 26 ? j : 25))}): ${display}\n`;
            }
        }
    }
}

// Xem thêm row 4-10 với tất cả các cột
output += '\n=== SAMPLE DATA WITH ACCESSORIES (Row 4-12) ===\n';
for (let i = 3; i < Math.min(12, data.length); i++) {
    const row = data[i];
    output += `\nRow ${i + 1}:\n`;
    if (row) {
        // Col A: Tên sản phẩm
        if (row[0]) output += `  A (Tên SP): ${String(row[0]).substring(0, 60).replace(/\r\n/g, '\\n')}...\n`;
        // Col B: Loại
        if (row[1]) output += `  B (Loại): ${row[1]}\n`;
        // Col C onwards - check for accessory data
        for (let j = 2; j < Math.min(10, row.length); j++) {
            if (row[j] !== null && row[j] !== undefined) {
                output += `  Col ${j}: ${row[j]}\n`;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'excel-accessories-debug.txt'), output);
console.log('Đã xuất ra excel-accessories-debug.txt');
