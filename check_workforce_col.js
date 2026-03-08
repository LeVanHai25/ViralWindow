const db = require('./backend/config/db');

async function checkColumn() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM projects LIKE 'workforce'");
        if (columns.length > 0) {
            console.log("SUCCESS: Column 'workforce' exists.");
            console.log(JSON.stringify(columns[0], null, 2));
        } else {
            console.log("FAILURE: Column 'workforce' does NOT exist.");
        }
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error.message);
        process.exit(1);
    }
}

checkColumn();
