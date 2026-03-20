const fs = require('fs');
const db = require('./config/db');
db.query('SHOW TRIGGERS')
  .then(([r]) => { fs.writeFileSync('triggers.json', JSON.stringify(r, null, 2)); })
  .catch(console.error)
  .finally(() => process.exit(0));
