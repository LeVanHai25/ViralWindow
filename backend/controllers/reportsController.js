/**
 * Reports Controller
 * Handles warehouse report exports by date range
 */

const ExcelJS = require('exceljs');
const db = require('../config/db');

/**
 * Export warehouse report by date range
 * GET /api/reports/warehouse/export-excel?item_type=...&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 */
exports.exportWarehouseReport = async (req, res) => {
    try {
        const { item_type, date_from, date_to } = req.query;

        // Validate inputs
        if (!item_type || !['aluminum', 'accessory', 'glass', 'other'].includes(item_type)) {
            return res.status(400).json({
                success: false,
                message: 'item_type phải là: aluminum, accessory, glass, hoặc other'
            });
        }

        if (!date_from || !date_to) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp date_from và date_to (format: YYYY-MM-DD)'
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date_from) || !dateRegex.test(date_to)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng ngày không hợp lệ (YYYY-MM-DD)'
            });
        }

        if (date_from > date_to) {
            return res.status(400).json({
                success: false,
                message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc'
            });
        }

        const startDate = `${date_from} 00:00:00`;
        const endDate = `${date_to} 23:59:59`;

        // Item type translation (in case DB uses different keys)
        const itemTypeMap = {
            'aluminum': ['aluminum', 'nhom', 'Nhom', 'ALUMINUM'],
            'accessory': ['accessory', 'phukien', 'PhuKien', 'ACCESSORY'],
            'glass': ['glass', 'kinh', 'Kinh', 'GLASS'],
            'other': ['other', 'vattu', 'VatTu', 'OTHER', 'vattuph']
        };
        const itemTypeVariants = itemTypeMap[item_type] || [item_type];

        // Get all items that had transactions in the date range
        const [itemsWithTransactions] = await db.query(`
            SELECT DISTINCT 
                l.item_id, 
                l.item_type,
                dl.item_code,
                dl.item_name,
                dl.unit
            FROM stock_ledger l
            LEFT JOIN stock_document_lines dl ON dl.document_id = l.document_id 
                AND dl.item_type = l.item_type 
                AND dl.item_id = l.item_id
            WHERE l.item_type IN (?)
              AND l.transaction_at >= ?
              AND l.transaction_at <= ?
            ORDER BY dl.item_code
        `, [itemTypeVariants, startDate, endDate]);

        // Calculate stats for each item
        const itemStats = [];
        let grandTotalOpening = 0;
        let grandTotalIn = 0;
        let grandTotalOut = 0;
        let grandTotalClosing = 0;

        for (const item of itemsWithTransactions) {
            // Get opening balance (last transaction before start date)
            const [openingRows] = await db.query(`
                SELECT balance_after
                FROM stock_ledger
                WHERE item_type = ? AND item_id = ?
                  AND transaction_at < ?
                ORDER BY transaction_at DESC, id DESC
                LIMIT 1
            `, [item.item_type, item.item_id, startDate]);

            const openingBalance = openingRows.length > 0 ? parseFloat(openingRows[0].balance_after) || 0 : 0;

            // Get transactions in range
            const [rangeTxns] = await db.query(`
                SELECT 
                    SUM(qty_in) AS total_in, 
                    SUM(qty_out) AS total_out
                FROM stock_ledger
                WHERE item_type = ? AND item_id = ?
                  AND transaction_at >= ? AND transaction_at <= ?
            `, [item.item_type, item.item_id, startDate, endDate]);

            const qtyIn = parseFloat(rangeTxns[0]?.total_in) || 0;
            const qtyOut = parseFloat(rangeTxns[0]?.total_out) || 0;
            const closingBalance = openingBalance + qtyIn - qtyOut;

            // Only include items with actual transactions or non-zero balances
            if (qtyIn > 0 || qtyOut > 0 || openingBalance !== 0) {
                itemStats.push({
                    code: item.item_code || `ID:${item.item_id}`,
                    name: item.item_name || '-',
                    unit: item.unit || '-',
                    opening: openingBalance,
                    in: qtyIn,
                    out: qtyOut,
                    closing: closingBalance
                });

                grandTotalOpening += openingBalance;
                grandTotalIn += qtyIn;
                grandTotalOut += qtyOut;
                grandTotalClosing += closingBalance;
            }
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ViralWindow';
        workbook.created = new Date();

        // Warehouse labels
        const warehouseLabels = {
            'aluminum': 'NHÔM',
            'accessory': 'PHỤ KIỆN',
            'glass': 'KÍNH',
            'other': 'VẬT TƯ PHỤ'
        };
        const warehouseLabel = warehouseLabels[item_type] || item_type.toUpperCase();

        const worksheet = workbook.addWorksheet('BaoCao');

        // Title
        worksheet.mergeCells('A1:G1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `BÁO CÁO NHẬP XUẤT KHO ${warehouseLabel}`;
        titleCell.font = { bold: true, size: 16, color: { argb: 'FF007B5E' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 35;

        // Date range info
        worksheet.mergeCells('A2:G2');
        const dateRangeCell = worksheet.getCell('A2');
        const fromDate = new Date(date_from).toLocaleDateString('vi-VN');
        const toDate = new Date(date_to).toLocaleDateString('vi-VN');
        dateRangeCell.value = `Từ ngày ${fromDate} đến ngày ${toDate}`;
        dateRangeCell.font = { italic: true, size: 11, color: { argb: 'FF666666' } };
        dateRangeCell.alignment = { horizontal: 'center' };

        // Export info
        worksheet.mergeCells('A3:G3');
        const exportInfoCell = worksheet.getCell('A3');
        const now = new Date();
        exportInfoCell.value = `Ngày xuất: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')} | Người xuất: ${req.user?.full_name || req.user?.username || 'Admin'}`;
        exportInfoCell.font = { size: 9, color: { argb: 'FF999999' } };
        exportInfoCell.alignment = { horizontal: 'center' };

        // Empty row
        worksheet.getRow(4).height = 10;

        // Headers
        const headers = ['STT', 'Mã vật tư', 'Tên vật tư', 'ĐVT', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối'];
        const headerRow = worksheet.getRow(5);
        headerRow.values = headers;
        headerRow.height = 28;
        headerRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF007B5E' }
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
        worksheet.views = [{ state: 'frozen', ySplit: 5 }];

        // Data rows
        let currentRow = 6;
        if (itemStats.length === 0) {
            // No data message
            worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
            const noDataCell = worksheet.getCell(`A${currentRow}`);
            noDataCell.value = 'Không có dữ liệu giao dịch trong khoảng thời gian này';
            noDataCell.font = { italic: true, color: { argb: 'FF999999' } };
            noDataCell.alignment = { horizontal: 'center' };
            currentRow++;
        } else {
            itemStats.forEach((stat, index) => {
                const dataRow = worksheet.getRow(currentRow);
                dataRow.values = [
                    index + 1,
                    stat.code,
                    stat.name,
                    stat.unit,
                    stat.opening,
                    stat.in,
                    stat.out,
                    stat.closing
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
                    if (colNumber >= 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        cell.numFmt = '#,##0.##';
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
            totalRow.values = ['', '', '', 'TỔNG CỘNG:', grandTotalOpening, grandTotalIn, grandTotalOut, grandTotalClosing];
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
                if (colNumber >= 5) {
                    cell.numFmt = '#,##0.##';
                    cell.alignment = { horizontal: 'right' };
                }
            });
            currentRow++;

            // Summary row
            currentRow++;
            worksheet.getCell(`A${currentRow}`).value = `Tổng số mặt hàng có phát sinh: ${itemStats.length}`;
            worksheet.getCell(`A${currentRow}`).font = { italic: true, size: 10 };
        }

        // Set column widths
        worksheet.columns = [
            { width: 6 },   // STT
            { width: 15 },  // Mã vật tư
            { width: 40 },  // Tên vật tư
            { width: 8 },   // ĐVT
            { width: 12 },  // Tồn đầu
            { width: 12 },  // Nhập
            { width: 12 },  // Xuất
            { width: 12 }   // Tồn cuối
        ];

        // Generate filename
        const warehouseFileNames = {
            'aluminum': 'Nhom',
            'accessory': 'PhuKien',
            'glass': 'Kinh',
            'other': 'VatTuPhu'
        };
        const fromStr = date_from.replace(/-/g, '');
        const toStr = date_to.replace(/-/g, '');
        const filename = `BaoCao_${warehouseFileNames[item_type]}_${fromStr}-${toStr}.xlsx`;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting warehouse report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất báo cáo: ' + error.message
        });
    }
};
