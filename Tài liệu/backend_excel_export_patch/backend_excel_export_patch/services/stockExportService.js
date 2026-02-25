const db = require('./dbAdapter');

/**
 * IMPORTANT
 * ---------
 * Adapt table/column names to your schema.
 * This service assumes you already have a stock_ledger table similar to what inventory.html consumes.
 *
 * Required ledger columns for monthly report:
 *  - item_type (aluminum/accessory/glass/other)
 *  - item_id (or unique key)
 *  - qty_in, qty_out, balance_after
 *  - created_at (datetime)
 *  - item_code, item_name, unit (recommended)
 */

function getMonthRange(monthStr) {
  // monthStr: 'YYYY-MM'
  const [y, m] = monthStr.split('-').map((v) => Number(v));
  if (!y || !m || m < 1 || m > 12) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end };
}

async function getMonthlyLedgerSummary(monthStr) {
  const { start, end } = getMonthRange(monthStr);
  const startIso = start.toISOString().slice(0, 19).replace('T', ' ');
  const endIso = end.toISOString().slice(0, 19).replace('T', ' ');

  // 1) Aggregate in/out in month + pick last transaction timestamp in month
  const monthAggSql = `
    SELECT
      item_type,
      item_id,
      SUM(qty_in) AS in_month,
      SUM(qty_out) AS out_month,
      MAX(created_at) AS last_at
    FROM stock_ledger
    WHERE created_at >= ? AND created_at < ?
    GROUP BY item_type, item_id
  `;
  const monthAgg = await db.query(monthAggSql, [startIso, endIso]);

  // 2) Closing balance (balance_after at last_at)
  // Note: if multiple rows share same timestamp, you may need a deterministic tie-breaker (id).
  const closingSql = `
    SELECT l.item_type, l.item_id, l.balance_after AS closing_balance,
           l.item_code, l.item_name, l.unit
    FROM stock_ledger l
    JOIN (
      SELECT item_type, item_id, MAX(created_at) AS last_at
      FROM stock_ledger
      WHERE created_at >= ? AND created_at < ?
      GROUP BY item_type, item_id
    ) x
      ON x.item_type = l.item_type
     AND x.item_id = l.item_id
     AND x.last_at = l.created_at
  `;
  const closingRows = await db.query(closingSql, [startIso, endIso]);
  const closingMap = new Map();
  closingRows.forEach((r) => {
    closingMap.set(`${r.item_type}::${r.item_id}`, r);
  });

  // 3) Opening balance (last record before month start)
  const openingSql = `
    SELECT l.item_type, l.item_id, l.balance_after AS opening_balance
    FROM stock_ledger l
    JOIN (
      SELECT item_type, item_id, MAX(created_at) AS last_at
      FROM stock_ledger
      WHERE created_at < ?
      GROUP BY item_type, item_id
    ) x
      ON x.item_type = l.item_type
     AND x.item_id = l.item_id
     AND x.last_at = l.created_at
  `;
  const openingRows = await db.query(openingSql, [startIso]);
  const openingMap = new Map();
  openingRows.forEach((r) => {
    openingMap.set(`${r.item_type}::${r.item_id}`, Number(r.opening_balance || 0));
  });

  // 4) Merge
  const details = monthAgg.map((a) => {
    const key = `${a.item_type}::${a.item_id}`;
    const closing = closingMap.get(key);
    const opening = openingMap.get(key) ?? 0;
    const inMonth = Number(a.in_month || 0);
    const outMonth = Number(a.out_month || 0);
    const closingBalance = Number(closing?.closing_balance ?? opening + inMonth - outMonth);

    return {
      item_type: a.item_type,
      item_id: a.item_id,
      item_code: closing?.item_code || '',
      item_name: closing?.item_name || '',
      unit: closing?.unit || '',
      opening_balance: opening,
      in_month: inMonth,
      out_month: outMonth,
      closing_balance: closingBalance,
    };
  });

  // 5) Also handle edge case: items with no transactions in month but need to appear.
  // For a monthly report you may want ONLY items that had movement, or all items in stock.
  // If you want all items: query inventory items + last-known balance before end.

  // 6) Summaries per warehouse
  const summaryByType = new Map();
  details.forEach((d) => {
    const s = summaryByType.get(d.item_type) || {
      item_type: d.item_type,
      opening_total: 0,
      in_total: 0,
      out_total: 0,
      closing_total: 0,
      rows: 0,
    };
    s.opening_total += d.opening_balance;
    s.in_total += d.in_month;
    s.out_total += d.out_month;
    s.closing_total += d.closing_balance;
    s.rows += 1;
    summaryByType.set(d.item_type, s);
  });

  return {
    month: monthStr,
    start: startIso,
    end: endIso,
    summary: Array.from(summaryByType.values()),
    details,
  };
}

async function getStockDocumentById(id) {
  // Adapt schema names here
  const docSql = `
    SELECT id, doc_no, doc_type, created_at, created_by_name, supplier_name, project_code, note
    FROM stock_documents
    WHERE id = ?
    LIMIT 1
  `;
  const docs = await db.query(docSql, [id]);
  const doc = docs?.[0];
  if (!doc) return null;

  const itemsSql = `
    SELECT item_code, item_name, unit, qty_in, qty_out, unit_price, note
    FROM stock_document_items
    WHERE document_id = ?
    ORDER BY id ASC
  `;
  const items = await db.query(itemsSql, [id]);

  return { doc, items };
}

module.exports = {
  getMonthlyLedgerSummary,
  getStockDocumentById,
  getMonthRange,
};
