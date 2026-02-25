/**
 * Inventory Export Controller
 * Handles Excel export for inventory data by warehouse type
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');

/**
 * Export inventory to Excel by item type (warehouse)
 * GET /api/inventory/export-excel?item_type=...&search=...&category=...
 */
exports.exportInventory = async (req, res) => {
    try {
        const { item_type, search, category, system } = req.query;

        if (!item_type || !['aluminum', 'accessory', 'glass', 'other'].includes(item_type)) {
            return res.status(400).json({
                success: false,
                message: 'item_type phải là: aluminum, accessory, glass, hoặc other'
            });
        }

        // Build query based on item_type
        let sql = '';
        let params = [];

        switch (item_type) {
            case 'aluminum':
                sql = `
                    SELECT 
                        item_code AS code,
                        item_name AS name,
                        aluminum_system AS category,
                        'cây' AS unit,
                        quantity AS stock,
                        unit_price AS price,
                        description AS notes
                    FROM aluminum_systems
                    WHERE 1=1
                `;
                if (search) {
                    sql += ` AND (item_code LIKE ? OR item_name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                if (system) {
                    sql += ` AND aluminum_system = ?`;
                    params.push(system);
                }
                sql += ` ORDER BY aluminum_system, item_code`;
                break;

            case 'accessory':
                sql = `
                    SELECT 
                        code,
                        name,
                        category,
                        unit,
                        stock_quantity AS stock,
                        COALESCE(purchase_price, sale_price) AS price,
                        description AS notes
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
                        stock_quantity AS stock,
                        price_per_sqm AS price,
                        CONCAT(thickness, 'mm - ', COALESCE(color, '')) AS notes
                    FROM glass_inventory
                    WHERE 1=1
                `;
                if (search) {
                    sql += ` AND (code LIKE ? OR name LIKE ?)`;
                    params.push(`%${search}%`, `%${search}%`);
                }
                sql += ` ORDER BY glass_type, code`;
                break;

            case 'other':
                // "other" uses the accessories table with specific categories
                sql = `
                    SELECT 
                        code,
                        name,
                        category,
                        unit,
                        stock_quantity AS stock,
                        COALESCE(purchase_price, sale_price) AS price,
                        description AS notes
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
        }

        const [rows] = await db.query(sql, params);

        // Handle empty results gracefully - still create Excel with message
        if (!rows || rows.length === 0) {
            // Return an Excel file with "no data" message
            const workbook = new ExcelJS.Workbook();
            const warehouseNames = {
                aluminum: 'Kho Nhôm',
                accessory: 'Kho Phụ Kiện',
                glass: 'Kho Kính',
                other: 'Kho Vật Tư Phụ'
            };
            const ws = workbook.addWorksheet(warehouseNames[item_type]);
            ws.getCell('A1').value = 'Không có dữ liệu vật tư phù hợp với bộ lọc';
            ws.getCell('A1').font = { italic: true, color: { argb: 'FF666666' } };

            const warehouseFileNames = { aluminum: 'Nhom', accessory: 'PhuKien', glass: 'Kinh', other: 'VatTuPhu' };
            const filename = `TonKho_${warehouseFileNames[item_type]}_${new Date().toISOString().slice(0, 10)}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            await workbook.xlsx.write(res);
            return res.end();
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        // Get Vietnamese name for the warehouse type
        const warehouseNames = {
            aluminum: 'Kho Nhôm',
            accessory: 'Kho Phụ Kiện',
            glass: 'Kho Kính',
            other: 'Kho Vật Tư Phụ'
        };
        const sheetName = warehouseNames[item_type];

        const worksheet = workbook.addWorksheet(sheetName);

        // Title row
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `BÁO CÁO TỒN KHO - ${sheetName.toUpperCase()}`;
        titleCell.font = { bold: true, size: 16, color: { argb: 'FF007B5E' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;

        // Date row
        worksheet.mergeCells('A2:H2');
        const dateCell = worksheet.getCell('A2');
        const today = new Date();
        dateCell.value = `Ngày xuất: ${today.toLocaleDateString('vi-VN')} ${today.toLocaleTimeString('vi-VN')}`;
        dateCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
        dateCell.alignment = { horizontal: 'center' };

        // Empty row
        worksheet.getRow(3).height = 10;

        // Header row
        const headers = ['STT', 'Mã vật tư', 'Tên vật tư', 'Danh mục/Hệ', 'Đơn vị', 'Tồn kho', 'Đơn giá', 'Tổng giá trị'];
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 25;
        headerRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF007B5E' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Freeze header row
        worksheet.views = [{ state: 'frozen', ySplit: 4 }];

        // Data rows
        let totalValue = 0;
        rows.forEach((row, index) => {
            const stock = parseFloat(row.stock) || 0;
            const price = parseFloat(row.price) || 0;
            const lineTotal = stock * price;
            totalValue += lineTotal;

            const dataRow = worksheet.addRow([
                index + 1,
                row.code || '-',
                row.name || '-',
                row.category || '-',
                row.unit || '-',
                stock,
                price,
                lineTotal
            ]);

            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                };
                cell.alignment = { vertical: 'middle' };

                // Center align STT
                if (colNumber === 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
                // Right align numbers
                if (colNumber >= 6) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    if (colNumber === 7 || colNumber === 8) {
                        cell.numFmt = '#,##0 "₫"';
                    } else {
                        cell.numFmt = '#,##0.##';
                    }
                }
            });

            // Alternate row color
            if (index % 2 === 1) {
                dataRow.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF5F5F5' }
                    };
                });
            }
        });

        // Total row
        const totalRow = worksheet.addRow([
            '', '', '', '', 'TỔNG CỘNG:', rows.length + ' mặt hàng', '', totalValue
        ]);
        totalRow.height = 28;
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, size: 11 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE8F5E9' }
            };
            cell.border = {
                top: { style: 'medium' },
                bottom: { style: 'medium' }
            };
            if (colNumber === 8) {
                cell.numFmt = '#,##0 "₫"';
                cell.alignment = { horizontal: 'right' };
            }
        });

        // Set column widths
        worksheet.columns = [
            { width: 6 },   // STT
            { width: 15 },  // Mã vật tư
            { width: 35 },  // Tên vật tư
            { width: 25 },  // Danh mục/Hệ
            { width: 10 },  // Đơn vị
            { width: 12 },  // Tồn kho
            { width: 15 },  // Đơn giá
            { width: 18 }   // Tổng giá trị
        ];

        // Generate filename without Vietnamese accents
        const warehouseFileNames = {
            aluminum: 'Nhom',
            accessory: 'PhuKien',
            glass: 'Kinh',
            other: 'VatTuPhu'
        };
        const dateStr = today.toISOString().slice(0, 10);
        const filename = `TonKho_${warehouseFileNames[item_type]}_${dateStr}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất Excel: ' + error.message
        });
    }
};
