const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(worksheet['!ref']);

// Đọc ALL cells
const data = [];
for (let r = range.s.r; r <= range.e.r; r++) {
    const row = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
        row.push(cell ? cell.v : null);
    }
    data.push(row);
}

// Debug row 3 (index 2) - Sản phẩm đầu tiên với giá
console.log('=== ROW 3 (first product) - ALL non-null values ===');
const row3 = data[2];
for (let c = 0; c < row3.length; c++) {
    if (row3[c] !== null && row3[c] !== undefined) {
        const val = typeof row3[c] === 'string' ? row3[c].substring(0, 50) : row3[c];
        console.log(`Col ${c}: ${typeof row3[c]} = ${val}`);
    }
}

// Debug row 8 (index 7) - Row có giá phụ kiện
console.log('\n=== ROW 8 (product with accessory) - ALL non-null values ===');
const row8 = data[7];
for (let c = 0; c < row8.length; c++) {
    if (row8[c] !== null && row8[c] !== undefined) {
        const val = typeof row8[c] === 'string' ? row8[c].substring(0, 50) : row8[c];
        console.log(`Col ${c}: ${typeof row8[c]} = ${val}`);
    }
}

// Check merged cells info
console.log('\n=== MERGED CELLS ===');
if (worksheet['!merges']) {
    console.log('Merged ranges:', worksheet['!merges'].length);
    worksheet['!merges'].slice(0, 10).forEach((m, i) => {
        console.log(`  ${i}: ${XLSX.utils.encode_range(m)}`);
    });
} else {
    console.log('No merged cells detected');
}
