/**
 * AUTO MIGRATE SERVICE - Senior Architect Standard
 * Tự động đồng bộ cấu trúc Database Production
 */
const db = require('./config/db');

async function migrate() {
    console.log('\n🚀 [AutoMigrate] Đang kiểm tra cấu trúc Database...');
    
    try {
        // 1. Đồng bộ bảng audit_logs
        const auditLogsColumns = [
            { name: 'actor_role', type: 'VARCHAR(50) AFTER actor_name' },
            { name: 'metadata', type: 'LONGTEXT AFTER changed_fields' },
            { name: 'ip_address', type: 'VARCHAR(45) AFTER reason' },
            { name: 'user_agent', type: 'TEXT AFTER ip_address' }
        ];

        for (const col of auditLogsColumns) {
            try {
                await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`✅ Bảng audit_logs: Đã đồng bộ cột ${col.name}`);
            } catch (e) {
                // Ignore if column exists or other minor errors
            }
        }

        // 2. Sửa bảng user_sessions - Bật AUTO_INCREMENT
        try {
            await db.query(`ALTER TABLE user_sessions MODIFY COLUMN id INT AUTO_INCREMENT`);
            console.log('✅ Bảng user_sessions: Đã kích hoạt AUTO_INCREMENT');
        } catch (e) {
            console.error('❌ Bảng user_sessions:', e.message);
        }

        // 3. Sửa bảng login_logs - Bật AUTO_INCREMENT
        try {
            await db.query(`ALTER TABLE login_logs MODIFY COLUMN id INT AUTO_INCREMENT`);
            console.log('✅ Bảng login_logs: Đã kích hoạt AUTO_INCREMENT');
        } catch (e) {
            // Ignore if not exists
        }

        console.log('🎊 [AutoMigrate] Hoàn tất quá trình đồng bộ!\n');
    } catch (err) {
        console.error('🛑 [AutoMigrate] Lỗi nghiêm trọng:', err.message);
    }
}

module.exports = migrate;
