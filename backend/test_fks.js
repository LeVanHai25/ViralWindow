const fs = require('fs');
const db = require('./config/db');
db.query(`
    SELECT table_name, column_name, referenced_table_name, referenced_column_name 
    FROM information_schema.key_column_usage 
    WHERE referenced_table_name = 'projects' OR referenced_table_name = 'customers'
`).then(([r]) => { 
    fs.writeFileSync('fks.json', JSON.stringify(r, null, 2)); 
}).catch(console.error).finally(() => process.exit(0));
