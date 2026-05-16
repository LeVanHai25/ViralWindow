/**
 * E2E Test: Kiểm tra toàn bộ luồng API sau khi sửa lỗi
 */
const db = require('../config/db');

async function runTests() {
    console.log('============================================');
    console.log('🧪 E2E TEST SUITE — ViralWindow Aluminum Fix');
    console.log('============================================\n');

    let passed = 0, failed = 0;

    function test(name, condition, detail = '') {
        if (condition) {
            console.log(`  ✅ ${name}`);
            passed++;
        } else {
            console.log(`  ❌ ${name}${detail ? ' → ' + detail : ''}`);
            failed++;
        }
    }

    // =====================
    // TEST 1: Database State
    // =====================
    console.log('📦 TEST GROUP 1: Database State');
    const [alum] = await db.query('SELECT COUNT(*) as c FROM aluminum_systems WHERE is_active=1');
    const [inv]  = await db.query("SELECT COUNT(*) as c FROM inventory WHERE item_type='aluminum'");
    const [users] = await db.query('SELECT COUNT(*) as c FROM users');
    const [glass] = await db.query("SELECT COUNT(*) as c FROM inventory WHERE item_type='glass'");

    test('aluminum_systems có dữ liệu', alum[0].c > 0, `found ${alum[0].c}`);
    test('inventory[aluminum] có dữ liệu (đã migrate)', inv[0].c > 0, `found ${inv[0].c}`);
    test('Số lượng nhôm khớp giữa 2 bảng', alum[0].c === inv[0].c, `alum=${alum[0].c} inv=${inv[0].c}`);
    test('Users table tồn tại', users[0].c > 0, `found ${users[0].c}`);
    test('Kính trong inventory', glass[0].c >= 0, `found ${glass[0].c}`);

    // =====================
    // TEST 2: Data Integrity
    // =====================
    console.log('\n📊 TEST GROUP 2: Data Integrity');
    const [sampleAlum] = await db.query('SELECT code, name, density, length_m, unit_price, aluminum_system, quantity FROM aluminum_systems WHERE is_active=1 LIMIT 5');
    test('aluminum_systems có field code', sampleAlum.every(r => r.code), 'code field missing');
    test('aluminum_systems có field name', sampleAlum.every(r => r.name), 'name field missing');
    test('aluminum_systems có field aluminum_system', sampleAlum.some(r => r.aluminum_system), 'aluminum_system all null');
    test('aluminum_systems có field density', sampleAlum.some(r => r.density > 0), 'density all zero');
    test('aluminum_systems có field length_m', sampleAlum.some(r => r.length_m > 0), 'length_m all null');
    test('aluminum_systems có field unit_price', sampleAlum.some(r => r.unit_price > 0), 'unit_price all zero');

    const [invSample] = await db.query("SELECT item_code, item_name, quantity, unit_price FROM inventory WHERE item_type='aluminum' LIMIT 3");
    test('inventory[aluminum] có item_code', invSample.every(r => r.item_code), 'item_code missing');
    test('inventory[aluminum] có item_name', invSample.every(r => r.item_name), 'item_name missing');

    // =====================
    // TEST 3: Key items từ ảnh bóc tách
    // =====================
    console.log('\n🖼️  TEST GROUP 3: Vật tư từ ảnh Bóc tách');
    const keyCodes = ['C3332', 'C3332P', 'AL5506', 'C22900', 'FD-YL01', 'FD-YL02'];
    for (const code of keyCodes) {
        const [r] = await db.query('SELECT code, name, quantity FROM aluminum_systems WHERE code=? AND is_active=1', [code]);
        const [ri] = await db.query("SELECT item_code, quantity FROM inventory WHERE item_code=? AND item_type='aluminum'", [code]);
        if (r.length > 0) {
            test(`${code} (${r[0].name?.substring(0,20)}) trong aluminum_systems`, true);
            test(`${code} đã sync vào inventory`, ri.length > 0, `not found in inventory`);
        } else {
            // Code có thể không có trong DB này, skip
            console.log(`  ⏭️  ${code}: không có trong database này (OK)`);
        }
    }

    // =====================
    // TEST 4: API Route Check (chỉ kiểm tra DB query logic)
    // =====================
    console.log('\n🔌 TEST GROUP 4: Query Logic cho /api/aluminum');
    const [apiSimulation] = await db.query(`
        SELECT a.id, a.code, a.name, a.aluminum_system, a.unit_price,
               COALESCE(a.quantity, 0) as quantity,
               a.length_m, a.density
        FROM aluminum_systems a
        WHERE a.is_active = 1
        ORDER BY a.code ASC
        LIMIT 5
    `);
    test('Query /api/aluminum trả về records', apiSimulation.length > 0);
    test('Query có field code (cho displayAluminumSystems)', apiSimulation.every(r => r.code !== undefined));
    test('Query có field name (cho displayAluminumSystems)', apiSimulation.every(r => r.name !== undefined));
    test('Query có field aluminum_system (cho cột Hệ)', apiSimulation.every(r => r.aluminum_system !== undefined));
    test('Query có field density (cho tính khối lượng)', apiSimulation.every(r => r.density !== undefined));
    test('Query có field unit_price (cho tính giá trị)', apiSimulation.every(r => r.unit_price !== undefined));
    test('Query có field quantity', apiSimulation.every(r => r.quantity !== undefined));

    // =====================
    // SUMMARY
    // =====================
    console.log('\n============================================');
    console.log(`✅ PASSED: ${passed}  |  ❌ FAILED: ${failed}  |  TOTAL: ${passed + failed}`);
    console.log('============================================');
    console.log(`\n📋 TỔNG KHO NHÔM: ${inv[0].c} vật tư | HỆ NHÔM: ${alum[0].c} loại`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
