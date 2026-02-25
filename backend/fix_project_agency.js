/**
 * Script để cập nhật agency_id cho các project chưa có
 * Mỗi project sẽ được gán agency_id dựa trên customer's agency_id (nếu có)
 * Hoặc mặc định là agency_id = 1
 */

const db = require('./config/db');

async function fixProjectAgency() {
    try {
        console.log('🔧 Bắt đầu cập nhật agency_id cho projects...\n');

        // 1. Lấy danh sách agencies có sẵn
        const [agencies] = await db.query('SELECT id, name FROM agencies ORDER BY id');
        console.log('📋 Danh sách agencies:');
        agencies.forEach(a => console.log(`   - ID: ${a.id}, Name: ${a.name}`));

        // 2. Lấy danh sách projects chưa có agency_id
        const [projectsWithoutAgency] = await db.query(`
            SELECT p.id, p.project_code, p.project_name, p.customer_id, c.agency_id as customer_agency_id
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.agency_id IS NULL
        `);

        console.log(`\n📊 Số projects chưa có agency_id: ${projectsWithoutAgency.length}`);

        if (projectsWithoutAgency.length === 0) {
            console.log('✅ Tất cả projects đã có agency_id!');

            // Liệt kê các projects và agency_id của chúng
            const [allProjects] = await db.query(`
                SELECT p.id, p.project_code, p.project_name, p.agency_id, a.name as agency_name
                FROM projects p
                LEFT JOIN agencies a ON p.agency_id = a.id
                ORDER BY p.id DESC
                LIMIT 10
            `);

            console.log('\n📋 10 projects gần nhất:');
            allProjects.forEach(p => {
                console.log(`   - [${p.project_code}] ${p.project_name}: agency_id=${p.agency_id || 'NULL'} (${p.agency_name || 'N/A'})`);
            });

            process.exit(0);
        }

        // 3. Cập nhật agency_id cho từng project
        for (const project of projectsWithoutAgency) {
            // Ưu tiên lấy từ customer, nếu không có thì mặc định agency_id = 1
            const newAgencyId = project.customer_agency_id || 1;

            await db.query('UPDATE projects SET agency_id = ? WHERE id = ?', [newAgencyId, project.id]);
            console.log(`   ✅ [${project.project_code}] ${project.project_name}: agency_id = ${newAgencyId}`);
        }

        console.log(`\n✅ Đã cập nhật ${projectsWithoutAgency.length} projects!`);

        // 4. Kiểm tra lại
        const [updated] = await db.query(`
            SELECT p.id, p.project_code, p.project_name, p.agency_id, a.name as agency_name
            FROM projects p
            LEFT JOIN agencies a ON p.agency_id = a.id
            ORDER BY p.id DESC
            LIMIT 10
        `);

        console.log('\n📋 10 projects sau khi cập nhật:');
        updated.forEach(p => {
            console.log(`   - [${p.project_code}] ${p.project_name}: agency_id=${p.agency_id} (${p.agency_name || 'N/A'})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

fixProjectAgency();
