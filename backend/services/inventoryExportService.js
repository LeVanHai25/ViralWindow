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
            'accessory': 'accessory_report_template.xlsx',
            'aluminum': 'accessory_report_template.xlsx', // Will be upgraded to dedicated templates later if needed
            'glass': 'accessory_report_template.xlsx',
            'other': 'accessory_report_template.xlsx',
            'scraps': 'accessory_report_template.xlsx'
        };

        const templateName = templateMap[itemType] || 'accessory_report_template.xlsx';
        const templatePath = path.join(__dirname, '../templates', templateName);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templateName}`);
        }

        await workbook.xlsx.readFile(templatePath);
        const worksheet = workbook.getWorksheet(1);

        // 1. Inject Professional Logo if possible
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

        // 2. Inject Header Metadata
        const titleRow = 7;
        if (options.title) {
            const titleCell = worksheet.getCell(`A${titleRow}`);
            titleCell.value = options.title.toUpperCase();
            titleCell.font = { bold: true, size: 16, color: { argb: 'FF007B5E' } };
            titleCell.alignment = { horizontal: 'center' };
            // Merge title cell across data columns
            try { worksheet.mergeCells(`A${titleRow}:H${titleRow}`); } catch (e) { }
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
        const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');
        const exportInfoCell = worksheet.getCell(`A${titleRow + 2}`);
        exportInfoCell.value = `Ngày xuất: ${dateStr} | Người xuất: ${options.generatedBy || 'Admin'}`;
        exportInfoCell.font = { italic: true, size: 10 };
        exportInfoCell.alignment = { horizontal: 'center' };
        try { worksheet.mergeCells(`A${titleRow + 2}:H${titleRow + 2}`); } catch (e) { }

        // 3. Inject Data (Starting from Row 11)
        let currentRowIndex = 11;

        // Clear existing data rows in template (up to 500 rows) to avoid overlapping
        for (let i = 11; i <= 500; i++) {
            const r = worksheet.getRow(i);
            r.values = [];
        }

        // Prepare headers if they are somehow missing in template at Row 10
        const headerRow = worksheet.getRow(10);
        const headers = ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối'];
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            if (!cell.value) cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF007B5E' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' }, margin: { top: 5, bottom: 5 },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        data.forEach((item, index) => {
            const row = worksheet.getRow(currentRowIndex);

            row.getCell(1).value = index + 1; // STT
            row.getCell(2).value = item.code || '';
            row.getCell(3).value = item.name || '';
            row.getCell(4).value = item.unit || '';
            row.getCell(5).value = Number(item.opening) || 0;
            row.getCell(6).value = Number(item.in) || 0;
            row.getCell(7).value = Number(item.out) || 0;
            row.getCell(8).value = Number(item.closing) || 0;

            // Apply borders to mimic template style for new rows
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= 8) {
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
                    // Handle number formatting
                    if (colNumber >= 5) {
                        cell.numFmt = '#,##0.##';
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

        const totals = data.reduce((acc, curr) => ({
            opening: acc.opening + (Number(curr.opening) || 0),
            in: acc.in + (Number(curr.in) || 0),
            out: acc.out + (Number(curr.out) || 0),
            closing: acc.closing + (Number(curr.closing) || 0)
        }), { opening: 0, in: 0, out: 0, closing: 0 });

        totalRow.getCell(5).value = totals.opening;
        totalRow.getCell(6).value = totals.in;
        totalRow.getCell(7).value = totals.out;
        totalRow.getCell(8).value = totals.closing;

        totalRow.eachCell((cell, colNumber) => {
            if (colNumber >= 3 && colNumber <= 8) {
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
            cell.alignment = { horizontal: 'center' };
        });

        return await workbook.xlsx.writeBuffer();
    }
}

module.exports = InventoryExportService;
