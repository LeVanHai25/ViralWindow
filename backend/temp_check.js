const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function check() {
    try {
        console.log('--- USERS WITH AVATARS ---');
        const [users] = await db.query('SELECT id, fullname, username, avatar_url FROM users LIMIT 5');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- RECENT NOTIFICATIONS ---');
        const [notifs] = await db.query('SELECT n.id, n.title, n.message, n.audit_log_id, al.actor_name, al.entity_name, al.event_code FROM notifications n LEFT JOIN audit_logs al ON n.audit_log_id = al.id ORDER BY n.created_at DESC LIMIT 5');
        console.log(JSON.stringify(notifs, null, 2));

        console.log('--- EVENT TYPES (CUSTOMER UPDATED) ---');
        const [events] = await db.query('SELECT * FROM event_types WHERE event_code = "customer.updated"');
        console.log(JSON.stringify(events, null, 2));

        console.log('--- CHECK DEFAULT AVATAR FILE ---');
        const avatarPath = path.join(__dirname, '..', 'FontEnd', 'uploads', 'default-avatar.png');
        console.log(`Checking path: ${avatarPath}`);
        if (fs.existsSync(avatarPath)) {
            console.log('✅ default-avatar.png exists');
        } else {
            console.log('❌ default-avatar.png DOES NOT exist');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
