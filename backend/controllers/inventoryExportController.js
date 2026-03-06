const db = require('../config/db');
const inventoryExportService = require('../services/inventoryExportService');

/**
 * Export inventory to Excel by item type (warehouse)
 * GET /api/inventory/export-excel?item_type=...&search=...&category=...
 */
exports.exportInventory = async (req, res) => {
    try {
        const { item_type, search, category, system } = req.query;

        if (!item_type || !['aluminum', 'accessory', 'glass', 'other', 'scraps'].includes(item_type)) {
            return res.status(400).json({
                success: false,
                message: 'item_type phải là: aluminum, accessory, glass, other hoặc scraps'
            });
        }

        // Build query based on item_type
        let sql = '';
        let params = [];

        switch (item_type) {
            case 'aluminum':
                sql = `
                    SELECT 
                        code,
                        name,
                        aluminum_system AS category,
                        'cây' AS unit,
                        quantity AS stock
                    FROM aluminum_systems
                    WHERE 1=1
                `;
                if (search) {
                    sql += ` AND (code LIKE ? OR name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                if (system) {
                    sql += ` AND aluminum_system = ?`;
                    params.push(system);
                }
                sql += ` ORDER BY aluminum_system, code`;
                break;

            case 'accessory':
                sql = `
                    SELECT 
                        code,
                        name,
                        category,
                        unit,
                        stock_quantity AS stock
                    FROM accessories
                    WHERE 1=1
                `;
                if (search) {
                    sql += ` AND (code LIKE ? OR name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                if (category && category !== 'all') {
                    sql += ` AND category = ?`;
                    params.push(category);
                }
                sql += ` ORDER BY category, code`;
                break;

            case 'glass':
                sql = `
                    SELECT 
                        code,
                        name,
                        glass_type AS category,
                        'tấm' AS unit,
                        quantity AS stock
                    FROM glass_items
                    WHERE 1=1
                `;
                if (search) {
                    sql += ` AND (code LIKE ? OR name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                sql += ` ORDER BY glass_type, code`;
                break;

            case 'other':
                sql = `
                    SELECT 
                        code,
                        name,
                        category,
                        unit,
                        stock_quantity AS stock
                    FROM accessories
                    WHERE category IN ('Ke', 'Gioăng', 'Nhựa ốp', 'Keo', 'Khác')
                `;
                if (search) {
                    sql += ` AND (code LIKE ? OR name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                if (category && category !== 'all') {
                    sql += ` AND category = ?`;
                    params.push(category);
                }
                sql += ` ORDER BY category, code`;
                break;

            case 'scraps':
                sql = `
                    SELECT 
                        scrap_code AS code,
                        profile_name AS name,
                        'Phế liệu nhôm' AS category,
                        'đoạn' AS unit,
                        length_mm / 1000 AS stock
                    FROM aluminum_scraps
                    WHERE is_used = 0
                `;
                if (search) {
                    sql += ` AND (scrap_code LIKE ? OR profile_name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                sql += ` ORDER BY created_at DESC`;
                break;
        }

        const [rows] = await db.query(sql, params);

        // Map data to service format
        const exportData = rows.map(row => ({
            code: row.code,
            name: row.name,
            unit: row.unit,
            opening: 0,
            in: 0,
            out: 0,
            closing: row.stock
        }));

        const warehouseNames = {
            aluminum: 'NHÔM',
            accessory: 'PHỤ KIỆN',
            glass: 'KÍNH',
            other: 'VẬT TƯ PHỤ',
            scraps: 'PHẾ LIỆU'
        };

        const buffer = await inventoryExportService.exportToExcel(item_type, exportData, {
            title: `BÁO CÁO TỒN KHO ${warehouseNames[item_type]}`,
            generatedBy: req.user?.full_name || req.user?.username || 'Admin'
        });

        // Filenames
        const warehouseFileNames = { aluminum: 'Nhom', accessory: 'PhuKien', glass: 'Kinh', other: 'VatTuPhu', scraps: 'PheLieu' };
        const filename = `TonKho_${warehouseFileNames[item_type]}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);

    } catch (error) {
        console.error('Error exporting inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất Excel: ' + error.message
        });
    }
};
