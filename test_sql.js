const db = require('./backend/config/db');
async function check() {
  try {
    const [rows] = await db.query("SELECT l.item_code, l.item_name, SUM(l.qty) as total_exported, COUNT(*) as cnt FROM stock_document_lines l JOIN stock_documents d ON l.document_id = d.id WHERE d.doc_type = 'export' AND d.status = 'posted' AND (l.project_id = 18 OR d.project_id = 18) GROUP BY l.item_code, l.item_name");
    console.log(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
