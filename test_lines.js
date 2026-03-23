const db = require('./backend/config/db');
async function check() {
  try {
    const [rows] = await db.query("SELECT l.item_code, l.item_name, l.qty, d.doc_type, d.status FROM stock_document_lines l JOIN stock_documents d ON l.document_id = d.id WHERE (l.project_id = 17 OR d.project_id = 17) AND d.doc_type='export' AND d.status='posted'");
    console.log(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
