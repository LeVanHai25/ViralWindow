const db = require('./backend/config/db');

async function run() {
    try {
        const [rows] = await db.query("SELECT id, project_code, status, progress_percent, production_step, production_progress FROM projects WHERE project_code = 'VR018'");
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
