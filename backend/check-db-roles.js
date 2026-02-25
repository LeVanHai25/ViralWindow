// Check database for user role assignments
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserRoles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viral_window_db'
    });

    console.log('\n=== DATABASE CHECK: User Roles ===\n');

    // Check users table structure
    const [columns] = await connection.query(`
        SHOW COLUMNS FROM users WHERE Field = 'role_id'
    `);

    if (columns.length === 0) {
        console.log('❌ CRITICAL: Column "role_id" DOES NOT EXIST in users table!');
        console.log('   This is why API cannot return role_id!');
        console.log('\n   Fix: Run ALTER TABLE users ADD COLUMN role_id INT');
        await connection.end();
        return;
    }

    console.log('✅ Column role_id EXISTS in users table');
    console.log('   Type:', columns[0].Type);

    // Check users and their roles
    const [users] = await connection.query(`
        SELECT u.id, u.full_name, u.email, u.user_type, u.role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = 1
        ORDER BY u.id
    `);

    console.log('\n📋 Users in database:\n');
    console.log('ID | Name                | Email                  | role_id | role_name');
    console.log('---|---------------------|------------------------|---------|----------');

    users.forEach(u => {
        const roleId = u.role_id !== null ? u.role_id : 'NULL ❌';
        const roleName = u.role_name || 'N/A';
        console.log(`${u.id}  | ${u.full_name.padEnd(19)} | ${u.email.padEnd(22)} | ${String(roleId).padEnd(7)} | ${roleName}`);
    });

    // Count users without role
    const usersWithoutRole = users.filter(u => u.role_id === null);
    console.log(`\n📊 Summary:`);
    console.log(`   Total active users: ${users.length}`);
    console.log(`   Users WITH role: ${users.length - usersWithoutRole.length}`);
    console.log(`   Users WITHOUT role: ${usersWithoutRole.length} ${usersWithoutRole.length > 0 ? '❌' : '✅'}`);

    if (usersWithoutRole.length > 0) {
        console.log('\n⚠️  Users without role_id:');
        usersWithoutRole.forEach(u => {
            console.log(`   - ${u.full_name} (${u.email})`);
        });
        console.log('\n💡 This is why they show "Chưa phân quyền"!');
        console.log('   Admin needs to assign roles in admin-management.html');
    }

    await connection.end();
}

checkUserRoles().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
