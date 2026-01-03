const db = require('./config/db');

async function fix() {
    try {
        console.log('Fixing quotations...');

        // Delete bad quotation items
        await db.query('DELETE FROM quotation_items WHERE quotation_id IN (SELECT id FROM quotations WHERE quotation_code LIKE ?)', ['BG-2025-184%']);
        console.log('Deleted bad quotation items');

        // Delete bad quotations
        const [result] = await db.query('DELETE FROM quotations WHERE quotation_code LIKE ?', ['BG-2025-184%']);
        console.log('Deleted bad quotations:', result.affectedRows);

        // Check remaining codes
        const [rows] = await db.query('SELECT id, quotation_code FROM quotations ORDER BY id DESC LIMIT 10');
        console.log('Remaining quotations:', rows);

        // Get max number
        const [maxRows] = await db.query(
            `SELECT MAX(CAST(SUBSTRING_INDEX(quotation_code, '-', -1) AS UNSIGNED)) as max_num 
             FROM quotations 
             WHERE quotation_code LIKE 'BG-2025-%'`
        );
        console.log('Max number:', maxRows[0]?.max_num);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit();
    }
}

fix();
