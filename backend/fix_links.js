const db = require('./config/db');

async function fix() {
    try {
        console.log('--- FIXING LINKS ---');
        const [res1] = await db.query(
            "UPDATE notifications SET link = REPLACE(link, 'customers.html', 'customer-detail.html') WHERE link LIKE '%customers.html%'"
        );
        console.log(`Fixed customer links: ${res1.affectedRows}`);

        const [res2] = await db.query(
            "UPDATE notifications SET link = REPLACE(link, 'projects.html', 'project-detail.html') WHERE link LIKE '%projects.html%'"
        );
        console.log(`Fixed project links: ${res2.affectedRows}`);

        const [res3] = await db.query(
            "UPDATE notifications SET link = REPLACE(link, 'quotations.html', 'pending-quotations.html') WHERE link LIKE '%quotations.html%'"
        );
        console.log(`Fixed quotation links: ${res3.affectedRows}`);

        console.log('--- FIXING PLACEHOLDERS ---');
        // If message contains {customer_name} but link has id=X, we can't easily find the name here, 
        // but we can at least check if there's any obvious error.
        // For now, new notifications will be correct.

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
