// check-projects.js
const pool = require('./config/db');

async function check() {
    const [cols] = await pool.query('DESCRIBE projects');
    console.log('PROJECTS COLUMNS:');
    cols.forEach(c => console.log(`  - ${c.Field} (${c.Type})`));
    process.exit();
}
check();
