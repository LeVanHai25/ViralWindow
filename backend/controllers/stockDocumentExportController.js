/**
 * Stock Document Export Controller
 * Handles Excel export for stock documents and monthly reports
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');

/**
 * Export a single stock document to Excel
 * GET /api/stock-documents/:id/export-excel
 */
exports.exportSingleDocument = async (req, res) => {
    try {
        const docId = req.params.id;

        // Get document details - use created_by (not user_id)
        const [docs] = await db.query(`
            SELECT d.*, 
                   u.full_name AS created_by_name,
                   s.name AS supplier_name,
                   p.project_name
            FROM stock_documents d
            LEFT JOIN users u ON d.created_by = u.id
            LEFT JOIN suppliers s ON d.supplier_id = s.id
            LEFT JOIN projects p ON d.project_id = p.id
            WHERE d.id = ?
        `, [docId]);

        if (!docs || docs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiếu'
            });
        }

        const doc = docs[0];

        // Get document lines
        const [lines] = await db.query(`
            SELECT * FROM stock_document_lines WHERE document_id = ?
        `, [docId]);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        // Get doc type label
        const docTypeLabels = {
            'import': 'PHIẾU NHẬP KHO',
            'export': 'PHIẾU XUẤT KHO',
            'stocktake': 'PHIẾU KIỂM KHO',
            'adjust': 'PHIẾU ĐIỀU CHỈNH'
        };
        const docTypeLabel = docTypeLabels[doc.doc_type] || 'PHIẾU KHO';

        // Color themes by doc type
        const colorThemes = {
            'import': 'FF007B5E',   // Teal
            'export': 'FF2563EB',   // Blue
            'stocktake': 'FFF97316', // Orange
            'adjust': 'FF9333EA'    // Purple
        };
        const themeColor = colorThemes[doc.doc_type] || 'FF6B7280';

        const worksheet = workbook.addWorksheet(doc.doc_no || 'Phieu');

        // Header section
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = docTypeLabel;
        titleCell.font = { bold: true, size: 18, color: { argb: themeColor } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 35;

        // Document info section
        const infoData = [
            ['Mã phiếu:', doc.doc_no || '-', 'Ngày lập:', doc.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') : '-'],
            ['Trạng thái:', doc.status === 'posted' ? 'Đã hạch toán' : doc.status === 'cancelled' ? 'Đã hủy' : 'Nháp',
                'Người tạo:', doc.created_by_name || '-'],
            [doc.doc_type === 'export' ? 'Dự án:' : 'NCC:',
            doc.doc_type === 'export' ? (doc.project_name || '-') : (doc.supplier_name || '-'),
                'Ghi chú:', doc.note || '-']
        ];

        let currentRow = 3;
        infoData.forEach(rowData => {
            const row = worksheet.getRow(currentRow);
            row.getCell(1).value = rowData[0];
            row.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF666666' } };
            row.getCell(2).value = rowData[1];
            row.getCell(2).font = { size: 10 };
            row.getCell(4).value = rowData[2];
            row.getCell(4).font = { bold: true, size: 10, color: { argb: 'FF666666' } };
            row.getCell(5).value = rowData[3];
            row.getCell(5).font = { size: 10 };
            currentRow++;
        });

        // Empty row
        currentRow++;

        // Check if this is a stocktake document
        const isStocktake = doc.doc_type === 'stocktake';

        // Table headers - Different for stocktake
        const headers = isStocktake
            ? ['STT', 'Mã vật tư', 'Tên vật tư', 'Loại', 'Đơn vị', 'SL Tồn kho', 'SL Sau kiểm', 'Chênh lệch']
            : ['STT', 'Mã vật tư', 'Tên vật tư', 'Loại', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'];
        const headerRow = worksheet.getRow(currentRow);
        headerRow.values = headers;
        headerRow.height = 25;
        headerRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: themeColor }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Freeze header
        worksheet.views = [{ state: 'frozen', ySplit: currentRow }];

        currentRow++;

        // Item type labels
        const itemTypeLabels = {
            'aluminum': 'Nhôm',
            'accessory': 'Phụ kiện',
            'glass': 'Kính',
            'other': 'Vật tư phụ'
        };

        // Data rows
        let totalQty = 0;
        let totalValue = 0;
        let totalDiff = 0;

        lines.forEach((line, index) => {
            const dataRow = worksheet.getRow(currentRow);

            if (isStocktake) {
                // Stocktake specific: SL Tồn kho, SL Sau kiểm, Chênh lệch
                const qtySystem = parseFloat(line.qty_system) || 0;
                const qtyActual = parseFloat(line.qty) || 0;
                const diff = qtyActual - qtySystem;
                totalDiff += diff;
                totalQty += qtyActual;

                dataRow.values = [
                    index + 1,
                    line.item_code || '-',
                    line.item_name || '-',
                    itemTypeLabels[line.item_type] || line.item_type || '-',
                    line.unit || '-',
                    qtySystem,
                    qtyActual,
                    diff
                ];


                dataRow.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                    };
                    cell.alignment = { vertical: 'middle' };

                    if (colNumber === 1) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    if (colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        cell.numFmt = '#,##0';
                    }
                    // Color the diff column
                    if (colNumber === 8) {
                        const diffValue = parseFloat(cell.value) || 0;
                        if (diffValue > 0) {
                            cell.font = { bold: true, color: { argb: 'FF16A34A' } }; // Green
                        } else if (diffValue < 0) {
                            cell.font = { bold: true, color: { argb: 'FFDC2626' } }; // Red
                        }
                    }
                });
            } else {
                // Non-stocktake: qty, price, total
                const qty = parseFloat(line.qty) || 0;
                const price = parseFloat(line.unit_price) || 0;
                const lineTotal = qty * price;
                totalQty += qty;
                totalValue += lineTotal;

                dataRow.values = [
                    index + 1,
                    line.item_code || '-',
                    line.item_name || '-',
                    itemTypeLabels[line.item_type] || line.item_type || '-',
                    line.unit || '-',
                    qty,
                    price,
                    lineTotal
                ];

                dataRow.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                    };
                    cell.alignment = { vertical: 'middle' };

                    if (colNumber === 1) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                    if (colNumber >= 6) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        if (colNumber >= 7) {
                            cell.numFmt = '#,##0 "₫"';
                        } else {
                            cell.numFmt = '#,##0.##';
                        }
                    }
                });
            }

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
        if (isStocktake) {
            totalRow.values = ['', '', '', '', 'TỔNG CỘNG:', '', lines.length + ' dòng', totalDiff];
            // Color the total diff
            const diffCell = totalRow.getCell(8);
            if (totalDiff > 0) {
                diffCell.font = { bold: true, color: { argb: 'FF16A34A' } };
            } else if (totalDiff < 0) {
                diffCell.font = { bold: true, color: { argb: 'FFDC2626' } };
            }
        } else {
            totalRow.values = ['', '', '', '', 'TỔNG CỘNG:', totalQty, '', totalValue];
        }
        totalRow.height = 28;
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, size: 11 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE8F5E9' }
            };
            cell.border = {
                top: { style: 'medium' },
                bottom: { style: 'medium' }
            };
            if (colNumber === 6) {
                cell.numFmt = '#,##0.##';
                cell.alignment = { horizontal: 'right' };
            }
            if (colNumber === 8) {
                cell.numFmt = '#,##0 "₫"';
                cell.alignment = { horizontal: 'right' };
            }
        });

        // Set column widths
        worksheet.columns = [
            { width: 6 },   // STT
            { width: 15 },  // Mã vật tư
            { width: 35 },  // Tên vật tư
            { width: 12 },  // Loại
            { width: 10 },  // Đơn vị
            { width: 12 },  // Số lượng
            { width: 15 },  // Đơn giá
            { width: 18 }   // Thành tiền
        ];

        // Generate filename
        const safeDocNo = (doc.doc_no || 'Phieu_' + docId).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Phieu_${safeDocNo}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting document:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất Excel: ' + error.message
        });
    }
};

