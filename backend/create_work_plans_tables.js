const db = require('./config/db');

async function create() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS work_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                type VARCHAR(50),
                start_time DATETIME,
                end_time DATETIME,
                location VARCHAR(255),
                project_id INT,
                customer_name VARCHAR(255),
                status VARCHAR(50) DEFAULT 'planned',
                priority VARCHAR(50) DEFAULT 'normal',
                created_by INT,
                survey_data JSON,
                supervision_data JSON,
                meeting_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('work_plans created');

        await db.query(`
            CREATE TABLE IF NOT EXISTS work_plan_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                user_id INT NOT NULL,
                role VARCHAR(50) DEFAULT 'member',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
            );
        `);
        console.log('work_plan_participants created');

        await db.query(`
            CREATE TABLE IF NOT EXISTS work_plan_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                user_id INT NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
            );
        `);
        console.log('work_plan_comments created');

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
create();
