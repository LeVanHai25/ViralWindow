const db = require('./config/db');

async function checkCols() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM users");
        console.log(rows.map(r => r.Field));
    } catch(e) { console.error(e); }
    process.exit();
}
checkCols();
