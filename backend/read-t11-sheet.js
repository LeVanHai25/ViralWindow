// read-t11-sheet.js - Đọc chi tiết sheet T11.2025
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Tài liệu', 'Theo dõi đơn hàng.xlsx');

try {
    const workbook = XLSX.readFile(filePath);

    // Đọc sheet T11.2025
    const ws = workbook.Sheets['T11.2025'];
    if (!ws) {
        console.log('Không tìm thấy sheet T11.2025');
        process.exit(1);
    }

    const range = XLSX.utils.decode_range(ws['!ref']);
    console.log('='.repeat(80));
    console.log('📊 SHEET: T11.2025');
    console.log('='.repeat(80));
    console.log(`Range: ${ws['!ref']}`);

    // Đọc 3 dòng đầu để xem header
    console.log('\n📝 3 DÒNG ĐẦU TIÊN (raw):');
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c <= Math.min(20, range.e.c); c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            row.push(cell ? cell.v : '');
        }
        console.log(`Dòng ${r}: `, JSON.stringify(row.filter(x => x)));
    }

    // Tìm header chính (thường ở dòng 2 hoặc 3)
    console.log('\n🔍 TÌM CÁC CỘT CHÍNH:');
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    // Tìm dòng có header
    let headerRow = -1;
    for (let i = 0; i < 10; i++) {
        const row = data[i] || [];
        const rowStr = row.join(' ').toLowerCase();
        if (rowStr.includes('đơn hàng') || rowStr.includes('mã đơn') || rowStr.includes('khối lượng')) {
            headerRow = i;
            console.log(`\n📌 HEADER Ở DÒNG ${i}:`);
            row.forEach((val, idx) => {
                if (val) console.log(`  Cột ${idx}: "${val}"`);
            });
            break;
        }
    }

    // Nếu tìm thấy header, đọc data
    if (headerRow >= 0) {
        const headers = data[headerRow];
        console.log('\n📊 5 ĐƠN HÀNG ĐẦU TIÊN:');

        for (let i = headerRow + 1; i <= Math.min(headerRow + 5, data.length - 1); i++) {
            const row = data[i];
            if (!row || !row[0]) continue;

            console.log(`\n--- Đơn ${i - headerRow} ---`);
            headers.forEach((h, idx) => {
                if (h && row[idx]) {
                    console.log(`  ${h}: ${row[idx]}`);
                }
            });
        }

        // Phân tích giá trị unique của cột "Tình trạng"
        const statusIdx = headers.findIndex(h => h && h.toString().includes('Tình trạng'));
        if (statusIdx >= 0) {
            console.log('\n🎯 GIÁ TRỊ UNIQUE CỘT "Tình trạng":');
            const statuses = {};
            data.slice(headerRow + 1).forEach(row => {
                const val = row[statusIdx];
                if (val) statuses[val] = (statuses[val] || 0) + 1;
            });
            Object.entries(statuses).forEach(([s, c]) => console.log(`  "${s}": ${c}`));
        }

        // Phân tích cột "Loại vật tư"
        const materialIdx = headers.findIndex(h => h && h.toString().includes('Loại vật tư'));
        if (materialIdx >= 0) {
            console.log('\n📦 GIÁ TRỊ UNIQUE CỘT "Loại vật tư":');
            const materials = {};
            data.slice(headerRow + 1).forEach(row => {
                const val = row[materialIdx];
                if (val) materials[val] = (materials[val] || 0) + 1;
            });
            Object.entries(materials).forEach(([m, c]) => console.log(`  "${m}": ${c}`));
        }

        // Phân tích cột "Tình trạng vật tư nguyên liệu"
        const vtIdx = headers.findIndex(h => h && h.toString().includes('nguyên liệu'));
        if (vtIdx >= 0) {
            console.log('\n🔧 GIÁ TRỊ UNIQUE "Tình trạng vật tư nguyên liệu":');
            const vtStatus = {};
            data.slice(headerRow + 1).forEach(row => {
                const val = row[vtIdx];
                if (val) vtStatus[val] = (vtStatus[val] || 0) + 1;
            });
            Object.entries(vtStatus).forEach(([s, c]) => console.log(`  "${s}": ${c}`));
        }
    }

} catch (error) {
    console.error('Lỗi:', error.message);
}
