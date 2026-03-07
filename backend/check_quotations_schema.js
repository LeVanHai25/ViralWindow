const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query(`DESCRIBE quotations`);
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSchema();
