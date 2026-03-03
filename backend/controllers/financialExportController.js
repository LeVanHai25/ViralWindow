/**
 * Financial Export Controller
 * Handles Excel export for financial documents (payments, receipts, debt)
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');

// Helper: Convert number to Vietnamese words
function numberToVietnameseWords(num) {
    if (num === 0) return 'KhÃ´ng Ä‘á»“ng';

    const ones = ['', 'má»™t', 'hai', 'ba', 'bá»‘n', 'nÄƒm', 'sÃ¡u', 'báº£y', 'tÃ¡m', 'chÃ­n'];
    const teens = ['mÆ°á»i', 'mÆ°á»i má»™t', 'mÆ°á»i hai', 'mÆ°á»i ba', 'mÆ°á»i bá»‘n', 'mÆ°á»i lÄƒm', 'mÆ°á»i sÃ¡u', 'mÆ°á»i báº£y', 'mÆ°á»i tÃ¡m', 'mÆ°á»i chÃ­n'];
    const tens = ['', '', 'hai mÆ°Æ¡i', 'ba mÆ°Æ¡i', 'bá»‘n mÆ°Æ¡i', 'nÄƒm mÆ°Æ¡i', 'sÃ¡u mÆ°Æ¡i', 'báº£y mÆ°Æ¡i', 'tÃ¡m mÆ°Æ¡i', 'chÃ­n mÆ°Æ¡i'];
    const units = ['', 'nghÃ¬n', 'triá»‡u', 'tá»·'];

    function readThreeDigits(n) {
        let result = '';
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;

        if (hundred > 0) {
            result += ones[hundred] + ' trÄƒm ';
        }
        if (ten > 1) {
            result += tens[ten] + ' ';
            if (one === 5) result += 'lÄƒm ';
            else if (one === 1) result += 'má»‘t ';
            else if (one > 0) result += ones[one] + ' ';
        } else if (ten === 1) {
            result += teens[one] + ' ';
        } else if (one > 0) {
            if (hundred > 0) result += 'láº» ';
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
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' Ä‘á»“ng';
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
            name: info.company_name || 'CÃ”NG TY TNHH VIRALWINDOW',
            address: info.company_address || 'Äá»‹a chá»‰ cÃ´ng ty',
            phone: info.company_phone || '0123 456 789',
            email: info.company_email || 'contact@viralwindow.com',
            taxCode: info.company_tax_code || ''
        };
    } catch (error) {
        return {
            name: 'CÃ”NG TY TNHH VIRALWINDOW',
            address: 'Äá»‹a chá»‰ cÃ´ng ty',
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
    return new Intl.NumberFormat('vi-VN').format(value || 0) + 'Ä‘';
}

/**
 * Export Payment (Phiáº¿u chi) to Excel
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
                message: 'KhÃ´ng tÃ¬m tháº¥y phiáº¿u chi'
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
        const docTitle = isExpense ? 'PHIáº¾U CHI' : 'PHIáº¾U THU';
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
        addressCell.value = `Äá»‹a chá»‰: ${company.address}`;
        addressCell.font = { size: 10, color: { argb: 'FF666666' } };

        worksheet.mergeCells('A3:G3');
        const contactCell = worksheet.getCell('A3');
        contactCell.value = `ÄT: ${company.phone} | Email: ${company.email}`;
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
        docNoCell.value = `Sá»‘: ${transaction.transaction_code || 'N/A'}`;
        docNoCell.font = { size: 12 };
        docNoCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A7:G7');
        const dateCell = worksheet.getCell('A7');
        const txDate = transaction.transaction_date ? new Date(transaction.transaction_date) : new Date();
        dateCell.value = `NgÃ y ${txDate.getDate()} thÃ¡ng ${txDate.getMonth() + 1} nÄƒm ${txDate.getFullYear()}`;
        dateCell.font = { size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center' };

        // === DOCUMENT INFO ===
        let currentRow = 9;

        // Info rows
        const infoData = [
            ['Äá»‘i tÆ°á»£ng:', transaction.supplier || transaction.customer_name || '-'],
            ['Dá»± Ã¡n:', transaction.project_name || '-'],
            ['HÃ¬nh thá»©c:', transaction.payment_method === 'cash' ? 'Tiá»n máº·t' : transaction.payment_method === 'bank' ? 'Chuyá»ƒn khoáº£n' : (transaction.payment_method || 'Tiá»n máº·t')],
            ['Loáº¡i chi:', transaction.expense_type || transaction.income_type || '-'],
            ['Diá»…n giáº£i:', transaction.description || '-']
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
            const headers = ['STT', 'TÃªn hÃ ng hÃ³a/Dá»‹ch vá»¥', 'MÃ£', 'ÄVT', 'SL', 'ÄÆ¡n giÃ¡', 'ThÃ nh tiá»n'];
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
                    item.unit || 'cÃ¡i',
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
            totalRow.getCell(1).value = 'Tá»”NG Cá»˜NG:';
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
            wordsRow.getCell(1).value = `Báº±ng chá»¯: ${numberToVietnameseWords(totalAmount)}`;
            wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
            currentRow++;
        } else {
            // No items - show total amount from transaction
            const totalAmount = parseFloat(transaction.amount) || 0;
            const amountRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 5);
            amountRow.getCell(1).value = 'Sá»‘ tiá»n:';
            amountRow.getCell(1).font = { bold: true, size: 12 };
            amountRow.getCell(1).alignment = { horizontal: 'right' };
            worksheet.mergeCells(currentRow, 6, currentRow, 7);
            amountRow.getCell(6).value = totalAmount;
            amountRow.getCell(6).numFmt = '#,##0 "Ä‘"';
            amountRow.getCell(6).font = { bold: true, size: 14, color: { argb: themeColor } };
            amountRow.getCell(6).alignment = { horizontal: 'right' };
            currentRow++;

            currentRow++;
            const wordsRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            wordsRow.getCell(1).value = `Báº±ng chá»¯: ${numberToVietnameseWords(totalAmount)}`;
            wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
            currentRow++;
        }

        // === NOTES ===
        if (transaction.note) {
            currentRow++;
            const noteRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            noteRow.getCell(1).value = `Ghi chÃº: ${transaction.note}`;
            noteRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF666666' } };
            currentRow++;
        }

        // === SIGNATURES ===
        currentRow += 2;
        const signatureRow = worksheet.getRow(currentRow);
        signatureRow.getCell(1).value = 'NGÆ¯á»œI Láº¬P PHIáº¾U';
        signatureRow.getCell(4).value = 'Káº¾ TOÃN';
        signatureRow.getCell(7).value = 'GIÃM Äá»C';
        signatureRow.eachCell(cell => {
            cell.font = { bold: true, size: 11 };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        const signatureHintRow = worksheet.getRow(currentRow);
        signatureHintRow.getCell(1).value = '(KÃ½, ghi rÃµ há» tÃªn)';
        signatureHintRow.getCell(4).value = '(KÃ½, ghi rÃµ há» tÃªn)';
        signatureHintRow.getCell(7).value = '(KÃ½, Ä‘Ã³ng dáº¥u)';
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
            { width: 30 },  // TÃªn hÃ ng hÃ³a
            { width: 12 },  // MÃ£
            { width: 8 },   // ÄVT
            { width: 10 },  // SL
            { width: 15 },  // ÄÆ¡n giÃ¡
            { width: 18 }   // ThÃ nh tiá»n
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
            message: 'Lá»—i xuáº¥t Excel: ' + error.message
        });
    }
};

/**
 * Export Receipt (Phiáº¿u thu) to Excel
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
                message: 'KhÃ´ng tÃ¬m tháº¥y phiáº¿u thu'
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
        addressCell.value = `Äá»‹a chá»‰: ${company.address}`;
        addressCell.font = { size: 10, color: { argb: 'FF666666' } };

        worksheet.mergeCells('A3:F3');
        const contactCell = worksheet.getCell('A3');
        contactCell.value = `ÄT: ${company.phone} | Email: ${company.email}`;
        contactCell.font = { size: 10, color: { argb: 'FF666666' } };

        // === TITLE ===
        worksheet.mergeCells('A5:F5');
        const titleCell = worksheet.getCell('A5');
        titleCell.value = 'PHIáº¾U THU';
        titleCell.font = { bold: true, size: 20, color: { argb: themeColor } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(5).height = 35;

        // Doc number and date
        worksheet.mergeCells('A6:F6');
        const docNoCell = worksheet.getCell('A6');
        docNoCell.value = `Sá»‘: ${receipt.receipt_code || 'N/A'}`;
        docNoCell.font = { size: 12 };
        docNoCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A7:F7');
        const dateCell = worksheet.getCell('A7');
        const txDate = receipt.receipt_date ? new Date(receipt.receipt_date) : new Date();
        dateCell.value = `NgÃ y ${txDate.getDate()} thÃ¡ng ${txDate.getMonth() + 1} nÄƒm ${txDate.getFullYear()}`;
        dateCell.font = { size: 11, italic: true };
        dateCell.alignment = { horizontal: 'center' };

        // === DOCUMENT INFO ===
        let currentRow = 9;

        const infoData = [
            ['KhÃ¡ch hÃ ng:', receipt.customer_name_lookup || receipt.customer_name || '-'],
            ['Dá»± Ã¡n:', receipt.project_name || '-'],
            ['HÃ¬nh thá»©c:', receipt.payment_method === 'cash' ? 'Tiá»n máº·t' : receipt.payment_method === 'bank' ? 'Chuyá»ƒn khoáº£n' : (receipt.payment_method || 'Tiá»n máº·t')],
            ['Loáº¡i thu:', receipt.income_type || '-'],
            ['Diá»…n giáº£i:', receipt.description || '-']
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
        amountLabelRow.getCell(1).value = 'Sá»‘ tiá»n thu:';
        amountLabelRow.getCell(1).font = { bold: true, size: 14 };
        amountLabelRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.mergeCells(currentRow, 4, currentRow, 6);
        amountLabelRow.getCell(4).value = totalAmount;
        amountLabelRow.getCell(4).numFmt = '#,##0 "Ä‘"';
        amountLabelRow.getCell(4).font = { bold: true, size: 16, color: { argb: themeColor } };
        amountLabelRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 30;
        currentRow++;

        currentRow++;
        const wordsRow = worksheet.getRow(currentRow);
        worksheet.mergeCells(currentRow, 1, currentRow, 6);
        wordsRow.getCell(1).value = `Báº±ng chá»¯: ${numberToVietnameseWords(totalAmount)}`;
        wordsRow.getCell(1).font = { bold: true, italic: true, size: 11 };
        currentRow++;

        // === NOTES ===
        if (receipt.note) {
            currentRow++;
            const noteRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(currentRow, 1, currentRow, 6);
            noteRow.getCell(1).value = `Ghi chÃº: ${receipt.note}`;
            noteRow.getCell(1).font = { size: 10, italic: true, color: { argb: 'FF666666' } };
            currentRow++;
        }

        // === SIGNATURES ===
        currentRow += 2;
        const signatureRow = worksheet.getRow(currentRow);
        signatureRow.getCell(1).value = 'NGÆ¯á»œI Ná»˜P TIá»€N';
        signatureRow.getCell(3).value = 'NGÆ¯á»œI Láº¬P PHIáº¾U';
        signatureRow.getCell(5).value = 'THá»¦ QUá»¸';
        signatureRow.eachCell(cell => {
            cell.font = { bold: true, size: 11 };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        const signatureHintRow = worksheet.getRow(currentRow);
        signatureHintRow.getCell(1).value = '(KÃ½, ghi rÃµ há» tÃªn)';
        signatureHintRow.getCell(3).value = '(KÃ½, ghi rÃµ há» tÃªn)';
        signatureHintRow.getCell(5).value = '(KÃ½, ghi rÃµ há» tÃªn)';
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
            message: 'Lá»—i xuáº¥t Excel: ' + error.message
        });
    }
};

/**
 * Export Debt Report to Excel
 * GET /api/financial/debt/export-excel?type=receivable|payable
 */
