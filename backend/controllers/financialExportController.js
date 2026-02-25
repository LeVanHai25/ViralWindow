/**
 * Financial Export Controller
 * Handles Excel export for financial documents (payments, receipts, debt)
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');

// Helper: Convert number to Vietnamese words
function numberToVietnameseWords(num) {
    if (num === 0) return 'Không đồng';

    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
    const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    const units = ['', 'nghìn', 'triệu', 'tỷ'];

    function readThreeDigits(n) {
        let result = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;

        if (hundred > 0) {
            result += ones[hundred] + ' trăm ';
        }
        if (ten > 1) {
            result += tens[ten] + ' ';
            if (one === 5) result += 'lăm ';
            else if (one === 1) result += 'mốt ';
            else if (one > 0) result += ones[one] + ' ';
        } else if (ten === 1) {
            result += teens[one] + ' ';
        } else if (one > 0) {
            if (hundred > 0) result += 'lẻ ';
            result += ones[one] + ' ';
        }
        return result.trim();
    }

    let result = '';
    let unitIndex = 0;
    let n = Math.floor(num);

    while (n > 0) {
        const threeDigits = n % 1000;
        if (threeDigits > 0) {
            const words = readThreeDigits(threeDigits);
            result = words + ' ' + units[unitIndex] + ' ' + result;
        }
        n = Math.floor(n / 1000);
        unitIndex++;
    }

    result = result.trim();
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
    return result;
}

// Helper: Get company info
async function getCompanyInfo() {
    try {
        const [settings] = await db.query(`
            SELECT setting_key, setting_value 
            FROM system_settings 
            WHERE setting_key IN ('company_name', 'company_address', 'company_phone', 'company_email', 'company_tax_code')
        `);

        const info = {};
        settings.forEach(s => {
            info[s.setting_key] = s.setting_value;
        });

        return {
            name: info.company_name || 'CÔNG TY TNHH VIRALWINDOW',
            address: info.company_address || 'Địa chỉ công ty',
            phone: info.company_phone || '0123 456 789',
            email: info.company_email || 'contact@viralwindow.com',
            taxCode: info.company_tax_code || ''
        };
    } catch (error) {
        return {
            name: 'CÔNG TY TNHH VIRALWINDOW',
            address: 'Địa chỉ công ty',
            phone: '0123 456 789',
            email: 'contact@viralwindow.com',
            taxCode: ''
        };
    }
}

// Common Excel styling helpers
function applyBorder(cell, style = 'thin') {
    cell.border = {
        top: { style },
        left: { style },
        bottom: { style },
        right: { style }
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';
}

/**
 * Export Payment (Phiếu chi) to Excel
 * GET /api/financial/transactions/:id/export-excel
 */
