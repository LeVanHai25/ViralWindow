const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Service to handle professional Excel export for individual stock documents (Slips)
 * Refined to ensure high "WOW" factor and dynamic data injection.
 */
class StockDocumentExportService {
    constructor() {
        // Use the professional report template as base for consistency in branding
        this.templatePath = path.join(__dirname, '../templates/accessory_report_template.xlsx');
        this.logoPath = path.join(__dirname, '../assets/LogoViralWindow.png');
    }

    /**
     * Export a single document to professional template
     */
    async exportSingleDocument(doc, lines) {
        const workbook = new ExcelJS.Workbook();

        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template not found at: ${this.templatePath}`);
        }

        await workbook.xlsx.readFile(this.templatePath);

        // 1. Ensure only ONE sheet exists and it is clean
        while (workbook.worksheets.length > 1) {
            workbook.removeWorksheet(workbook.worksheets[1].id);
        }
        const worksheet = workbook.getWorksheet(1);
        worksheet.name = doc.doc_no || 'Phieu';

        // Clear all rows from 6 downwards to remove static template data
        for (let i = 6; i <= 200; i++) {
            const row = worksheet.getRow(i);
            row.values = [];
            row.eachCell(cell => { cell.style = {}; }); // Clear style
        }

        // 2. Inject Professional Logo
        try {
            if (fs.existsSync(this.logoPath)) {
                const logo = workbook.addImage({
                    filename: this.logoPath,
                    extension: 'png',
                });
                worksheet.addImage(logo, {
                    tl: { col: 0, row: 0 },
                    ext: { width: 120, height: 60 }
                });
            }
        } catch (logoErr) {
            console.warn('Could not add logo to slip:', logoErr.message);
        }

        // 3. Header Styling (Company info usually handled by template Rows 1-5)

        // 4. Dynamic Title (Row 6)
        const docTypeLabels = {
            'import': 'PHIẾU NHẬP KHO',
            'export': 'PHIẾU XUẤT KHO',
            'stocktake': 'PHIẾU KIỂM KHO',
            'adjust': 'PHIẾU ĐIỀU CHỈNH'
        };
        const titleCell = worksheet.getCell('A6');
        titleCell.value = docTypeLabels[doc.doc_type] || 'PHIẾU KHO';
        titleCell.font = { bold: true, size: 18, color: { argb: 'FF007B5E' } };
        try { worksheet.mergeCells('A6:H6'); } catch (e) { }
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(6).height = 30;

        // Date & Doc No (Row 7)
        const date = doc.created_at ? new Date(doc.created_at) : new Date();
        const dateStr = date.toLocaleDateString('vi-VN');
        const docNoCell = worksheet.getCell('A7');
        docNoCell.value = `Số: ${doc.doc_no || '-'} | Ngày: ${dateStr}`;
        docNoCell.font = { italic: true };
        try { worksheet.mergeCells('A7:H7'); } catch (e) { }
        docNoCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(7).height = 20;

        // Partner Info (Rows 8-9)
        let partnerText = '';
        if (doc.doc_type === 'import') {
            partnerText = `Nhà cung cấp: ${doc.supplier_name || doc.partner_name || '-'}`;
        } else if (doc.doc_type === 'export') {
            partnerText = `Dự án: ${doc.project_name || doc.customer_name || '-'}`;
        } else {
            partnerText = `Người thực hiện: ${doc.created_by_name || '-'}`;
        }

        const partnerCell = worksheet.getCell('A8');
        partnerCell.value = partnerText;
        partnerCell.font = { bold: true };
        try { worksheet.mergeCells('A8:H8'); } catch (e) { }
        partnerCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(8).height = 20;

        const noteCell = worksheet.getCell('A9');
        noteCell.value = `Ghi chú: ${doc.note || '-'}`;
        try { worksheet.mergeCells('A9:H9'); } catch (e) { }
        noteCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(9).height = 20;

        // 5. Table Headers (Row 11)
        const isStocktake = doc.doc_type === 'stocktake';
        const headers = isStocktake
            ? ['STT', 'Mã vật tư', 'Tên vật tư', 'ĐVT', 'Tồn sổ sách', 'Thực tế', 'Chênh lệch', 'Ghi chú']
            : ['STT', 'Mã vật tư', 'Tên vật tư', 'ĐVT', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ghi chú'];

        const headerRow = worksheet.getRow(11);
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007B5E' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        headerRow.height = 25;

        // 6. Data Injection (Row 12+)
        let currentRowIndex = 12;
        lines.forEach((line, index) => {
            const row = worksheet.getRow(currentRowIndex);

            row.getCell(1).value = index + 1;
            row.getCell(2).value = line.item_code || '-';
            row.getCell(3).value = line.item_name || '-';
            row.getCell(4).value = line.unit || '-';

            if (isStocktake) {
                row.getCell(5).value = parseFloat(line.qty_system) || 0;
                row.getCell(6).value = parseFloat(line.qty) || 0;
                row.getCell(7).value = (parseFloat(line.qty) || 0) - (parseFloat(line.qty_system) || 0);
                row.getCell(8).value = line.note || '';
            } else {
                row.getCell(5).value = parseFloat(line.qty) || 0;
                row.getCell(6).value = parseFloat(line.unit_price) || 0;
                row.getCell(7).value = (parseFloat(line.qty) || 0) * (parseFloat(line.unit_price) || 0);
                row.getCell(8).value = line.note || '';
            }

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= 8) {
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    if (colNumber >= 5 && colNumber <= 7) {
                        cell.numFmt = '#,##0';
                        cell.alignment = { horizontal: 'right' };
                    }
                }
            });
            currentRowIndex++;
        });

        // 7. Totals Row
        const totalRow = worksheet.getRow(currentRowIndex);
        totalRow.getCell(3).value = 'TỔNG CỘNG:';
        totalRow.getCell(3).font = { bold: true };

        if (isStocktake) {
            // Just count or specific totals if needed
        } else {
            const totalQty = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0), 0);
            const totalVal = lines.reduce((sum, l) => sum + ((parseFloat(l.qty) || 0) * (parseFloat(l.unit_price) || 0)), 0);
            totalRow.getCell(5).value = totalQty;
            totalRow.getCell(7).value = totalVal;
        }

        totalRow.eachCell((cell, col) => {
            if (col >= 3 && col <= 7) {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
                cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
            }
        });

        // 8. Signatures
        currentRowIndex += 2;
        const footerDate = `Hà Nội, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
        const dateFootCell = worksheet.getCell(`E${currentRowIndex}`);
        dateFootCell.value = footerDate;
        dateFootCell.font = { italic: true };
        dateFootCell.alignment = { horizontal: 'center' };
        try { worksheet.mergeCells(`E${currentRowIndex}:H${currentRowIndex}`); } catch (e) { }

        currentRowIndex++;
        const footers = [
            { col: 1, text: 'NGƯỜI LẬP' },
            { col: 3, text: 'KẾ TOÁN' },
            { col: 5, text: 'THỦ KHO' },
            { col: 7, text: 'NGƯỜI NHẬN' }
        ];
        footers.forEach(f => {
            const cell = worksheet.getRow(currentRowIndex).getCell(f.col);
            cell.value = f.text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        return await workbook.xlsx.writeBuffer();
    }
}

module.exports = new StockDocumentExportService();
