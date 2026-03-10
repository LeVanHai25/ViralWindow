const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Inventory Export Service
 * Handles professional Excel report generation using templates
 * Architecture: Template-based (SAP/Odoo style)
 */
class InventoryExportService {
    /**
     * Export inventory data to Excel using a template
     * @param {string} itemType - Warehouse type (aluminum, accessory, glass, other, scraps)
     * @param {Array} data - Array of objects with keys: code, name, unit, opening, in, out, closing
     * @param {Object} options - Additional info (generatedBy, dateRange, title)
     * @returns {Promise<Buffer>} - Excel file buffer
     */
    static async exportToExcel(itemType, data, options = {}) {
        const workbook = new ExcelJS.Workbook();

        // Map itemType to template file
        const templateMap = {
            'accessory': 'warehouse_inventory_template.xlsx',
            'aluminum': 'warehouse_inventory_template.xlsx',
            'glass': 'warehouse_inventory_template.xlsx',
            'other': 'warehouse_inventory_template.xlsx',
            'scraps': 'warehouse_inventory_template.xlsx'
        };

        const templateName = templateMap[itemType] || 'warehouse_inventory_template.xlsx';
        const templatePath = path.join(__dirname, '../templates', templateName);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templateName}`);
        }

        await workbook.xlsx.readFile(templatePath);
        const worksheet = workbook.getWorksheet(1);

        // 1. Inject Professional Logo if possible
        // [SENIOR ARCHITECT NOTE]: Removed Col 0, Row 0 logo to avoid overlapping with template headers and branding.
        /*
        try {
            const logoPath = path.join(__dirname, '../assets/LogoViralWindow.png');
            if (fs.existsSync(logoPath)) {
                const logo = workbook.addImage({
                    filename: logoPath,
                    extension: 'png',
                });
                worksheet.addImage(logo, {
                    tl: { col: 0, row: 0 },
                    ext: { width: 120, height: 60 }
                });
            }
        } catch (logoErr) {
            console.warn('Could not add logo to Excel:', logoErr.message);
        }
        */

        // [SENIOR ARCHITECT NOTE]: Clear legacy titles and data from template rows 5 to 500
        // Doing this EARLY to avoid clearing our own injected metadata.
        for (let i = 5; i <= 500; i++) {
            const r = worksheet.getRow(i);
            if (i < 10) {
                r.eachCell((cell) => { cell.value = null; });
            } else if (i > 10) {
                r.values = [];
            }
        }

        // 2. Inject Header Metadata
        // [SENIOR ARCHITECT NOTE]: Aligned with 'biểu mẫu format cho Bảng tồn kho khi xuất excel.xlsx'
        const titleRow = 7;
        if (options.title) {
            const titleCell = worksheet.getCell(`C${titleRow}`);
            // Format of title should be "BÁO CÁO TỒN KHO ......"
            titleCell.value = options.title.toUpperCase();
            titleCell.font = { bold: true, size: 20 };
            titleCell.alignment = { horizontal: 'center' };
            // Merge title cell across columns C to H as per template screenshot
            try { worksheet.mergeCells(`C${titleRow}:H${titleRow}`); } catch (e) { }
        }

        // Date Info (Row 8-9)
        const infoRange = `A${titleRow + 1}:H${titleRow + 2}`;
        if (options.dateRange) {
            const rangeCell = worksheet.getCell(`A${titleRow + 1}`);
            rangeCell.value = options.dateRange;
            rangeCell.alignment = { horizontal: 'center' };
            try { worksheet.mergeCells(`A${titleRow + 1}:H${titleRow + 1}`); } catch (e) { }
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN');
        const timeStr = now.toLocaleTimeString('vi-VN');

        // Rows 9, 10, 11 for Metadata as per template
        worksheet.getCell('B9').value = `Ngày xuất: ${dateStr}`;
        worksheet.getCell('B10').value = `Thời gian: ${timeStr}`;
        worksheet.getCell('B11').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;

        // 3. Inject Data (Starting from Row 15)
        let currentRowIndex = 15;

        // Prepare headers at Row 14 as per professional template
        const headerRow = worksheet.getRow(14);
        const dynamicHeaders = {
            'accessory': ['STT', 'Mã phụ kiện', 'Tên phụ kiện', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'other': ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'aluminum': ['STT', 'Mã nhôm', 'Tên nhôm', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'glass': ['STT', 'Mã kính', 'Tên kính', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'scraps': ['STT', 'Mã phế liệu', 'Tên phế liệu', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị']
        };
        const headers = dynamicHeaders[itemType] || dynamicHeaders['other'];

        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2D70B3' } // Standard corporate blue from template
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        data.forEach((item, index) => {
            const row = worksheet.getRow(currentRowIndex);

            row.getCell(1).value = index + 1; // STT
            row.getCell(2).value = item.code || ''; // Mã
            row.getCell(3).value = item.name || ''; // Tên
            row.getCell(4).value = item.unit || ''; // Đơn vị
            row.getCell(5).value = Number(item.stock) || 0; // Tồn kho
            row.getCell(6).value = Number(item.min) || 0; // Min
            row.getCell(7).value = Number(item.max) || 0; // Max
            row.getCell(8).value = Number(item.restock) || 0; // Cần nhập
            row.getCell(9).value = Number(item.price) || 0; // Giá trị (Đơn giá)
            row.getCell(10).value = Number(item.totalValue) || 0; // Tổng giá trị

            // Apply borders and formatting
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= 10) {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    // Center align STT and Unit
                    if (colNumber === 1 || colNumber === 4) {
                        cell.alignment = { horizontal: 'center' };
                    }
                    // Handle number formatting for stock, levels, prices
                    if (colNumber >= 5) {
                        cell.numFmt = '#,##0';
                        cell.alignment = { horizontal: 'right' };
                    }
                }
            });

            currentRowIndex++;
        });

        // 4. Totals Row
        const totalRow = worksheet.getRow(currentRowIndex);
        totalRow.getCell(3).value = 'TỔNG CỘNG:';
        totalRow.getCell(3).font = { bold: true };
        totalRow.getCell(3).alignment = { horizontal: 'right' };

        const totalValueStock = data.reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0);
        totalRow.getCell(10).value = totalValueStock;

        totalRow.eachCell((cell, colNumber) => {
            if (colNumber >= 3 && colNumber <= 10) {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E9' }
                };
                cell.border = {
                    top: { style: 'medium' },
                    bottom: { style: 'medium' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (colNumber === 10) {
                    cell.numFmt = '#,##0';
                    cell.alignment = { horizontal: 'right' };
                }
            }
        });

        // 5. Signature Area (Simplified auto-placement)
        currentRowIndex += 2;
        worksheet.getCell(`A${currentRowIndex}`).value = `Tổng số mặt hàng có phát sinh: ${data.length}`;
        worksheet.getCell(`A${currentRowIndex}`).font = { italic: true };

        currentRowIndex += 2;
        const footerCols = [
            { col: 1, text: 'BAN GIÁM ĐỐC' },
            { col: 3, text: 'KẾ TOÁN' },
            { col: 5, text: 'KIỂM SOÁT' },
            { col: 7, text: 'NGƯỜI LẬP' }
        ];

        footerCols.forEach(f => {
            const cell = worksheet.getRow(currentRowIndex).getCell(f.col);
            cell.value = f.text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: f.col === 7 ? 'right' : 'center' };
        });

        return await workbook.xlsx.writeBuffer();
    }
}

module.exports = InventoryExportService;
