const db = require('./dbAdapter');

/**
 * IMPORTANT
 * ---------
 * Adapt table/column names to your schema.
 *
 * Minimal fields required by export:
 *  - code, name, category_name/system_name (optional), unit, stock_qty, cost_price (optional), note (optional)
 */

async function listInventoryItems({ item_type, search = '', category = '' }) {
  // Example schema assumption:
  // inventory_items(id, item_type, code, name, unit, stock_qty, cost_price, note, category)
  // categories(id, name)

  const where = ['i.item_type = ?'];
  const params = [item_type];

  if (search) {
    where.push('(i.code LIKE ? OR i.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category && category !== 'all') {
    where.push('i.category = ?');
    params.push(category);
  }

  const sql = `
    SELECT
      i.code,
      i.name,
      i.unit,
      i.stock_qty,
      i.cost_price,
      i.note,
      i.category AS category_code,
      c.name AS category_name,
      i.system_name
    FROM inventory_items i
    LEFT JOIN categories c ON c.id = i.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.name ASC
  `;

  return db.query(sql, params);
}

module.exports = { listInventoryItems };