/**
 * Export monthly summary to Excel
 * GET /api/stock-documents/ledger/monthly-summary/export-excel?month=YYYY-MM
 */
exports.exportMonthlySummary = async (req, res) => {
    try {
        const { month, warehouse_id = 1 } = req.query;

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn tháng (format: YYYY-MM)'
            });
        }

        const [year, monthNum] = month.split('-');
        const startOfMonth = `${year}-${monthNum}-01 00:00:00`;
        const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);
        const endOfMonthStr = endOfMonth.toISOString().slice(0, 19).replace('T', ' ');

        const itemTypes = ['aluminum', 'accessory', 'glass', 'other'];
        const itemTypeLabels = {
            'aluminum': 'Nhôm',
            'accessory': 'Phụ kiện',
            'glass': 'Kính',
            'other': 'Vật tư phụ'
        };
        const sheetNames = {
            'aluminum': 'Nhom',
            'accessory': 'PhuKien',
            'glass': 'Kinh',
            'other': 'VatTuPhu'
        };

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        // Summary data for overview sheet
        const summaryData = [];

        // Process each item type
        for (const itemType of itemTypes) {
            // Get all items that had transactions in the month
            // JOIN with stock_document_lines to get item_code and item_name
            const [itemsWithTransactions] = await db.query(`
                SELECT DISTINCT 
                    l.item_id, 
                    l.item_type,
                    dl.item_code,
                    dl.item_name
                FROM stock_ledger l
                LEFT JOIN stock_document_lines dl ON dl.document_id = l.document_id 
                    AND dl.item_type = l.item_type 
                    AND dl.item_id = l.item_id
                WHERE l.warehouse_id = ?
                  AND l.item_type = ?
                  AND l.transaction_at >= ?
                  AND l.transaction_at <= ?
                ORDER BY dl.item_code
            `, [warehouse_id, itemType, startOfMonth, endOfMonthStr]);

            // Calculate stats for each item
            const itemStats = [];
            let totalOpeningQty = 0;
            let totalInQty = 0;
            let totalOutQty = 0;
            let totalClosingQty = 0;

            for (const item of itemsWithTransactions) {
                // Get opening balance (last transaction before start of month)
                const [openingRows] = await db.query(`
                    SELECT balance_after
                    FROM stock_ledger
                    WHERE warehouse_id = ? AND item_type = ? AND item_id = ?
                      AND transaction_at < ?
                    ORDER BY transaction_at DESC, id DESC
                    LIMIT 1
                `, [warehouse_id, itemType, item.item_id, startOfMonth]);

                const openingBalance = openingRows.length > 0 ? parseFloat(openingRows[0].balance_after) || 0 : 0;

                // Get transactions in month
                const [monthTxns] = await db.query(`
                    SELECT SUM(qty_in) AS total_in, SUM(qty_out) AS total_out
                    FROM stock_ledger
                    WHERE warehouse_id = ? AND item_type = ? AND item_id = ?
                      AND transaction_at >= ? AND transaction_at <= ?
                `, [warehouse_id, itemType, item.item_id, startOfMonth, endOfMonthStr]);

                const qtyIn = parseFloat(monthTxns[0]?.total_in) || 0;
                const qtyOut = parseFloat(monthTxns[0]?.total_out) || 0;
                const closingBalance = openingBalance + qtyIn - qtyOut;

                itemStats.push({
                    code: item.item_code || `ID:${item.item_id}`,
                    name: item.item_name || '-',
                    opening: openingBalance,
                    in: qtyIn,
                    out: qtyOut,
                    closing: closingBalance
                });

                totalOpeningQty += openingBalance;
                totalInQty += qtyIn;
                totalOutQty += qtyOut;
                totalClosingQty += closingBalance;
            }

            // Add to summary
            summaryData.push({
                type: itemTypeLabels[itemType],
                openingQty: totalOpeningQty,
                inQty: totalInQty,
                outQty: totalOutQty,
                closingQty: totalClosingQty,
                transactionCount: itemsWithTransactions.length
            });

            // Create detail sheet
            if (itemStats.length > 0) {
                const ws = workbook.addWorksheet(sheetNames[itemType]);

                // Title
                ws.mergeCells('A1:F1');
                ws.getCell('A1').value = `BÁO CÁO NHẬP XUẤT - ${itemTypeLabels[itemType].toUpperCase()} - THÁNG ${monthNum}/${year}`;
                ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF007B5E' } };
                ws.getCell('A1').alignment = { horizontal: 'center' };
                ws.getRow(1).height = 30;

                // Headers
                const headers = ['Mã vật tư', 'Tên vật tư', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ'];
                const headerRow = ws.getRow(3);
                headerRow.values = headers;
                headerRow.height = 25;
                headerRow.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007B5E' } };
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                });

                ws.views = [{ state: 'frozen', ySplit: 3 }];

                // Data
                let rowIndex = 4;
                itemStats.forEach((stat, idx) => {
                    const row = ws.getRow(rowIndex);
                    row.values = [stat.code, stat.name, stat.opening, stat.in, stat.out, stat.closing];
                    row.eachCell((cell, col) => {
                        cell.border = { top: { style: 'thin', color: { argb: 'FFE0E0E0' } }, bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }, left: { style: 'thin', color: { argb: 'FFE0E0E0' } }, right: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
                        if (col >= 3) {
                            cell.numFmt = '#,##0.##';
                            cell.alignment = { horizontal: 'right' };
                        }
                    });
                    if (idx % 2 === 1) {
                        row.eachCell(cell => {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                        });
                    }
                    rowIndex++;
                });

                // Total row
                const totalRow = ws.getRow(rowIndex);
                totalRow.values = ['', 'TỔNG CỘNG', totalOpeningQty, totalInQty, totalOutQty, totalClosingQty];
                totalRow.height = 28;
                totalRow.eachCell((cell, col) => {
                    cell.font = { bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
                    if (col >= 3) {
                        cell.numFmt = '#,##0.##';
                        cell.alignment = { horizontal: 'right' };
                    }
                });

                ws.columns = [
                    { width: 15 }, { width: 40 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
                ];
            }
        }

        // Create summary sheet (first)
        const summarySheet = workbook.addWorksheet('TongHop', { index: 0 });
        summarySheet.mergeCells('A1:F1');
        summarySheet.getCell('A1').value = `BÁO CÁO TỔNG HỢP NHẬP XUẤT KHO - THÁNG ${monthNum}/${year}`;
        summarySheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF007B5E' } };
        summarySheet.getCell('A1').alignment = { horizontal: 'center' };
        summarySheet.getRow(1).height = 35;

        const summaryHeaders = ['Kho', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ', 'Số mặt hàng'];
        const summaryHeaderRow = summarySheet.getRow(3);
        summaryHeaderRow.values = summaryHeaders;
        summaryHeaderRow.height = 25;
        summaryHeaderRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007B5E' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });

        let summaryRowIndex = 4;
        summaryData.forEach((data, idx) => {
            const row = summarySheet.getRow(summaryRowIndex);
            row.values = [data.type, data.openingQty, data.inQty, data.outQty, data.closingQty, data.transactionCount];
            row.eachCell((cell, col) => {
                cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
                if (col >= 2 && col <= 5) {
                    cell.numFmt = '#,##0.##';
                    cell.alignment = { horizontal: 'right' };
                }
            });
            if (idx % 2 === 1) {
                row.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                });
            }
            summaryRowIndex++;
        });

        summarySheet.columns = [
            { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
        ];

        // Generate filename
        const filename = `BaoCaoKho_${month}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting monthly summary:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất báo cáo tháng: ' + error.message
        });
    }
};
