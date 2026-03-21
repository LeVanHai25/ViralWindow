const fs = require('fs');
let content = fs.readFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/controllers/projectController.js', 'utf8');
let startIdx = content.indexOf('// 16.');
let endIdx = content.indexOf('// 17.', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `// 16. Kho, Stock Documents
        try {
            await connection.query(\`
                DELETE FROM stock_document_lines 
                WHERE project_id = ? OR document_id IN (SELECT id FROM stock_documents WHERE project_id = ?)
            \`, [id, id]);
            await connection.query(
                "DELETE FROM stock_documents WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted stock documents');

            await connection.query(\`
                DELETE FROM warehouse_export_items 
                WHERE export_id IN (SELECT id FROM warehouse_exports WHERE project_id = ?)
            \`, [id]);
            await connection.query(
                "DELETE FROM warehouse_exports WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted warehouse exports');
        } catch (e) {
            console.log('  - No warehouse_exports or stock_documents tables');
        }

        `;
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync('d:/ViralWindow_Phan_Mem_Nhom_Kinh/backend/controllers/projectController.js', content, 'utf8');
    console.log('Replacement successful!');
} else {
    console.log('Indices not found:', startIdx, endIdx);
}
