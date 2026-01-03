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
 * Tạo header chung cho Excel (logo, thông tin công ty)
 */
function addCompanyHeader(worksheet, workbook) {
    // Đường dẫn logo - thử nhiều vị trí
    let logoPath = path.join(__dirname, '..', 'assets', 'LogoViralWindow.png');
    if (!fs.existsSync(logoPath)) {
        logoPath = path.join(__dirname, '../../Tài liệu/LogoViralWindow.png');
    }
    let logoId = null;

    // Thêm logo nếu file tồn tại
    if (fs.existsSync(logoPath)) {
        try {
            logoId = workbook.addImage({
                filename: logoPath,
                extension: 'png',
            });
        } catch (err) {
            console.log('Không thể thêm logo:', err.message);
        }
    }

    // Row 1: CÔNG TY CỔ PHẦN VIRALWINDOW
    worksheet.mergeCells('A1:E1');
    const companyNameCell = worksheet.getCell('A1');
    companyNameCell.value = 'CÔNG TY CỔ PHẦN VIRALWINDOW';
    companyNameCell.font = { name: 'Times New Roman', size: 14, bold: true };
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Row 2: Nhà máy
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = 'Nhà máy: KM 03, Đường Cienco5, KĐT Thanh Hà, Hà Đông, Hà Nội';
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 10 };

    // Row 3: Hotline
    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = 'Hotline: 1800 282839';
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 10 };

    // Row 4: Email
    worksheet.mergeCells('A4:E4');
    worksheet.getCell('A4').value = 'Email: viralwindow.vn@gmail.com';
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 10 };

    // Row 5: Website
    worksheet.mergeCells('A5:E5');
    worksheet.getCell('A5').value = 'Website: viralwindow.vn';
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 10 };

    // Logo (bên phải)
    if (logoId !== null) {
        worksheet.addImage(logoId, {
            tl: { col: 7, row: 0 },
            ext: { width: 180, height: 100 },
            editAs: 'oneCell'
        });
    }

    return 7; // Return next row number
}

/**
 * Xuất Excel Bóc tách Nhôm
 */
exports.exportAluminumBreakdown = async (req, res) => {
    res.status(501).json({ success: false, message: 'Function not implemented yet' });
};

/**
 * Xuất Excel Bóc tách Kính
 */
exports.exportGlassBreakdown = async (req, res) => {
    res.status(501).json({ success: false, message: 'Function not implemented yet' });
};

/**
 * Xuất Excel Bóc tách Phụ kiện
 */
exports.exportAccessoriesBreakdown = async (req, res) => {
    res.status(501).json({ success: false, message: 'Function not implemented yet' });
};

/**
 * Xuất Excel Bóc tách Tổng hợp
 */
exports.exportCombinedBreakdown = async (req, res) => {
    res.status(501).json({ success: false, message: 'Function not implemented yet' });
};

/**
 * Xuất Excel Danh sách sản phẩm
 */
exports.exportProductList = async (req, res) => {
    res.status(501).json({ success: false, message: 'Function not implemented yet' });
};

/**
 * Xuất Excel Phiếu Yêu Cầu Vật Tư
 */
