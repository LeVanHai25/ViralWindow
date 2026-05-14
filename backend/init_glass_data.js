const mysql = require('mysql2/promise');

const config = {
    host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    port: 4000,
    user: '3LmszoG1PiqurSq.root',
    password: 'Lym4NIfWcVyhJt2V',
    database: 'viral_window_db',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
};

const glasses = [
    ['GL-CL08', 'Kính cường lực 8mm Trắng trong', 8, 2.44, 3.66, 450000],
    ['GL-CL10', 'Kính cường lực 10mm Trắng trong', 10, 2.44, 3.66, 550000],
    ['GL-CL12', 'Kính cường lực 12mm Trắng trong', 12, 2.44, 3.66, 680000],
    ['GL-DA638', 'Kính dán an toàn 6.38mm Trắng trong', 6.38, 2.14, 3.3, 280000],
    ['GL-DA838', 'Kính dán an toàn 8.38mm Trắng trong', 8.38, 2.14, 3.3, 350000],
    ['GL-DA1038', 'Kính dán 10.38mm Phản quang xanh biển', 10.38, 2.14, 3.3, 480000],
    ['GL-BOX595', 'Kính hộp 5-9-5mm Hút chân không', 19, 2.0, 3.0, 850000],
    ['GL-SOLAR6', 'Kính Solar Control 6mm Cản nhiệt', 6, 2.14, 3.3, 520000],
    ['GL-MO08', 'Kính mờ axit 8mm Trang trí', 8, 2.14, 3.3, 420000],
    ['GL-HL05', 'Kính Hải Long 5mm Trắng trong', 5, 2.14, 3.3, 180000]
];

async function initGlass() {
    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('🗑 Clearing old glass data...');
        await connection.query('DELETE FROM glass_items');

        console.log('📥 Inserting 10 new glass types...');
        const [maxIdRes] = await connection.query('SELECT COALESCE(MAX(id), 0) as maxId FROM glass_items');
        let nextId = maxIdRes[0].maxId + 1;

        for (const g of glasses) {
            const area = (g[3] * g[4]).toFixed(2);
            await connection.query(
                'INSERT INTO glass_items (id, code, name, thickness, width, height, area, price, stock_quantity, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, "m2")',
                [nextId++, g[0], g[1], g[2], g[3], g[4], area, g[5]]
            );
        }

        console.log('✅ Successfully initialized 10 glass items!');
    } catch (e) {
        console.error('❌ Failed:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

initGlass();
