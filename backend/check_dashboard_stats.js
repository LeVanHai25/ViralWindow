const db = require("./config/db");

async function check() {
    try {
        // 1. Inventory counts
        const [acc] = await db.query("SELECT COUNT(*) as count FROM accessories WHERE is_active = 1 AND stock_quantity <= 0");
        const [accLow] = await db.query("SELECT COUNT(*) as count FROM accessories WHERE is_active = 1 AND stock_quantity > 0 AND stock_quantity <= min_stock_level");

        const [alum] = await db.query("SELECT COUNT(*) as count FROM aluminum_systems WHERE is_active = 1 AND (quantity_m <= 0 OR quantity_m IS NULL)");
        const [alumLow] = await db.query("SELECT COUNT(*) as count FROM aluminum_systems WHERE is_active = 1 AND quantity_m > 0 AND quantity_m < 10");

        const [inv] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE item_type = 'glass' AND quantity <= 0");
        const [invLow] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE item_type = 'glass' AND quantity > 0 AND quantity <= min_stock_level");

        const [other] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE (item_type NOT IN ('glass', 'aluminum') OR item_type IS NULL) AND quantity <= 0");
        const [otherLow] = await db.query("SELECT COUNT(*) as count FROM inventory WHERE (item_type NOT IN ('glass', 'aluminum') OR item_type IS NULL) AND quantity > 0 AND quantity <= min_stock_level");

        console.log("--- INVENTORY ---");
        console.log("Accessories: Out=" + acc[0].count + ", Low=" + accLow[0].count);
        console.log("Aluminum: Out=" + alum[0].count + ", Low=" + alumLow[0].count);
        console.log("Glass: Out=" + inv[0].count + ", Low=" + invLow[0].count);
        console.log("Other: Out=" + other[0].count + ", Low=" + otherLow[0].count);
        console.log("Total Out: " + (acc[0].count + alum[0].count + inv[0].count + other[0].count));
        console.log("Total Low: " + (accLow[0].count + alumLow[0].count + invLow[0].count + otherLow[0].count));

        // 2. Project counts
        const [overdue] = await db.query("SELECT COUNT(*) as count FROM projects WHERE status NOT IN ('completed', 'cancelled', 'closed') AND deadline < NOW()");
        console.log("\n--- PROJECTS ---");
        console.log("Overdue: " + overdue[0].count);

        // 3. Quotation counts
        const [pending] = await db.query("SELECT COUNT(*) as count FROM quotations WHERE status IN ('pending', 'draft')");
        console.log("\n--- QUOTATIONS ---");
        console.log("Pending: " + pending[0].count);

        const [allQuots] = await db.query("SELECT status, COUNT(*) as count FROM quotations GROUP BY status");
        console.log("Quotation status breakdown:", allQuots);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
