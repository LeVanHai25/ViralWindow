/**
 * Inventory Export Controller
 * Handles Excel export for inventory data by warehouse type
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

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
                        quantity AS stock,
                        min_stock_level,
                        max_stock_level,
                        unit_price AS price,
                        description AS notes
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
                        stock_quantity AS stock,
                        min_stock_level,
                        max_stock_level,
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
                        quantity AS stock,
                        min_stock_level,
                        max_stock_level,
                        price AS price,
                        structure AS notes
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
                        stock_quantity AS stock,
                        min_stock_level,
                        max_stock_level,
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

            case 'scraps':
                sql = `
                    SELECT 
                        scrap_code AS code,
                        profile_name AS name,
                        'Phế liệu nhôm' AS category,
                        'đoạn' AS unit,
                        length_mm / 1000 AS stock,
                        0 AS min_stock_level,
                        0 AS max_stock_level,
                        0 AS price,
                        CONCAT('Trạng thái: ', status, ', Nặng: ', weight_kg, 'kg') AS notes
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

        const warehouseNames = {
            aluminum: 'Kho Nhôm',
            accessory: 'Kho Phụ Kiện',
            glass: 'Kho Kính',
            other: 'Kho Vật Tư Phụ',
            scraps: 'Kho Phế Liệu'
        };
        const sheetName = warehouseNames[item_type];

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        const worksheet = workbook.addWorksheet(sheetName);

        // --- STYLING & LOGO ---
        // Add logo
        const logoPath = path.join(__dirname, '../assets/LogoViralWindow.png');
        if (fs.existsSync(logoPath)) {
            const logoImage = workbook.addImage({
                filename: logoPath,
                extension: 'png',
            });
            worksheet.addImage(logoImage, {
                tl: { col: 0.2, row: 0.2 },
                ext: { width: 150, height: 60 }
            });
        }

        // Title and header info
        worksheet.mergeCells('D1:K1');
        const titleCell = worksheet.getCell('D1');
        titleCell.value = `BÁO CÁO TỒN KHO - ${sheetName.toUpperCase()}`;
        titleCell.font = { bold: true, size: 20, color: { argb: 'FF007B5E' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells('D2:K2');
        const today = new Date();
        const dateCell = worksheet.getCell('D2');
        dateCell.value = `Ngày xuất: ${today.toLocaleDateString('vi-VN')} ${today.toLocaleTimeString('vi-VN')}`;
        dateCell.font = { italic: true, size: 11 };
        dateCell.alignment = { horizontal: 'center' };

        worksheet.getRow(1).height = 40;
        worksheet.getRow(2).height = 20;
        worksheet.getRow(3).height = 30; // Spacer row

        // Header row (Row 4)
        const headers = ['STT', 'Mã vật tư', 'Tên vật tư', 'Danh mục/Hệ', 'Đơn vị', 'Tồn kho', 'Hạn mức Tối thiểu (MIN)', 'Hạn mức Tối đa (MAX)', 'Số lượng cần nhập', 'Đơn giá', 'Tổng giá trị'];
        const headerRow = worksheet.getRow(4);
        headerRow.values = headers;
        headerRow.height = 30;

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF007B5E' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // --- DATA ---
        let totalValue = 0;
        let rowIndex = 5;

        if (!rows || rows.length === 0) {
            worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
            const emptyCell = worksheet.getCell(`A${rowIndex}`);
            emptyCell.value = 'Không có dữ liệu phù hợp với bộ lọc';
            emptyCell.alignment = { horizontal: 'center' };
            emptyCell.font = { italic: true };
            rowIndex++;
        } else {
            rows.forEach((row, index) => {
                const stock = parseFloat(row.stock) || 0;
                const min = parseFloat(row.min_stock_level) || 0;
                const max = parseFloat(row.max_stock_level) || 100;
                const price = parseFloat(row.price) || 0;

                // Calculate Restock Quantity
                const restockQty = stock <= min ? Math.max(0, max - stock) : 0;
                const lineTotal = stock * price;
                totalValue += lineTotal;

                const dataRow = worksheet.getRow(rowIndex);
                dataRow.values = [
                    index + 1,
                    row.code || '-',
                    row.name || '-',
                    row.category || '-',
                    row.unit || '-',
                    stock,
                    min,
                    max,
                    restockQty,
                    price,
                    lineTotal
                ];

                dataRow.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                    };
                    cell.alignment = { vertical: 'middle' };

                    if (colNumber === 1) cell.alignment.horizontal = 'center';

                    // Highlight restock quantity if > 0
                    if (colNumber === 9 && restockQty > 0) {
                        cell.font = { bold: true, color: { argb: 'FFFF0000' } };
                    }

                    // Formatting numbers
                    if (colNumber >= 6) {
                        cell.alignment.horizontal = 'right';
                        if (colNumber >= 10 || colNumber === 11) {
                            cell.numFmt = '#,##0 "₫"';
                        } else {
                            cell.numFmt = '#,##0.##';
                        }
                    }
                });

                // Status-based row coloring (Optional but helpful)
                if (stock === 0) {
                    dataRow.eachCell(cell => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } }; // Light Red
                    });
                } else if (stock <= min) {
                    dataRow.eachCell(cell => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } }; // Light Yellow
                    });
                }

                rowIndex++;
            });
        }

        // Total Row
        const totalRow = worksheet.getRow(rowIndex);
        totalRow.values = ['', '', '', '', 'TỔNG CỘNG:', rows.length + ' mặt hàng', '', '', '', '', totalValue];
        totalRow.height = 30;
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
            cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
            if (colNumber === 11) {
                cell.numFmt = '#,##0 "₫"';
                cell.alignment = { horizontal: 'right' };
            }
        });

        // Column Widths
        worksheet.columns = [
            { width: 5 },   // STT
            { width: 15 },  // Code
            { width: 40 },  // Name
            { width: 25 },  // Category
            { width: 10 },  // Unit
            { width: 12 },  // Stock
            { width: 12 },  // Min
            { width: 12 },  // Max
            { width: 15 },  // Need
            { width: 15 },  // Price
            { width: 20 }   // Total
        ];

        // Freeze header
        worksheet.views = [{ state: 'frozen', ySplit: 4 }];

        // Filenames
        const warehouseFileNames = { aluminum: 'Nhom', accessory: 'PhuKien', glass: 'Kinh', other: 'VatTuPhu', scraps: 'PheLieu' };
        const dateStr = today.toISOString().slice(0, 10);
        const filename = `TonKho_${warehouseFileNames[item_type]}_${dateStr}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

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
