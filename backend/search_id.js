const db = require('./config/db');

async function searchItem() {
    try {
        console.log('--- Searching for ID 678 and code "Kinh-678" around the system ---');
        
        // Items tables
        const tables = [
            { name: 'accessories', codeCol: 'code' },
            { name: 'aluminum_systems', codeCol: 'code' },
            { name: 'glass_items', codeCol: 'code' },
            { name: 'inventory', codeCol: null }, // already checked, no code
            { name: 'aluminum_scraps', codeCol: null }
        ];

        for (const t of tables) {
            try {
                let idQuery = `SELECT * FROM ${t.name} WHERE id = 678`;
                const [idRows] = await db.query(idQuery);
                if (idRows.length > 0) {
                    console.log(`\n✅ Found ID 678 in table "${t.name}":`);
                    console.log(JSON.stringify(idRows, null, 2));
                }

                if (t.codeCol) {
                    let codeQuery = `SELECT * FROM ${t.name} WHERE ${t.codeCol} = "Kinh-678"`;
                    const [codeRows] = await db.query(codeQuery);
                    if (codeRows.length > 0) {
                        console.log(`\n✅ Found code "Kinh-678" in table "${t.name}":`);
                        console.log(JSON.stringify(codeRows, null, 2));
                    }
                }
            } catch (e) {
                console.log(`Error querying table ${t.name}: ${e.message}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

searchItem();
