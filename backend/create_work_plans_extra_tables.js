const db = require('./config/db');

async function createExtraTables() {
    try {
        console.log('Creating work_plan_logs table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS work_plan_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                user_id INT NOT NULL,
                action VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('Creating work_plan_checklists table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS work_plan_checklists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                is_completed TINYINT(1) DEFAULT 0,
                completed_by INT NULL,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE,
                FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('Tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables:', err.message);
        process.exit(1);
    }
}

createExtraTables();
