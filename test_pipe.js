const db = require('./backend/config/db');
async function main() {
    try {
        const id=17;
        const [lines]=await db.query('SELECT l.item_code, l.item_name, SUM(l.qty) as total_exported FROM stock_document_lines l JOIN stock_documents d ON l.document_id = d.id WHERE d.doc_type = "export" AND d.status = "posted" AND (l.project_id = ? OR d.project_id = ?) GROUP BY l.item_code, l.item_name', [id, id]);
        console.log('Lines exported:', lines);

        const [bom]=await db.query('SELECT material_code, material_name FROM project_materials WHERE project_id=? AND material_type="glass"', [id]);
        console.log('BOM Glass:', bom);
        process.exit(0);
    } catch(e) {
        console.log(e);
        process.exit(1);
    }
}
main();
