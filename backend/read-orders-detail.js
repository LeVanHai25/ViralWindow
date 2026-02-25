// read-orders-detail.js - Đọc chi tiết các đơn hàng
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Tài liệu', 'Theo dõi đơn hàng.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const ws = workbook.Sheets['T11.2025'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    console.log('='.repeat(80));
    console.log('📊 PHÂN TÍCH CẤU TRÚC ĐƠN HÀNG');
    console.log('='.repeat(80));

    // Header ở dòng 2 (index 2)
    const headers = data[2];
    console.log('\n📝 CÁC CỘT CHÍNH:');
    headers.forEach((h, i) => {
        if (h) console.log(`  ${i}: "${h}"`);
    });

    // Đọc row 0 và 1 để xem summary
    console.log('\n📈 DÒNG TỔNG HỢP (Row 0-1):');
    console.log('Row 0:', data[0].filter(x => x).slice(0, 10));
    console.log('Row 1:', data[1].filter(x => x).slice(0, 10));

    // Đọc 20 dòng dữ liệu để xem pattern
    console.log('\n📋 CẤU TRÚC DỮ LIỆU (20 DÒNG ĐẦU):');
    console.log('-'.repeat(80));

    let currentOrder = null;
    for (let i = 3; i <= Math.min(22, data.length - 1); i++) {
        const row = data[i];
        const madon = row[1]; // Cột B - Mã đơn
        const donhang = row[2]; // Cột C - Đơn hàng
        const khoiluong = row[3]; // Cột D - Khối lượng
        const donvix = row[4]; // Cột E - Đơn Vị SX
        const ngaytao = row[5]; // Cột F - Ngày tạo
        const kehoach = row[6]; // Cột G - Kế hoạch giao
        const loaiVT = row[7]; // Cột H - Loại vật tư
        const trangthaiVT = row[8]; // Cột I - Tình trạng VT
        const lichgiaoVT = row[9]; // Cột J - Lịch giao VT
        const fixInox = row[10]; // Cột K - Fix inox
        const ghichu = row[11]; // Cột L - Ghi chú

        // Check if new order or sub-row
        if (madon) {
            currentOrder = madon;
            console.log(`\n🏷️ ĐƠN: ${madon} - ${donhang}`);
            console.log(`   Khối lượng: ${khoiluong}, ĐV: ${donvix}, Ngày tạo: ${ngaytao}, KH giao: ${kehoach}`);
        }

        if (loaiVT) {
            console.log(`   📦 ${loaiVT}: ${trangthaiVT || '-'} | Giao: ${lichgiaoVT || '-'}`);
        }
        if (fixInox) {
            console.log(`   🔧 Fix: ${fixInox}`);
        }
        if (ghichu) {
            console.log(`   📝 Ghi chú: ${ghichu}`);
        }
    }

    // Tìm các trạng thái điều hành (Row 0-1)
    console.log('\n\n🎯 4 TRẠNG THÁI ĐIỀU HÀNH:');
    const row0 = data[0];
    const row1 = data[1];

    // Dòng 0 thường có: 0, 1 | "Đang sản xuất...", 2 | "Đã giao hàng", 3 | "Vướng mắc gấp", 4 | "Thay đổi thiết kế"
    row0.forEach((val, i) => {
        if (val && typeof val === 'string' && (val.includes('giao') || val.includes('xuất') || val.includes('vướng') || val.includes('thay đổi'))) {
            console.log(`  Cột ${i}: "${val}" -> Giá trị: ${row1[i] || 0}`);
        }
    });

} catch (error) {
    console.error('Lỗi:', error.message);
}
