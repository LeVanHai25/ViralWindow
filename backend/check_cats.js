const db = require("./config/db");

async function checkCategories() {
    try {
        console.log("--- Categories in accessories table ---");
        const [accRows] = await db.query("SELECT category, COUNT(*) as count FROM accessories GROUP BY category");
        console.table(accRows);

        console.log("\n--- Item types in inventory table ---");
        const [invRows] = await db.query("SELECT item_type, COUNT(*) as count FROM inventory GROUP BY item_type");
        console.table(invRows);

        console.log("\n--- Categories (notes) in inventory table for 'other' type ---");
        const [otherRows] = await db.query("SELECT notes as category, COUNT(*) as count FROM inventory WHERE item_type = 'other' GROUP BY notes");
        console.table(otherRows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkCategories();
