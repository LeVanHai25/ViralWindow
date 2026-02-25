// Debug script - kiểm tra và fix project status với log chi tiết
const db = require('./config/db');

async function debugAndFix() {
    try {
        console.log('\n=== DEBUG PROJECT STATUS ===\n');

        // 1. Kiểm tra project hiện tại
        const [before] = await db.query(
            "SELECT * FROM projects WHERE id = 1"
        );
        console.log('1. Project TRƯỚC khi update:');
        console.log('   ID:', before[0]?.id);
        console.log('   Code:', before[0]?.project_code);
        console.log('   Status:', JSON.stringify(before[0]?.status));
        console.log('   Status type:', typeof before[0]?.status);
        console.log('   Progress:', before[0]?.progress_percent);

        // 2. Thực hiện update trực tiếp
        console.log('\n2. Thực hiện UPDATE...');
        const [updateResult] = await db.query(
            "UPDATE projects SET status = 'installation' WHERE id = 1"
        );
        console.log('   Affected rows:', updateResult.affectedRows);
        console.log('   Changed rows:', updateResult.changedRows);

        // 3. Kiểm tra ngay sau update
        const [after] = await db.query(
            "SELECT * FROM projects WHERE id = 1"
        );
        console.log('\n3. Project SAU khi update:');
        console.log('   ID:', after[0]?.id);
        console.log('   Code:', after[0]?.project_code);
        console.log('   Status:', JSON.stringify(after[0]?.status));
        console.log('   Status type:', typeof after[0]?.status);
        console.log('   Progress:', after[0]?.progress_percent);

        // 4. Kiểm tra xem có trigger nào ảnh hưởng không
        console.log('\n4. Kiểm tra TRIGGERS trên bảng projects...');
        const [triggers] = await db.query(
            "SHOW TRIGGERS LIKE 'projects'"
        );
        if (triggers.length > 0) {
            console.log('   Có triggers:', triggers.map(t => t.Trigger));
        } else {
            console.log('   Không có trigger nào.');
        }

        // 5. Kiểm tra cấu trúc cột status
        console.log('\n5. Kiểm tra cấu trúc cột STATUS...');
        const [columns] = await db.query(
            "SHOW COLUMNS FROM projects LIKE 'status'"
        );
        if (columns.length > 0) {
            console.log('   Type:', columns[0].Type);
            console.log('   Null:', columns[0].Null);
            console.log('   Key:', columns[0].Key);
            console.log('   Default:', columns[0].Default);
            console.log('   Extra:', columns[0].Extra);
        }

        // 6. Nếu status vẫn rỗng, thử ALTER cột và update lại
        if (after[0]?.status === '' || after[0]?.status === null) {
            console.log('\n6. Status vẫn rỗng, đang thử force update...');

            // Thử update với cách khác
            await db.query("SET @new_status = 'installation'");
            const [result2] = await db.query(
                "UPDATE projects SET status = @new_status WHERE id = 1"
            );
            console.log('   Force update affected rows:', result2.affectedRows);

            const [final] = await db.query(
                "SELECT id, project_code, status, progress_percent FROM projects WHERE id = 1"
            );
            console.log('\n7. Kết quả CUỐI CÙNG:');
            console.log('   Status:', JSON.stringify(final[0]?.status));
        }

        console.log('\n=== KẾT THÚC DEBUG ===\n');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi:', error);
        process.exit(1);
    }
}

debugAndFix();
