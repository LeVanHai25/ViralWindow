// Script kiểm tra project status trong database
const db = require('./config/db');

async function checkProjectStatus() {
    try {
        console.log('\\n=== KIỂM TRA PROJECT STATUS ===\\n');

        // Lấy tất cả projects với status
        const [projects] = await db.query(`
            SELECT 
                id, 
                project_code, 
                project_name, 
                status, 
                progress_percent
            FROM projects 
            ORDER BY id DESC 
            LIMIT 10
        `);

        console.log('10 dự án gần nhất:');
        console.log('-'.repeat(100));
        console.log('ID'.padEnd(6) + 'Code'.padEnd(15) + 'Name'.padEnd(30) + 'Status'.padEnd(20) + 'Progress');
        console.log('-'.repeat(100));

        projects.forEach(p => {
            console.log(
                String(p.id).padEnd(6) +
                (p.project_code || 'N/A').padEnd(15) +
                (p.project_name || 'N/A').substring(0, 28).padEnd(30) +
                (p.status || 'null').padEnd(20) +
                (p.progress_percent || 0) + '%'
            );
        });

        console.log('\\n=== THỐNG KÊ THEO STATUS ===\\n');

        const [stats] = await db.query(`
            SELECT 
                status, 
                COUNT(*) as count
            FROM projects 
            GROUP BY status 
            ORDER BY count DESC
        `);

        stats.forEach(s => {
            console.log(`  ${(s.status || 'null').padEnd(20)}: ${s.count} dự án`);
        });

        // Tìm các project có status = 'installation'
        console.log('\\n=== DỰ ÁN ĐANG Ở GIAI ĐOẠN LẮP ĐẶT (status = installation) ===\\n');

        const [installationProjects] = await db.query(`
            SELECT 
                id, 
                project_code, 
                project_name, 
                status, 
                progress_percent
            FROM projects 
            WHERE status = 'installation'
            ORDER BY id DESC
        `);

        if (installationProjects.length === 0) {
            console.log('❌ KHÔNG CÓ dự án nào có status = "installation"');
            console.log('\\n💡 Đây là nguyên nhân trang installation.html không hiển thị dự án!');
        } else {
            console.log(`✅ Có ${installationProjects.length} dự án với status = "installation":`);
            installationProjects.forEach(p => {
                console.log(`  - [${p.id}] ${p.project_code}: ${p.project_name} (${p.progress_percent}%)`);
            });
        }

        // Tìm các project có progress >= 85 nhưng status khác 'installation'
        console.log('\\n=== DỰ ÁN CÓ PROGRESS >= 85% NHƯNG STATUS KHÔNG PHẢI "installation" ===\\n');

        const [mismatchProjects] = await db.query(`
            SELECT 
                id, 
                project_code, 
                project_name, 
                status, 
                progress_percent
            FROM projects 
            WHERE progress_percent >= 85 
            AND (status IS NULL OR status != 'installation')
            AND status != 'completed'
            AND status != 'handover'
            ORDER BY id DESC
        `);

        if (mismatchProjects.length > 0) {
            console.log('⚠️ Phát hiện các dự án KHÔNG ĐỒNG BỘ:');
            mismatchProjects.forEach(p => {
                console.log(`  - [${p.id}] ${p.project_code}: status="${p.status}" nhưng progress=${p.progress_percent}%`);
                console.log(`    → Cần cập nhật status thành "installation"`);
            });
        } else {
            console.log('✅ Không có dự án không đồng bộ.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
}

checkProjectStatus();
