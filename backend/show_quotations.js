const fs = require('fs');
const db = require('./config/db');
db.query("SHOW CREATE TABLE quotations").then(([r])=>{
  fs.writeFileSync('quotations_schema.txt', r[0]['Create Table']);
}).catch(console.error).finally(()=>process.exit(0));
