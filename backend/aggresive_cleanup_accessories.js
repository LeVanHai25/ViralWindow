const mysql = require('mysql2/promise');

const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

async function cleanup(config, label) {
    console.log(`\n--- Cleaning up accessories in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        const query = `
            DELETE FROM accessories 
            WHERE code NOT LIKE 'VR%'
        `;
        
        const [result] = await conn.query(query);
        console.log(`✅ ${label}: Deleted ${result.affectedRows} non-VR items.`);
        
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
