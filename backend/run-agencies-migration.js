// run-agencies-migration.js - Chạy migration tạo bảng agencies
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'viralwindow',
        multipleStatements: true
    });

    try {
        console.log('🚀 Bắt đầu migration Agencies...');

        // 1. Tạo bảng agencies
        const [agenciesTable] = await connection.query("SHOW TABLES LIKE 'agencies'");
        if (agenciesTable.length > 0) {
            console.log('⚠️ Bảng agencies đã tồn tại');
        } else {
            await connection.query(`
                CREATE TABLE agencies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    code VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    address VARCHAR(255),
                    phone VARCHAR(20),
                    email VARCHAR(100),
                    region VARCHAR(100),
                    manager_name VARCHAR(100),
                    manager_phone VARCHAR(20),
                    logo_url VARCHAR(255),
                    notes TEXT,
                    status ENUM('active','inactive') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Đã tạo bảng agencies');

            // Insert sample data
            await connection.query(`
                INSERT INTO agencies (code, name, address, region, status) VALUES
                ('HQ', 'Viralwindow - Trụ sở chính', 'Hà Nội', 'Hà Nội', 'active'),
                ('HN', 'Chi nhánh Hà Nội', 'Hà Nội', 'Miền Bắc', 'active'),
                ('ND', 'Chi nhánh Nam Định', 'Nam Định', 'Miền Bắc', 'active'),
                ('HNA', 'Chi nhánh Hà Nam', 'Hà Nam', 'Miền Bắc', 'active')
            `);
            console.log('✅ Đã thêm 4 đại lý mẫu');
        }

        // 2. Tạo bảng customer_agency_history
        const [historyTable] = await connection.query("SHOW TABLES LIKE 'customer_agency_history'");
        if (historyTable.length > 0) {
            console.log('⚠️ Bảng customer_agency_history đã tồn tại');
        } else {
            await connection.query(`
                CREATE TABLE customer_agency_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    customer_id INT NOT NULL,
                    from_agency_id INT,
                    to_agency_id INT NOT NULL,
                    transferred_by INT,
                    reason TEXT,
                    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Đã tạo bảng customer_agency_history (audit log)');
        }

        // 3. Thêm cột agency_id vào customers
        const [customerCols] = await connection.query("SHOW COLUMNS FROM customers LIKE 'agency_id'");
        if (customerCols.length > 0) {
            console.log('⚠️ Cột agency_id đã tồn tại trong customers');
        } else {
            await connection.query(`ALTER TABLE customers ADD COLUMN agency_id INT`);
            console.log('✅ Đã thêm cột agency_id vào bảng customers');

            // Migrate từ unit_id sang agency_id (nếu có)
            const [unitIdCol] = await connection.query("SHOW COLUMNS FROM customers LIKE 'unit_id'");
            if (unitIdCol.length > 0) {
                // Map unit_id to agency_id (HQ = 1)
                await connection.query(`UPDATE customers SET agency_id = 1 WHERE agency_id IS NULL`);
                console.log('✅ Đã migrate dữ liệu từ unit_id sang agency_id');
            }
        }

        // 4. Thêm cột agency_id vào projects
        const [projectCols] = await connection.query("SHOW COLUMNS FROM projects LIKE 'agency_id'");
        if (projectCols.length > 0) {
            console.log('⚠️ Cột agency_id đã tồn tại trong projects');
        } else {
            await connection.query(`ALTER TABLE projects ADD COLUMN agency_id INT`);
            console.log('✅ Đã thêm cột agency_id vào bảng projects');

            // Update projects từ customer agency
            await connection.query(`
                UPDATE projects p 
                SET agency_id = (SELECT agency_id FROM customers c WHERE c.id = p.customer_id LIMIT 1)
                WHERE p.agency_id IS NULL
            `);
            console.log('✅ Đã sync agency_id từ customers sang projects');
        }

        // Show result
        const [allAgencies] = await connection.query('SELECT * FROM agencies');
        console.log('\n📋 Danh sách Đại lý:');
        allAgencies.forEach(a => console.log(`  - ${a.code}: ${a.name} (${a.region || 'N/A'})`));

        console.log('\n✅ Migration Agencies hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await connection.end();
    }
}

runMigration();
