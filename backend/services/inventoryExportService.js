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
            'aluminum': 'aluminum_inventory_template.xlsx', // Specific template for Aluminum
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

        // [SENIOR ARCHITECT NOTE]: Clear legacy titles and data from template rows 5 to 500
        for (let i = 5; i <= 500; i++) {
            const r = worksheet.getRow(i);
            if (i < 10) {
                r.eachCell((cell) => { cell.value = null; });
            } else if (i > 10) {
                r.values = [];
            }
        }

        // 2. Inject Header Metadata
        const titleRow = 7;
        if (options.title) {
            const titleCell = worksheet.getCell(`C${titleRow}`);
            titleCell.value = options.title.toUpperCase();
            titleCell.font = { bold: true, size: 20 };
            titleCell.alignment = { horizontal: 'center' };
            try { worksheet.mergeCells(`C${titleRow}:H${titleRow}`); } catch (e) { }
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN');
        const timeStr = now.toLocaleTimeString('vi-VN');

        worksheet.getCell('A9').value = `Ngày xuất: ${dateStr}`;
        worksheet.getCell('A10').value = `Thời gian: ${timeStr}`;
        worksheet.getCell('A11').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;

        // 3. Inject Data (Starting from Row 15)
        let currentRowIndex = 15;

        // Prepare headers at Row 14
        const headerRow = worksheet.getRow(14);
        const dynamicHeaders = {
            'accessory': ['STT', 'Mã phụ kiện', 'Tên phụ kiện', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'other': ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'aluminum': ['STT', 'Mã cây', 'Tên thanh nhôm', 'Màu sắc', 'Tỉ trọng thô', 'Mét dài(m)', 'SL(thanh)', 'Tổng số mét dài(m)', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'glass': ['STT', 'Mã kính', 'Tên kính', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'scraps': ['STT', 'Mã phế liệu', 'Tên phế liệu', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị']
        };
        const headers = dynamicHeaders[itemType] || dynamicHeaders['other'];
        const maxCols = headers.length;

        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2D70B3' }
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

            if (itemType === 'aluminum') {
                const stock = Number(item.stock) || 0;
                const lengthM = Number(item.length_m) || 0;
                const min = Number(item.min) || 0;
                const max = Number(item.max) || 0;
                const price = Number(item.price) || 0;

                row.getCell(2).value = item.code || ''; // Mã cây
                row.getCell(3).value = item.name || ''; // Tên thanh nhôm
                row.getCell(4).value = item.color || ''; // Màu sắc
                row.getCell(5).value = Number(item.density) || 0; // Tỉ trọng thô
                row.getCell(6).value = lengthM; // Mét dài(m)
                row.getCell(7).value = stock; // SL(thanh)
                row.getCell(8).value = stock * lengthM; // Tổng số mét dài(m)
                row.getCell(9).value = min; // Min
                row.getCell(10).value = max; // Max
                row.getCell(11).value = max > stock ? (max - stock) : 0; // Cần nhập
                row.getCell(12).value = price; // Giá trị
                row.getCell(13).value = stock * price; // Tổng giá trị
            } else {
                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.name || '';
                row.getCell(4).value = item.unit || '';
                row.getCell(5).value = Number(item.stock) || 0;
                row.getCell(6).value = Number(item.min) || 0;
                row.getCell(7).value = Number(item.max) || 0;
                row.getCell(8).value = Number(item.restock) || 0;
                row.getCell(9).value = Number(item.price) || 0;
                row.getCell(10).value = Number(item.totalValue) || 0;
            }

            // Apply borders and formatting
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= maxCols) {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    if (colNumber === 1 || (itemType !== 'aluminum' && colNumber === 4)) {
                        cell.alignment = { horizontal: 'center' };
                    }
                    if ((itemType === 'aluminum' && colNumber >= 5) || (itemType !== 'aluminum' && colNumber >= 5)) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                    }
                }
            });
            currentRowIndex++;
        });

        // 4. Totals Row
        const totalRow = worksheet.getRow(currentRowIndex);
        totalRow.getCell(3).value = 'Tổng cộng:';
        totalRow.getCell(3).font = { bold: true };
        totalRow.getCell(3).alignment = { horizontal: 'right' };

        if (itemType === 'aluminum') {
            const sumCols = [7, 8, 13]; // SL(thanh), Tổng số mét dài(m), Tổng giá trị
            sumCols.forEach(col => {
                let sum = 0;
                data.forEach(item => {
                    if (col === 7) sum += (Number(item.stock) || 0);
                    if (col === 8) sum += (Number(item.stock) || 0) * (Number(item.length_m) || 0);
                    if (col === 13) sum += (Number(item.stock) || 0) * (Number(item.price) || 0);
                });
                const cell = totalRow.getCell(col);
                cell.value = sum;
                cell.font = { bold: true };
                cell.numFmt = '#,##0.00';
                cell.alignment = { horizontal: 'right' };
            });
        } else {
            const totalStock = data.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
            const totalRestock = data.reduce((acc, curr) => acc + (Number(curr.restock) || 0), 0);
            const totalValueStock = data.reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0);
            totalRow.getCell(5).value = totalStock;
            totalRow.getCell(8).value = totalRestock;
            totalRow.getCell(10).value = totalValueStock;
        }

        totalRow.eachCell((cell, colNumber) => {
            if (colNumber >= 3 && colNumber <= maxCols) {
                cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
            }
        });

        // 5. Signatures
        currentRowIndex += 3;
        const footerCols = itemType === 'aluminum'
            ? [{ col: 4, text: 'NGƯỜI TẠO PHIẾU' }, { col: 7, text: 'KẾ TOÁN' }, { col: 12, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }]
            : [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 5, text: 'KẾ TOÁN' }, { col: 9, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }];

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
