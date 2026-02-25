const { ExcelJS, setXlsxHeaders, styleHeaderRow, applyTableBorders } = require('../utils/excelUtil');
const db = require('../services/dbAdapter');
const stockService = require('../services/stockExportService');

try {
  // eslint-disable-next-line global-require
  db.init(require('../db'));
} catch (e) {
  // Adjust db init according to your project
}

const ITEM_TYPE_LABEL = {
  aluminum: 'Nhom',
  accessory: 'PhuKien',
  glass: 'Kinh',
  other: 'VatTuPhu',
};

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

exports.exportMonthlySummaryExcel = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, message: 'month is required (YYYY-MM)' });
    }

    const report = await stockService.getMonthlyLedgerSummary(month);

    const wb = new ExcelJS.Workbook();

    // Sheet 1: Summary
    const wsSum = wb.addWorksheet(`TongHop_${month}`);
    wsSum.mergeCells('A1:H1');
    wsSum.getCell('A1').value = `BÁO CÁO KHO THÁNG ${month}`;
    wsSum.getCell('A1').font = { size: 14, bold: true };
    wsSum.addRow([]);
    wsSum.addRow(['Kho', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ', 'Giá trị nhập', 'Giá trị xuất', 'Số dòng']);
    wsSum.views = [{ state: 'frozen', ySplit: 3 }];
    styleHeaderRow(wsSum.getRow(3));

    const sumStartRow = 4;
    (report.summary || []).forEach((s) => {
      wsSum.addRow([
        ITEM_TYPE_LABEL[s.item_type] || s.item_type,
        safeNum(s.opening_total),
        safeNum(s.in_total),
        safeNum(s.out_total),
        safeNum(s.closing_total),
        0,
        0,
        safeNum(s.rows),
      ]);
    });

    wsSum.getColumn(2).numFmt = '#,##0.##';
    wsSum.getColumn(3).numFmt = '#,##0.##';
    wsSum.getColumn(4).numFmt = '#,##0.##';
    wsSum.getColumn(5).numFmt = '#,##0.##';
    wsSum.getColumn(6).numFmt = '#,##0" đ"';
    wsSum.getColumn(7).numFmt = '#,##0" đ"';

    wsSum.columns = [
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 16 },
      { width: 10 },
    ];

    applyTableBorders(wsSum, 3, wsSum.lastRow.number, 1, 8);

    // Sheets 2-5: Details by warehouse
    const detailsByType = new Map();
    (report.details || []).forEach((d) => {
      const arr = detailsByType.get(d.item_type) || [];
      arr.push(d);
      detailsByType.set(d.item_type, arr);
    });

    for (const [type, rows] of detailsByType.entries()) {
      const label = ITEM_TYPE_LABEL[type] || type;
      const ws = wb.addWorksheet(`${label}_${month}`);
      ws.mergeCells('A1:H1');
      ws.getCell('A1').value = `CHI TIẾT ${label.toUpperCase()} - THÁNG ${month}`;
      ws.getCell('A1').font = { size: 14, bold: true };

      ws.addRow([]);
      ws.addRow(['Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Tồn đầu kỳ', 'Nhập trong kỳ', 'Xuất trong kỳ', 'Tồn cuối kỳ', 'Giá trị']);
      ws.views = [{ state: 'frozen', ySplit: 3 }];
      styleHeaderRow(ws.getRow(3));

      rows.sort((a, b) => String(a.item_name || '').localeCompare(String(b.item_name || ''), 'vi'));
      rows.forEach((r) => {
        ws.addRow([
          r.item_code || '',
          r.item_name || '',
          r.unit || '',
          safeNum(r.opening_balance),
          safeNum(r.in_month),
          safeNum(r.out_month),
          safeNum(r.closing_balance),
          0,
        ]);
      });

      ws.getColumn(4).numFmt = '#,##0.##';
      ws.getColumn(5).numFmt = '#,##0.##';
      ws.getColumn(6).numFmt = '#,##0.##';
      ws.getColumn(7).numFmt = '#,##0.##';
      ws.getColumn(8).numFmt = '#,##0" đ"';

      ws.columns = [
        { width: 16 },
        { width: 44 },
        { width: 10 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 16 },
      ];

      applyTableBorders(ws, 3, ws.lastRow.number, 1, 8);
    }

    const filename = `BaoCaoKho_${month}.xlsx`;
    setXlsxHeaders(res, filename);
    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('exportMonthlySummaryExcel error:', err);
    return res.status(500).json({ success: false, message: 'Export monthly report failed' });
  }
};

exports.exportSingleDocumentExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await stockService.getStockDocumentById(id);

    if (!data) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
    }

    const { doc, items } = data;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Phieu');

    ws.mergeCells('A1:H1');
    ws.getCell('A1').value = `PHIẾU KHO: ${doc.doc_no || doc.id}`;
    ws.getCell('A1').font = { size: 14, bold: true };

    ws.addRow(['Mã phiếu', doc.doc_no || doc.id, '', '', 'Loại phiếu', doc.doc_type || '', '', '']);
    ws.addRow(['Ngày', doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : '', '', '', 'Người tạo', doc.created_by_name || '', '', '']);
    ws.addRow(['Dự án', doc.project_code || '', '', '', 'Nhà cung cấp', doc.supplier_name || '', '', '']);
    ws.addRow(['Ghi chú', doc.note || '', '', '', '', '', '', '']);

    ws.addRow([]);
    ws.addRow(['Mã VT', 'Tên VT', 'Đơn vị', 'SL Nhập', 'SL Xuất', 'Đơn giá', 'Thành tiền', 'Ghi chú']);
    ws.views = [{ state: 'frozen', ySplit: 7 }];
    styleHeaderRow(ws.getRow(7));

    (items || []).forEach((it) => {
      const qtyIn = safeNum(it.qty_in);
      const qtyOut = safeNum(it.qty_out);
      const price = safeNum(it.unit_price);
      const amount = (qtyIn || qtyOut) * price;
      ws.addRow([
        it.item_code || '',
        it.item_name || '',
        it.unit || '',
        qtyIn,
        qtyOut,
        price,
        amount,
        it.note || '',
      ]);
    });

    const firstDataRow = 8;
    const lastDataRow = ws.lastRow.number;

    ws.getColumn(4).numFmt = '#,##0.##';
    ws.getColumn(5).numFmt = '#,##0.##';
    ws.getColumn(6).numFmt = '#,##0" đ"';
    ws.getColumn(7).numFmt = '#,##0" đ"';

    ws.columns = [
      { width: 16 },
      { width: 44 },
      { width: 10 },
      { width: 12 },
      { width: 12 },
      { width: 14 },
      { width: 16 },
      { width: 20 },
    ];

    ws.addRow([]);
    const totalRow = ws.addRow(['', '', '', '', '', 'Tổng', { formula: `SUM(G${firstDataRow}:G${lastDataRow})` }, '']);
    totalRow.font = { bold: true };

    applyTableBorders(ws, 7, ws.lastRow.number, 1, 8);

    const filename = `Phieu_${doc.doc_no || doc.id}.xlsx`;
    setXlsxHeaders(res, filename);

    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('exportSingleDocumentExcel error:', err);
    return res.status(500).json({ success: false, message: 'Export document failed' });
  }
};
