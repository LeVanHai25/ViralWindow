const db = require('./config/db');
async function verify() {
    try {
        const [rows] = await db.query("SELECT id, name, sale_price FROM accessories WHERE code LIKE 'VT-IMPORT-%' ORDER BY id");
        console.log('=== Imported Materials ===');
        rows.forEach(r => console.log(`ID=${r.id} | ${r.name} | ${r.sale_price}đ`));
        console.log(`\nTotal imported: ${rows.length}`);

        const [total] = await db.query('SELECT COUNT(*) as count FROM accessories');
        console.log(`Total accessories in DB: ${total[0].count}`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
verify();
