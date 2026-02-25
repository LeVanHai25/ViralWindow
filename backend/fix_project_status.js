// Script sửa lỗi: Đồng bộ status với progress_percent
const db = require('./config/db');

async function fixProjectStatus() {
    try {
        console.log('\\n=== SỬA LỖI ĐỒNG BỘ PROJECT STATUS ===\\n');

        // Cập nhật các project có progress >= 85 nhưng status không phải 'installation'
        const [result] = await db.query(`
            UPDATE projects 
            SET status = 'installation'
            WHERE progress_percent >= 85 
            AND progress_percent < 95
            AND (status IS NULL OR status = '' OR status NOT IN ('installation', 'completed', 'handover'))
        `);

        console.log(`✅ Đã cập nhật ${result.affectedRows} dự án sang status = 'installation'`);

        // Cập nhật các project có progress >= 95 và < 100 thành 'handover'
        const [result2] = await db.query(`
            UPDATE projects 
            SET status = 'handover'
            WHERE progress_percent >= 95 
            AND progress_percent < 100
            AND (status IS NULL OR status = '' OR status NOT IN ('handover', 'completed'))
        `);

        console.log(`✅ Đã cập nhật ${result2.affectedRows} dự án sang status = 'handover'`);

        // Hiển thị lại danh sách sau khi sửa
        console.log('\\n=== KẾT QUẢ SAU KHI SỬA ===\\n');

        const [projects] = await db.query(`
            SELECT 
                id, 
                project_code, 
                project_name, 
                status, 
                progress_percent
            FROM projects 
            WHERE progress_percent >= 85
            ORDER BY progress_percent DESC
        `);

        if (projects.length > 0) {
            console.log('Các dự án có progress >= 85%:');
            projects.forEach(p => {
                console.log(`  [${p.id}] ${p.project_code}: status="${p.status}" - progress=${p.progress_percent}%`);
            });
        }

        console.log('\\n✅ Hoàn thành! Vui lòng refresh trang installation.html để kiểm tra.\\n');

        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
}

fixProjectStatus();
