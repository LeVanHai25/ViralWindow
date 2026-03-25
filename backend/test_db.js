const db = require('./config/db');

async function test() {
    try {
        const [u] = await db.query("SELECT id, full_name, user_type, role_id FROM users WHERE full_name LIKE '%Hoa%'");
        console.log('Hoa:', u);
        const [p] = await db.query("SELECT id, title, created_by FROM work_plans");
        console.log('Plans:', p);
        const [part] = await db.query("SELECT * FROM work_plan_participants");
        console.log('Participants:', part);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
