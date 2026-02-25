// run-glass-migration.js - Chạy migration tạo bảng glass_items
const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'viral_window_db',
    multipleStatements: true
};

async function runMigration() {
    console.log('🔧 Đang kết nối database...');
    const connection = await mysql.createConnection(config);

    try {
        // Tạo bảng glass_items
        console.log('📦 Đang tạo bảng glass_items...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS glass_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL COMMENT 'Tên loại kính',
                structure VARCHAR(50) COMMENT 'Cấu tạo (VD: 3+3, 4+4, 5+5)',
                price DECIMAL(15,2) DEFAULT 0 COMMENT 'Giá thêm/m² so với giá gốc',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Kiểm tra xem đã có dữ liệu chưa
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM glass_items');
        if (rows[0].count > 0) {
            console.log(`✅ Bảng glass_items đã tồn tại với ${rows[0].count} records`);
            return;
        }

        // Insert dữ liệu ban đầu
        console.log('📥 Đang insert dữ liệu kính...');
        const glassData = [
            [1, 'Kính dán an toàn 2 lớp 6.38mm', '3+3', 0],
            [2, 'Kính dán an toàn 2 lớp 8.38mm', '4+4', 54000],
            [3, 'Kính dán an toàn 2 lớp 10.38mm', '5+5', 101000],
            [4, 'Kính dán an toàn 2 lớp 12.38mm', '6+6', 165000],
            [5, 'Kính dán an toàn 2 lớp 13.38mm', '5+8', 191000],
            [6, 'Kính dán an toàn 2 lớp 16.38mm', '8+8', 275000],
            [7, 'Kính dán an toàn 2 lớp 20.76mm', '10+10 (Khổ < 1.5 m2)', 443000],
            [8, 'Kính dán an toàn 2 lớp 24.76mm', '12+12 (Khổ < 1.5 m2)', 537000],
            [9, 'Kính dán an toàn 2 lớp 6.38mm phim màu trắng sữa', '3+3', 9000],
            [10, 'Kính dán an toàn 2 lớp 8.38mm phim màu trắng sữa', '4+4', 62000],
            [11, 'Kính dán an toàn 2 lớp 10.38mm phim màu trắng sữa', '5+5', 110000],
            [12, 'Kính dán an toàn 2 lớp 12.38mm phim màu trắng sữa', '6+6', 174000],
            [13, 'Kính dán 6.38mm film màu grey', '3+3', 0],
            [14, 'Kính dán 8.38mm film màu grey', '4+4', 211000],
            [15, 'Kính dán 10.38mm euro grey', '5+5', 277000],
            [16, 'Kính dán 12.38mm euro grey', '6+6', 371000],
            [17, 'Kính dán 16.38mm euro grey', '8+8', 558000],
            [18, 'Kính dán 20.76mm euro grey', '10+10', 793000],
            [19, 'Kính dán 6.38mm Solar control', '3+3', 0],
            [20, 'Kính dán 8.38mm Solar control', '5+3', 336000],
            [21, 'Kính dán 10.38mm Solar control', '5+5', 402000],
            [22, 'Kính dán 12.38mm Solar control', '6+6', 485000],
            [23, 'Kính dán 16.38mm Solar control', '8+8', 716000]
        ];

        for (const glass of glassData) {
            await connection.execute(
                'INSERT INTO glass_items (id, name, structure, price) VALUES (?, ?, ?, ?)',
                glass
            );
        }

        console.log(`✅ Đã insert ${glassData.length} loại kính vào database`);

    } finally {
        await connection.end();
    }
}

runMigration()
    .then(() => console.log('🎉 Migration hoàn thành!'))
    .catch(err => console.error('❌ Lỗi:', err.message));
