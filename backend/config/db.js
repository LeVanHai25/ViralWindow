const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
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
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log("✅ Kết nối database thành công!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối database:", err.message);
    });

module.exports = pool;



