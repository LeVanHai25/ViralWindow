/**
 * dbAdapter
 * ---------
 * This module gives you a single "query" function no matter what DB library you use.
 *
 * Supported patterns (auto-detected):
 *  - Sequelize: export { sequelize }
 *  - mysql2/promise pool: export { pool }
 *  - Knex: export { knex }
 *  - Custom: export { query }
 *
 * You should point require('./db') to your real db module and export one of the above.
 */

let _db;

function init(db) {
  _db = db;
}

async function query(sql, params = []) {
  if (!_db) {
    throw new Error(
      'DB not initialized. Call init(require("../db")) or edit services/dbAdapter.js to match your project.'
    );
  }

  // Custom query
  if (typeof _db.query === 'function') {
    return _db.query(sql, params);
  }

  // Sequelize
  if (_db.sequelize && typeof _db.sequelize.query === 'function') {
    const [rows] = await _db.sequelize.query(sql, { replacements: params });
    return rows;
  }

  // mysql2/promise pool
  if (_db.pool && typeof _db.pool.execute === 'function') {
    const [rows] = await _db.pool.execute(sql, params);
    return rows;
  }

  // Knex
  if (_db.knex && typeof _db.knex.raw === 'function') {
    const result = await _db.knex.raw(sql, params);
    // knex/mysql returns [rows]; knex/pg returns { rows }
    if (Array.isArray(result)) return result[0];
    if (result && Array.isArray(result.rows)) return result.rows;
    return result;
  }

  throw new Error('Unsupported DB adapter. Please adjust dbAdapter.js.');
}

module.exports = { init, query };
