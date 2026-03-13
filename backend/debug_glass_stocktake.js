const db = require('./config/db');

async function checkGlass() {
    try {
        console.log('--- All glass_items ---');
        const [rows] = await db.query('SELECT id, code, name, quantity FROM glass_items');
        console.log(JSON.stringify(rows, null, 2));

        console.log('\n--- Checking stocktake documents today ---');
        const [docs] = await db.query(`
            SELECT id, doc_no, status, warehouse_id, created_at
            FROM stock_documents 
            WHERE doc_type = 'stocktake' AND DATE(created_at) = '2026-03-13'
            ORDER BY created_at DESC
        `);
        console.log(JSON.stringify(docs, null, 2));

        if (docs.length > 0) {
            const docId = docs[0].id;
            console.log(`\n--- Lines for doc ${docs[0].doc_no} (ID: ${docId}) ---`);
            const [lines] = await db.query(`
                SELECT id, item_id, item_code, item_name, item_type, qty, qty_system, qty_actual, qty_diff, system_id
                FROM stock_document_lines
                WHERE document_id = ?
            `, [docId]);
            console.log(JSON.stringify(lines, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkGlass();
