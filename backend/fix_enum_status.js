// Script sửa cột ENUM status và update project
const db = require('./config/db');

async function fixEnumAndUpdate() {
    try {
        console.log('\n=== SỬA ENUM STATUS VÀ UPDATE PROJECT ===\n');

        // 1. Kiểm tra cấu trúc hiện tại
        console.log('1. Kiểm tra cấu trúc cột status hiện tại...');
        const [columns] = await db.query(
            "SHOW COLUMNS FROM projects LIKE 'status'"
        );
        console.log('   Type hiện tại:', columns[0]?.Type);

        // 2. ALTER cột để thêm các giá trị mới
        console.log('\n2. Đang ALTER cột status để thêm installation, handover, designing...');
        await db.query(`
            ALTER TABLE projects 
            MODIFY COLUMN status ENUM(
                'new',
                'quotation_pending',
                'designing',
                'bom_extraction',
                'in_production',
                'installation',
                'handover',
                'completed',
                'paused',
                'cancelled'
            ) DEFAULT 'new'
        `);
        console.log('   ✅ Đã ALTER cột thành công!');

        // 3. Kiểm tra lại cấu trúc
        const [columnsAfter] = await db.query(
            "SHOW COLUMNS FROM projects LIKE 'status'"
        );
        console.log('   Type sau khi ALTER:', columnsAfter[0]?.Type);

        // 4. Update project id=1
        console.log('\n3. Đang UPDATE project id=1...');
        const [result] = await db.query(
            "UPDATE projects SET status = 'installation' WHERE id = 1"
        );
        console.log('   Affected rows:', result.affectedRows);
        console.log('   Changed rows:', result.changedRows);

        // 5. Kiểm tra kết quả
        const [project] = await db.query(
            "SELECT id, project_code, status, progress_percent FROM projects WHERE id = 1"
        );
        console.log('\n4. Kết quả cuối cùng:');
        console.log('   Project:', project[0]);

        if (project[0]?.status === 'installation') {
            console.log('\n✅ THÀNH CÔNG! Status đã được cập nhật thành "installation"');
            console.log('   Vui lòng refresh trang installation.html để kiểm tra.');
        } else {
            console.log('\n❌ Vẫn có lỗi, status không thay đổi:', project[0]?.status);
        }

        console.log('\n=== HOÀN THÀNH ===\n');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error.message);
        console.error('Chi tiết:', error);
        process.exit(1);
    }
}

fixEnumAndUpdate();
