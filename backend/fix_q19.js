// Fix quotation 19 status
const db = require('./config/db');

async function fix() {
    try {
        console.log('Updating quotation 19 status to contract_signed...');
        const [r] = await db.query("UPDATE quotations SET status = 'contract_signed' WHERE id = 19");
        console.log('Updated:', r.affectedRows, 'rows');

        const [q] = await db.query('SELECT id, quotation_code, status FROM quotations WHERE id = 19');
        console.log('Quotation 19 now:', q[0]);

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

fix();
