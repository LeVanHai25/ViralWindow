const db = require('./config/db');
const projectCtrl = require('./controllers/projectController');
async function test() {
    console.log("Creating dummy customer...");
    const [c] = await db.query("INSERT INTO customers (full_name) VALUES ('TEST_CUST_DELETE')");
    const custId = c.insertId;
    console.log("Customer ID:", custId);
    
    console.log("Creating dummy project...");
    const [p] = await db.query("INSERT INTO projects (project_code, project_name, customer_id, start_date, deadline) VALUES ('TEST_PRJ', 'Test Prj', ?, NOW(), NOW())", [custId]);
    const prjId = p.insertId;
    console.log("Project ID:", prjId);

    console.log("Creating dummy quotation...");
    await db.query("INSERT INTO quotations (quotation_code, customer_id, project_id, status, quotation_date) VALUES ('TEST_Q', ?, ?, 'pending', NOW())", [custId, prjId]);
    
    // Simulate req, res
    const req = { params: { id: prjId }, user: { id: 1 } };
    let responseSent = null;
    const res = {
        json: (data) => { responseSent = data; },
        status: (code) => { return res; }
    };
    
    console.log("Calling projectController.delete()...");
    await projectCtrl.delete(req, res);
    console.log("Response:", responseSent);
    
    console.log("Checking customer...");
    const [cAfter] = await db.query("SELECT * FROM customers WHERE id = ?", [custId]);
    console.log("Customer after delete:", cAfter.length > 0 ? "EXISTS" : "DELETED");
    
    console.log("Checking quotation...");
    const [qAfter] = await db.query("SELECT * FROM quotations WHERE project_id = ?", [prjId]);
    console.log("Quotations after delete:", qAfter.length);
    
    process.exit(0);
}
test().catch(console.error);
