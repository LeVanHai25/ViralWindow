/**
 * Migration: Thêm cột deposit_paid và deposit_amount vào bảng quotations
 * Chạy: node add_deposit_paid.js
 */

const db = require('./config/db');

async function addDepositPaid() {
    try {
        console.log('🔧 Kiểm tra và thêm các cột deposit vào bảng quotations...\n');

        // Kiểm tra cột deposit_paid
        const [cols1] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'quotations' 
            AND COLUMN_NAME = 'deposit_paid'
        `);

        if (cols1.length > 0) {
            console.log('✅ Cột deposit_paid đã tồn tại!');
        } else {
            await db.query(`
                ALTER TABLE quotations 
                ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE
            `);
            console.log('✅ Đã thêm cột deposit_paid');
        }

        // Kiểm tra cột deposit_amount
        const [cols2] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'quotations' 
            AND COLUMN_NAME = 'deposit_amount'
        `);

        if (cols2.length > 0) {
            console.log('✅ Cột deposit_amount đã tồn tại!');
        } else {
            await db.query(`
                ALTER TABLE quotations 
                ADD COLUMN deposit_amount DECIMAL(15,2) DEFAULT 0
            `);
            console.log('✅ Đã thêm cột deposit_amount');
        }

        // Kiểm tra lại
        const [quotations] = await db.query(`
            SELECT id, quotation_code, status, deposit_paid, deposit_amount, total_amount 
            FROM quotations 
            WHERE status = 'approved'
            ORDER BY id DESC 
            LIMIT 5
        `);

        console.log('\n📋 5 báo giá đã chốt gần nhất:');
        if (quotations.length === 0) {
            console.log('   (Chưa có báo giá nào đã chốt)');
        } else {
            quotations.forEach(q => {
                console.log(`   - [${q.quotation_code}] deposit_paid=${q.deposit_paid || false}, deposit_amount=${q.deposit_amount || 0}`);
            });
        }

        console.log('\n✅ Hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

addDepositPaid();
