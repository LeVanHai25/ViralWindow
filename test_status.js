const db = require('./backend/config/db');
const fs = require('fs');
async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM order_material_status WHERE order_id = 17 AND material_type = "GLASS"');
        fs.writeFileSync('status.json', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
