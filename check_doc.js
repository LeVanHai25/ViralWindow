const db = require('./backend/config/db');
async function check() {
    try {
        const [docs] = await db.query(`
            SELECT id, doc_no, doc_type, created_at
            FROM stock_documents
            ORDER BY id DESC
            LIMIT 20
        `);
        console.log("Recent stock_documents:");
        docs.forEach(d => console.log(`[${d.doc_type}] ${d.doc_no} - ${d.created_at}`));
        process.exit(0);
    } catch(e) { console.error(e); process.exit(1); }
}
check();