exports.exportMaterialRequest = async (req, res) => {
    try {
        const { projectId, category, title, orderCode, createdDate, requiredDate, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu vật tư để xuất'
            });
        }

        // Get project info
        const [projects] = await db.query(
            `SELECT p.*, c.full_name AS customer_name, c.address AS customer_address 
             FROM projects p 
             LEFT JOIN customers c ON p.customer_id = c.id 
             WHERE p.id = ?`,
            [projectId]
        );
        const project = projects[0] || {};

        // Tạo workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Phiếu Yêu Cầu Vật Tư');

        // Set column widths
        worksheet.columns = [
            { width: 6 },   // A - STT
            { width: 15 },  // B - Mã VT
            { width: 40 },  // C - Tên vật tư
            { width: 10 },  // D - ĐVT
            { width: 15 },  // E - Số lượng thiếu
            { width: 15 },  // F - Số lượng yêu cầu
            { width: 30 }   // G - Ghi chú
        ];

        let currentRow = addCompanyHeader(worksheet, workbook);

        // Title
        worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = title || 'PHIẾU YÊU CẦU VẬT TƯ';
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell.font = { name: 'Times New Roman', size: 16, bold: true };
        worksheet.getRow(currentRow).height = 30;
        currentRow += 2;

        // Project info
        worksheet.getCell(`A${currentRow}`).value = 'Dự án:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = project.project_name || '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Khách hàng:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = project.customer_name || '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Địa điểm:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = project.location || project.address || '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        // Request info
        worksheet.getCell(`A${currentRow}`).value = 'Mã đơn hàng:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = orderCode || '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Ngày tạo phiếu:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = createdDate ? formatDateVN(createdDate) : '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = 'Ngày vật tư cần về:';
        worksheet.getCell(`A${currentRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.mergeCells(`B${currentRow}:D${currentRow}`);
        worksheet.getCell(`B${currentRow}`).value = requiredDate ? formatDateVN(requiredDate) : '';
        worksheet.getCell(`B${currentRow}`).font = { name: 'Times New Roman', size: 11 };
        currentRow += 2;

        // Header row
        const headerRow = currentRow;
        const headers = ['STT', 'Mã VT', 'Tên vật tư', 'ĐVT', 'Số lượng thiếu', 'Số lượng yêu cầu', 'Ghi chú'];
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(headerRow, index + 1);
            cell.value = header;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C7E7' } };
            cell.font = { name: 'Times New Roman', size: 10, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        worksheet.getRow(headerRow).height = 25;
        currentRow++;

        // Data rows
        let totalShortage = 0;
        let totalRequest = 0;
        items.forEach((item, index) => {
            const row = currentRow;
            const shortage = parseFloat(item.shortage || 0);
            const requestQty = parseFloat(item.requestQty || item.shortage || 0);
            totalShortage += shortage;
            totalRequest += requestQty;

            worksheet.getCell(row, 1).value = index + 1; // STT
            worksheet.getCell(row, 2).value = item.code || ''; // Mã VT
            worksheet.getCell(row, 3).value = item.name || ''; // Tên vật tư
            worksheet.getCell(row, 4).value = item.unit || ''; // ĐVT
            worksheet.getCell(row, 5).value = shortage; // Số lượng thiếu
            worksheet.getCell(row, 6).value = requestQty; // Số lượng yêu cầu
            worksheet.getCell(row, 7).value = item.notes || ''; // Ghi chú

            // Style cells
            for (let col = 1; col <= 7; col++) {
                const cell = worksheet.getCell(row, col);
                cell.font = { name: 'Times New Roman', size: 10 };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: [1, 4, 5, 6].includes(col) ? 'center' : 'left',
                    wrapText: true
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                if (col === 5 || col === 6) {
                    cell.numFmt = '0.00';
                }
            }
            worksheet.getRow(row).height = 22;
            currentRow++;
        });

        // Footer row - TỔNG CỘNG
        const footerRow = currentRow;
        worksheet.mergeCells(`A${footerRow}:D${footerRow}`);
        worksheet.getCell(`A${footerRow}`).value = 'TỔNG CỘNG:';
        worksheet.getCell(`A${footerRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.getCell(`A${footerRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getCell(`E${footerRow}`).value = totalShortage;
        worksheet.getCell(`E${footerRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.getCell(`E${footerRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`E${footerRow}`).numFmt = '0.00';
        worksheet.getCell(`F${footerRow}`).value = totalRequest;
        worksheet.getCell(`F${footerRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.getCell(`F${footerRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`F${footerRow}`).numFmt = '0.00';
        worksheet.getCell(`G${footerRow}`).value = `${items.length} loại`;
        worksheet.getCell(`G${footerRow}`).font = { name: 'Times New Roman', size: 11, bold: true };
        worksheet.getCell(`G${footerRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

        // Style footer
        for (let col = 1; col <= 7; col++) {
            const cell = worksheet.getCell(footerRow, col);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C7E7' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
        worksheet.getRow(footerRow).height = 25;

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers
        const projectName = (project.project_name || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
        const categoryLabel = (title || 'MaterialRequest').replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${categoryLabel}_${projectName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting material request Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất Excel: ' + error.message
        });
    }
};