exports.exportDebtReport = async (req, res) => {
    try {
        const { customer_id, supplier_id, type } = req.query;

        // Build query tá»« báº£ng ÄÃšNG lÃ  'debts' (khÃ´ng pháº£i customer_debt)
        let query = `
            SELECT d.*,
                   c.full_name AS customer_name_join,
                   p.project_name,
                   p.project_code
            FROM debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN projects p ON d.project_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (customer_id) {
            query += ' AND d.customer_id = ?';
            params.push(customer_id);
        }
        if (type === 'receivable' || type === 'payable') {
            query += ' AND d.debt_type = ?';
            params.push(type);
        }

        query += ' ORDER BY d.due_date ASC, d.created_at DESC';

        const [debts] = await db.query(query, params);

        // Tá»•ng há»£p theo dá»± Ã¡n/khÃ¡ch hÃ ng
        const [summary] = await db.query(`
            SELECT 
                d.debt_type,
                COUNT(*) as total_count,
                COALESCE(SUM(d.original_amount), 0) as total_original,
                COALESCE(SUM(d.paid_amount), 0) as total_paid,
                COALESCE(SUM(d.remaining_amount), 0) as total_remaining,
                SUM(CASE WHEN d.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN d.status != 'paid' AND d.due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_count
            FROM debts d
            WHERE 1=1
            ${type === 'receivable' || type === 'payable' ? 'AND d.debt_type = ?' : ''}
        `, type === 'receivable' || type === 'payable' ? [type] : []);

        // Get company info
        const company = await getCompanyInfo();

        // ===== Táº O WORKBOOK =====
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        const isReceivable = type === 'receivable';
        const themeArgb = isReceivable ? 'FF7C3AED' : 'FFDC2626'; // Purple: receivable, Red: payable
        const reportTitle = isReceivable ? 'BÃO CÃO CÃ”NG Ná»¢ PHáº¢I THU' : (type === 'payable' ? 'BÃO CÃO CÃ”NG Ná»¢ PHáº¢I TRáº¢' : 'BÃO CÃO Tá»”NG Há»¢P CÃ”NG Ná»¢');

        // ===== SHEET 1: Tá»”NG Há»¢P =====
        const ws1 = workbook.addWorksheet('Tong hop cong no', { properties: { tabColor: { argb: themeArgb } } });
        ws1.columns = [{ width: 28 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 18 }];

        // Header cÃ´ng ty
        ws1.mergeCells('A1:E1');
        ws1.getCell('A1').value = company.name;
        ws1.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FF1E40AF' } };

        ws1.mergeCells('A2:E2');
        ws1.getCell('A2').value = `ÄT: ${company.phone} | ${company.email}`;
        ws1.getCell('A2').font = { size: 9, color: { argb: 'FF666666' } };

        // TiÃªu Ä‘á» bÃ¡o cÃ¡o
        ws1.mergeCells('A4:E4');
        ws1.getCell('A4').value = reportTitle;
        ws1.getCell('A4').font = { bold: true, size: 16, color: { argb: themeArgb } };
        ws1.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };
        ws1.getRow(4).height = 34;

        ws1.mergeCells('A5:E5');
        ws1.getCell('A5').value = `NgÃ y xuáº¥t: ${new Date().toLocaleDateString('vi-VN')}`;
        ws1.getCell('A5').font = { italic: true, size: 10, color: { argb: 'FF666666' } };
        ws1.getCell('A5').alignment = { horizontal: 'center' };

        ws1.addRow([]);

        // Báº£ng tá»•ng há»£p
        const sum = summary[0] || {};
        const sumHeaderRow = ws1.getRow(7);
        sumHeaderRow.values = ['CHá»ˆ TIÃŠU', 'PHáº¢I THU', 'PHáº¢I TRáº¢', 'Tá»”NG Cá»˜NG', 'GHI CHÃš'];
        sumHeaderRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: themeArgb } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            applyBorder(cell);
        });
        ws1.getRow(7).height = 24;

        const [recSum] = await db.query(`SELECT COALESCE(SUM(original_amount),0) as orig, COALESCE(SUM(paid_amount),0) as paid, COALESCE(SUM(remaining_amount),0) as remain, COUNT(*) as cnt, SUM(CASE WHEN status!='paid' AND due_date<CURDATE() THEN 1 ELSE 0 END) as overdue FROM debts WHERE debt_type='receivable'`);
        const [paySum] = await db.query(`SELECT COALESCE(SUM(original_amount),0) as orig, COALESCE(SUM(paid_amount),0) as paid, COALESCE(SUM(remaining_amount),0) as remain, COUNT(*) as cnt, SUM(CASE WHEN status!='paid' AND due_date<CURDATE() THEN 1 ELSE 0 END) as overdue FROM debts WHERE debt_type='payable'`);
        const rs = recSum[0] || {}, ps = paySum[0] || {};

        const sumData = [
            ['Tá»•ng sá»‘ báº£n ghi', rs.cnt || 0, ps.cnt || 0, (rs.cnt || 0) + (ps.cnt || 0), ''],
            ['Tá»•ng ná»£ ban Ä‘áº§u', parseFloat(rs.orig) || 0, parseFloat(ps.orig) || 0, (parseFloat(rs.orig) || 0) + (parseFloat(ps.orig) || 0), ''],
            ['ÄÃ£ thanh toÃ¡n', parseFloat(rs.paid) || 0, parseFloat(ps.paid) || 0, (parseFloat(rs.paid) || 0) + (parseFloat(ps.paid) || 0), ''],
            ['CÃ²n pháº£i thu/tráº£', parseFloat(rs.remain) || 0, parseFloat(ps.remain) || 0, (parseFloat(rs.remain) || 0) + (parseFloat(ps.remain) || 0), 'âš  Cáº§n xá»­ lÃ½'],
            ['QuÃ¡ háº¡n', rs.overdue || 0, ps.overdue || 0, (rs.overdue || 0) + (ps.overdue || 0), 'ðŸ”´ Kháº©n cáº¥p'],
        ];

        sumData.forEach((row, i) => {
            const r = ws1.addRow(row);
            r.getCell(1).font = { bold: true };
            [2, 3, 4].forEach(c => {
                if (i > 0) { r.getCell(c).numFmt = '#,##0'; }
                r.getCell(c).alignment = { horizontal: i === 0 ? 'center' : 'right' };
            });
            r.eachCell(cell => {
                applyBorder(cell);
                if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
            });
        });

        // ===== SHEET 2: CHI TIáº¾T =====
        const ws2 = workbook.addWorksheet('Chi tiet cong no', { properties: { tabColor: { argb: 'FF0EA5E9' } } });
        ws2.columns = [
            { width: 6 },   // STT
            { width: 22 },  // KhÃ¡ch hÃ ng/NhÃ  CC
            { width: 12 },  // Loáº¡i
            { width: 18 },  // Dá»± Ã¡n
            { width: 16 },  // Sá»‘ tiá»n gá»‘c
            { width: 16 },  // ÄÃ£ thanh toÃ¡n
            { width: 16 },  // CÃ²n láº¡i
            { width: 14 },  // NgÃ y háº¡n
            { width: 18 },  // Tráº¡ng thÃ¡i
        ];

        // Header
        ws2.mergeCells('A1:I1');
        ws2.getCell('A1').value = reportTitle + ' - Chi tiáº¿t';
        ws2.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        ws2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: themeArgb } };
        ws2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        ws2.getRow(1).height = 30;

        ws2.mergeCells('A2:I2');
        ws2.getCell('A2').value = `NgÃ y xuáº¥t: ${new Date().toLocaleDateString('vi-VN')} | Tá»•ng: ${debts.length} báº£n ghi`;
        ws2.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } };
        ws2.getCell('A2').alignment = { horizontal: 'center' };

        const headerRow = ws2.getRow(3);
        headerRow.values = ['#', 'KhÃ¡ch hÃ ng/NCC', 'Loáº¡i', 'Dá»± Ã¡n', 'Sá»‘ tiá»n gá»‘c', 'ÄÃ£ thanh toÃ¡n', 'CÃ²n láº¡i', 'NgÃ y háº¡n', 'Tráº¡ng thÃ¡i'];
        headerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: themeArgb } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            applyBorder(cell);
        });
        ws2.getRow(3).height = 28;

        let totalOrig = 0, totalPaid2 = 0, totalRemain = 0;

        debts.forEach((debt, i) => {
            const orig = parseFloat(debt.original_amount || debt.amount || 0);
            const paid = parseFloat(debt.paid_amount || 0);
            const remain = parseFloat(debt.remaining_amount || (orig - paid));
            totalOrig += orig;
            totalPaid2 += paid;
            totalRemain += remain;

            const dueDate = debt.due_date ? new Date(debt.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date() && debt.status !== 'paid';
            const statusText = debt.status === 'paid' ? 'âœ… ÄÃ£ TT' : (debt.status === 'partial' ? 'ðŸ”¶ TT má»™t pháº§n' : (isOverdue ? 'ðŸ”´ QuÃ¡ háº¡n' : 'â³ ChÆ°a TT'));

            const r = ws2.addRow([
                i + 1,
                debt.customer_name_join || debt.customer_name || debt.supplier_name || '-',
                debt.debt_type === 'receivable' ? 'Pháº£i thu' : 'Pháº£i tráº£',
                (debt.project_code ? debt.project_code + ' - ' : '') + (debt.project_name || '-'),
                orig,
                paid,
                remain,
                dueDate ? dueDate.toLocaleDateString('vi-VN') : '-',
                statusText
            ]);

            [5, 6, 7].forEach(c => { r.getCell(c).numFmt = '#,##0'; r.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' }; });
            r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
            r.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };

            r.eachCell(cell => {
                applyBorder(cell);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF5F3FF' } };
            });

            // Highlight quÃ¡ háº¡n
            if (isOverdue) {
                r.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
                r.getCell(9).font = { bold: true, color: { argb: 'FFDC2626' } };
            } else if (debt.status === 'paid') {
                r.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
                r.getCell(9).font = { color: { argb: 'FF065F46' } };
            }
        });

        // Tá»•ng
        const totalRowNum = ws2.rowCount + 1;
        ws2.mergeCells('A' + totalRowNum + ':D' + totalRowNum);
        const tr = ws2.getRow(totalRowNum);
        tr.getCell(1).value = 'Tá»”NG Cá»˜NG (' + debts.length + ' báº£n ghi)';
        tr.getCell(1).font = { bold: true, size: 12 };
        tr.getCell(1).alignment = { horizontal: 'right' };
        tr.getCell(5).value = totalOrig;
        tr.getCell(6).value = totalPaid2;
        tr.getCell(7).value = totalRemain;
        [5, 6, 7].forEach(c => {
            tr.getCell(c).numFmt = '#,##0';
            tr.getCell(c).font = { bold: true, color: { argb: c === 7 ? themeArgb : 'FF111827' } };
            tr.getCell(c).alignment = { horizontal: 'right' };
            tr.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
            applyBorder(tr.getCell(c), 'medium');
        });
        tr.height = 26;

        // ===== Gá»¬I FILE =====
        const typeLabel = type === 'receivable' ? 'PhaiThu' : (type === 'payable' ? 'PhaiTra' : 'TongHop');
        const filename = `CongNo_${typeLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting debt report:', error);
        res.status(500).json({
            success: false,
            message: 'Lá»—i xuáº¥t bÃ¡o cÃ¡o cÃ´ng ná»£: ' + error.message
        });
    }
};

