const db = require('./BackEnd/config/db');

async function checkCustomer() {
    try {
        const [rows] = await db.query("SELECT id, full_name, customer_code FROM customers WHERE customer_code = 'KH-026'");
        console.log("EXACT MATCH KH-026:", rows);
        
        const [all] = await db.query("SELECT id, full_name, customer_code FROM customers");
        console.log("Total customers:", all.length);
        
        let maxNumber = 0;
        for (const row of all) {
            if (row.customer_code) {
                const match = row.customer_code.match(/KH-?(\d+)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (!isNaN(num) && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
        }
        console.log("MAX NUMBER:", maxNumber);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkCustomer();
