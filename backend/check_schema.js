const db = require('./config/db');
async function run() {
    try {
        const [convCols] = await db.query(`SHOW COLUMNS FROM conversations`);
        const [memCols] = await db.query(`SHOW COLUMNS FROM conversation_members`);
        console.log("=== CONVERSATIONS ===");
        console.dir(convCols.map(c => c.Field), { maxArrayLength: null });
        console.log("=== CONVERSATION_MEMBERS ===");
        console.dir(memCols.map(c => c.Field), { maxArrayLength: null });
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
