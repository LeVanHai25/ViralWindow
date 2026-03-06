/**
 * Import "Vật tư" data from Excel into accessories table
 * Source: "Tài liệu/Data vật tư trong Sản phẩm.xlsx" -> Sheet "Vật tư"
 * Target: accessories table
 * Strategy: INSERT all 13 new materials (none exist in DB yet)
 */

const XLSX = require('xlsx');
const db = require('./config/db');

const EXCEL_PATH = 'D:\\ViralWindow_Phan_Mem_Nhom_Kinh\\Tài liệu\\Data vật tư trong Sản phẩm.xlsx';

async function importMaterials() {
    try {
        // 1. Read Excel
        const workbook = XLSX.readFile(EXCEL_PATH);
        const worksheet = workbook.Sheets['Vật tư'];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row, filter rows with name
        const rows = data.slice(1).filter(r => r[1]);

        console.log(`📋 Found ${rows.length} materials in Excel to import\n`);

        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        for (const row of rows) {
            const stt = row[0];
            const name = String(row[1]).trim();
            const price = Number(row[2]) || 0;
            const code = 'VT-IMPORT-' + Date.now() + '-' + stt;

            // Check if already exists (by exact name)
            const [existing] = await db.query('SELECT id FROM accessories WHERE name = ?', [name]);
            if (existing.length > 0) {
                // Update existing record's price
                await db.query('UPDATE accessories SET sale_price = ?, updated_at = NOW() WHERE id = ?', [price, existing[0].id]);
                console.log(`🔄 Updated: "${name}" -> ${price.toLocaleString()}đ (ID: ${existing[0].id})`);
                skipped++;
                continue;
            }

            // Insert new record
            try {
                await db.query(
                    `INSERT INTO accessories (code, name, category, unit, sale_price, purchase_price, stock_quantity, min_stock_level, is_active, created_at, updated_at)
                     VALUES (?, ?, 'vật tư', 'cái', ?, 0, 0, 0, 1, NOW(), NOW())`,
                    [code, name, price]
                );
                console.log(`✅ Inserted: "${name}" -> ${price.toLocaleString()}đ`);
                inserted++;
            } catch (err) {
                console.error(`❌ Error inserting "${name}":`, err.message);
                errors++;
            }
        }

        console.log(`\n========================================`);
        console.log(`📊 Import Summary:`);
        console.log(`   ✅ Inserted: ${inserted}`);
        console.log(`   🔄 Updated:  ${skipped}`);
        console.log(`   ❌ Errors:   ${errors}`);
        console.log(`   📋 Total:    ${rows.length}`);
        console.log(`========================================`);

        // Verify final count
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM accessories');
        console.log(`\n📦 Total accessories in DB after import: ${countResult[0].count}`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        process.exit();
    }
}

importMaterials();
