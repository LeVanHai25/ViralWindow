/**
 * fix_orphan_data.js
 * One-time script: xóa sạch dữ liệu mồ côi của các dự án đã bị xóa
 * Run: node fix_orphan_data.js
 */
const db = require('./backend/config/db');
const fs = require('fs');

async function fixOrphanData() {
    let out = '';
    const log = (msg) => { console.log(msg); out += msg + '\n'; };
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        log('🧹 BẮT ĐẦU DỌN DẸP DỮ LIỆU MỒ CÔI...\n');

        // 1. order_material_status (dùng order_id = project.id)
        const [r1] = await connection.query(`
            DELETE FROM order_material_status
            WHERE order_id NOT IN (SELECT id FROM projects)
        `);
        log(`✅ order_material_status: đã xóa ${r1.affectedRows} orphan rows`);

        // 2. product_manufacturing
        try {
            const [r2] = await connection.query(`
                DELETE FROM product_manufacturing
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ product_manufacturing: đã xóa ${r2.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  product_manufacturing: ${e.message}`); }

        // 3. installation_progress
        try {
            const [r3] = await connection.query(`
                DELETE FROM installation_progress
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ installation_progress: đã xóa ${r3.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  installation_progress: ${e.message}`); }

        // 4. product_materials
        try {
            const [r4] = await connection.query(`
                DELETE FROM product_materials
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ product_materials: đã xóa ${r4.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  product_materials: ${e.message}`); }

        // 5. project_material_status
        try {
            const [r5] = await connection.query(`
                DELETE FROM project_material_status
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ project_material_status: đã xóa ${r5.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  project_material_status: ${e.message}`); }

        // 6. purchase_requests + items
        try {
            await connection.query(`
                DELETE FROM material_request_items
                WHERE request_id IN (
                    SELECT id FROM purchase_requests
                    WHERE project_id IS NOT NULL
                      AND project_id NOT IN (SELECT id FROM projects)
                )
            `);
            const [r6] = await connection.query(`
                DELETE FROM purchase_requests
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ purchase_requests: đã xóa ${r6.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  purchase_requests: ${e.message}`); }

        // 7. material_requests + items
        try {
            await connection.query(`
                DELETE FROM material_request_items
                WHERE request_id IN (
                    SELECT id FROM material_requests
                    WHERE project_id IS NOT NULL
                      AND project_id NOT IN (SELECT id FROM projects)
                )
            `);
            const [r7] = await connection.query(`
                DELETE FROM material_requests
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ material_requests: đã xóa ${r7.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  material_requests: ${e.message}`); }

        // 8. export_slips + items
        try {
            await connection.query(`
                DELETE FROM export_slip_items
                WHERE slip_id IN (
                    SELECT id FROM export_slips
                    WHERE project_id IS NOT NULL
                      AND project_id NOT IN (SELECT id FROM projects)
                )
            `);
            const [r8] = await connection.query(`
                DELETE FROM export_slips
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ export_slips: đã xóa ${r8.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  export_slips: ${e.message}`); }

        // 9. project_activity_logs
        try {
            const [r9] = await connection.query(`
                DELETE FROM project_activity_logs
                WHERE project_id IS NOT NULL
                  AND project_id NOT IN (SELECT id FROM projects)
            `);
            log(`✅ project_activity_logs: đã xóa ${r9.affectedRows} orphan rows`);
        } catch(e) { log(`⚠️  project_activity_logs: ${e.message}`); }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.commit();

        log('\n✅ HOÀN THÀNH! Tất cả dữ liệu mồ côi đã được dọn sạch.');
        fs.writeFileSync('fix_orphan_result.txt', out);
        process.exit(0);
    } catch(e) {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.rollback();
        log(`\n❌ LỖI: ${e.message}\n${e.stack}`);
        fs.writeFileSync('fix_orphan_result.txt', out);
        process.exit(1);
    } finally {
        connection.release();
    }
}
fixOrphanData();
