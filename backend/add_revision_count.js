/**
 * Migration script: Thêm cột revision_count vào bảng quotations
 * Chạy: node add_revision_count.js
 */

const db = require('./config/db');

async function addRevisionCount() {
    try {
        console.log('🔧 Kiểm tra và thêm cột revision_count vào bảng quotations...\n');

        // Kiểm tra cột đã tồn tại chưa
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'quotations' 
            AND COLUMN_NAME = 'revision_count'
        `);

        if (columns.length > 0) {
            console.log('✅ Cột revision_count đã tồn tại!');
        } else {
            // Thêm cột mới
            await db.query(`
                ALTER TABLE quotations 
                ADD COLUMN revision_count INT DEFAULT 0
            `);
            console.log('✅ Đã thêm cột revision_count (mặc định = 0)');
        }

        // Kiểm tra lại
        const [quotations] = await db.query(`
            SELECT id, quotation_code, revision_count 
            FROM quotations 
            ORDER BY id DESC 
            LIMIT 5
        `);

        console.log('\n📋 5 báo giá gần nhất:');
        quotations.forEach(q => {
            console.log(`   - [${q.quotation_code}] revision_count = ${q.revision_count || 0}`);
        });

        console.log('\n✅ Hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

addRevisionCount();
