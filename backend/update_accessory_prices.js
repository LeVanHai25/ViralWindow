const mysql = require('mysql2/promise');

const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

const priceMap = {
    'VR001': 125000,   // Tay nắm cửa sổ
    'VR002': 450000,   // Tay nắm cửa đi Galaxy
    'VR003': 380000,   // Tay nắm cửa đi (loại khác)
    'VR004': 250000,   // Tay nắm
    'VR005': 180000,   // Tay nắm
    'VR006': 150000,   // Tay nắm
    'VR007': 95000,    // Bản lề chữ A
    'VR008': 110000,   // Bản lề chữ A 14 inch
    'VR009': 135000,   // Bản lề chữ A 16 inch
    'VR010': 185000,   // Bản lề 3D/4D
    'VR011': 195000,   // Bản lề 3D/4D
    'VR012': 165000,   // Bản lề cửa đi
    'VR013': 165000,   // Bản lề cửa đi
    'VR014': 220000,   // Bản lề
    'VR015': 220000,   // Bản lề
    'VR016': 75000,    // Bánh xe
    'VR017': 85000,    // Bánh xe đôi
    'VR018': 125000,   // Bánh xe
    'VR019': 65000,    // Bánh xe đơn
    'VR020': 215000,   // Bộ chuyển động
    'VR021': 145000,   // Bộ chốt cánh phụ
    'VR022': 155000,   // Bộ chốt
    'VR023': 165000,   // Bộ chốt
    'VR024': 175000,   // Bộ chốt
    'VR025': 185000,   // Bộ chốt
    'VR026': 195000,   // Bộ chốt
    'VR027': 45000,    // Đầu biên
    'VR028': 45000,    // Đầu biên
    'VR029': 55000,    // Thanh truyền
    'VR030': 65000,    // Thanh truyền
    'VR031': 85000,    // Bánh xe chống rung
    'VR032': 12000     // Vấu hãm
};

async function updatePrices(config, label) {
    console.log(`\n--- Updating Accessory Prices in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        for (const [code, price] of Object.entries(priceMap)) {
            const [result] = await conn.query(
                "UPDATE accessories SET sale_price = ?, purchase_price = ? WHERE code = ? AND (sale_price = 0 OR sale_price IS NULL)",
                [price, price * 0.8, code]
            );
            if (result.affectedRows > 0) {
                console.log(`✅ ${code}: Updated sale_price to ${price.toLocaleString()}đ`);
            }
        }
        
    } catch (err) {
        console.error(`❌ ${label} error:`, err.message);
    } finally {
        if (conn) await conn.end();
    }
}

async function start() {
    await updatePrices(LOCAL, 'LOCAL');
    await updatePrices(TIDB, 'TIDB');
}

start();
