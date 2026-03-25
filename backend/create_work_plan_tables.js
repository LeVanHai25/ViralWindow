// Script to create the 3 new tables for the Work Plan module
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'viral_window_db',
    port: parseInt(process.env.DB_PORT) || 3306,
};

async function createTable() {
    console.log('Connecting to database:', config.database);
    let connection;
    try {
        connection = await mysql.createConnection(config);
        
        // 1. CREATE work_plans TABLE
        const sqlWorkPlans = `
            CREATE TABLE IF NOT EXISTS work_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                type ENUM('meeting', 'client', 'survey', 'supervision', 'internal') NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                location VARCHAR(255),
                project_id INT NULL,
                customer_name VARCHAR(255) NULL,
                status ENUM('planned', 'ongoing', 'done', 'cancel') DEFAULT 'planned',
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                survey_data JSON NULL,
                supervision_data JSON NULL,
                meeting_note TEXT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        // 2. CREATE work_plan_participants TABLE
        // No foreign key constraints on user_id/work_plan_id yet to avoid errors if other tables don't match, 
        // but we assume standard references.
        const sqlParticipants = `
            CREATE TABLE IF NOT EXISTS work_plan_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                user_id INT NOT NULL,
                role ENUM('leader', 'member') DEFAULT 'member',
                INDEX (work_plan_id),
                INDEX (user_id),
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        // 3. CREATE work_plan_comments TABLE
        const sqlComments = `
            CREATE TABLE IF NOT EXISTS work_plan_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                work_plan_id INT NOT NULL,
                user_id INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (work_plan_id),
                FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(sqlWorkPlans);
        console.log('✅ Created table: work_plans');
        
        await connection.execute(sqlParticipants);
        console.log('✅ Created table: work_plan_participants');
        
        await connection.execute(sqlComments);
        console.log('✅ Created table: work_plan_comments');
        
        console.log('\\nAll tables created successfully!');
        
    } catch (err) {
        console.error('❌ Database error:', err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTable();
