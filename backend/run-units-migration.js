// run-units-migration.js - Chạy migration thêm bảng units
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viralwindow',
        multipleStatements: true
    });

    try {
        console.log('🚀 Bắt đầu migration...');

        // Check if units table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'units'");
        if (tables.length > 0) {
            console.log('⚠️ Bảng units đã tồn tại, bỏ qua tạo bảng');
        } else {
            // Create units table
            await connection.query(`
                CREATE TABLE units (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(20) UNIQUE,
                    address VARCHAR(255),
                    phone VARCHAR(20),
                    manager_name VARCHAR(100),
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Đã tạo bảng units');

            // Insert default units
            await connection.query(`
                INSERT INTO units (name, code, address, status) VALUES
                ('Chi nhánh Hà Nội', 'HN', 'Hà Nội', 'active'),
                ('Chi nhánh Nam Định', 'ND', 'Nam Định', 'active'),
                ('Chi nhánh Hà Nam', 'HNA', 'Hà Nam', 'active'),
                ('Viralwindow - Trụ sở chính', 'VW', 'Trụ sở chính', 'active')
            `);
            console.log('✅ Đã thêm 4 chi nhánh mẫu');
        }

        // Check if unit_id column exists in customers
        const [columns] = await connection.query("SHOW COLUMNS FROM customers LIKE 'unit_id'");
        if (columns.length > 0) {
            console.log('⚠️ Cột unit_id đã tồn tại trong bảng customers');
        } else {
            // Add unit_id column
            await connection.query(`
                ALTER TABLE customers 
                ADD COLUMN unit_id INT DEFAULT NULL
            `);
            console.log('✅ Đã thêm cột unit_id vào bảng customers');

            // Update existing customers to default unit
            const [units] = await connection.query("SELECT id FROM units WHERE code = 'VW' LIMIT 1");
            if (units.length > 0) {
                await connection.query(`UPDATE customers SET unit_id = ? WHERE unit_id IS NULL`, [units[0].id]);
                console.log('✅ Đã cập nhật khách hàng hiện tại vào chi nhánh mặc định');
            }
        }

        // Show result
        const [allUnits] = await connection.query('SELECT * FROM units');
        console.log('\n📋 Danh sách đơn vị:');
        allUnits.forEach(u => console.log(`  - ${u.code}: ${u.name}`));

        console.log('\n✅ Migration hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

runMigration();
