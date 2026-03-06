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
 * 
 * CRITICAL: Must wrap BOTH pool.query() AND connection.query() (from getConnection)
 * because 25+ controllers use transactions via getConnection().
 */
const originalPoolQuery = pool.query.bind(pool);

/**
 * Core auto-ID logic - works with any query function
 * @param {Function} queryFn - The original query function to call
 * @param {string} sql - SQL string
 * @param {Array} params - Query parameters
 */
async function autoIdQuery(queryFn, sql, params) {
    if (typeof sql === 'string') {
        const upperSql = sql.trim().toUpperCase();
        // Only intercept INSERT INTO ... (...) VALUES (...)
        if (upperSql.startsWith('INSERT INTO')) {
            const match = sql.match(/INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)/is);
            if (match) {
                const tableName = match[1];
                const columns = match[2].split(',').map(c => c.trim().replace(/`/g, ''));

                // If 'id' is not in the columns list, add it
                if (!columns.includes('id')) {
                    try {
                        // FIX: Dùng FOR UPDATE để serialize việc lấy ID trong cùng transaction isolation
                        const [maxResult] = await queryFn(
                            `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM \`${tableName}\` FOR UPDATE`
                        );
                        const nextId = maxResult[0].nextId;

                        // Log để dễ debug khi có lỗi trùng lặp
                        // console.log(`[AutoID] Generated ID ${nextId} for table "${tableName}"`);

                        // Add 'id' to columns and nextId to values
                        const newSql = sql.replace(
                            /INSERT\s+INTO\s+(`?\w+`?)\s*\(([^)]+)\)/is,
                            `INSERT INTO $1 (id, $2)`
                        );
                        // Add nextId as first parameter
                        const newParams = params ? [nextId, ...params] : [nextId];

                        // Add ? placeholder for id value
                        const newSql2 = newSql.replace(
                            /VALUES\s*\(/i,
                            'VALUES (?, '
                        );

                        const queryResult = await queryFn(newSql2, newParams);
                        // CRITICAL: Patch insertId because MySQL returns 0 
                        // when id is explicitly specified (not AUTO_INCREMENT)
                        if (queryResult && queryResult[0]) {
                            queryResult[0].insertId = nextId;
                        }
                        return queryResult;
                    } catch (e) {
                        const isDuplicateKey = e.code === 'ER_DUP_ENTRY' || (e.message && e.message.includes('Duplicate'));
                        // Log the real error so it's never silently lost
                        console.error(`[AutoID] Error for table "${tableName}": ${e.code} - ${e.message}`);
                        if (isDuplicateKey) {
                            // Duplicate key: retry with MAX(id)+1 immediately
                            try {
                                // retry cũng dùng queryFn của transaction và FOR UPDATE
                                const [retryMax] = await queryFn(
                                    `SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM \`${tableName}\` FOR UPDATE`
                                );
                                const retryId = Number(retryMax[0].nextId) + Math.floor(Math.random() * 50) + 1;
                                // Rebuild modified SQL
                                const retryNewSql = sql.replace(
                                    /INSERT\s+INTO\s+(`?\w+`?)\s*\(([^)]+)\)/is,
                                    `INSERT INTO $1 (id, $2)`
                                );
                                const retrySql2 = retryNewSql.replace(
                                    /VALUES\s*\(/i,
                                    'VALUES (?, '
                                );
                                const retryParams = [retryId, ...params];
                                const retryResult = await queryFn(retrySql2, retryParams);
                                if (retryResult && retryResult[0]) retryResult[0].insertId = retryId;
                                return retryResult;
                            } catch (retryErr) {
                                console.error(`[AutoID] Retry also failed for "${tableName}": ${retryErr.message}`);
                                throw retryErr;
                            }
                        }

                        // Non-duplicate error: re-throw so caller sees real error
                        throw e;
                    }
                }
            }
        }
    }
    return queryFn(sql, params);
}

/**
 * Wrap a connection object so its query/execute also go through autoIdQuery
 */
function wrapConnection(connection) {
    const origConnQuery = connection.query.bind(connection);
    const origConnExecute = connection.execute ? connection.execute.bind(connection) : null;

    return new Proxy(connection, {
        get(target, prop) {
            if (prop === 'query') {
                return (sql, params) => autoIdQuery(origConnQuery, sql, params);
            }
            if (prop === 'execute' && origConnExecute) {
                return (sql, params) => autoIdQuery(origConnExecute, sql, params);
            }
            return target[prop];
        }
    });
}

// Create pool wrapper
const wrappedPool = new Proxy(pool, {
    get(target, prop) {
        if (prop === 'query') {
            return (sql, params) => autoIdQuery(originalPoolQuery, sql, params);
        }
        if (prop === 'execute') {
            return (sql, params) => autoIdQuery(originalPoolQuery, sql, params);
        }
        if (prop === 'getConnection') {
            // Wrap getConnection to return wrapped connections
            return async () => {
                const connection = await target.getConnection();
                return wrapConnection(connection);
            };
        }
        return target[prop];
    }
});

module.exports = wrappedPool;

