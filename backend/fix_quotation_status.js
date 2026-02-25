// Script to fix quotation status and add quote_locked/contract_locked flags
const db = require('./config/db');

async function fix() {
    try {
        console.log('=== Fixing Quotation Status & Project Flags ===\n');

        // Step 1: Check/Add quote_locked column
        console.log('Step 1: Check/Add quote_locked column...');
        try {
            await db.query('SELECT quote_locked FROM projects LIMIT 1');
            console.log('  ✓ quote_locked column exists');
        } catch (e) {
            console.log('  Adding quote_locked column...');
            await db.query('ALTER TABLE projects ADD COLUMN quote_locked TINYINT(1) DEFAULT 0 AFTER progress_percent');
            console.log('  ✓ Added quote_locked column');
        }

        // Step 2: Check/Add contract_locked column
        console.log('Step 2: Check/Add contract_locked column...');
        try {
            await db.query('SELECT contract_locked FROM projects LIMIT 1');
            console.log('  ✓ contract_locked column exists');
        } catch (e) {
            console.log('  Adding contract_locked column...');
            await db.query('ALTER TABLE projects ADD COLUMN contract_locked TINYINT(1) DEFAULT 0 AFTER quote_locked');
            console.log('  ✓ Added contract_locked column');
        }

        // Step 3: Fix quotation 19 status (set to contract_signed since project already has VR code)
        console.log('Step 3: Fix quotation 19 status...');
        const [result1] = await db.query('UPDATE quotations SET status = ? WHERE id = 19', ['contract_signed']);
        console.log(`  ✓ Updated quotation 19 status to "contract_signed" (${result1.affectedRows} rows)`);

        // Step 4: Update project 5 flags
        console.log('Step 4: Update project 5 flags...');
        const [result2] = await db.query('UPDATE projects SET quote_locked = 1, contract_locked = 1 WHERE id = 5');
        console.log(`  ✓ Updated project 5: quote_locked=1, contract_locked=1 (${result2.affectedRows} rows)`);

        // Step 5: Verify
        console.log('\n=== Verification ===');
        const [quotations] = await db.query('SELECT id, quotation_code, status, project_id FROM quotations');
        console.log('Quotations:');
        quotations.forEach(q => console.log(`  ${q.id}: ${q.quotation_code} | Status: ${q.status || 'NULL'} | Project: ${q.project_id}`));

        const [projects] = await db.query('SELECT id, project_code, status, progress_percent, quote_locked, contract_locked FROM projects');
        console.log('Projects:');
        projects.forEach(p => console.log(`  ${p.id}: ${p.project_code} | Status: ${p.status} | Progress: ${p.progress_percent}% | QuoteLocked: ${p.quote_locked} | ContractLocked: ${p.contract_locked}`));

        console.log('\n✅ Fix completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fix();