exports.exportPayment = async (req, res) => {
    try {
        const { id } = req.params;

        // Get transaction details
        const [transactions] = await db.query(`
            SELECT t.*, 
                   u.full_name AS created_by_name,
                   p.project_name
            FROM financial_transactions t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = ?
        `, [id]);

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu chi'
            });
        }

        const transaction = transactions[0];

        // Get transaction items
        const [items] = await db.query(`
            SELECT * FROM financial_transaction_items 
            WHERE transaction_id = ?
            ORDER BY id
        `, [id]);

        // Get company info
        const company = await getCompanyInfo();

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        const isExpense = transaction.transaction_type === 'expense';
        const docTitle = isExpense ? 'PHIẾU CHI' : 'PHIẾU THU';
        const themeColor = isExpense ? 'FFDC2626' : 'FF16A34A'; // Red for expense, Green for income

        const worksheet = workbook.addWorksheet(transaction.transaction_code || 'PhieuChi');

        // === HEADER: Company Info ===
        worksheet.mergeCells('A1:G1');
        const companyCell = worksheet.getCell('A1');
        companyCell.value = company.name;
        companyCell.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };
        companyCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(1).height = 25;

        worksheet.mergeCells('A2:G2');
        const addressCell = worksheet.getCell('A2');
        addressCell.value = `Địa chỉ: ${company.address}`;
        addressCell.font = { size: 10, color: { argb: 'FF666666' } };

        worksheet.mergeCells('A3:G3');
        const contactCell = worksheet.getCell('A3');
        contactCell.value = `ĐT: ${company.phone} | Email: ${company.email}`;
        contactCell.font = { size: 10, color: { argb: 'FF666666' } };

        // === TITLE ===
        worksheet.mergeCells('A5:G5');
        const titleCell = worksheet.getCell('A5');
        titleCell.value = docTitle;
        titleCell.font = { bold: true, size: 20, color: { argb: themeColor } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(5).height = 35;

        // Doc number and date
        worksheet.mergeCells('A6:G6');
        const docNoCell = worksheet.getCell('A6');
        docNoCell.value = `Số: ${transaction.transaction_code || 'N/A'}`;
        docNoCell.font = { size: 12 };
        docNoCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A7:G7');
        const dateCell = worksheet.getCell('A7');
        const txDate = transaction.transaction_date ? new Date(transaction.transaction_date) : new Date();
        dateCell.value = `Ngày ${txDate.getDate()} tháng ${txDate.getMonth() + 1} năm ${txDate.getFullYear()}`;
        dateCell.font = { size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center' };

        // === DOCUMENT INFO ===
        let currentRow = 9;

        // Info rows
        const infoData = [
            ['Đối tượng:', transaction.supplier || transaction.customer_name || '-'],
            ['Dự án:', transaction.project_name || '-'],
            ['Hình thức:', transaction.payment_method === 'cash' ? 'Tiền mặt' : transaction.payment_method === 'bank' ? 'Chuyển khoản' : (transaction.payment_method || 'Tiền mặt')],
            ['Loại chi:', transaction.expense_type || transaction.income_type || '-'],
            ['Diễn giải:', transaction.description || '-']
        ];

        infoData.forEach(([label, value]) => {
            const row = worksheet.getRow(currentRow);
            row.getCell(1).value = label;
            row.getCell(1).font = { bold: true, size: 11 };
            worksheet.mergeCells(currentRow, 2, currentRow, 7);
            row.getCell(2).value = value;
            row.getCell(2).font = { size: 11 };
            currentRow++;
        });

        currentRow++; // Empty row

        // === ITEMS TABLE ===
        if (items && items.length > 0) {
            // Table header
            const headers = ['STT', 'Tên hàng hóa/Dịch vụ', 'Mã', 'ĐVT', 'SL', 'Đơn giá', 'Thành tiền'];
            const headerRow = worksheet.getRow(currentRow);
            headerRow.values = headers;
            headerRow.height = 28;
            headerRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: themeColor }
                };
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                applyBorder(cell);
            });
            currentRow++;

            // Data rows
            let totalAmount = 0;
            items.forEach((item, index) => {
                const qty = parseInt(item.quantity) || 0;
                const unitPrice = parseFloat(item.unit_price) || 0;
                const amount = parseFloat(item.amount) || (qty * unitPrice);
                totalAmount += amount;

                const dataRow = worksheet.getRow(currentRow);
                dataRow.values = [
                    index + 1,
                    item.item_name || '-',
                    item.item_code || '-',
                    item.unit || 'cái',
                    qty,
                    unitPrice,
                    amount
                ];

                dataRow.eachCell((cell, colNumber) => {
                    applyBorder(cell);
                    cell.alignment = { vertical: 'middle' };

                    if (colNumber === 1) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    if (colNumber >= 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    }
                    if (colNumber === 6 || colNumber === 7) {
                        cell.numFmt = '#,##0';
                    }
                });

                // Alternate row color
                if (index % 2 === 1) {
                    dataRow.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF5F5F5' }
                        };
                    });
                }

                currentRow++;
            });

            // Total row
            const totalRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 6);
            totalRow.getCell(1).value = 'TỔNG CỘNG:';
            totalRow.getCell(1).font = { bold: true, size: 12 };
            totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
            totalRow.getCell(7).value = totalAmount;
            totalRow.getCell(7).numFmt = '#,##0';
            totalRow.getCell(7).font = { bold: true, size: 12, color: { argb: themeColor } };
            totalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
            totalRow.height = 28;
            applyBorder(totalRow.getCell(1), 'medium');
            applyBorder(totalRow.getCell(7), 'medium');
            currentRow++;

            // Amount in words
            currentRow++;
            const wordsRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            wordsRow.getCell(1).value = `Bằng chữ: ${numberToVietnameseWords(totalAmount)}`;
            wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
            currentRow++;
        } else {
            // No items - show total amount from transaction
            const totalAmount = parseFloat(transaction.amount) || 0;
            const amountRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 5);
            amountRow.getCell(1).value = 'Số tiền:';
            amountRow.getCell(1).font = { bold: true, size: 12 };
            amountRow.getCell(1).alignment = { horizontal: 'right' };
            worksheet.mergeCells(currentRow, 6, currentRow, 7);
            amountRow.getCell(6).value = totalAmount;
            amountRow.getCell(6).numFmt = '#,##0 "đ"';
            amountRow.getCell(6).font = { bold: true, size: 14, color: { argb: themeColor } };
            amountRow.getCell(6).alignment = { horizontal: 'right' };
            currentRow++;

            currentRow++;
            const wordsRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            wordsRow.getCell(1).value = `Bằng chữ: ${numberToVietnameseWords(totalAmount)}`;
            wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
            currentRow++;
        }

        // === NOTES ===
        if (transaction.note) {
            currentRow++;
            const noteRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            noteRow.getCell(1).value = `Ghi chú: ${transaction.note}`;
            noteRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF666666' } };
            currentRow++;
        }

        // === SIGNATURES ===
        currentRow += 2;
        const signatureRow = worksheet.getRow(currentRow);
        signatureRow.getCell(1).value = 'NGƯỜI LẬP PHIẾU';
        signatureRow.getCell(4).value = 'KẾ TOÁN';
        signatureRow.getCell(7).value = 'GIÁM ĐỐC';
        signatureRow.eachCell(cell => {
            cell.font = { bold: true, size: 11 };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        const signatureHintRow = worksheet.getRow(currentRow);
        signatureHintRow.getCell(1).value = '(Ký, ghi rõ họ tên)';
        signatureHintRow.getCell(4).value = '(Ký, ghi rõ họ tên)';
        signatureHintRow.getCell(7).value = '(Ký, đóng dấu)';
        signatureHintRow.eachCell(cell => {
            cell.font = { size: 10, italic: true, color: { argb: 'FF999999' } };
            cell.alignment = { horizontal: 'center' };
        });

        // Space for signatures
        currentRow += 4;
        const nameRow = worksheet.getRow(currentRow);
        nameRow.getCell(1).value = transaction.created_by_name || '';
        nameRow.getCell(1).font = { bold: true };
        nameRow.getCell(1).alignment = { horizontal: 'center' };

        // === COLUMN WIDTHS ===
        worksheet.columns = [
            { width: 6 },   // STT
            { width: 30 },  // Tên hàng hóa
            { width: 12 },  // Mã
            { width: 8 },   // ĐVT
            { width: 10 },  // SL
            { width: 15 },  // Đơn giá
            { width: 18 }   // Thành tiền
        ];

        // Generate filename
        const safeCode = (transaction.transaction_code || `PC_${id}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${isExpense ? 'PhieuChi' : 'PhieuThu'}_${safeCode}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất Excel: ' + error.message
        });
    }
};

/**
 * Export Receipt (Phiếu thu) to Excel
 * GET /api/financial/receipts/:id/export-excel
 */
exports.exportReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        // Get receipt details
        const [receipts] = await db.query(`
            SELECT r.*, 
                   u.full_name AS created_by_name,
                   c.name AS customer_name_lookup,
                   p.project_name
            FROM financial_receipts r
            LEFT JOIN users u ON r.created_by = u.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN projects p ON r.project_id = p.id
            WHERE r.id = ?
        `, [id]);

        if (!receipts || receipts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu thu'
            });
        }

        const receipt = receipts[0];

        // Get company info
        const company = await getCompanyInfo();

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        const themeColor = 'FF16A34A'; // Green for income

        const worksheet = workbook.addWorksheet(receipt.receipt_code || 'PhieuThu');

        // === HEADER: Company Info ===
        worksheet.mergeCells('A1:F1');
        const companyCell = worksheet.getCell('A1');
        companyCell.value = company.name;
        companyCell.font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };
        companyCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.getRow(1).height = 25;

        worksheet.mergeCells('A2:F2');
        const addressCell = worksheet.getCell('A2');
        addressCell.value = `Địa chỉ: ${company.address}`;
        addressCell.font = { size: 10, color: { argb: 'FF666666' } };

        worksheet.mergeCells('A3:F3');
        const contactCell = worksheet.getCell('A3');
        contactCell.value = `ĐT: ${company.phone} | Email: ${company.email}`;
        contactCell.font = { size: 10, color: { argb: 'FF666666' } };

        // === TITLE ===
        worksheet.mergeCells('A5:F5');
        const titleCell = worksheet.getCell('A5');
        titleCell.value = 'PHIẾU THU';
        titleCell.font = { bold: true, size: 20, color: { argb: themeColor } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(5).height = 35;

        // Doc number and date
        worksheet.mergeCells('A6:F6');
        const docNoCell = worksheet.getCell('A6');
        docNoCell.value = `Số: ${receipt.receipt_code || 'N/A'}`;
        docNoCell.font = { size: 12 };
        docNoCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A7:F7');
        const dateCell = worksheet.getCell('A7');
        const txDate = receipt.receipt_date ? new Date(receipt.receipt_date) : new Date();
        dateCell.value = `Ngày ${txDate.getDate()} tháng ${txDate.getMonth() + 1} năm ${txDate.getFullYear()}`;
        dateCell.font = { size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center' };

        // === DOCUMENT INFO ===
        let currentRow = 9;

        const infoData = [
            ['Khách hàng:', receipt.customer_name_lookup || receipt.customer_name || '-'],
            ['Dự án:', receipt.project_name || '-'],
            ['Hình thức:', receipt.payment_method === 'cash' ? 'Tiền mặt' : receipt.payment_method === 'bank' ? 'Chuyển khoản' : (receipt.payment_method || 'Tiền mặt')],
            ['Loại thu:', receipt.income_type || '-'],
            ['Diễn giải:', receipt.description || '-']
        ];

        infoData.forEach(([label, value]) => {
            const row = worksheet.getRow(currentRow);
            row.getCell(1).value = label;
            row.getCell(1).font = { bold: true, size: 11 };
            worksheet.mergeCells(currentRow, 2, currentRow, 6);
            row.getCell(2).value = value;
            row.getCell(2).font = { size: 11 };
            currentRow++;
        });

        currentRow++;

        // === AMOUNT ===
        const totalAmount = parseFloat(receipt.amount) || 0;

        const amountLabelRow = worksheet.getRow(currentRow);
        worksheet.mergeCells(currentRow, 1, currentRow, 3);
        amountLabelRow.getCell(1).value = 'Số tiền thu:';
        amountLabelRow.getCell(1).font = { bold: true, size: 14 };
        amountLabelRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.mergeCells(currentRow, 4, currentRow, 6);
        amountLabelRow.getCell(4).value = totalAmount;
        amountLabelRow.getCell(4).numFmt = '#,##0 "đ"';
        amountLabelRow.getCell(4).font = { bold: true, size: 16, color: { argb: themeColor } };
        amountLabelRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 30;
        currentRow++;

        currentRow++;
        const wordsRow = worksheet.getRow(currentRow);
        worksheet.mergeCells(currentRow, 1, currentRow, 6);
        wordsRow.getCell(1).value = `Bằng chữ: ${numberToVietnameseWords(totalAmount)}`;
        wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
        currentRow++;

        // === NOTES ===
        if (receipt.note) {
            currentRow++;
            const noteRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 6);
            noteRow.getCell(1).value = `Ghi chú: ${receipt.note}`;
            noteRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF666666' } };
            currentRow++;
        }

        // === SIGNATURES ===
        currentRow += 2;
        const signatureRow = worksheet.getRow(currentRow);
        signatureRow.getCell(1).value = 'NGƯỜI NỘP TIỀN';
        signatureRow.getCell(3).value = 'NGƯỜI LẬP PHIẾU';
        signatureRow.getCell(5).value = 'THỦ QUỸ';
        signatureRow.eachCell(cell => {
            cell.font = { bold: true, size: 11 };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        const signatureHintRow = worksheet.getRow(currentRow);
        signatureHintRow.getCell(1).value = '(Ký, ghi rõ họ tên)';
        signatureHintRow.getCell(3).value = '(Ký, ghi rõ họ tên)';
        signatureHintRow.getCell(5).value = '(Ký, ghi rõ họ tên)';
        signatureHintRow.eachCell(cell => {
            cell.font = { size: 10, italic: true, color: { argb: 'FF999999' } };
            cell.alignment = { horizontal: 'center' };
        });

        // === COLUMN WIDTHS ===
        worksheet.columns = [
            { width: 18 },
            { width: 20 },
            { width: 18 },
            { width: 20 },
            { width: 18 },
            { width: 20 }
        ];

        // Generate filename
        const safeCode = (receipt.receipt_code || `PT_${id}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `PhieuThu_${safeCode}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất Excel: ' + error.message
        });
    }
};

/**
 * Export Debt Report to Excel
 * GET /api/financial/debt/export-excel
 */
exports.exportDebtReport = async (req, res) => {
    try {
        const { customer_id, supplier_id, type } = req.query;

        // Build query
        let query = `
            SELECT d.*, 
                   c.name AS customer_name,
                   s.name AS supplier_name,
                   p.project_name
            FROM customer_debt d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN suppliers s ON d.supplier_id = s.id
            LEFT JOIN projects p ON d.project_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (customer_id) {
            query += ' AND d.customer_id = ?';
            params.push(customer_id);
        }
        if (supplier_id) {
            query += ' AND d.supplier_id = ?';
            params.push(supplier_id);
        }
        if (type) {
            query += ' AND d.debt_type = ?';
            params.push(type);
        }

        query += ' ORDER BY d.created_at DESC';

        const [debts] = await db.query(query, params);

        // Get company info
        const company = await getCompanyInfo();

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('CongNo');

        // === HEADER ===
        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = company.name;
        worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E40AF' } };
        worksheet.getRow(1).height = 25;

        worksheet.mergeCells('A3:H3');
        worksheet.getCell('A3').value = 'BÁO CÁO CÔNG NỢ';
        worksheet.getCell('A3').font = { bold: true, size: 18, color: { argb: 'FF7C3AED' } };
        worksheet.getCell('A3').alignment = { horizontal: 'center' };
        worksheet.getRow(3).height = 35;

        worksheet.mergeCells('A4:H4');
        worksheet.getCell('A4').value = `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`;
        worksheet.getCell('A4').font = { size: 10, italic: true };
        worksheet.getCell('A4').alignment = { horizontal: 'center' };

        // === TABLE ===
        let currentRow = 6;
        const headers = ['STT', 'Đối tượng', 'Loại', 'Dự án', 'Số tiền nợ', 'Đã thanh toán', 'Còn lại', 'Trạng thái'];
        const headerRow = worksheet.getRow(currentRow);
        headerRow.values = headers;
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7C3AED' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            applyBorder(cell);
        });
        currentRow++;

        let totalDebt = 0;
        let totalPaid = 0;
        let totalRemaining = 0;

        debts.forEach((debt, index) => {
            const debtAmount = parseFloat(debt.amount) || 0;
            const paidAmount = parseFloat(debt.paid_amount) || 0;
            const remaining = debtAmount - paidAmount;

            totalDebt += debtAmount;
            totalPaid += paidAmount;
            totalRemaining += remaining;

            const dataRow = worksheet.getRow(currentRow);
            dataRow.values = [
                index + 1,
                debt.customer_name || debt.supplier_name || '-',
                debt.debt_type === 'receivable' ? 'Phải thu' : 'Phải trả',
                debt.project_name || '-',
                debtAmount,
                paidAmount,
                remaining,
                debt.status === 'paid' ? 'Đã thanh toán' : debt.status === 'partial' ? 'Thanh toán một phần' : 'Chưa thanh toán'
            ];

            dataRow.eachCell((cell, colNumber) => {
                applyBorder(cell);
                cell.alignment = { vertical: 'middle' };
                if (colNumber === 1) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
                if (colNumber >= 5 && colNumber <= 7) {
                    cell.numFmt = '#,##0';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });

            if (index % 2 === 1) {
                dataRow.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF5F5F5' }
                    };
                });
            }

            currentRow++;
        });

        // Total row
        const totalRow = worksheet.getRow(currentRow);
        worksheet.mergeCells(currentRow, 1, currentRow, 4);
        totalRow.getCell(1).value = 'TỔNG CỘNG:';
        totalRow.getCell(1).font = { bold: true, size: 12 };
        totalRow.getCell(1).alignment = { horizontal: 'right' };
        totalRow.getCell(5).value = totalDebt;
        totalRow.getCell(6).value = totalPaid;
        totalRow.getCell(7).value = totalRemaining;
        totalRow.height = 28;
        [5, 6, 7].forEach(col => {
            totalRow.getCell(col).numFmt = '#,##0';
            totalRow.getCell(col).font = { bold: true };
            totalRow.getCell(col).alignment = { horizontal: 'right' };
            applyBorder(totalRow.getCell(col), 'medium');
        });

        // === COLUMN WIDTHS ===
        worksheet.columns = [
            { width: 6 },
            { width: 25 },
            { width: 12 },
            { width: 20 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
            { width: 18 }
        ];

        // Generate filename
        const filename = `BaoCaoCongNo_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting debt report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất báo cáo công nợ: ' + error.message
        });
    }
};
