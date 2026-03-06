const db = require('./config/db');

const excelNames = [
    "Chia đố vách VRA",
    "Chia đố vách VRE",
    "Gia công uốn vòm VRA",
    "Bông hoa",
    "Hình thoi (Quả trám)",
    "Cây góc vuông",
    "Cây tăng cứng",
    "Gia công uốn vòm VRE",
    "Nan nhôm tt Ý màu vân gỗ",
    "Nan nhôm tt Ý màu đen, xám",
    "Nan nhôm tt Ý màu nâu, trắng",
    "Nan nhôm tt Ý màu vàng, trắng sữa, bạc F6",
    "Bông hoa tt ý 6"
];

async function check() {
    try {
        // Check exact matches
        const [rows] = await db.query('SELECT id, name, sale_price FROM accessories WHERE name IN (?)', [excelNames]);
        console.log('=== EXACT MATCHES ===');
        rows.forEach(r => console.log(`  ID=${r.id} | "${r.name}" | sale_price=${r.sale_price}`));
        console.log(`Found ${rows.length} exact matches out of ${excelNames.length} excel items\n`);

        // Check partial/like matches for unmatched
        const matchedNames = rows.map(r => r.name);
        const unmatched = excelNames.filter(n => !matchedNames.includes(n));
        console.log('=== UNMATCHED (no exact DB match) ===');
        for (const name of unmatched) {
            const keyword = name.substring(0, 10);
            const [likeRows] = await db.query('SELECT id, name, sale_price FROM accessories WHERE name LIKE ?', [`%${keyword}%`]);
            console.log(`  Excel: "${name}"`);
            if (likeRows.length > 0) {
                likeRows.forEach(r => console.log(`    Similar: ID=${r.id} | "${r.name}" | sale_price=${r.sale_price}`));
            } else {
                console.log('    No similar matches found -> NEEDS INSERT');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
