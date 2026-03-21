const db = require('./backend/config/db');
const projectController = require('./backend/controllers/projectController');

async function run() {
    const idsToDelete = [14, 8, 6];

    for (const id of idsToDelete) {
        console.log(\`Attempting to delete project ID: \${id}\`);
        
        const req = {
            params: { id: id.toString() },
            user: { id: 1, role: 'admin' } // Mock user for SystemNotifier tracking
        };
        
        let responseSent = false;
        const res = {
            status: (code) => {
                return {
                    json: (data) => {
                        console.log(\`\${code}: \`, data);
                        responseSent = true;
                    }
                };
            },
            json: (data) => {
                console.log(\`200 OK: \`, data);
                responseSent = true;
            }
        };

        try {
            await projectController.delete(req, res);
        } catch (e) {
            console.error(\`Controller crashed on ID \${id}: \`, e);
        }
    }
    
    console.log('Finished processing all deletions.');
    process.exit(0);
}

run();
