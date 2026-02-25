/**
 * Run Production Excel Schema Migration
 * Execute this file to create the required tables
 */

const db = require('./config/db');

async function runMigration() {
    console.log('🔄 Running Production Excel View migration...\n');

    try {
        // 1. Create order_material_status table
        console.log('📦 Creating order_material_status table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_material_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL COMMENT 'FK to projects.id',
                material_type ENUM('KINH','NHOM','PHUKIEN','VATTUPHU') NOT NULL,
                status ENUM('MISSING','ORDERED','ARRIVED','ISSUED','OK') DEFAULT 'MISSING',
                plan_date DATE NULL,
                actual_date DATE NULL,
                source_type ENUM('manual','stock_document','purchase_request') DEFAULT 'manual',
                source_id INT NULL,
                note TEXT NULL,
                updated_by INT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_order_material (order_id, material_type),
                INDEX idx_order_id (order_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ order_material_status created\n');

        // 2. Create order_issues table
        console.log('📦 Creating order_issues table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_issues (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NULL,
                severity ENUM('low','medium','high','critical') DEFAULT 'medium',
                status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
                assigned_to INT NULL,
                resolved_by INT NULL,
                resolved_at TIMESTAMP NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_order_id (order_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ order_issues created\n');

        // 3. Create order_events table
        console.log('📦 Creating order_events table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS order_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_title VARCHAR(255) NULL,
                payload_json JSON NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_order_id (order_id),
                INDEX idx_event_type (event_type),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ order_events created\n');

        // 4. Insert initial material status for existing production projects
        console.log('📦 Initializing material status for existing projects...');
        const [projects] = await db.query(`
            SELECT id FROM projects 
            WHERE status IN ('in_production', 'designing', 'quotation_approved', 'installation')
        `);

        let inserted = 0;
        for (const project of projects) {
            for (const type of ['KINH', 'NHOM', 'PHUKIEN', 'VATTUPHU']) {
                try {
                    await db.query(`
                        INSERT IGNORE INTO order_material_status 
                        (order_id, material_type, status, note, updated_by)
                        VALUES (?, ?, 'MISSING', 'Auto-created', 1)
                    `, [project.id, type]);
                    inserted++;
                } catch (e) { /* ignore duplicates */ }
            }
        }
        console.log(`✅ Initialized ${inserted} material status records\n`);

        console.log('🎉 Migration completed successfully!');
        console.log('📍 Access: http://localhost:3001/production-excel-view.html');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
    }

    process.exit(0);
}

runMigration();
