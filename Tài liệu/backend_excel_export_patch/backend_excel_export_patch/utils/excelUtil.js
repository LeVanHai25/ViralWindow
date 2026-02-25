const ExcelJS = require('exceljs');

function setXlsxHeaders(res, filename) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
}

function styleHeaderRow(row) {
  row.font = { bold: true };
  row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };
  });
}

function setColumns(ws, cols) {
  ws.columns = cols.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width || 16,
    style: c.style || {},
  }));
}

function applyTableBorders(ws, fromRow, toRow, fromCol = 1, toCol = ws.columnCount) {
  for (let r = fromRow; r <= toRow; r += 1) {
    const row = ws.getRow(r);
    for (let c = fromCol; c <= toCol; c += 1) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    }
  }
}

module.exports = {
  ExcelJS,
  setXlsxHeaders,
  styleHeaderRow,
  setColumns,
  applyTableBorders,
};
