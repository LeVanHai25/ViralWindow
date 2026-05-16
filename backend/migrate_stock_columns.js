const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateStockTable() {
    console.log('🚀 Bắt đầu quá trình Migration: Cập nhật bảng stock_document_lines...');

    // 1. Cấu hình các môi trường cần cập nhật
    const environments = [
        {
            name: 'LOCAL (MySQL)',
            config: {
                host: process.env.DB_HOST || '127.0.0.1',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'viral_window_db',
                port: parseInt(process.env.DB_PORT) || 3306
            }
        },
        {
            name: 'CLOUD (TiDB AliCloud)',
            config: {
                host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
                user: '3LmszoG1PiqurSq.root',
                password: 'Lym4NIfWcVyhJt2V',
                database: 'viral_window_db',
                port: 4000,
                ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
            }
        }
    ];

    for (const env of environments) {
        console.log(`\n--- Đang xử lý môi trường: ${env.name} ---`);
        let conn;
        try {
            conn = await mysql.createConnection(env.config);
            console.log(`✅ Kết nối thành công tới ${env.name}`);

            // Thêm cột balance_before
            try {
                await conn.query('ALTER TABLE stock_document_lines ADD COLUMN balance_before DECIMAL(15,4) DEFAULT NULL AFTER note');
                console.log('✅ Đã thêm cột balance_before');
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME') console.log('ℹ️ Cột balance_before đã tồn tại.');
                else throw e;
            }

            // Thêm cột balance_after
            try {
                await conn.query('ALTER TABLE stock_document_lines ADD COLUMN balance_after DECIMAL(15,4) DEFAULT NULL AFTER balance_before');
                console.log('✅ Đã thêm cột balance_after');
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME') console.log('ℹ️ Cột balance_after đã tồn tại.');
                else throw e;
            }

            console.log(`✨ Hoàn tất cập nhật ${env.name}`);

        } catch (err) {
            console.error(`❌ Lỗi tại ${env.name}:`, err.message);
        } finally {
            if (conn) await conn.end();
        }
    }
    
    console.log('\n🏁 Quá trình Migration kết thúc.');
}

migrateStockTable();
