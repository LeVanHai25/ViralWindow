/**
 * MIGRATE: aluminum_systems → inventory (item_type = 'aluminum')
 * Chuyển toàn bộ vật tư nhôm vào bảng Tổng Kho
 */
const db = require('../config/db');

async function migrate() {
    console.log('🚀 Bắt đầu migrate dữ liệu nhôm từ aluminum_systems → inventory...\n');

    // Kiểm tra trước
    const [existing] = await db.query("SELECT COUNT(*) as total FROM inventory WHERE item_type = 'aluminum'");
    console.log(`📋 Hiện tại inventory có: ${existing[0].total} vật tư nhôm`);

    // Lấy toàn bộ dữ liệu từ aluminum_systems
    const [alums] = await db.query(`
        SELECT id, code, name, unit_price, quantity, density, length_m, 
               aluminum_system, color, description, quantity_m
        FROM aluminum_systems 
        WHERE is_active = 1
        ORDER BY code ASC
    `);
    console.log(`📦 Tìm thấy ${alums.length} vật tư nhôm trong aluminum_systems\n`);

    if (alums.length === 0) {
        console.log('❌ Không có dữ liệu để migrate!');
        process.exit(0);
    }

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of alums) {
        try {
            // Kiểm tra đã tồn tại chưa (theo item_code)
            const [exists] = await db.query(
                "SELECT id FROM inventory WHERE item_code = ? AND item_type = 'aluminum'",
                [item.code]
            );

            if (exists.length > 0) {
                // Cập nhật nếu đã tồn tại
                await db.query(`
                    UPDATE inventory SET
                        item_name = ?,
                        quantity = ?,
                        unit = 'cây',
                        unit_price = ?,
                        notes = ?,
                        updated_at = NOW()
                    WHERE item_code = ? AND item_type = 'aluminum'
                `, [
                    item.name || '',
                    parseFloat(item.quantity || item.quantity_m || 0),
                    parseFloat(item.unit_price || 0),
                    item.aluminum_system || null,
                    item.code
                ]);
                skipped++;
            } else {
                // Thêm mới vào inventory
                await db.query(`
                    INSERT INTO inventory 
                    (item_type, item_code, item_name, quantity, unit, unit_price, 
                     min_stock_level, max_stock_level, notes)
                    VALUES ('aluminum', ?, ?, ?, 'cây', ?, 5, 200, ?)
                `, [
                    item.code,
                    item.name || '',
                    parseFloat(item.quantity || item.quantity_m || 0),
                    parseFloat(item.unit_price || 0),
                    item.aluminum_system || null  // Lưu tên hệ nhôm vào notes
                ]);
                inserted++;
            }

            if ((inserted + skipped + errors) % 50 === 0) {
                console.log(`  ⏳ Đã xử lý ${inserted + skipped + errors}/${alums.length}...`);
            }
        } catch (err) {
            console.error(`  ❌ Lỗi với ${item.code} (${item.name}): ${err.message}`);
            errors++;
        }
    }

    // Kiểm tra kết quả
    const [final] = await db.query("SELECT COUNT(*) as total FROM inventory WHERE item_type = 'aluminum'");
    
    console.log('\n====================================');
    console.log('✅ MIGRATE HOÀN TẤT!');
    console.log('====================================');
    console.log(`  ✨ Thêm mới : ${inserted} vật tư`);
    console.log(`  🔄 Cập nhật: ${skipped} vật tư`);
    console.log(`  ❌ Lỗi     : ${errors} vật tư`);
    console.log(`  📦 Tổng kho nhôm hiện tại: ${final[0].total} vật tư`);
    console.log('====================================');

    process.exit(0);
}

migrate().catch(err => {
    console.error('FATAL ERROR:', err);
    process.exit(1);
});
