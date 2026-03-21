const db = require('./config/db');
const projectCtrl = require('./controllers/projectController');

async function test() {
    const idsToDelete = [14, 8, 6];

    for (const id of idsToDelete) {
        console.log("\\n=================================");
        console.log("Attempting to delete project ID: " + id);
        
        const req = {
            params: { id: id.toString() },
            user: { id: 1, full_name: 'Admin' },
            app: {
                get: function(key) {
                    if (key === 'io') return { to: function() { return { emit: function() {} }; }, emit: function() {} };
                    return null;
                }
            }
        };
        
        let responseSent = null;
        let responseStatus = null;
        const res = {
            json: function(data) { responseSent = data; console.log('JSON:', data); return res; },
            status: function(code) { responseStatus = code; console.log('STATUS:', code); return res; }
        };
        
        try {
            await projectCtrl.delete(req, res);
            console.log("Finished processing ID " + id);
        } catch (e) {
            console.error("CRASH on ID " + id + ": ", e);
        }
    }
    
    console.log("\\nChecking projects in DB...");
    const [rows] = await db.query("SELECT id, project_name FROM projects WHERE id IN (14, 8, 6)");
    console.log("Remaining projects count: " + rows.length);
    if (rows.length > 0) {
        console.log("Remaining:", rows);
    } else {
        console.log("All 3 stuck projects successfully deleted!");
    }
    
    process.exit(0);
}

test().catch(console.error);
