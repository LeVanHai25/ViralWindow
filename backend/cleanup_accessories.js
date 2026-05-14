const mysql = require('mysql2/promise');

const LOCAL = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'viral_window_db'
};

const TIDB = {
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: '3LmszoG1PiqurSq.root',
    password: 'Lym4NIfWcVyhJt2V',
    database: 'viral_window_db',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
};

const validCodes = [
    'VR001', 'VR002', 'VR003', 'VR004', 'VR005', 'VR006', 'VR007', 'VR009',
    'VR010', 'VR011', 'VR012', 'VR013', 'VR014', 'VR015', 'VR016', 'VR017',
    'VR018', 'VR019', 'VR020', 'VR021', 'VR022', 'VR023', 'VR024', 'VR025',
    'VR026', 'VR027', 'VR028', 'VR029', 'VR030', 'VR031', 'VR032'
];

// Categories that should be considered "Phụ kiện"
const accessoryCategories = [
    'Bản lề', 'Bánh xe & ray trượt', 'Khóa', 'Phụ kiện cửa nhôm', 
    'Phụ kiện khác', 'Phụ kiện lùa', 'Tay nắm', 'Tay nắm & khóa', 'Khác'
];

async function cleanup(config, label) {
    console.log(`\n--- Cleaning up accessories in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        // Convert array to string for SQL IN clause
        const placeholders = validCodes.map(() => '?').join(',');
        const catPlaceholders = accessoryCategories.map(() => '?').join(',');
        
        const query = `
            DELETE FROM accessories 
            WHERE category IN (${catPlaceholders})
            AND code NOT IN (${placeholders})
        `;
        
        const [result] = await conn.query(query, [...accessoryCategories, ...validCodes]);
        console.log(`✅ ${label}: Deleted ${result.affectedRows} redundant accessories.`);
        
    } catch (err) {
        console.error(`❌ ${label} error:`, err.message);
    } finally {
        if (conn) await conn.end();
    }
}

async function start() {
    await cleanup(LOCAL, 'LOCAL');
    await cleanup(TIDB, 'TIDB');
}

start();
