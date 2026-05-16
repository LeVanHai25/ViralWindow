const db = require('../config/db');

async function verify() {
    const [stats] = await db.query("SELECT COUNT(*) as total, SUM(quantity) as tong_cay FROM inventory WHERE item_type='aluminum'");
    console.log('=== KẾT QUẢ MIGRATE ===');
    console.log('Tổng vật tư nhôm:', stats[0].total, 'records');
    console.log('Tổng số cây tồn kho:', stats[0].tong_cay);

    const [sample] = await db.query("SELECT item_code, item_name, quantity, unit_price, notes FROM inventory WHERE item_type='aluminum' LIMIT 5");
    console.log('\n--- Mẫu 5 vật tư đầu ---');
    sample.forEach(r => console.log(r.item_code, '|', (r.item_name || '').substring(0,25), '| qty:', r.quantity, '| giá:', r.unit_price));

    const [specific] = await db.query("SELECT item_code, item_name, quantity FROM inventory WHERE item_type='aluminum' AND item_code IN ('C3332','C3332P','AL5506','C22900')");
    console.log('\n--- Vật tư từ ảnh bóc tách ---');
    specific.forEach(r => console.log(r.item_code, '|', r.item_name, '| qty:', r.quantity));

    process.exit(0);
}
verify().catch(e => { console.error(e.message); process.exit(1); });
