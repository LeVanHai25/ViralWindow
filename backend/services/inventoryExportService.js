const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

/**
 * Inventory Export Service
 * Handles professional Excel report generation using templates
 * Architecture: Template-based (SAP/Odoo style)
 * 
 * [SENIOR ARCHITECT] v2.0 - Nâng cấp format chuyên nghiệp:
 * - Thêm cột "Danh mục" cho Phụ kiện & Vật tư phụ
 * - Thiết kế lại Glass (bỏ parse unreliable) & Scraps (layout riêng)
 * - Cải thiện number format cho VND (bỏ .00)
 * - Thêm dòng "Tổng số mặt hàng"
 */
class InventoryExportService {
    /**
     * Export inventory data to Excel using a template
     * @param {string} itemType - Warehouse type (aluminum, accessory, glass, other, scraps)
     * @param {Array} data - Array of export data objects
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

        // ✅ FIX: Xóa TOÀN BỘ merged cells từ template trước
        // (tránh conflict khi merge mới ở title row)
        const mergedCells = Object.keys(worksheet.model?.merges || {});
        mergedCells.forEach(range => {
            try { worksheet.unMergeCells(range); } catch (e) { }
        });

        // ✅ FIX: Clear legacy contents + FORMAT (fill, font, border)
        // includeEmpty: true → xóa CẢ cell có background color nhưng không có value
        for (let i = 1; i <= 500; i++) {
            const r = worksheet.getRow(i);
            r.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null;
                cell.style = {}; // Xóa toàn bộ format (fill, font, border, alignment)
            });
            r.height = 20;
        }

        // ✅ FIX: Xóa tất cả hình ảnh embedded từ template
        if (worksheet._media) worksheet._media = [];

        // ============================================================
        // 1. COMPANY HEADER (Rows 1-4)
        // ============================================================
        // ✅ FIX: Freeze panes — dòng tiêu đề bảng (Row 14) đứng yên khi cuộn
        worksheet.views = [{ state: 'frozen', ySplit: 14 }];

        await InventoryExportService.addCompanyHeader(workbook, worksheet, 10);

        // ============================================================
        // 2. REPORT METADATA
        // ============================================================
        const isMovementReport = data.length > 0 && data[0].opening !== undefined;

        // Dynamic headers per tab — v2.0 Professional Layout
        const dynamicHeaders = {
            'accessory': ['STT', 'Mã phụ kiện', 'Tên phụ kiện', 'Danh mục', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Đơn giá', 'Tổng giá trị'],
            'other':     ['STT', 'Mã vật tư', 'Tên vật tư', 'Danh mục', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Đơn giá', 'Tổng giá trị'],
            'aluminum':  ['STT', 'Mã cây', 'Hệ', 'Tên thanh nhôm', 'Màu sắc', 'Tỉ trọng thô', 'Mét dài(m)', 'SL(thanh)', 'Tổng số mét dài(m)', 'Tổng khối lượng(Kg)', 'Min', 'Max', 'Cần nhập', 'Đơn giá', 'Tổng giá trị'],
            'glass':     ['STT', 'Mã kính', 'Tên kính', 'Nhà cung cấp', 'Đơn vị', 'Tồn kho', 'Min', 'Max', 'Cần nhập', 'Đơn giá', 'Tổng giá trị'],
            'scraps':    ['STT', 'Mã Đề C', 'Tên thanh nhôm', 'Chiều dài (cm)', 'Trạng thái', 'Ngày tạo']
        };

        const reportHeaders = isMovementReport
            ? ['STT', 'Mã vật tư', 'Tên', 'Đơn vị tính', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối', 'Giá', 'Tổng giá trị']
            : (dynamicHeaders[itemType] || dynamicHeaders['other']);
        const maxCols = reportHeaders.length;

        // Title Row (Row 6)
        if (options.title) {
            const titleRow = 6;
            const titleCell = worksheet.getCell(`A${titleRow}`);
            titleCell.value = options.title.toUpperCase();
            titleCell.font = { bold: true, size: 20, color: { argb: 'FF000000' }, name: 'Times New Roman' };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Merge across all columns
            const lastCol = maxCols <= 26 ? String.fromCharCode(64 + maxCols) : 'O';
            try { worksheet.mergeCells(`A${titleRow}:${lastCol}${titleRow}`); } catch (e) { }
            worksheet.getRow(titleRow).height = 45;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN');
        const timeStr = now.toLocaleTimeString('vi-VN');

        if (isMovementReport) {
            const { fromDateStr, toDateStr } = options;
            worksheet.getCell('A8').value = `Ngày xuất: ${dateStr}`;
            worksheet.getCell('A9').value = `Từ ngày: ${fromDateStr || '-'}`;
            worksheet.getCell('A10').value = `Đến ngày: ${toDateStr || '-'}`;
            worksheet.getCell('A11').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;
            worksheet.getCell('A12').value = `Tổng số mặt hàng: ${data.length}`;

            [8, 9, 10, 11, 12].forEach(r => {
                const row = worksheet.getRow(r);
                row.height = 20;
                row.getCell(1).font = { italic: true, size: 11, name: 'Times New Roman' };
            });
        } else {
            worksheet.getCell('A8').value = `Ngày xuất: ${dateStr}`;
            worksheet.getCell('A9').value = `Thời gian: ${timeStr}`;
            worksheet.getCell('A10').value = `Người thực hiện: ${options.generatedBy || 'Admin'}`;
            worksheet.getCell('A11').value = `Tổng số mặt hàng: ${data.length}`;

            [8, 9, 10, 11].forEach(r => {
                const row = worksheet.getRow(r);
                row.height = 20;
                row.getCell(1).font = { italic: true, size: 11, name: 'Times New Roman' };
            });
            // Bold for total items count
            worksheet.getRow(11).getCell(1).font = { bold: true, italic: true, size: 11, name: 'Times New Roman', color: { argb: 'FF0070C0' } };
        }

        // ============================================================
        // 3. TABLE HEADERS (Row 14)
        // ============================================================
        let currentRowIndex = 15;
        const headerRow = worksheet.getRow(14);
        headerRow.height = 35;

        reportHeaders.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' }, name: 'Times New Roman' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D70B3' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'medium', color: { argb: 'FF000000' } },
                left: { style: 'thin' },
                bottom: { style: 'medium', color: { argb: 'FF000000' } },
                right: { style: 'thin' }
            };
        });

        // Movement report column widths
        if (isMovementReport) {
            worksheet.columns = [
                { key: 'stt', width: 6 }, { key: 'code', width: 15 }, { key: 'name', width: 35 },
                { key: 'unit', width: 12 }, { key: 'opening', width: 12 }, { key: 'in', width: 12 },
                { key: 'out', width: 12 }, { key: 'closing', width: 12 }, { key: 'price', width: 15 },
                { key: 'totalValue', width: 18 }
            ];
        }

        // ============================================================
        // 4. DATA ROWS (Row 15+)
        // ============================================================
        data.forEach((item, index) => {
            const row = worksheet.getRow(currentRowIndex);
            row.height = 25;
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
                // 15 columns — unchanged layout
                const stock = Number(item.stock) || 0;
                const lengthM = Number(item.length_m) || 0;
                const density = Number(item.density) || 0;
                const min = Number(item.min) || 0;
                const max = Number(item.max) || 0;
                const price = Number(item.price) || 0;

                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.aluminum_system || '';
                row.getCell(4).value = item.name || '';
                row.getCell(5).value = item.color || '';
                row.getCell(6).value = density;
                row.getCell(7).value = lengthM;
                row.getCell(8).value = stock;
                row.getCell(9).value = stock * lengthM;
                row.getCell(10).value = stock * lengthM * density;
                row.getCell(11).value = min;
                row.getCell(12).value = max;
                row.getCell(13).value = max > stock ? (max - stock) : 0;
                row.getCell(14).value = price;
                row.getCell(15).value = stock * price;

            } else if (itemType === 'glass') {
                // 11 columns — NCC + Đơn vị + Min/Max (nhất quán với các tab khác)
                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.name || '';
                row.getCell(4).value = item.supplier_name || '';
                row.getCell(5).value = item.unit || 'Tấm';
                row.getCell(6).value = Number(item.stock) || 0;
                row.getCell(7).value = Number(item.min) || 0;
                row.getCell(8).value = Number(item.max) || 0;
                row.getCell(9).value = Number(item.restock) || 0;
                row.getCell(10).value = Number(item.price) || 0;
                row.getCell(11).value = Number(item.totalValue) || 0;

            } else if (itemType === 'scraps') {
                // 6 columns — layout riêng cho Nhôm Đề C
                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.name || '';
                row.getCell(4).value = Number(item.length_cm) || 0;
                row.getCell(5).value = item.status_label || '';
                row.getCell(6).value = item.created_date || '';

            } else {
                // accessory / other — 11 columns với Danh mục
                row.getCell(2).value = item.code || '';
                row.getCell(3).value = item.name || '';
                row.getCell(4).value = item.category || '';
                row.getCell(5).value = item.unit || '';
                row.getCell(6).value = Number(item.stock) || 0;
                row.getCell(7).value = Number(item.min) || 0;
                row.getCell(8).value = Number(item.max) || 0;
                row.getCell(9).value = Number(item.restock) || 0;
                row.getCell(10).value = Number(item.price) || 0;
                row.getCell(11).value = Number(item.totalValue) || 0;
            }

            // ============================================================
            // 4.1 STYLING: Borders, zebra striping, number formats
            // ============================================================
            const isEvenRow = index % 2 === 1;
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= maxCols) {
                    cell.font = { size: 11, name: 'Times New Roman' };
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    // Zebra Striping
                    if (isEvenRow) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }

                    // Default: left-aligned text, middle vertical
                    cell.alignment = { vertical: 'middle' };

                    // STT = center
                    if (colNumber === 1) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }

                    // Number formatting per itemType
                    if (itemType === 'aluminum') {
                        // Cols 6,7 (Tỉ trọng, Mét dài) = decimal
                        if (colNumber === 6 || colNumber === 7) {
                            cell.numFmt = '#,##0.00';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                        // Cols 8-13 (SL, Tổng m, Tổng kg, Min, Max, Cần nhập) = integer
                        if (colNumber >= 8 && colNumber <= 13) {
                            cell.numFmt = '#,##0';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                        // Cols 14-15 (Đơn giá, Tổng giá trị) = VND no decimal
                        if (colNumber >= 14) {
                            cell.numFmt = '#,##0';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                        // Col 5 (Màu sắc) = center
                        if (colNumber === 5) {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }
                    } else if (itemType === 'scraps') {
                        // Col 4 (Chiều dài cm) = 1 decimal
                        if (colNumber === 4) {
                            cell.numFmt = '#,##0.0';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                        // Col 5 (Trạng thái) = center
                        if (colNumber === 5) {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }
                        // Col 6 (Ngày tạo) = center
                        if (colNumber === 6) {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }
                    } else {
                        // accessory / other / glass — 11 columns
                        // Col 5 (Đơn vị) = center
                        if (colNumber === 5) {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        }
                        // Cols 6-9 (Tồn kho, Min, Max, Cần nhập) = integer, right
                        if (colNumber >= 6 && colNumber <= 9) {
                            cell.numFmt = '#,##0';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                        // Cols 10-11 (Đơn giá, Tổng giá trị) = VND no decimal
                        if (colNumber >= 10 && colNumber <= 11) {
                            cell.numFmt = '#,##0';
                            cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        }
                    }
                }
            });
            currentRowIndex++;
        });

        // ============================================================
        // 5. AUTO-FIT COLUMNS
        // ============================================================
        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) maxLength = columnLength;
            });
            column.width = Math.min(Math.max(maxLength + 5, 12), 50);
        });

        // ============================================================
        // 6. TOTALS ROW
        // ============================================================
        const totalRow = worksheet.getRow(currentRowIndex);
        totalRow.getCell(3).value = 'Tổng cộng:';
        totalRow.getCell(3).font = { bold: true, size: 11, name: 'Times New Roman' };
        totalRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };

        if (isMovementReport) {
            [5, 6, 7, 8, 10].forEach(col => {
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
                cell.font = { bold: true, size: 11, name: 'Times New Roman' };
                cell.numFmt = '#,##0';
                cell.alignment = { horizontal: 'right' };
            });

        } else if (itemType === 'aluminum') {
            [8, 9, 10, 15].forEach(col => {
                let sum = 0;
                data.forEach(item => {
                    const stock = Number(item.stock) || 0;
                    const lengthM = Number(item.length_m) || 0;
                    const density = Number(item.density) || 0;
                    const price = Number(item.price) || 0;
                    if (col === 8) sum += stock;
                    if (col === 9) sum += stock * lengthM;
                    if (col === 10) sum += stock * lengthM * density;
                    if (col === 15) sum += stock * price;
                });
                const cell = totalRow.getCell(col);
                cell.value = sum;
                cell.font = { bold: true, size: 11, name: 'Times New Roman' };
                cell.numFmt = (col === 8) ? '#,##0' : '#,##0.00';
                cell.alignment = { horizontal: 'right' };
            });

        } else if (itemType === 'scraps') {
            // Scraps: Tổng chiều dài (cm) at col 4
            const totalLength = data.reduce((acc, curr) => acc + (Number(curr.length_cm) || 0), 0);
            const cell4 = totalRow.getCell(4);
            cell4.value = totalLength;
            cell4.font = { bold: true, size: 11, name: 'Times New Roman' };
            cell4.numFmt = '#,##0.0';
            cell4.alignment = { horizontal: 'right' };

        } else {
            // accessory / other / glass — 11 columns
            const totalStock = data.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
            const totalRestock = data.reduce((acc, curr) => acc + (Number(curr.restock) || 0), 0);
            const totalValue = data.reduce((acc, curr) => acc + (Number(curr.totalValue) || 0), 0);

            totalRow.getCell(6).value = totalStock;
            totalRow.getCell(6).numFmt = '#,##0';
            totalRow.getCell(9).value = totalRestock;
            totalRow.getCell(9).numFmt = '#,##0';
            totalRow.getCell(11).value = totalValue;
            totalRow.getCell(11).numFmt = '#,##0';

            [6, 9, 11].forEach(col => {
                const cell = totalRow.getCell(col);
                cell.font = { bold: true, size: 11, name: 'Times New Roman' };
                cell.alignment = { horizontal: 'right' };
            });
        }

        // Style totals row
        totalRow.eachCell((cell, colNumber) => {
            if (colNumber >= 3 && colNumber <= maxCols) {
                cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
                if (!cell.font) cell.font = { bold: true, size: 11, name: 'Times New Roman' };
                cell.alignment = cell.alignment || { vertical: 'middle' };
            }
        });
        totalRow.height = 30;

        // ============================================================
        // 7. SIGNATURES (3 rows after totals)
        // ============================================================
        currentRowIndex += 3;
        const footerColsArr = {
            'movement': [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 5, text: 'KẾ TOÁN' }, { col: 9, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'aluminum': [{ col: 4, text: 'NGƯỜI TẠO PHIẾU' }, { col: 9, text: 'KẾ TOÁN' }, { col: 14, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'scraps':   [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 4, text: 'KẾ TOÁN' }, { col: 6, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }],
            'default':  [{ col: 2, text: 'NGƯỜI TẠO PHIẾU' }, { col: 6, text: 'KẾ TOÁN' }, { col: 10, text: 'CÔNG TY CỔ PHẦN VIRALWINDOW' }]
        };
        const activeFooter = isMovementReport ? footerColsArr.movement : (footerColsArr[itemType] || footerColsArr.default);

        activeFooter.forEach(f => {
            const cell = worksheet.getRow(currentRowIndex).getCell(f.col);
            cell.value = f.text;
            cell.font = { bold: true, size: 11, name: 'Times New Roman' };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        return await workbook.xlsx.writeBuffer();
    }

    /**
     * Thêm thông tin công ty vào đầu sheet (Rows 1-4)
     */
    static async addCompanyHeader(workbook, sheet, maxColumn) {
        // Row 1: Tên công ty
        const nameCell = sheet.getCell('A1');
        nameCell.value = 'CÔNG TY CỔ PHẦN VIRALWINDOW';
        nameCell.font = { bold: true, size: 14, color: { argb: 'FF0070C0' }, name: 'Times New Roman' };
        nameCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // Row 2: Nhà máy
        const factoryCell = sheet.getCell('A2');
        factoryCell.value = 'Nhà máy: KM 03, Đường Cienco5, KĐT Thanh Hà, Hà Đông, Hà Nội';
        factoryCell.font = { size: 11, name: 'Times New Roman' };
        factoryCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // Row 3: Hotline
        const hotlineCell = sheet.getCell('A3');
        hotlineCell.value = 'Hotline: 1800 282839';
        hotlineCell.font = { size: 11, name: 'Times New Roman' };
        hotlineCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // Row 4: Email
        const emailCell = sheet.getCell('A4');
        emailCell.value = 'Email: viralwindow.vn@gmail.com';
        emailCell.font = { size: 11, name: 'Times New Roman' };
        emailCell.alignment = { horizontal: 'left', vertical: 'middle' };

        [1, 2, 3, 4].forEach(r => { sheet.getRow(r).height = 25; });
    }
}

module.exports = InventoryExportService;
