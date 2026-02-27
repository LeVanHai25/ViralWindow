const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'viral_window_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Thêm timeout để tránh lỗi ETIMEDOUT
    connectTimeout: 60000, // 60 giây
    acquireTimeout: 60000, // 60 giây
    timeout: 60000, // 60 giây
    // Thêm retry logic
    reconnect: true
};

// TiDB Cloud / Production SSL support
if (process.env.DB_SSL === 'true') {
    dbConfig.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    };
    console.log('🔒 Database SSL enabled');
}

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log("✅ Kết nối database thành công!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối database:", err.message);
    });

/**
 * TiDB Auto-ID Wrapper
 * TiDB Cloud tables don't have AUTO_INCREMENT.
 * This wrapper intercepts INSERT queries and auto-generates 'id' if missing.
 */
const originalQuery = pool.query.bind(pool);
const originalExecute = pool.execute ? pool.execute.bind(pool) : null;

async function autoIdQuery(sql, params) {
    if (typeof sql === 'string') {
        const upperSql = sql.trim().toUpperCase();
        // Only intercept INSERT INTO ... (...) VALUES (...)
        if (upperSql.startsWith('INSERT INTO')) {
            const match = sql.match(/INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)/i);
            if (match) {
                const tableName = match[1];
                const columns = match[2].split(',').map(c => c.trim().replace(/`/g, ''));

                // If 'id' is not in the columns list, add it
                if (!columns.includes('id')) {
                    try {
                        // Generate next ID
                        const [maxResult] = await originalQuery(
                            `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM \`${tableName}\``
                        );
                        const nextId = maxResult[0].nextId;

                        // Add 'id' to columns and nextId to values
                        const newSql = sql.replace(
                            /INSERT\s+INTO\s+(`?\w+`?)\s*\(([^)]+)\)/i,
                            `INSERT INTO $1 (id, $2)`
                        );
                        // Add nextId as first parameter
                        const newParams = params ? [nextId, ...params] : [nextId];

                        // Add ? placeholder for id value
                        const newSql2 = newSql.replace(
                            /VALUES\s*\(/i,
                            'VALUES (?, '
                        );

                        return originalQuery(newSql2, newParams);
                    } catch (e) {
                        // If auto-id fails, fall through to original query
                        // (table might not have 'id' column at all)
                    }
                }
            }
        }
    }
    return originalQuery(sql, params);
}

// Create wrapper
const wrappedPool = new Proxy(pool, {
    get(target, prop) {
        if (prop === 'query') return autoIdQuery;
        if (prop === 'execute') return autoIdQuery;
        return target[prop];
    }
});

module.exports = wrappedPool;
