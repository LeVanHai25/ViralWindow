const db = require("../config/db");
const ExcelJS = require("exceljs");

/**
 * Controller xuất Excel cho Phiếu Yêu Cầu Vật Tư
 * Template theo mẫu CT-Mr Mậu Yên Nghĩa.xlsx
 */

// GET /api/material-requests/:id/export-excel
exports.exportExcel = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin phiếu yêu cầu
        const [rows] = await db.query(
            `SELECT pr.*, 
                    u.full_name as created_by_name,
                    p.project_code, p.project_name as project_name_full,
                    p.construction_address as project_address,
                    c.full_name as customer_name, 
                    c.phone as customer_phone,
                    c.address as customer_address
             FROM purchase_requests pr
             LEFT JOIN users u ON pr.created_by = u.id
             LEFT JOIN projects p ON pr.project_id = p.id
             LEFT JOIN customers c ON p.customer_id = c.id
             WHERE pr.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy phiếu yêu cầu" 
            });
        }

        const request = rows[0];

        // Parse JSON data
        let nhomItems = [];
        let kinhItems = [];
        let phukienItems = [];
        let vattuItems = [];

        try {
            if (request.nhom_data) {
                nhomItems = typeof request.nhom_data === 'string' 
                    ? JSON.parse(request.nhom_data) 
                    : request.nhom_data;
            }
            if (request.kinh_data) {
                kinhItems = typeof request.kinh_data === 'string' 
                    ? JSON.parse(request.kinh_data) 
                    : request.kinh_data;
            }
            if (request.phukien_data) {
                phukienItems = typeof request.phukien_data === 'string' 
                    ? JSON.parse(request.phukien_data) 
                    : request.phukien_data;
            }
            if (request.vattu_data) {
                vattuItems = typeof request.vattu_data === 'string' 
                    ? JSON.parse(request.vattu_data) 
                    : request.vattu_data;
            }
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
        }

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow System';
        workbook.created = new Date();

        // Xác định loại phiếu để tạo sheet phù hợp
        const hasNhom = nhomItems && nhomItems.length > 0;
        const hasKinh = kinhItems && kinhItems.length > 0;
        const hasPhukien = phukienItems && phukienItems.length > 0;
        const hasVattu = vattuItems && vattuItems.length > 0;

        // Tạo sheet riêng cho từng loại nếu có dữ liệu
        if (hasNhom) {
            const nhomSheet = workbook.addWorksheet('NHÔM');
            await createNhomSheet(nhomSheet, request, nhomItems);
        }

        if (hasVattu) {
            const vattuSheet = workbook.addWorksheet('VẬT TƯ PHỤ');
            await createVattuPhukienSheet(vattuSheet, request, vattuItems);
        }

        if (hasPhukien) {
            const phukienSheet = workbook.addWorksheet('PHỤ KIỆN');
            await createVattuPhukienSheet(phukienSheet, request, phukienItems);
        }

        if (hasKinh) {
            const kinhSheet = workbook.addWorksheet('KÍNH');
            await createKinhSheet(kinhSheet, request, kinhItems);
        }

        // Set response headers
        const filename = `Phieu_Yeu_Cau_${request.request_code || id}_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('Error exporting Excel:', err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi khi xuất Excel: " + err.message 
        });
    }
};

// Format ngày theo mẫu: "Ngày ..DD..tháng ..MM.. năm YYYY"
// Luôn sử dụng ngày hiện tại theo múi giờ Việt Nam (GMT+7)
function formatDateTemplate() {
    // Tạo ngày hiện tại theo múi giờ Việt Nam
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    const day = vietnamTime.getDate();
    const month = vietnamTime.getMonth() + 1;
    const year = vietnamTime.getFullYear();
    
    return `Ngày ..${day}..tháng ..${month}.. năm ${year}`;
}

