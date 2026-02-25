// add-more-agencies.js - Thêm các đại lý từ danh sách user cung cấp
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAgencies() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viralwindow'
    });

    try {
        console.log('🚀 Thêm đại lý mới...');

        // Danh sách đại lý từ user
        const agencies = [
            { code: 'PBG', name: 'Phòng Báo Giá', region: 'Trụ sở' },
            { code: 'PKD', name: 'Phòng Kinh Doanh', region: 'Trụ sở' },
            { code: 'ND', name: 'CN Nam Định', region: 'Miền Bắc' },
            { code: 'TB', name: 'CN Thái Bình', region: 'Miền Bắc' },
            { code: 'TN', name: 'CN Thái Nguyên', region: 'Miền Bắc' },
            { code: 'LS', name: 'CN Lạng Sơn', region: 'Miền Bắc' },
            { code: 'LC', name: 'CN Lào Cai', region: 'Miền Bắc' },
            { code: 'QH', name: 'CN Quỳ Hợp', region: 'Miền Trung' },
            { code: 'TQ', name: 'CN Tuyên Quang', region: 'Miền Bắc' },
            { code: 'HNA', name: 'CN Hà Nam', region: 'Miền Bắc' },
            { code: 'NB', name: 'CN Ninh Bình', region: 'Miền Bắc' },
            { code: 'PT', name: 'CN Phú Thọ', region: 'Miền Bắc' },
            { code: 'KDHN', name: 'KD Hà Nội', region: 'Hà Nội' },
            { code: 'VP', name: 'CN Vĩnh Phúc', region: 'Miền Bắc' },
            { code: 'QN', name: 'CN Quảng Ninh', region: 'Miền Bắc' },
            { code: 'SL', name: 'CN Sơn La', region: 'Miền Bắc' },
            { code: 'BN', name: 'CN Bắc Ninh', region: 'Miền Bắc' }
        ];

        // Xóa các đại lý cũ (giữ lại dữ liệu)
        await connection.query(`DELETE FROM agencies WHERE code NOT IN ('HQ')`);
        console.log('🗑️  Đã xóa đại lý cũ');

        // Thêm từng đại lý
        for (const agency of agencies) {
            try {
                await connection.query(
                    `INSERT INTO agencies (code, name, region, status) VALUES (?, ?, ?, 'active')`,
                    [agency.code, agency.name, agency.region]
                );
                console.log(`✅ Đã thêm: ${agency.code} - ${agency.name}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  ${agency.code} đã tồn tại`);
                } else {
                    console.log(`❌ Lỗi thêm ${agency.code}: ${err.message}`);
                }
            }
        }

        // Hiển thị kết quả
        const [allAgencies] = await connection.query('SELECT id, code, name, region FROM agencies ORDER BY id');
        console.log('\n📋 Danh sách Đại lý:');
        allAgencies.forEach((a, i) => console.log(`  ${i + 1}. ${a.code}: ${a.name} (${a.region || 'N/A'})`));
        console.log(`\n✅ Tổng: ${allAgencies.length} đại lý`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

addAgencies();
