const ExcelJS = require('exceljs');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Format date to Vietnamese format
function formatDateVN(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Xuất Excel Phiếu Yêu Cầu Vật Tư
 */
exports.exportPurchaseRequest = async (req, res) => {
    try {
        const { type, data } = req.body; // type: 'nhom', 'vattu', 'phukien', 'kinh'

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu để xuất'
            });
        }

        // Get project info from request body
        const projectInfo = req.body.projectInfo || {};

        // Tạo workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PHIẾU YÊU CẦU VẬT TƯ');

        // Set column widths based on type
        if (type === 'nhom') {
            worksheet.columns = [
                { width: 6 },   // A - TT
                { width: 35 },  // B - Tên vật tư
                { width: 15 },  // C - Mã vật tư
                { width: 12 },  // D - Tỷ trọng
                { width: 12 },  // E - Mét (M)
                { width: 10 },  // F - Đơn vị
                { width: 12 },  // G - Số lượng
                { width: 15 },  // H - Khối lượng
                { width: 30 }   // I - Ghi chú
            ];
        } else if (type === 'vattu' || type === 'phukien') {
            worksheet.columns = [
                { width: 6 },   // A - TT
                { width: 15 },  // B - Mã VT
                { width: 40 },  // C - Tên vật tư
                { width: 10 },  // D - Đơn vị
                { width: 12 }   // E - Số lượng
            ];
        } else if (type === 'kinh') {
            worksheet.columns = [
                { width: 6 },   // A - TT
                { width: 15 },  // B - Mã Kính
                { width: 30 },  // C - Loại kính
                { width: 12 },  // D - Chiều rộng
                { width: 12 },  // E - Chiều cao
                { width: 10 },  // F - ĐVT
                { width: 12 },  // G - Số tấm
                { width: 15 }   // H - Diện tích
            ];
        }

        let currentRow = 1;

        // Title
        const titles = {
            'nhom': 'PHIẾU YÊU CẦU VẬT TƯ- PHỤ KIỆN (NHÔM)',
            'vattu': 'PHIẾU YÊU CẦU VẬT TƯ',
            'phukien': 'PHIẾU YÊU CẦU VẬT TƯ- PHỤ KIỆN ĐI CÔNG TRÌNH',
            'kinh': 'PHIẾU YÊU CẦU VẬT TƯ KÍNH'
        };

        worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = `  ${titles[type] || 'PHIẾU YÊU CẦU VẬT TƯ'}`;
        titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        currentRow++;

        // Date
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = ` Ngày ..${day}..tháng ..${month}.. năm ${year}`;
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        // Project info
        worksheet.getCell(`A${currentRow}`).value = `Công trình : ${projectInfo.projectName || ''}`;
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = `Mã Đơn Hàng : ${projectInfo.orderCode || ''}`;
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = `Chủng loại phụ kiện : ${projectInfo.productType || ''}`;
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = `Màu sắc : ${projectInfo.color || ''}`;
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = `Địa chỉ giao hàng : ${projectInfo.deliveryAddress || ''}`;
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        currentRow++; // Empty row

        // Table header
        const headerRow = currentRow;
        const borderStyle = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };

        if (type === 'nhom') {
            const headers = ['TT', 'Tên vật tư', 'Mã vật tư', 'Tỷ trọng', 'Mét (M)', 'Đơn vị', 'Số lượng', 'Khối lượng', 'Ghi chú'];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(headerRow, idx + 1);
                cell.value = header;
                cell.font = { name: 'Times New Roman', size: 10, bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            });
        } else if (type === 'vattu' || type === 'phukien') {
            const headers = ['TT', 'Mã VT', 'Tên vật tư', 'Đơn vị', 'Số lượng'];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(headerRow, idx + 1);
                cell.value = header;
                cell.font = { name: 'Times New Roman', size: 10, bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            });
        } else if (type === 'kinh') {
            const headers = ['TT', 'Mã Kính', 'Loại kính', 'Chiều rộng', 'Chiều cao', 'ĐVT', 'Số tấm', 'Diện tích'];
            headers.forEach((header, idx) => {
                const cell = worksheet.getCell(headerRow, idx + 1);
                cell.value = header;
                cell.font = { name: 'Times New Roman', size: 10, bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            });
        }

        worksheet.getRow(headerRow).height = 25;
        currentRow++;

        // Data rows
        let totalQty = 0;
        let totalWeight = 0;
        let totalPanels = 0;
        let totalArea = 0;

        data.forEach((item, index) => {
            const row = worksheet.getRow(currentRow);

            if (type === 'nhom') {
                row.getCell(1).value = index + 1; // TT
                row.getCell(2).value = item.name || ''; // Tên vật tư
                row.getCell(3).value = item.code || ''; // Mã vật tư
                row.getCell(4).value = item.density || 0; // Tỷ trọng
                row.getCell(5).value = item.length || 6; // Mét (M)
                row.getCell(6).value = item.unit || 'cây'; // Đơn vị
                row.getCell(7).value = item.quantity || 0; // Số lượng
                row.getCell(8).value = item.weight || 0; // Khối lượng
                row.getCell(9).value = item.note || ''; // Ghi chú

                totalQty += parseFloat(item.quantity) || 0;
                totalWeight += parseFloat(item.weight) || 0;
            } else if (type === 'vattu' || type === 'phukien') {
                row.getCell(1).value = index + 1; // TT
                row.getCell(2).value = item.code || ''; // Mã VT
                row.getCell(3).value = item.name || ''; // Tên vật tư
                row.getCell(4).value = item.unit || 'cái'; // Đơn vị
                row.getCell(5).value = item.quantity || 0; // Số lượng

                totalQty += parseFloat(item.quantity) || 0;
            } else if (type === 'kinh') {
                row.getCell(1).value = index + 1; // TT
                row.getCell(2).value = item.code || ''; // Mã Kính
                row.getCell(3).value = item.type || ''; // Loại kính
                row.getCell(4).value = item.width || 0; // Chiều rộng
                row.getCell(5).value = item.height || 0; // Chiều cao
                row.getCell(6).value = item.unit || 'tấm'; // ĐVT
                row.getCell(7).value = item.panels || 0; // Số tấm
                row.getCell(8).value = parseFloat(item.area || 0).toFixed(6); // Diện tích

                totalPanels += parseInt(item.panels) || 0;
                totalArea += parseFloat(item.area) || 0;
            }

            // Apply border to all cells in row
            const colCount = type === 'nhom' ? 9 : (type === 'kinh' ? 8 : 5);
            for (let col = 1; col <= colCount; col++) {
                const cell = row.getCell(col);
                cell.font = { name: 'Times New Roman', size: 10 };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: [1, 3, 4, 5, 6, 7, 8].includes(col) ? 'center' : 'left',
                    wrapText: true
                };
                cell.border = borderStyle;
            }

            row.height = 22;
            currentRow++;
        });

        // Total row
        const totalRow = currentRow;
        if (type === 'nhom') {
            worksheet.getCell(`B${totalRow}`).value = 'TỔNG CỘNG';
            worksheet.getCell(`B${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`G${totalRow}`).value = totalQty;
            worksheet.getCell(`G${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`H${totalRow}`).value = parseFloat(totalWeight.toFixed(2));
            worksheet.getCell(`H${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`H${totalRow}`).numFmt = '0.00';

            for (let col = 1; col <= 9; col++) {
                const cell = worksheet.getCell(totalRow, col);
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            }
        } else if (type === 'kinh') {
            worksheet.getCell(`B${totalRow}`).value = 'TỔNG';
            worksheet.getCell(`B${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`G${totalRow}`).value = totalPanels;
            worksheet.getCell(`G${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`H${totalRow}`).value = parseFloat(totalArea.toFixed(6));
            worksheet.getCell(`H${totalRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
            worksheet.getCell(`H${totalRow}`).numFmt = '0.000000';

            for (let col = 1; col <= 8; col++) {
                const cell = worksheet.getCell(totalRow, col);
                cell.border = borderStyle;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            }
        }

        currentRow += 2;

        // Date and location
        worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
        worksheet.getCell(`C${currentRow}`).value = `          Hà Nội, Ngày ${day} tháng ${month} năm ${year}`;
        worksheet.getCell(`C${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.getCell(`C${currentRow}`).alignment = { horizontal: 'center' };
        currentRow += 2;

        // Signature section
        const signatureRow1 = currentRow;
        const signatureRow2 = currentRow + 1;

        const signatures = [' Người lập', 'Kiểm tra', 'Kế toán', 'Vật tư', 'Người nhận', 'Duyệt'];
        const signatureLabels = ['  (Ký, họ tên)', '  (Ký, họ tên)', '  (Ký, họ tên)', '  (Ký, họ tên)', '  (Ký, họ tên)', '  (Ký, họ tên)'];

        signatures.forEach((sig, idx) => {
            const cell1 = worksheet.getCell(signatureRow1, idx + 1);
            cell1.value = sig;
            cell1.font = { name: 'Times New Roman', size: 11, bold: true };
            cell1.alignment = { horizontal: 'center', vertical: 'middle' };

            const cell2 = worksheet.getCell(signatureRow2, idx + 1);
            cell2.value = signatureLabels[idx];
            cell2.font = { name: 'Times New Roman', size: 10 };
            cell2.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Send file
        const buffer = await workbook.xlsx.writeBuffer();
        const typeNames = {
            'nhom': 'NHOM',
            'vattu': 'VTP',
            'phukien': 'PK',
            'kinh': 'KINH'
        };
        const filename = `Phieu_Yeu_Cau_${typeNames[type]}_${projectInfo.projectName || 'Công trình'}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.send(buffer);

    } catch (error) {
        console.error('Error exporting purchase request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất Excel: ' + error.message
        });
    }
};





