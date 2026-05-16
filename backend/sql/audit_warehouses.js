const db = require('../config/db');

async function auditWarehouses() {
    console.log('=== KIỂM TRA KHO NHÔM ===\n');

    // 1. Tất cả kho trong hệ thống
    const [wh] = await db.query('SELECT * FROM inventory_warehouses ORDER BY id');
    console.log('--- Bảng inventory_warehouses (TẤT CẢ) ---');
    wh.forEach(w => console.log(`  id:${w.id} | name:"${w.warehouse_name}" | type:${w.inventory_type} | active:${w.is_active}`));

    // 2. Chỉ kho nhôm
    const [alumWh] = await db.query("SELECT * FROM inventory_warehouses WHERE inventory_type = 'aluminum' ORDER BY id");
    console.log('\n--- Kho có inventory_type = aluminum ---');
    if (alumWh.length === 0) console.log('  [TRỐNG] Không có kho nhôm nào được cấu hình!');
    alumWh.forEach(w => console.log(`  id:${w.id} | "${w.warehouse_name}" | active:${w.is_active}`));

    // 3. Stock theo kho
    try {
        const [stock] = await db.query(`
            SELECT iw.warehouse_name, iw.id as wh_id,
                   COUNT(aws.id) as so_mat_hang,
                   SUM(aws.quantity) as tong_cay
            FROM aluminum_warehouse_stock aws
            JOIN inventory_warehouses iw ON aws.warehouse_id = iw.id
            GROUP BY aws.warehouse_id, iw.warehouse_name
            ORDER BY iw.id
        `);
        console.log('\n--- Tổng tồn kho theo từng kho ---');
        if (stock.length === 0) console.log('  [TRỐNG] Không có dữ liệu stock trong aluminum_warehouse_stock');
        stock.forEach(r => console.log(`  Kho: "${r.warehouse_name}" (id:${r.wh_id}) | Mặt hàng: ${r.so_mat_hang} | Tổng cây: ${r.tong_cay}`));
    } catch(e) {
        console.log('\n  [LỖI] aluminum_warehouse_stock:', e.message);
    }

    // 4. Tìm YANGLY, KOSO, VIRAL
    const keywords = ['YANGLY', 'YANG', 'YL', 'KOSO', 'VIRAL'];
    console.log('\n--- Tìm kho theo từ khóa ---');
    for (const kw of keywords) {
        const [found] = await db.query('SELECT id, warehouse_name, inventory_type FROM inventory_warehouses WHERE warehouse_name LIKE ?', [`%${kw}%`]);
        if (found.length > 0) found.forEach(w => console.log(`  [FOUND] "${kw}" → id:${w.id} name:"${w.warehouse_name}" type:${w.inventory_type}`));
        else console.log(`  [MISSING] Không tìm thấy kho chứa từ khóa "${kw}"`);
    }

    // 5. Mẫu stock data
    try {
        const [sample] = await db.query('SELECT aws.warehouse_id, iw.warehouse_name, aws.aluminum_system_id, aws.quantity FROM aluminum_warehouse_stock aws JOIN inventory_warehouses iw ON aws.warehouse_id = iw.id ORDER BY aws.warehouse_id LIMIT 10');
        console.log('\n--- Mẫu aluminum_warehouse_stock ---');
        sample.forEach(s => console.log(`  wh:"${s.warehouse_name}"(${s.warehouse_id}) | system_id:${s.aluminum_system_id} | qty:${s.quantity}`));
    } catch(e) {
        console.log('\n  [LỖI] Lấy mẫu stock:', e.message);
    }

    process.exit(0);
}

auditWarehouses().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
