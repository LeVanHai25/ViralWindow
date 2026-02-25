// read-excel-detailed.js - Đọc chi tiết file Theo dõi đơn hàng.xlsx
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Tài liệu', 'Theo dõi đơn hàng.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    console.log('='.repeat(80));
    console.log('📊 PHÂN TÍCH FILE: Theo dõi đơn hàng.xlsx');
    console.log('='.repeat(80));

    // Danh sách sheets
    console.log('\n📑 DANH SÁCH SHEETS:');
    workbook.SheetNames.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });

    // Phân tích sheet đầu tiên chi tiết
    const firstSheet = workbook.SheetNames[0];
    const ws = workbook.Sheets[firstSheet];

    console.log(`\n📋 PHÂN TÍCH SHEET: "${firstSheet}"`);
    console.log('-'.repeat(60));

    // Lấy range
    const range = XLSX.utils.decode_range(ws['!ref']);
    console.log(`Range: ${ws['!ref']}`);
    console.log(`Số dòng: ${range.e.r - range.s.r + 1}`);
    console.log(`Số cột: ${range.e.c - range.s.c + 1}`);

    // Đọc header (dòng 1)
    console.log('\n📝 CÁC CỘT (Header):');
    const headers = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
        const value = cell ? cell.v : '';
        headers.push(value);
        if (value) console.log(`  Cột ${c + 1}: "${value}"`);
    }

    // Đọc 5 dòng dữ liệu đầu tiên
    console.log('\n📊 5 DÒNG DỮ LIỆU ĐẦU TIÊN:');
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
        console.log(`\n  --- Dòng ${i} ---`);
        data[i].forEach((val, idx) => {
            if (val && headers[idx]) {
                console.log(`  ${headers[idx]}: ${val}`);
            }
        });
    }

    // Phân tích các giá trị unique trong cột "Tình trạng"
    console.log('\n🔍 PHÂN TÍCH TRẠNG THÁI (Tình trạng):');
    const statusIdx = headers.findIndex(h => h && h.toString().includes('Tình trạng'));
    if (statusIdx >= 0) {
        const statuses = {};
        data.slice(1).forEach(row => {
            const status = row[statusIdx];
            if (status) {
                statuses[status] = (statuses[status] || 0) + 1;
            }
        });
        Object.entries(statuses).forEach(([status, count]) => {
            console.log(`  "${status}": ${count} đơn`);
        });
    }

    // Phân tích cột "Loại vật tư" nếu có
    console.log('\n📦 PHÂN TÍCH LOẠI VẬT TƯ:');
    const materialIdx = headers.findIndex(h => h && h.toString().includes('Loại vật tư'));
    if (materialIdx >= 0) {
        const materials = {};
        data.slice(1).forEach(row => {
            const material = row[materialIdx];
            if (material) {
                materials[material] = (materials[material] || 0) + 1;
            }
        });
        Object.entries(materials).forEach(([m, count]) => {
            console.log(`  "${m}": ${count} dòng`);
        });
    }

    // Phân tích tất cả các sheets
    console.log('\n\n📊 TÓM TẮT TẤT CẢ SHEETS:');
    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`  ${sheetName}: ${sheetData.length - 1} dòng dữ liệu`);
    });

} catch (error) {
    console.error('Lỗi:', error.message);
}
