const db = require("./config/db");

async function checkAll() {
    try {
        const tables = ['accessories', 'inventory', 'glass_items', 'aluminum_systems'];
        for (const table of tables) {
            const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`Table ${table}: ${rows[0].count} items`);

            if (table === 'inventory') {
                const [types] = await db.query("SELECT item_type, COUNT(*) as count FROM inventory GROUP BY item_type");
                console.log("Inventory types:", JSON.stringify(types));
            }
            if (table === 'accessories') {
                const [cats] = await db.query("SELECT category, COUNT(*) as count FROM accessories GROUP BY category");
                console.log("Accessories categories:", JSON.stringify(cats));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkAll();
