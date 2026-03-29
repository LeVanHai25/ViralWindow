const db = require('./config/db');

async function createTable() {
    try {
        console.log('Đang tạo bảng user_shifts...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_shifts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                shift_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_user_shift (user_id),
                KEY idx_shift (shift_id)
            )
        `);
        console.log('Tạo bảng user_shifts thành công!');
        process.exit(0);
    } catch (e) {
        console.error('Lỗi tạo bảng:', e);
        process.exit(1);
    }
}

createTable();