// =====================================================
// SHEET NHÔM - Theo mẫu hình 2
// =====================================================
async function createNhomSheet(sheet, request, items) {
    // Set column widths
    sheet.columns = [
        { width: 6 },   // A - TT
        { width: 30 },  // B - Tên vật tư
        { width: 15 },  // C - Mã vật tư
        { width: 12 },  // D - Tỷ trọng
        { width: 10 },  // E - Đơn vị
        { width: 12 },  // F - Số lượng
        { width: 12 },  // G - Khối lượng
        { width: 25 },  // H - Ghi chú
    ];

    // Row 1: Title
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'PHIẾU YÊU CẦU VẬT TƯ NHÔM';
    titleCell.font = { bold: true, size: 16, name: 'Times New Roman' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    // Row 2: Date - Luôn lấy ngày hiện tại khi xuất phiếu
    sheet.mergeCells('A2:H2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = formatDateTemplate();
    dateCell.font = { size: 12, italic: true, name: 'Times New Roman' };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Công trình
    sheet.getCell('A3').value = 'Công trình :';
    sheet.getCell('A3').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B3:H3');
    sheet.getCell('B3').value = request.project_name_full || request.project_name || '';
    sheet.getCell('B3').font = { size: 11, name: 'Times New Roman' };

    // Row 4: Mã Đơn Hàng
    sheet.getCell('A4').value = 'Mã Đơn Hàng :';
    sheet.getCell('A4').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B4:H4');
    sheet.getCell('B4').value = request.order_code || '';
    sheet.getCell('B4').font = { size: 11, name: 'Times New Roman' };

    // Row 5: Chủng loại phụ kiện
    sheet.getCell('A5').value = 'Chủng loại phụ kiện :';
    sheet.getCell('A5').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B5:H5');
    sheet.getCell('B5').value = request.product_type || 'Viralwindow';
    sheet.getCell('B5').font = { size: 11, name: 'Times New Roman' };

    // Row 6: Màu sắc (highlight vàng)
    sheet.getCell('A6').value = 'Màu sắc :';
    sheet.getCell('A6').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    sheet.mergeCells('B6:H6');
    sheet.getCell('B6').value = request.color || '';
    sheet.getCell('B6').font = { size: 11, name: 'Times New Roman' };
    sheet.getCell('B6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };

    // Row 7: Địa chỉ giao hàng
    sheet.getCell('A7').value = 'Địa chỉ giao hàng :';
    sheet.getCell('A7').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B7:H7');
    sheet.getCell('B7').value = request.delivery_address || '';
    sheet.getCell('B7').font = { size: 11, name: 'Times New Roman' };

    // Row 8: Empty row
    let currentRow = 9;

    // Header bảng - Theo mẫu NHÔM: TT | Tên vật tư | Mã vật tư | Tỷ trọng | Đơn vị | Số lượng | Khối lượng | Ghi chú
    const headers = ['TT', 'Tên vật tư', 'Mã vật tư', 'Tỷ trọng', 'Đơn vị', 'Số lượng', 'Khối lượng', 'Ghi chú'];
    headers.forEach((header, i) => {
        const cell = sheet.getCell(currentRow, i + 1);
        cell.value = header;
        cell.font = { bold: true, size: 11, name: 'Times New Roman' };
        cell.border = { 
            top: { style: 'thin' }, 
            left: { style: 'thin' }, 
            bottom: { style: 'thin' }, 
            right: { style: 'thin' } 
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    sheet.getRow(currentRow).height = 30;
    currentRow++;

    // Dữ liệu
    items.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.name || '',
            item.code || '',
            item.density || '',
            item.unit || 'cây',
            item.quantity || 0,
            item.weight || '',
            item.note || item.notes || ''
        ];

        rowData.forEach((val, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = val;
            cell.font = { size: 11, name: 'Times New Roman' };
            cell.border = { 
                top: { style: 'thin' }, 
                left: { style: 'thin' }, 
                bottom: { style: 'thin' }, 
                right: { style: 'thin' } 
            };
            cell.alignment = { 
                horizontal: i === 0 || i >= 3 ? 'center' : 'left', 
                vertical: 'middle' 
            };
        });
        sheet.getRow(currentRow).height = 30;
        currentRow++;
    });
}

// =====================================================
// SHEET VẬT TƯ PHỤ / PHỤ KIỆN - Theo mẫu hình 3
// =====================================================
async function createVattuPhukienSheet(sheet, request, items) {
    // Set column widths
    sheet.columns = [
        { width: 6 },   // A - TT
        { width: 18 },  // B - Mã VT
        { width: 35 },  // C - Tên vật tư
        { width: 12 },  // D - Đơn vị
        { width: 12 },  // E - Số lượng
        { width: 25 },  // F - Xuất xưởng
    ];

    // Row 1: Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'PHIẾU YÊU CẦU VẬT TƯ- PHỤ KIỆN';
    titleCell.font = { bold: true, size: 16, name: 'Times New Roman' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    // Row 2: Date - Luôn lấy ngày hiện tại khi xuất phiếu
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = formatDateTemplate();
    dateCell.font = { size: 12, italic: true, name: 'Times New Roman' };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Công trình
    sheet.getCell('A3').value = 'Công trình :';
    sheet.getCell('A3').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B3:F3');
    sheet.getCell('B3').value = request.project_name_full || request.project_name || '';
    sheet.getCell('B3').font = { size: 11, name: 'Times New Roman' };

    // Row 4: Mã Đơn Hàng
    sheet.getCell('A4').value = 'Mã Đơn Hàng :';
    sheet.getCell('A4').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B4:F4');
    sheet.getCell('B4').value = request.order_code || '';
    sheet.getCell('B4').font = { size: 11, name: 'Times New Roman' };

    // Row 5: Chủng loại phụ kiện
    sheet.getCell('A5').value = 'Chủng loại phụ kiện :';
    sheet.getCell('A5').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B5:F5');
    sheet.getCell('B5').value = request.product_type || '';
    sheet.getCell('B5').font = { size: 11, name: 'Times New Roman' };

    // Row 6: Màu sắc
    sheet.getCell('A6').value = 'Màu sắc :';
    sheet.getCell('A6').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B6:F6');
    sheet.getCell('B6').value = request.color || '';
    sheet.getCell('B6').font = { size: 11, name: 'Times New Roman' };

    // Row 7: Địa chỉ giao hàng
    sheet.getCell('A7').value = 'Địa chỉ giao hàng :';
    sheet.getCell('A7').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B7:F7');
    sheet.getCell('B7').value = request.delivery_address || '';
    sheet.getCell('B7').font = { size: 11, name: 'Times New Roman' };

    // Row 8: Empty row
    let currentRow = 9;

    // Header bảng - Theo mẫu: TT | Mã VT | Tên vật tư | Đơn vị | Số lượng | Xuất xưởng
    const headers = ['TT', 'Mã VT', 'Tên vật tư', 'Đơn vị', 'Số lượng', 'Xuất xưởng'];
    headers.forEach((header, i) => {
        const cell = sheet.getCell(currentRow, i + 1);
        cell.value = header;
        cell.font = { bold: true, size: 11, name: 'Times New Roman' };
        cell.border = { 
            top: { style: 'thin' }, 
            left: { style: 'thin' }, 
            bottom: { style: 'thin' }, 
            right: { style: 'thin' } 
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // Dữ liệu
    items.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.code || '',
            item.name || '',
            item.unit || 'cái',
            item.quantity || 0,
            item.note || item.notes || ''  // Xuất xưởng = ghi chú
        ];

        rowData.forEach((val, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = val;
            cell.font = { size: 11, name: 'Times New Roman' };
            cell.border = { 
                top: { style: 'thin' }, 
                left: { style: 'thin' }, 
                bottom: { style: 'thin' }, 
                right: { style: 'thin' } 
            };
            cell.alignment = { 
                horizontal: i === 0 || i === 4 ? 'center' : 'left', 
                vertical: 'middle' 
            };
        });
        sheet.getRow(currentRow).height = 30;
        currentRow++;
    });
}

// =====================================================
// SHEET KÍNH - Theo mẫu hình 1
// =====================================================
async function createKinhSheet(sheet, request, items) {
    // Set column widths
    sheet.columns = [
        { width: 6 },   // A - TT
        { width: 12 },  // B - Mã Kính
        { width: 25 },  // C - Loại kính
        { width: 14 },  // D - Chiều rộng
        { width: 14 },  // E - Chiều cao
        { width: 10 },  // F - ĐVT
        { width: 10 },  // G - Số tấm
        { width: 12 },  // H - Diện tích
    ];

    // Row 1: Title
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'PHIẾU YÊU CẦU VẬT TƯ KÍNH';
    titleCell.font = { bold: true, size: 16, name: 'Times New Roman' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    // Row 2: Date - Luôn lấy ngày hiện tại khi xuất phiếu
    sheet.mergeCells('A2:H2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = formatDateTemplate();
    dateCell.font = { size: 12, italic: true, name: 'Times New Roman' };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3: Công trình
    sheet.getCell('A3').value = 'Công trình :';
    sheet.getCell('A3').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B3:H3');
    sheet.getCell('B3').value = request.project_name_full || request.project_name || '';
    sheet.getCell('B3').font = { size: 11, name: 'Times New Roman' };

    // Row 4: Mã Đơn Hàng
    sheet.getCell('A4').value = 'Mã Đơn Hàng :';
    sheet.getCell('A4').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B4:H4');
    sheet.getCell('B4').value = request.order_code || '';
    sheet.getCell('B4').font = { size: 11, name: 'Times New Roman' };

    // Row 5: Chủng loại phụ kiện
    sheet.getCell('A5').value = 'Chủng loại phụ kiện :';
    sheet.getCell('A5').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B5:H5');
    sheet.getCell('B5').value = request.product_type || '';
    sheet.getCell('B5').font = { size: 11, name: 'Times New Roman' };

    // Row 6: Màu sắc (highlight vàng)
    sheet.getCell('A6').value = 'Màu sắc :';
    sheet.getCell('A6').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    sheet.mergeCells('B6:H6');
    sheet.getCell('B6').value = request.color || '';
    sheet.getCell('B6').font = { size: 11, name: 'Times New Roman' };
    sheet.getCell('B6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };

    // Row 7: Địa chỉ giao hàng
    sheet.getCell('A7').value = 'Địa chỉ giao hàng :';
    sheet.getCell('A7').font = { bold: true, size: 11, name: 'Times New Roman' };
    sheet.mergeCells('B7:H7');
    sheet.getCell('B7').value = request.delivery_address || '';
    sheet.getCell('B7').font = { size: 11, name: 'Times New Roman' };

    // Row 8: Empty row
    let currentRow = 9;

    // Header bảng - Theo mẫu KÍNH: TT | Mã Kính | Loại kính | Chiều rộng | Chiều cao | ĐVT | Số tấm | Diện tích
    const headers = ['TT', 'Mã Kính', 'Loại kính', 'Chiều rộng', 'Chiều cao', 'ĐVT', 'Số tấm', 'Diện tích'];
    headers.forEach((header, i) => {
        const cell = sheet.getCell(currentRow, i + 1);
        cell.value = header;
        cell.font = { bold: true, size: 11, name: 'Times New Roman' };
        cell.border = { 
            top: { style: 'thin' }, 
            left: { style: 'thin' }, 
            bottom: { style: 'thin' }, 
            right: { style: 'thin' } 
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // Dữ liệu
    items.forEach((item, index) => {
        const panels = parseFloat(item.panels || item.quantity) || 0;
        const area = parseFloat(item.area) || 0;

        const rowData = [
            index + 1,
            item.code || '',
            item.type || item.name || '',
            item.width || '',
            item.height || '',
            item.unit || 'tấm',
            panels.toFixed(2),
            area.toFixed(2)
        ];

        rowData.forEach((val, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = val;
            cell.font = { size: 11, name: 'Times New Roman' };
            cell.border = { 
                top: { style: 'thin' }, 
                left: { style: 'thin' }, 
                bottom: { style: 'thin' }, 
                right: { style: 'thin' } 
            };
            cell.alignment = { 
                horizontal: 'center', 
                vertical: 'middle' 
            };
        });
        sheet.getRow(currentRow).height = 30;
        currentRow++;
    });
}
