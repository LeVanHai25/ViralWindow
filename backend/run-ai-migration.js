const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function runMigration() {
    let connection;
    try {
        console.log('🔄 Đang chạy Script Migration Memory (Phase 4 & 6)...');
        
        connection = await db.getConnection();
        const sqlPath = path.join(__dirname, 'migrations', 'ai_brain_memory.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        const queries = sqlContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--') && !q.startsWith('//'));

        for (const query of queries) {
            console.log(`\n▶️ Thực thi: ${query.substring(0, 50)}...`);
            await connection.query(query);
            console.log('✅ Xong');
        }

        console.log('\n🎉 Hoàn thành Migration AI Memory!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Lỗi Migration:', err.message);
        process.exit(1);
    } finally {
        if(connection) connection.release();
    }
}

runMigration();
