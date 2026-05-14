const mysql = require('mysql2/promise');

const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

const koso_full_data = [
    // I. VRA-Hệ 55 Mở quay (KOSO)
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3209", name: "Khung vách", weight: 0.842, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3295", name: "Nẹp kính đơn vách", weight: 0.272, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3236", name: "Nẹp kính hộp vách", weight: 0.228, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3318", name: "Khung bao cửa sổ", weight: 0.887, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "T3202", name: "Cánh cửa sổ cong", weight: 1.030, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "3202P", name: "Cánh cửa sổ Phẳng cánh", weight: 1.030, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3296M", name: "Nẹp kính đơn cánh", weight: 0.202, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3225", name: "Nẹp kính hộp cánh", weight: 0.228, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3328", name: "Khung bao cửa đi", weight: 1.160, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "T3303", name: "Cánh cửa đi mở ngoài cong", weight: 1.463, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "T3332", name: "Cánh cửa đi mở trong cong", weight: 1.463, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3203-1.4", name: "Đố T chia vách", weight: 0.880, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3313", name: "Dố T chia khung", weight: 1.010, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3208", name: "Đảo khung", weight: 0.980, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3323-AM", name: "Đố động dùng chung", weight: 0.846, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C3300", name: "I nối", weight: 0.348, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C22900", name: "Ốp chân cánh cửa đi", weight: 0.405, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "55x200", name: "Khung bao TL", weight: 2.721, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "DA-TL01", name: "Cánh cửa TL 140", weight: 2.798, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "DA-TL02", name: "Nẹp kính đơn cánh TL", weight: 0.254, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "DA-TL03", name: "Nẹp kính hộp cánh TL", weight: 0.175, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "DADV51", name: "Đế vách TL", weight: 0.325, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C101", name: "Sập đế vách TL kính đơn", weight: 0.133, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "C102", name: "Sập đế vách TL kính hộp", weight: 0.127, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "DA-TL04", name: "Ốp đáy cánh TL", weight: 0.300, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "P01", name: "Phào 01", weight: 0.196, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "P02", name: "Phào 02", weight: 0.379, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "T3303-1.4", name: "Cánh cửa mở quay ngoài cong -1.4", weight: 1.250, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "T3332-1.4", name: "Cánh cửa mở quay trong cong -1.4", weight: 1.250, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "E1283", name: "Khung chớp", weight: 1.250, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "E192", name: "lá chớp", weight: 1.250, qty: 6 },
    { sys: "I. VRA-Hệ 55 Mở quay (KOSO)", code: "TCD", name: "Thanh Chuyển động", weight: 0.128, qty: 6 },

    // IX. HỆ LÙA 94 KOSO
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-K9501", name: "Khung bao lùa YL-9501", weight: 1.188, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-K9504", name: "Ốp móc cánh cửa sổ lùa ray inox 95 xám đá Yangli", weight: 0.347, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-9508", name: "Cánh cửa đi lùa YL-9508", weight: 1.174, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-9506", name: "Op móc cánh cửa đi YL-9506", weight: 0.376, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-K9509", name: "Khung bao lùa đôi YL - K9509", weight: 1.188, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-K9510", name: "Khung bao lùa đơn YL - K9510", weight: 1.188, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-9505", name: "Khung bao vách YL-9505", weight: 1.402, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL5506", name: "Đố T chia vách 95", weight: 0.748, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-950S", name: "Ray dưới YL-950S", weight: 0.748, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "YL-3215", name: "Dối đầu cửa lùa", weight: 0.250, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "LIN-HD50", name: "Hèm móc cánh đi lùa ray inox 97 màu xám đá Yangli", weight: 0.469, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "LINDT-21", name: "Dẫn hướng trên", weight: 0.220, qty: 6 },
    { sys: "IX. HỆ LÙA 94 KOSO", code: "LIN H17", name: "Bắt phụ kiện", weight: 0.220, qty: 6 }
];

async function updateKosoStock(config, label) {
    console.log(`\n--- Updating Koso Stock in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        // Load Viral codes for conflict detection
        const [viral] = await conn.query("SELECT code FROM aluminum_systems WHERE color = 'Xám sần' AND is_active = 1");
        const viralCodes = new Set(viral.map(v => v.code));

        for (const item of koso_full_data) {
            let finalCode = item.code;
            if (viralCodes.has(item.code)) {
                finalCode = `KS_${item.code}`;
                console.log(`⚠️ Code conflict: ${item.code} -> ${finalCode}`);
            }

            // DELETE existing Koso entry for this code
            await conn.query("DELETE FROM aluminum_systems WHERE code = ? AND color = 'Xám đá'", [finalCode]);

            let nextId = null;
            if (label === 'TIDB') {
                const [maxRow] = await conn.query('SELECT MAX(id) as maxId FROM aluminum_systems');
                nextId = (maxRow[0].maxId || 0) + 1;
            }

            // INSERT
            const [result] = await conn.query(
                `INSERT INTO aluminum_systems 
                 (id, code, name, aluminum_system, thickness_mm, weight_per_meter, length_m, quantity, unit_price, color, brand, is_active, category) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'viralwindow')`,
                [nextId, finalCode, item.name, item.sys, 1.4, item.weight, 6, item.qty, 195000, 'Xám đá', 'Koso']
            );
            
            const profileId = result.insertId || nextId;

            // Warehouse ID 2 for Koso
            await conn.query("DELETE FROM aluminum_warehouse_stock WHERE aluminum_system_id = ? AND warehouse_id = 2", [profileId]);
            await conn.query(
                "INSERT INTO aluminum_warehouse_stock (aluminum_system_id, warehouse_id, quantity) VALUES (?, 2, ?)",
                [profileId, item.qty]
            );
        }
        console.log(`✅ ${label} complete.`);
    } catch (err) {
        console.error(`❌ ${label} error:`, err.message);
    } finally {
        if (conn) await conn.end();
    }
}

async function start() {
    await updateKosoStock(LOCAL, 'LOCAL');
    await updateKosoStock(TIDB, 'TIDB');
}

start();
