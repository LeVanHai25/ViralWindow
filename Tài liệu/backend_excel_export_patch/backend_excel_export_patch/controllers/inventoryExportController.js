const { ExcelJS, setXlsxHeaders, styleHeaderRow, applyTableBorders } = require('../utils/excelUtil');
const db = require('../services/dbAdapter');
const inventoryService = require('../services/inventoryExportService');

// Init DB adapter once (adjust path to your real db module)
try {
  // eslint-disable-next-line global-require
  db.init(require('../db'));
} catch (e) {
  // If your project uses a different db module path, change it or call db.init(...) in your app bootstrap.
}

const ITEM_TYPE_LABEL = {
  aluminum: 'Nhom',
  accessory: 'PhuKien',
  glass: 'Kinh',
  other: 'VatTuPhu',
};

exports.exportInventoryExcel = async (req, res) => {
  try {
    const { item_type, search = '', category = '' } = req.query;

    if (!ITEM_TYPE_LABEL[item_type]) {
      return res.status(400).json({ success: false, message: 'item_type invalid' });
    }

    const items = await inventoryService.listInventoryItems({
      item_type,
      search,
      category,
    });

    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư' });
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('TonKho');

    // Title row
    ws.mergeCells('A1:H1');
    ws.getCell('A1').value = `TỒN KHO - ${ITEM_TYPE_LABEL[item_type]} (${new Date().toLocaleDateString('vi-VN')})`;
    ws.getCell('A1').font = { size: 14, bold: true };
    ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

    // Header row (row 3)
    ws.addRow([]);
    ws.addRow(['Mã vật tư', 'Tên vật tư', 'Danh mục/Hệ', 'Đơn vị', 'Tồn kho', 'Giá nhập', 'Tổng giá trị', 'Ghi chú']);
    ws.views = [{ state: 'frozen', ySplit: 3 }];
    styleHeaderRow(ws.getRow(3));

    // Data rows start at row 4
    items.forEach((it) => {
      const qty = Number(it.stock_qty ?? it.qty ?? it.stock ?? 0);
      const cost = Number(it.cost_price ?? it.price_in ?? it.cost ?? 0);
      ws.addRow([
        it.code || '',
        it.name || '',
        it.category_name || it.system_name || it.category_code || '',
        it.unit || '',
        qty,
        cost,
        qty * cost,
        it.note || '',
      ]);
    });

    const firstDataRow = 4;
    const lastDataRow = ws.lastRow.number;

    // Number formats
    ws.getColumn(5).numFmt = '#,##0.##';
    ws.getColumn(6).numFmt = '#,##0" đ"';
    ws.getColumn(7).numFmt = '#,##0" đ"';

    // Column widths
    ws.columns = [
      { width: 16 },
      { width: 44 },
      { width: 22 },
      { width: 10 },
      { width: 12 },
      { width: 14 },
      { width: 16 },
      { width: 20 },
    ];

    // Footer totals
    ws.addRow([]);
    const totalRow = ws.addRow(['', '', '', 'Tổng', { formula: `SUM(E${firstDataRow}:E${lastDataRow})` }, '', { formula: `SUM(G${firstDataRow}:G${lastDataRow})` }, '']);
    totalRow.font = { bold: true };

    // Borders
    applyTableBorders(ws, 3, ws.lastRow.number, 1, 8);

    const today = new Date().toISOString().slice(0, 10);
    const filename = `TonKho_${ITEM_TYPE_LABEL[item_type]}_${today}.xlsx`;
    setXlsxHeaders(res, filename);

    await wb.xlsx.write(res);
    return res.end();
  } catch (err) {
    console.error('exportInventoryExcel error:', err);
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
};
