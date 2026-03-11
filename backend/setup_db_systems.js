const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'viral_window_db'
    });

    try {
        console.log('Creating aluminum_warehouse_catalog_systems table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS aluminum_warehouse_catalog_systems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                system_name VARCHAR(255) UNIQUE NOT NULL,
                display_order INT DEFAULT 0,
                is_active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Migrate existing systems to ensure data continuity
        console.log('Migrating existing systems...');
        const [existingSystems] = await connection.query(`
            SELECT DISTINCT aluminum_system 
            FROM aluminum_systems 
            WHERE aluminum_system IS NOT NULL AND aluminum_system != ''
        `);

        for (const sys of existingSystems) {
            await connection.query(`
                INSERT IGNORE INTO aluminum_warehouse_catalog_systems (system_name)
                VALUES (?)
            `, [sys.aluminum_system]);
        }

        // Add some common defaults that might be missing but were in the hardcoded list
        const defaults = [
            'VRA – Hệ 55 mở quay',
            'VRA – Hệ 50',
            'VRA – Hệ 64 (cửa sổ lùa)',
            'VRE – Hệ 65 mở quay (Mạnh Quy)',
            'VRE – Hệ 65 mở quay (Yangly)',
            'VRE – Hệ xếp trượt 80',
            'VRE – Hệ lùa 120 & 180',
            'Hệ lùa 94 mới',
            'Thủy lực',
            'Mặt dựng'
        ];

        for (const name of defaults) {
            await connection.query(`
                INSERT IGNORE INTO aluminum_warehouse_catalog_systems (system_name)
                VALUES (?)
            `, [name]);
        }

        console.log('Database setup completed successfully.');
    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await connection.end();
    }
}

setupDatabase();
