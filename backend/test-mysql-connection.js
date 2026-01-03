/**
 * Script test kết nối MySQL
 * Chạy từ thư mục backend: node test-mysql-connection.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function testConnection() {
    console.log('========================================');
    console.log('TEST KET NOI MYSQL');
    console.log('========================================\n');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viral_window_db',
        port: parseInt(process.env.DB_PORT) || 3306,
        connectTimeout: 10000, // 10 giây
    };

    console.log('Cấu hình kết nối:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  Password: ${config.password ? '***' : '(empty)'}\n`);

    console.log('Đang thử kết nối...\n');

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Kết nối MySQL thành công!\n');

        // Test query
        const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as database');
        console.log('Thông tin MySQL:');
        console.log(`  Version: ${rows[0].version}`);
        console.log(`  Database: ${rows[0].database}\n`);

        // Test query bảng users
        try {
            const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
            console.log(`✅ Bảng users: ${users[0].count} records\n`);
        } catch (err) {
            console.log(`⚠️  Bảng users: ${err.message}\n`);
        }

        await connection.end();
        console.log('========================================');
        console.log('KET NOI THANH CONG!');
        console.log('========================================');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi kết nối MySQL:\n');
        console.error(`  Code: ${err.code}`);
        console.error(`  Message: ${err.message}\n`);

        if (err.code === 'ETIMEDOUT') {
            console.log('🔧 Gợi ý sửa lỗi ETIMEDOUT:');
            console.log('  1. Kiểm tra MySQL có đang chạy không (XAMPP Control Panel)');
            console.log('  2. Kiểm tra port 3306 có bị chặn không');
            console.log('  3. Thử tăng connectTimeout trong config');
            console.log('  4. Kiểm tra firewall Windows\n');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('🔧 Gợi ý sửa lỗi ECONNREFUSED:');
            console.log('  1. MySQL chưa khởi động - mở XAMPP và Start MySQL');
            console.log('  2. Port 3306 không đúng - kiểm tra trong XAMPP\n');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('🔧 Gợi ý sửa lỗi ER_ACCESS_DENIED_ERROR:');
            console.log('  1. Kiểm tra username/password trong file .env');
            console.log('  2. Thử đăng nhập MySQL bằng phpMyAdmin\n');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('🔧 Gợi ý sửa lỗi ER_BAD_DB_ERROR:');
            console.log('  1. Database chưa được tạo - import file database.sql');
            console.log('  2. Kiểm tra tên database trong file .env\n');
        }

        console.log('========================================');
        console.log('KET NOI THAT BAI!');
        console.log('========================================');
        process.exit(1);
    }
}

testConnection();




