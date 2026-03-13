const db = require('./config/db');

async function checkId() {
    try {
        const [rows] = await db.query('SELECT id, code, name FROM glass_items WHERE id = 678');
        console.log('Result for ID 678 in glass_items:');
        console.log(JSON.stringify(rows, null, 2));

        const [tables] = await db.query('SHOW TABLES');
        console.log('\nAll tables:');
        console.log(JSON.stringify(tables, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkId();
