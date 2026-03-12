const XLSX = require('xlsx');
const path = require('path');
const db = require('../backend/config/db');

// Configuration
const EXCEL_FILE = path.join('d:', 'ViralWindow_Phan_Mem_Nhom_Kinh', 'Tài liệu', 'Tồn kho KOSO viral.xlsx');
const TARGET_WAREHOUSE_ID = 1; // Kho Nhôm VIRAL

async function importData() {
    let connection;
    try {
        console.log('🚀 DỰ ÁN: NHẬP DỮ LIỆU TỒN KHO KOSO');
        console.log(`📂 File: ${EXCEL_FILE}`);
        console.log(`📦 Kho đích: ID ${TARGET_WAREHOUSE_ID}`);

        // 1. Read Excel
        const workbook = XLSX.readFile(EXCEL_FILE);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Skip header rows (Row 0 is title/headers, data starts after row 1 based on debug)
        const rows = rawData.slice(1).filter(row => row[0]); // Filter rows with a code
        console.log(`📊 Tìm thấy ${rows.length} dòng dữ liệu.`);

        connection = await db.getConnection();
        await connection.beginTransaction();

        // 2. Synchronize Systems
        const systems = [...new Set(rows.map(row => row[1]?.toString().trim()))].filter(s => s);
        console.log(`🔍 Các hệ nhôm cần đồng bộ: ${systems.join(', ')}`);

        for (const systemName of systems) {
            await connection.query(
                `INSERT IGNORE INTO aluminum_warehouse_catalog_systems (system_name, display_order) VALUES (?, 0)`,
                [systemName]
            );
        }
        console.log('✅ Đồng bộ danh mục hệ nhôm xong.');

        // 3. Upsert Items and Stocks
        let updatedCount = 0;
        let insertedCount = 0;

        for (const row of rows) {
            const code = row[0]?.toString().trim();
            const system = row[1]?.toString().trim();
            const name = row[2]?.toString().trim();
            const weight_per_meter = parseFloat(row[4]) || 0;
            const length = parseFloat(row[5]) || 0;
            const quantity = parseFloat(row[6]) || 0;
            const minStock = parseInt(row[7]) || 5;
            const maxStock = parseInt(row[8]) || 20;
            const color = row[12]?.toString().trim() || 'Xám đá';
            const brand = 'KOSO';
            const thickness = 1.4; // Default thickness for KOSO 55 if not specified

            if (!code) continue;

            // Upsert into aluminum_systems
            const [existing] = await connection.query('SELECT id FROM aluminum_systems WHERE code = ?', [code]);
            let systemId;

            if (existing.length > 0) {
                systemId = existing[0].id;
                await connection.query(
                    `UPDATE aluminum_systems SET 
                        name = ?, 
                        aluminum_system = ?, 
                        brand = ?,
                        weight_per_meter = ?,
                        thickness_mm = ?,
                        length_m = ?, 
                        color = ?, 
                        min_stock_level = ?, 
                        max_stock_level = ?,
                        is_active = 1
                     WHERE id = ?`,
                    [name, system, brand, weight_per_meter, thickness, length, color, minStock, maxStock, systemId]
                );
                updatedCount++;
            } else {
                const [result] = await connection.query(
                    `INSERT INTO aluminum_systems (code, name, aluminum_system, brand, weight_per_meter, thickness_mm, length_m, color, min_stock_level, max_stock_level, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                    [code, name, system, brand, weight_per_meter, thickness, length, color, minStock, maxStock]
                );
                systemId = result.insertId;
                insertedCount++;
            }

            // Upsert into aluminum_warehouse_stock
            await connection.query(
                `INSERT INTO aluminum_warehouse_stock (aluminum_system_id, warehouse_id, quantity) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
                [systemId, TARGET_WAREHOUSE_ID, quantity]
            );
        }

        await connection.commit();
        console.log(`✅ Hoàn tất: Thêm mới ${insertedCount}, Cập nhật ${updatedCount} mặt hàng.`);
        console.log('--- KẾT THÚC NHẬP LIỆU ---');
        process.exit(0);

    } catch (err) {
        console.error('❌ LỖI NHẬP LIỆU:', err);
        if (connection) await connection.rollback();
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

importData();
