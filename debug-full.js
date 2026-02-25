const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Đọc file Excel
const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

let output = '';

// Xem tất cả các cột của header row (row 2)
output += '=== ALL COLUMNS IN HEADER ROW (Row 2) ===\n';
const headerRow = data[1];
if (headerRow) {
    for (let j = 0; j < headerRow.length; j++) {
        const val = headerRow[j];
        if (val !== null && val !== undefined) {
            const display = typeof val === 'string' ? val.substring(0, 40).replace(/\r\n/g, '|') : val;
            output += `Col ${j}: ${display}\n`;
        }
    }
}

// Xem row 8-10 với tất cả cột có giá trị
output += '\n=== FULL DATA ROW 8-10 (Products with accessory prices) ===\n';
for (let i = 7; i < 10; i++) {
    const row = data[i];
    output += `\nRow ${i + 1}:\n`;
    if (row) {
        for (let j = 0; j < row.length; j++) {
            const val = row[j];
            if (val !== null && val !== undefined) {
                let display;
                if (typeof val === 'string') {
                    display = val.substring(0, 80).replace(/\r\n/g, '|');
                } else {
                    display = val;
                }
                output += `  Col ${j}: ${display}\n`;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'excel-full-debug.txt'), output);
console.log('Đã xuất ra excel-full-debug.txt');
