const db = require('./config/db');

async function diag() {
    try {
        console.log("--- Customer Search ---");
        const [customers] = await db.query("SELECT id, full_name, customer_code FROM customers WHERE full_name LIKE '%Lê Văn Long%' OR full_name LIKE '%Van Long%'");
        console.log("Found customers:", customers);

        if (customers.length === 0) {
            console.log("No customer found matching name.");
        } else {
            const customerId = customers[0].id;
            console.log(`\n--- Projects for Customer ID: ${customerId} ---`);
            const [projects] = await db.query("SELECT id, project_code, project_name, total_value, status FROM projects WHERE customer_id = ?", [customerId]);
            console.log("Projects:", projects);
            
            if (projects.length > 0) {
                const totalCalculated = projects.reduce((sum, p) => sum + (parseFloat(p.total_value) || 0), 0);
                console.log("\nCalculated Total Value in Modal Logic:", totalCalculated);
            }
        }

        console.log("\n--- Project Search by Code VRBG017 ---");
        const [prjByCode] = await db.query("SELECT id, project_code, project_name, total_value, status, customer_id FROM projects WHERE project_code = 'VRBG017'");
        console.log("Project by code:", prjByCode);

    } catch (err) {
        console.error("Error during diagnostic:", err);
    } finally {
        process.exit(0);
    }
}

diag();
