const db = require('./config/db');

async function checkProject() {
    try {
        console.log('🔍 Đang kiểm tra dự án ID=9...\n');

        // Kiểm tra dự án ID=9
        const [project9] = await db.query('SELECT * FROM projects WHERE id = 9');

        if (project9.length > 0) {
            console.log('✅ Dự án ID=9 TỒN TẠI:');
            console.log('   - Mã dự án:', project9[0].project_code);
            console.log('   - Tên dự án:', project9[0].project_name);
            console.log('   - Trạng thái:', project9[0].status);
            console.log('   - is_active:', project9[0].is_active);
        } else {
            console.log('❌ Dự án ID=9 KHÔNG TỒN TẠI trong database\n');

            // Lấy danh sách 10 dự án gần nhất
            console.log('📋 Danh sách 10 dự án gần nhất:');
            const [recentProjects] = await db.query(`
                SELECT id, project_code, project_name, status 
                FROM projects 
                ORDER BY id DESC 
                LIMIT 10
            `);

            if (recentProjects.length > 0) {
                console.table(recentProjects);
            } else {
                console.log('   ⚠️ Không có dự án nào trong database');
            }
        }

        // Kiểm tra các dự án đã hủy
        const [cancelledProjects] = await db.query(`
            SELECT id, project_code, project_name, cancelled_at, cancel_reason 
            FROM projects 
            WHERE status = 'cancelled' 
            ORDER BY id DESC 
            LIMIT 5
        `);

        if (cancelledProjects.length > 0) {
            console.log('\n📋 Danh sách dự án đã hủy:');
            console.table(cancelledProjects);
        }

        await db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

checkProject();
