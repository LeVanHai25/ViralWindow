const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Đọc file Excel
const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Đọc với range đầy đủ - force all columns
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log('Sheet range:', worksheet['!ref']);
console.log('From:', range.s, 'To:', range.e);

// Đọc trực tiếp từng cell
const data = [];
for (let r = range.s.r; r <= range.e.r; r++) {
    const row = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        row.push(cell ? cell.v : null);
    }
    data.push(row);
}

console.log('Total rows:', data.length);
console.log('Total cols per row:', data[0] ? data[0].length : 0);

// Xem header row (row 2 = index 1)
console.log('\n=== HEADER ROW (row 2) - first 60 cols ===');
const headerRow = data[1];
for (let c = 0; c < Math.min(60, headerRow.length); c++) {
    if (headerRow[c]) {
        const val = String(headerRow[c]).substring(0, 30).replace(/\r?\n/g, '|');
        console.log(`Col ${c}: ${val}`);
    }
}

// Xem data row 3 (Vách kính cố định đầu tiên)
console.log('\n=== DATA ROW 3 - prices ===');
const dataRow = data[2];
for (let c = 0; c < Math.min(60, dataRow.length); c++) {
    if (dataRow[c] && typeof dataRow[c] === 'number') {
        console.log(`Col ${c}: ${dataRow[c]}`);
    }
}
