const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query('DESCRIBE aluminum_systems');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
