// Script sửa trực tiếp project id = 1
const db = require('./config/db');

async function fixProject1() {
    try {
        console.log('Updating project id=1 status to installation...');

        const [result] = await db.query(
            "UPDATE projects SET status = 'installation' WHERE id = 1"
        );

        console.log('Updated rows:', result.affectedRows);

        const [project] = await db.query(
            "SELECT id, project_code, status, progress_percent FROM projects WHERE id = 1"
        );

        console.log('Project after update:', project[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixProject1();
