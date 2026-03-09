const db = require("./config/db");

async function check() {
    try {
        const [rows] = await db.query("SELECT id, item_code, item_name, item_type, notes FROM inventory WHERE item_code = 'VRPK070'");
        console.log("Item VRPK070 details:");
        console.log(JSON.stringify(rows, null, 2));

        const [lastItems] = await db.query("SELECT id, item_code, item_name, item_type, notes FROM inventory ORDER BY id DESC LIMIT 5");
        console.log("\nLast 5 items in database:");
        console.log(JSON.stringify(lastItems, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
