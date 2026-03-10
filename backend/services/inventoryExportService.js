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
            'aluminum': 'aluminum_inventory_template.xlsx',
            'glass': 'glass_inventory_template.xlsx',
            'other': 'warehouse_inventory_template.xlsx',
            'scraps': 'warehouse_inventory_template.xlsx'
        };

        const templateName = templateMap[itemType] || 'warehouse_inventory_template.xlsx';
        const templatePath = path.join(__dirname, '../templates', templateName);

        let worksheet;
        if (fs.existsSync(templatePath)) {
            try {
                await workbook.xlsx.readFile(templatePath);
                worksheet = workbook.getWorksheet(1);
            } catch (err) {
                console.error(`Error reading template ${templateName}:`, err.message);
                worksheet = workbook.addWorksheet('Báo cáo');
            }
        } else {
            console.warn(`Template not found: ${templateName}. Using blank workbook.`);
            worksheet = workbook.addWorksheet('Báo cáo');
        }

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
        const isMovementReport = data.length > 0 && data[0].opening !== undefined;

        // Prepare headers at Row 14 (moved up for maxCols calculation)
        const dynamicHeaders = {
            'accessory': ['STT', 'Mã phụ kiện', 'Tên phụ kiện', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'other': ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'aluminum': ['STT', 'Mã cây', 'Tên thanh nhôm', 'Màu sắc', 'Tỉ trọng thô', 'Mét dài(m)', 'SL(thanh)', 'Tổng số mét dài(m)', 'Tổng khối lượng(Kg)', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị'],
            'glass': ['STT', 'Mã kính', 'Tên kính', 'Nhà cung cấp', 'Độ dày(mm)', 'Kích thước(DxR)', 'Diện tích(m2)', 'Giá', 'Tồn kho', 'Tổng giá trị'],
            'scraps': ['STT', 'Mã phế liệu', 'Tên phế liệu', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Giá trị', 'Tổng giá trị']
        };
        const reportHeaders = isMovementReport
            ? ['STT', 'Mã vật tư', 'Tên', 'Đơn vị tính', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối', 'Giá', 'Tổng giá trị']
            : (dynamicHeaders[itemType] || dynamicHeaders['other']);
        const maxCols = reportHeaders.length;

        if (options.title) {
            const titleRow = 7;
            const titleCell = worksheet.getCell(`A${titleRow}`);
            titleCell.value = options.title.toUpperCase();
            titleCell.font = { bold: true, size: 20 };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            // Merge across all columns in use (A to J for movement, or dynamic for others)
            const lastColChar = String.fromCharCode(64 + maxCols);
            try { worksheet.mergeCells(`A${titleRow}:${lastColChar}${titleRow}`); } catch (e) { }
            worksheet.getRow(titleRow).height = 40;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN');
        const timeStr = now.toLocaleTimeString('vi-VN');

        if (isMovementReport) {
            // Specialized layout for Movement Report
            worksheet.getCell('A9').value = `Ngày xuất: ${dateStr}`;

            // Extract dates from range string "Từ ngày 10/03/2026 đến ngày 20/03/2026"
            let fromDate = '-', toDate = '-';
            if (options.dateRange) {
                const parts = options.dateRange.split('đến ngày');
                if (parts.length === 2) {
                    fromDate = parts[0].replace('Từ ngày', '').trim();
                    toDate = parts[1].trim();
                } else {
                    fromDate = options.dateRange;
                }
            }

            worksheet.getCell('A10').value = `Từ ngày: ${fromDate}`;
            worksheet.getCell('A11').value = `Đến ngày: ${toDate}`;
            worksheet.getCell('A12').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;

            // Ensure Row heights
            [9, 10, 11, 12].forEach(r => { worksheet.getRow(r).height = 20; });
        } else {
            // Default layout for Stock Report
            worksheet.getCell('A9').value = `Ngày xuất: ${dateStr}`;
            worksheet.getCell('A10').value = `Thời gian: ${timeStr}`;
            worksheet.getCell('A11').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;
        }

        // 3. Inject Data (Starting from Row 15)
        let currentRowIndex = 15;

        // Prepare headers at Row 14
        const headerRow = worksheet.getRow(14);

        reportHeaders.forEach((h, i) => {
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
        headerRow.height = 30;

        // Set column widths for Movement Report
        if (isMovementReport) {
            worksheet.columns = [
                { key: 'stt', width: 6 },
                { key: 'code', width: 15 },
                { key: 'name', width: 35 },
                { key: 'unit', width: 12 },
                { key: 'opening', width: 12 },
                { key: 'in', width: 12 },
                { key: 'out', width: 12 },
                { key: 'closing', width: 12 },
                { key: 'price', width: 15 },
                { key: 'totalValue', width: 18 }
            ];
        }

        data.forEach((item, index) => {
            const row = worksheet.getRow(currentRowIndex);
            row.getCell(1).value = index + 1; // STT

            if (isMovementReport) {
                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.name || '';
                row.getCell(4).value = item.unit || '';
                row.getCell(5).value = Number(item.opening) || 0;
                row.getCell(6).value = Number(item.in) || 0;
                row.getCell(7).value = Number(item.out) || 0;
                row.getCell(8).value = Number(item.closing) || 0;
                row.getCell(9).value = Number(item.price) || 0;
                row.getCell(10).value = Number(item.totalValue) || 0;
            } else if (itemType === 'aluminum') {
                const stock = Number(item.stock) || 0;
                const lengthM = Number(item.length_m) || 0;
                const density = Number(item.density) || 0;
                const min = Number(item.min) || 0;
                const max = Number(item.max) || 0;
                const price = Number(item.price) || 0;
                const totalM = stock * lengthM;
                const totalWeight = totalM * density;

                row.getCell(2).value = item.code || ''; // Mã cây
                row.getCell(3).value = item.name || ''; // Tên thanh nhôm
                row.getCell(4).value = item.color || ''; // Màu sắc
                row.getCell(5).value = density; // Tỉ trọng thô
                row.getCell(6).value = lengthM; // Mét dài(m)
                row.getCell(7).value = stock; // SL(thanh)
                row.getCell(8).value = totalM; // Tổng số mét dài(m)
                row.getCell(9).value = totalWeight; // Tổng khối lượng(Kg)
                row.getCell(10).value = min; // Min
                row.getCell(11).value = max; // Max
                row.getCell(12).value = max > stock ? (max - stock) : 0; // Cần nhập
                row.getCell(13).value = price; // Giá trị
                row.getCell(14).value = stock * price; // Tổng giá trị
            } else if (itemType === 'glass') {
                const stock = Number(item.stock) || 0;
                const price = Number(item.price) || 0;
                const notes = item.notes || '';

                // Parse dimensions from notes (e.g., '8mm - 2m x 3m')
                const thickMatch = notes.match(/(\d+(?:\.\d+)?)\s*mm/);
                const dimMatch = notes.match(/(\d+(?:\.\d+)?)\s*m\s*x\s*(\d+(?:\.\d+)?)\s*m/);

                const thickness = thickMatch ? parseFloat(thickMatch[1]) : '';
                const dimensions = dimMatch ? `${dimMatch[1]}x${dimMatch[2]}` : '';
                const area = dimMatch ? parseFloat(dimMatch[1]) * parseFloat(dimMatch[2]) : 0;

                row.getCell(2).value = item.code || ''; // Mã kính
                row.getCell(3).value = item.name || ''; // Tên kính
                row.getCell(4).value = item.supplier_name || ''; // Nhà cung cấp
                row.getCell(5).value = thickness; // Độ dày(mm)
                row.getCell(6).value = dimensions; // Kích thước(DxR)
                row.getCell(7).value = area || ''; // Diện tích(m2)
                row.getCell(8).value = price; // Giá
                row.getCell(9).value = stock; // Tồn kho
                row.getCell(10).value = stock * price; // Tổng giá trị
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

                    // Specific number formatting
                    if (itemType === 'aluminum') {
                        if (colNumber === 5 || colNumber === 6 || colNumber === 9 || colNumber >= 13) {
                            // Density, Length, Weight, Price, Total Value: 2 decimals
                            cell.numFmt = '#,##0.00';
                        } else if (colNumber >= 7 && colNumber <= 12) {
                            // SL, Total Meters, Min, Max, Cần nhập: Integers
                            cell.numFmt = '#,##0';
                        }
                    } else if (itemType === 'glass') {
                        if (colNumber === 7 || colNumber === 8 || colNumber === 10) {
                            cell.numFmt = '#,##0.00';
                        } else if (colNumber === 9) {
                            cell.numFmt = '#,##0';
                        }
                    } else if (colNumber >= 5) {
                        cell.numFmt = '#,##0.00';
                    }

                    if (colNumber >= 5 && (itemType !== 'glass' || (colNumber !== 6))) {
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

        if (isMovementReport) {
            const sumCols = [5, 6, 7, 8, 10]; // Tồn đầu, Nhập, Xuất, Tồn cuối, Tổng giá trị
            sumCols.forEach(col => {
                let sum = 0;
                data.forEach(item => {
                    if (col === 5) sum += Number(item.opening) || 0;
                    if (col === 6) sum += Number(item.in) || 0;
                    if (col === 7) sum += Number(item.out) || 0;
                    if (col === 8) sum += Number(item.closing) || 0;
                    if (col === 10) sum += Number(item.totalValue) || 0;
                });
                const cell = totalRow.getCell(col);
                cell.value = sum;
                cell.font = { bold: true };
                cell.numFmt = '#,##0.00';
                cell.alignment = { horizontal: 'right' };
            });
        } else if (itemType === 'aluminum') {
            const sumCols = [7, 8, 9, 14]; // SL(thanh), Tổng số mét dài(m), Tổng khối lượng(Kg), Tổng giá trị
            sumCols.forEach(col => {
                let sum = 0;
                data.forEach(item => {
                    const stock = Number(item.stock) || 0;
                    const lengthM = Number(item.length_m) || 0;
                    const density = Number(item.density) || 0;
                    const price = Number(item.price) || 0;

                    if (col === 7) sum += stock;
                    if (col === 8) sum += stock * lengthM;
                    if (col === 9) sum += stock * lengthM * density;
                    if (col === 14) sum += stock * price;
                });
                const cell = totalRow.getCell(col);
                cell.value = sum;
                cell.font = { bold: true };
                cell.numFmt = (col === 7 || col === 8) ? '#,##0' : '#,##0.00';
                cell.alignment = { horizontal: 'right' };
            });
        } else if (itemType === 'glass') {
            const sumCols = [9, 10]; // Tồn kho, Tổng giá trị
            sumCols.forEach(col => {
                let sum = 0;
                data.forEach(item => {
                    const stock = Number(item.stock) || 0;
                    const price = Number(item.price) || 0;
                    if (col === 9) sum += stock;
                    if (col === 10) sum += stock * price;
                });
                const cell = totalRow.getCell(col);
                cell.value = sum;
                cell.font = { bold: true };
                cell.numFmt = col === 9 ? '#,##0' : '#,##0.00';
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
        const footerColsArr = {
            'movement': [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 5, text: 'KẾ TOÁN' }, { col: 9, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'aluminum': [{ col: 4, text: 'NGƯỜI TẠO PHIẾU' }, { col: 8, text: 'KẾ TOÁN' }, { col: 13, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'glass': [{ col: 3, text: 'NGƯỜI TẠO PHIẾU' }, { col: 6, text: 'KẾ TOÁN' }, { col: 9, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'default': [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 5, text: 'KẾ TOÁN' }, { col: 9, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }]
        };
        const activeFooter = isMovementReport ? footerColsArr.movement : (footerColsArr[itemType] || footerColsArr.default);

        activeFooter.forEach(f => {
            const cell = worksheet.getRow(currentRowIndex).getCell(f.col);
            cell.value = f.text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        return await workbook.xlsx.writeBuffer();
    }
}

module.exports = InventoryExportService;
