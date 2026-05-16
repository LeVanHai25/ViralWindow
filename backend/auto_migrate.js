/**
 * AUTO MIGRATE SERVICE - Senior Architect Standard
 * Tự động đồng bộ cấu trúc Database Production
 */
const db = require('./config/db');

async function migrate() {
    console.log('\n🚀 [AutoMigrate] Đang kiểm tra cấu trúc Database...');
    
    try {
        // 1. Sửa bảng audit_logs - Thêm cột actor_role
        try {
            await db.query(`
                ALTER TABLE audit_logs 
                ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50) AFTER actor_name
            `);
            console.log('✅ Bảng audit_logs: Đã đồng bộ cột actor_role');
        } catch (e) {
            if (!e.message.includes('Duplicate column')) {
                console.error('❌ Bảng audit_logs:', e.message);
            }
        }

        // 2. Sửa bảng user_sessions - Bật AUTO_INCREMENT
        try {
            await db.query(`ALTER TABLE user_sessions MODIFY COLUMN id INT AUTO_INCREMENT`);
            console.log('✅ Bảng user_sessions: Đã kích hoạt AUTO_INCREMENT');
        } catch (e) {
            console.error('❌ Bảng user_sessions:', e.message);
        }

        // 3. Sửa bảng login_logs (Nếu có) - Bật AUTO_INCREMENT
        try {
            await db.query(`ALTER TABLE login_logs MODIFY COLUMN id INT AUTO_INCREMENT`);
            console.log('✅ Bảng login_logs: Đã kích hoạt AUTO_INCREMENT');
        } catch (e) {
            // Bảng này có thể không tồn tại hoặc tên khác, không sao
        }

        console.log('🎊 [AutoMigrate] Hoàn tất quá trình đồng bộ!\n');
    } catch (err) {
        console.error('🛑 [AutoMigrate] Lỗi nghiêm trọng:', err.message);
    }
}

module.exports = migrate;
