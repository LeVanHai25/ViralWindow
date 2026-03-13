const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE aluminum_systems');
        rows.forEach(row => {
            console.log(`${row.Field.padEnd(20)} | ${row.Type.padEnd(20)} | Null: ${row.Null.padEnd(5)} | Def: ${row.Default}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
