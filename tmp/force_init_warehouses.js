const pool = require('../backend/config/db');

async function forceInit() {
    try {
        console.log('--- Force Initializing Aluminum Warehouses ---');
        
        // 1. Ensure inventory_warehouses table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventory_warehouses (
              id INT AUTO_INCREMENT PRIMARY KEY,
              warehouse_name VARCHAR(255) NOT NULL,
              warehouse_code VARCHAR(50) NOT NULL UNIQUE,
              inventory_type ENUM('aluminum', 'accessory', 'glass', 'other') NOT NULL,
              is_active TINYINT(1) DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ inventory_warehouses table ready.');

        // 2. Insert default warehouses
        await pool.query(`
            INSERT IGNORE INTO inventory_warehouses (id, warehouse_name, warehouse_code, inventory_type) VALUES 
            (1, 'Kho Nhôm Chính', 'ALU_MAIN', 'aluminum'),
            (2, 'Kho Nhôm Phụ', 'ALU_SUB', 'aluminum')
        `);
        console.log('✅ Default warehouses inserted.');

        // 3. Ensure aluminum_warehouse_stock table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS aluminum_warehouse_stock (
              aluminum_system_id INT NOT NULL,
              warehouse_id INT NOT NULL,
              quantity DECIMAL(10, 2) DEFAULT 0,
              PRIMARY KEY (aluminum_system_id, warehouse_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ aluminum_warehouse_stock table ready.');

        // 4. Migrate data to Kho Chính (ID 1)
        console.log('Migrating stock data...');
        const [systems] = await pool.query("SELECT id, quantity FROM aluminum_systems");
        console.log(`Found ${systems.length} systems to migrate.`);
        
        for (const system of systems) {
            await pool.query(
                "INSERT INTO aluminum_warehouse_stock (aluminum_system_id, warehouse_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)",
                [system.id, 1, system.quantity || 0]
            );
        }
        console.log('✅ Data migration completed.');

        // 5. Final check
        const [warehouses] = await pool.query("SELECT * FROM inventory_warehouses WHERE inventory_type = 'aluminum'");
        console.log('Active Aluminum Warehouses:', warehouses.map(w => w.warehouse_name));

        console.log('--- Initialization Finished ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ FORCE INIT FAILED:', err);
        process.exit(1);
    }
}

forceInit();
