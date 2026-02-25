const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Đọc file Excel
const workbook = XLSX.readFile(path.join(__dirname, 'Tài liệu', 'Sản phẩm.xlsx'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(worksheet['!ref']);

// Đọc tất cả cells
const data = [];
for (let r = range.s.r; r <= range.e.r; r++) {
    const row = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
        row.push(cell ? cell.v : null);
    }
    data.push(row);
}

console.log('Rows:', data.length, 'Cols:', range.e.c + 1);

// SIZE_COLUMNS - dựa vào data, giá bắt đầu từ Col 6 (index 6)
// Và có khoảng 28 giá (Col 6-33) tương ứng 28 size columns đầu tiên
const SIZE_COLUMNS = [
    '0-0.25', '0.25-0.5', '0.5-0.75', '0.75-1', '1-1.25', '1.25-1.5', '1.5-1.75', '1.75-2',
    '2-2.25', '2.25-2.5', '2.5-2.75', '2.75-3', '3-3.25', '3.25-3.5', '3.5-3.75', '3.75-4',
    '4-4.25', '4.25-4.5', '4.5-4.75', '4.75-5', '5-5.25', '5.25-5.5', '5.5-5.75', '5.75-6',
    '6-6.25', '6.25-6.5', '6.5-6.75', '6.75-7', '7-7.25', '7.25-7.5', '7.5-7.75', '7.75-8',
    '8-8.25', '8.25-8.5', '8.5-8.75', '8.75-9', '9-9.25', '9.25-9.5', '9.5-9.75', '9.75-10',
    '10-10.25', '10.25-10.5', '10.5-10.75', '10.75-11', '11-11.25', '11.25-11.5', '11.5-12',
    '12-12.5', '12.5-13', '13-14', '14-15'
];

// GIẢM GIÁ bắt đầu từ Col 6 (index 6)
const PRICE_COL_START = 6;

const products = [];
let currentGroupCode = 'VRA';
let currentGroupName = 'Vách kính cố định';
let vraCounter = 1;
let vreCounter = 1;

for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const colA = String(row[0]).trim();

    // MÃ NHÓM
    if (colA === 'VRA' || colA === 'VRE' || colA === 'CHOP') {
        currentGroupCode = colA;
        console.log(`>>> Group: ${currentGroupCode}`);
        continue;
    }

    // TÊN LOẠI (highlighted rows như "Cửa sổ mở trượt 64")
    if ((colA.startsWith('Cửa') || colA.startsWith('Vách') || colA.startsWith('CHỚP'))
        && !colA.includes(' - ') && colA.length < 50 && !colA.includes('dùng nhôm')) {
        currentGroupName = colA;
        continue;
    }

    if (colA === 'CHỚP NHÔM CỐ ĐỊNH') {
        currentGroupCode = 'CHOP';
        currentGroupName = 'Chớp nhôm cố định';
        continue;
    }

    // SẢN PHẨM - có tên dài hoặc chứa "dùng nhôm"
    const isProduct = colA.includes('dùng nhôm') || colA.includes('VRA') || colA.includes('VRE') || colA.includes('VR100');

    if (isProduct) {
        // Phụ kiện: Col 4 = Viralwindow price
        const accessoryPrice = row[4] && typeof row[4] === 'number' ? row[4] : null;

        // Giá kích thước: bắt đầu từ Col 6
        const prices = {};
        let priceCount = 0;
        for (let c = PRICE_COL_START; c < row.length; c++) {
            const sizeIndex = c - PRICE_COL_START;
            if (sizeIndex < SIZE_COLUMNS.length && row[c] && typeof row[c] === 'number' && row[c] > 100000) {
                prices[SIZE_COLUMNS[sizeIndex]] = row[c];
                priceCount++;
            }
        }

        // Mã sản phẩm
        let code;
        if (currentGroupCode === 'VRA') {
            code = `VRA_VR${String(vraCounter++).padStart(3, '0')}`;
        } else if (currentGroupCode === 'VRE') {
            code = `VRE_VR${String(vreCounter++).padStart(3, '0')}`;
        } else {
            code = `CHOP_VR${String(vraCounter++).padStart(3, '0')}`;
        }

        products.push({
            id: products.length + 1,
            code,
            groupCode: currentGroupCode,
            groupName: currentGroupName,
            name: colA.replace(/\r?\n/g, '\n'),
            accessory: accessoryPrice ? 'Viralwindow' : null,
            accessoryPrice,
            prices
        });

        if (products.length <= 5) {
            console.log(`[${code}] ${priceCount} prices, acc=${accessoryPrice || 'N/A'}`);
        }
    }
}

console.log('\n=== SUMMARY ===');
console.log('Total:', products.length);
console.log('VRA:', products.filter(p => p.groupCode === 'VRA').length);
console.log('VRE:', products.filter(p => p.groupCode === 'VRE').length);
console.log('With prices:', products.filter(p => Object.keys(p.prices).length > 0).length);
console.log('With accessory:', products.filter(p => p.accessoryPrice).length);

// Sample với giá
const sampleWithPrices = products.find(p => Object.keys(p.prices).length > 0);
if (sampleWithPrices) {
    console.log('\n--- Sample with prices ---');
    console.log(`${sampleWithPrices.code}: ${sampleWithPrices.groupName}`);
    console.log(`Prices (${Object.keys(sampleWithPrices.prices).length}):`,
        Object.entries(sampleWithPrices.prices).slice(0, 5).map(([k, v]) => `${k}=${v}`).join(', '));
}

// Export
const js = `// products-data.js - Từ Sản phẩm.xlsx
// Generated: ${new Date().toISOString()}
// Total: ${products.length} (VRA:${products.filter(p => p.groupCode === 'VRA').length}, VRE:${products.filter(p => p.groupCode === 'VRE').length})
// With prices: ${products.filter(p => Object.keys(p.prices).length > 0).length}, With accessory: ${products.filter(p => p.accessoryPrice).length}

const PRODUCTS_DATA = ${JSON.stringify(products, null, 2)};
const ACCESSORIES_LIST = ['Hopo', 'Viralwindow', 'Cmech'];

if (typeof module !== 'undefined') module.exports = { PRODUCTS_DATA, ACCESSORIES_LIST };
`;

fs.writeFileSync(path.join(__dirname, 'FontEnd', 'js', 'products-data.js'), js);
console.log('\n✅ Saved FontEnd/js/products-data.js');
