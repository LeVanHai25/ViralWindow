const db = require('../config/db');

async function fullPermissionAudit() {
    console.log('============================================================');
    console.log('🏛️  FULL PERMISSION SYSTEM AUDIT — Senior Architect Report');
    console.log('============================================================\n');

    // 1. All permissions by module
    const [perms] = await db.query('SELECT id, code, name, module, sort_order FROM permissions ORDER BY module, sort_order, name');
    console.log(`📋 TỔNG SỐ QUYỀN: ${perms.length}\n`);
    
    let currentModule = '';
    perms.forEach(p => {
        if (p.module !== currentModule) {
            currentModule = p.module;
            console.log(`\n  📁 [${p.module}]`);
        }
        console.log(`    #${p.id} | code:"${p.code}" | name:"${p.name}"`);
    });

    // 2. Roles & permission counts
    const [roles] = await db.query(`
        SELECT r.id, r.name, r.description, 
               COUNT(rp.permission_id) as perm_count,
               COUNT(u.id) as user_count
        FROM roles r 
        LEFT JOIN role_permissions rp ON r.id = rp.role_id 
        LEFT JOIN users u ON u.role_id = r.id
        GROUP BY r.id 
        ORDER BY r.id
    `);
    console.log('\n\n📊 DANH SÁCH ROLES & PHÂN QUYỀN:');
    roles.forEach(r => {
        console.log(`  [${r.id}] "${r.name}" | Mô tả: ${r.description || 'N/A'} | Quyền: ${r.perm_count} | Users: ${r.user_count}`);
    });

    // 3. Modules distinct
    const modules = [...new Set(perms.map(p => p.module))];
    console.log('\n\n🗂️  MODULES CÓ PHÂN QUYỀN: ' + modules.length);
    modules.forEach(m => console.log(`  - ${m}`));

    // 4. Check permissions in backend middleware
    console.log('\n\n⚠️  KIỂM TRA CÁC QUYỀN CÒN THIẾU:');

    // Compare with what we see in the UI from the screenshot
    const uiPermissions = [
        // Báo cáo
        { module: 'Báo cáo', name: 'Xuất Báo cáo' },
        { module: 'Báo cáo', name: 'Xem Báo cáo' },
        // Kho & Vật tư
        { module: 'Kho & Vật tư', name: 'Xem Kho vật tư' },
        { module: 'Kho & Vật tư', name: 'Yêu cầu vật tư' },
        { module: 'Kho & Vật tư', name: 'Xuất vật tư' },
        { module: 'Kho & Vật tư', name: 'Nhập kho' },
        { module: 'Kho & Vật tư', name: 'Quản lý Tồn kho' },
        // Kinh doanh
        { module: 'Kinh doanh', name: 'Tạo Báo giá' },
        { module: 'Kinh doanh', name: 'Hủy Dự án' },
        { module: 'Kinh doanh', name: 'Quản lý Khách hàng' },
        { module: 'Kinh doanh', name: 'Tạo Dự án mới' },
        { module: 'Kinh doanh', name: 'Xem Báo giá' },
        { module: 'Kinh doanh', name: 'Xem Dự án' },
    ];

    uiPermissions.forEach(ui => {
        const found = perms.find(p => p.name === ui.name || p.module === ui.module);
        const exactMatch = perms.find(p => p.name === ui.name);
        if (!exactMatch) {
            console.log(`  ❌ THIẾU: "${ui.name}" trong module "${ui.module}"`);
        }
    });

    // 5. Check role_permissions table structure
    const [rp] = await db.query('DESCRIBE role_permissions');
    console.log('\n\n🔗 CẤU TRÚC BẢNG role_permissions:');
    rp.forEach(c => console.log(`  ${c.Field} | ${c.Type} | ${c.Key}`));

    process.exit(0);
}

fullPermissionAudit().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
