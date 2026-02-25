// read-excel.js - Script đọc file Excel để phân tích cấu trúc
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'Tài liệu', 'Theo dõi đơn hàng.xlsx');
console.log('📁 Đang đọc file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);

    console.log('\n📊 DANH SÁCH SHEET:');
    console.log(workbook.SheetNames);

    // Đọc từng sheet
    workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`\n========== SHEET ${index + 1}: ${sheetName} ==========`);
        const sheet = workbook.Sheets[sheetName];

        // Lấy range của sheet
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        console.log(`Range: ${sheet['!ref']} (${range.e.r + 1} dòng × ${range.e.c + 1} cột)`);

        // Đọc 10 dòng đầu để xem cấu trúc
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        console.log('\n📋 10 DÒNG ĐẦU:');
        data.slice(0, 10).forEach((row, idx) => {
            // Chỉ hiện 10 cột đầu để dễ đọc
            const shortRow = row.slice(0, 15).map(cell => {
                if (cell === null || cell === undefined) return '';
                const str = String(cell);
                return str.length > 25 ? str.substring(0, 22) + '...' : str;
            });
            console.log(`${idx + 1}: ${JSON.stringify(shortRow)}`);
        });

        // Xác định headers (dòng đầu tiên có dữ liệu)
        console.log('\n📌 HEADERS:');
        const headers = data[0] || [];
        headers.forEach((h, i) => {
            if (h) console.log(`  Col ${i + 1}: ${h}`);
        });
    });

} catch (error) {
    console.error('❌ Lỗi:', error.message);
}
