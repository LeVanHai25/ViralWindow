const db = require('./backend/config/db');
async function fixDb() {
    try {
        const [rows] = await db.query(`
            SELECT oms.id, oms.status, oms.source_id, sd.doc_type
            FROM order_material_status oms
            JOIN stock_documents sd ON oms.source_id = sd.id
            WHERE oms.source_type = 'stock_document' AND oms.status = 'NONE'
        `);
        
        for (let row of rows) {
            let correctStatus = null;
            if (row.doc_type === 'import') correctStatus = 'ARRIVED';
            if (row.doc_type === 'export') correctStatus = 'ISSUED';
            
            if (correctStatus) {
                await db.query(`UPDATE order_material_status SET status = ? WHERE id = ?`, [correctStatus, row.id]);
                console.log(`[FIXED] Updated order_material_status ID ${row.id} from NONE to ${correctStatus}`);
            }
        }
        console.log(`Hoàn thành. Đã khắc phục ${rows.length} bản ghi bị lỗi trạng thái.`);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fixDb();
