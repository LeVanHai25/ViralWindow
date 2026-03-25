const db = require('./config/db.js');
async function checkUsers() {
    try {
        const [users] = await db.query('SHOW COLUMNS FROM users');
        console.log(users.map(c => c.Field));
    } catch(e) { console.error(e); }
    process.exit();
}
checkUsers();
