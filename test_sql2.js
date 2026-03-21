const db = require('./backend/config/db');
async function check() {
  try {
    const [projs] = await db.query("SELECT id FROM projects WHERE code = 'VR018'");
    if (projs.length === 0) { console.log('Proj not found'); process.exit(0); }
    const pid = projs[0].id;
    console.log('Project ID:', pid);
    const [rows] = await db.query("SELECT l.item_code, l.item_name, SUM(l.qty) as total_exported, COUNT(*) as cnt FROM stock_document_lines l JOIN stock_documents d ON l.document_id = d.id WHERE d.doc_type = 'export' AND d.status = 'posted' AND (l.project_id = ? OR d.project_id = ?) GROUP BY l.item_code, l.item_name", [pid, pid]);
    console.log(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
