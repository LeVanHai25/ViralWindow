// update-agencies-merger.js - Cập nhật tên chi nhánh theo sáp nhập tỉnh 2025
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAgencies() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viralwindow',
        port: parseInt(process.env.DB_PORT) || 3306,
        ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined
    });

    try {
        console.log('🔄 Cập nhật chi nhánh theo sáp nhập tỉnh 2025...\n');

        // Hiện trạng trước khi sửa
        const [before] = await connection.query('SELECT id, code, name, region FROM agencies ORDER BY id');
        console.log('📋 TRƯỚC KHI CẬP NHẬT:');
        before.forEach(a => console.log(`  ${a.id}. [${a.code}] ${a.name} | ${a.region || 'N/A'}`));
        console.log();

        // Mapping: tỉnh cũ → tỉnh mới (sau sáp nhập)
        const updates = [
            // CN Hà Nam → Hà Nam sáp nhập vào Ninh Bình
            { oldName: 'CN Hà Nam', newName: 'CN Ninh Bình (Hà Nam)', newRegion: 'Ninh Bình' },
            // CN Thái Bình → sáp nhập vào Hưng Yên
            { oldName: 'CN Thái Bình', newName: 'CN Hưng Yên (Thái Bình)', newRegion: 'Hưng Yên' },
            // CN Vĩnh Phúc → sáp nhập vào Phú Thọ
            { oldName: 'CN Vĩnh Phúc', newName: 'CN Phú Thọ (Vĩnh Phúc)', newRegion: 'Phú Thọ' },
            // CN Nam Định → giữ nguyên tên nhưng cập nhật region  
            { oldName: 'CN Nam Định', newName: 'CN Nam Định', newRegion: 'Ninh Bình' },
            // Cập nhật region cho các CN giữ nguyên tên
            { oldName: 'CN Bắc Ninh', newName: 'CN Bắc Ninh', newRegion: 'Bắc Ninh' },
            { oldName: 'CN Lạng Sơn', newName: 'CN Lạng Sơn', newRegion: 'Lạng Sơn' },
            { oldName: 'CN Lào Cai', newName: 'CN Lào Cai', newRegion: 'Lào Cai' },
            { oldName: 'CN Ninh Bình', newName: 'CN Ninh Bình', newRegion: 'Ninh Bình' },
            { oldName: 'CN Phú Thọ', newName: 'CN Phú Thọ', newRegion: 'Phú Thọ' },
            { oldName: 'CN Quảng Ninh', newName: 'CN Quảng Ninh', newRegion: 'Quảng Ninh' },
            { oldName: 'CN Sơn La', newName: 'CN Sơn La', newRegion: 'Sơn La' },
            { oldName: 'CN Thái Nguyên', newName: 'CN Thái Nguyên', newRegion: 'Thái Nguyên' },
            { oldName: 'CN Tuyên Quang', newName: 'CN Tuyên Quang', newRegion: 'Tuyên Quang' },
            { oldName: 'CN Quỳ Hợp', newName: 'CN Quỳ Hợp', newRegion: 'Nghệ An' },
            { oldName: 'KD Hà Nội', newName: 'KD Hà Nội', newRegion: 'Hà Nội' },
        ];

        let updatedCount = 0;
        for (const u of updates) {
            const [result] = await connection.query(
                `UPDATE agencies SET name = ?, region = ? WHERE name = ?`,
                [u.newName, u.newRegion, u.oldName]
            );
            if (result.affectedRows > 0) {
                if (u.oldName !== u.newName) {
                    console.log(`  ✅ "${u.oldName}" → "${u.newName}" (${u.newRegion})`);
                } else {
                    console.log(`  📍 "${u.oldName}" → region: ${u.newRegion}`);
                }
                updatedCount++;
            }
        }

        console.log(`\n✅ Đã cập nhật ${updatedCount} chi nhánh\n`);

        // Hiện trạng sau khi sửa
        const [after] = await connection.query('SELECT id, code, name, region FROM agencies ORDER BY id');
        console.log('📋 SAU KHI CẬP NHẬT:');
        after.forEach(a => console.log(`  ${a.id}. [${a.code}] ${a.name} | ${a.region || 'N/A'}`));
        console.log(`\n✅ Tổng: ${after.length} chi nhánh`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

updateAgencies();
