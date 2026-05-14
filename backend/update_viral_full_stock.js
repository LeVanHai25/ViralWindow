const mysql = require('mysql2/promise');

const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

const full_data = [
    // I. VRA-Hệ 55 Mở quay
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3209", name: "Khung vách", weight: 0.842, qty: 21 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3318", name: "Khung bao cửa sổ mở quay", weight: 0.887, qty: 17 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3208", name: "Cây đảo khuôn bao", weight: 0.798, qty: 9 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3202P", name: "Cánh cửa sổ mở ngoài", weight: 1.127, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "MT3202A", name: "Cánh cửa sổ mở quay mặt Phẳng DMAX", weight: 1.127, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3313", name: "Đố tĩnh chia Khung cửa sổ", weight: 1.056, qty: 5 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3203", name: "Đố tĩnh chia cánh", weight: 1.001, qty: 14 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3328", name: "Khung bao cửa đi", weight: 1.286, qty: 10 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3303P", name: "Cánh cửa đi mở ngoài", weight: 1.496, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3332P", name: "Cánh cửa đi mở trong", weight: 1.496, qty: 12 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3304P", name: "Đố ngang dưới cánh cửa đi", weight: 2.107, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3323", name: "Đố động cửa đi", weight: 0.828, qty: 22 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3295", name: "Nẹp kính đơn >12mm", weight: 0.238, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3296", name: "Nẹp kính khung bao", weight: 0.246, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3236", name: "Nẹp kính hộp >22mm", weight: 0.238, qty: 32 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3286", name: "Nẹp kính hộp >25mm", weight: 0.238, qty: 30 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3225", name: "Sập kính hộp cho khung > 21mm", weight: 0.233, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3326", name: "Thanh chuyển góc 90 độ", weight: 0.933, qty: 1 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3310", name: "Thanh tăng cứng vách và cửa", weight: 1.371, qty: 2 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C910", name: "Cây chuyển góc 135 độ", weight: 0.962, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3300", name: "Thanh ghép 2mm", weight: 0.364, qty: 9 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "F077", name: "Pano", weight: 0.697, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C3319", name: "Ngưỡng cửa đi", weight: 0.723, qty: 12 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "E1283", name: "Khung chớp", weight: 0.21, qty: 1 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "E192", name: "Nan chớp", weight: 0.34, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "VRA55-02", name: "Cánh cửa đi mở trong mới", weight: 1.515, qty: 0 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "VRA55-03", name: "Cánh cửa đi mở ngoài mới", weight: 1.515, qty: 14 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "VRA55-01", name: "Cánh cửa sổ mới", weight: 1.163, qty: 13 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "VRA55-04", name: "Nẹp kính hộp cho VRA55 cánh cửa sổ mới", weight: 0.233, qty: 40 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "C22900", name: "Ốp chân cánh cửa đi", weight: 0.405, qty: 14 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "SH6002", name: "Sập kính hộp", weight: 0.31, qty: 18 },
    { sys: "I. VRA-Hệ 55 Mở quay", code: "SH6001", name: "Sập kính hộp", weight: 0.278, qty: 48 },

    // II. VRA-Hệ 50
    { sys: "II. VRA-Hệ 50", code: "VRA50-02", name: "Cánh cửa sổ", weight: 0.958, qty: 0 },
    { sys: "II. VRA-Hệ 50", code: "VRA50-01", name: "Cánh cửa đi", weight: 1.038, qty: 2 },
    { sys: "II. VRA-Hệ 50", code: "Q56A", name: "Chia ô nhỏ", weight: 0.75, qty: 0 },

    // III. VRA-Hệ 64 Cửa sổ lùa
    { sys: "III. VRA-Hệ 64 Cửa sổ lùa", code: "VRA64-01", name: "Khung cửa lùa", weight: 1.041, qty: 11 },
    { sys: "III. VRA-Hệ 64 Cửa sổ lùa", code: "VRA64-02", name: "Cánh cửa lùa", weight: 1.155, qty: 15 },
    { sys: "III. VRA-Hệ 64 Cửa sổ lùa", code: "VRA64-03", name: "Ốp móc cửa lùa", weight: 0.42, qty: 1 },

    // VII. VRE- Hệ Xếp trượt 80
    { sys: "VII. VRE- Hệ Xếp trượt 80", code: "FD-YL01", name: "Khung bao hệ xếp trượt", weight: 2.125, qty: 0 },
    { sys: "VII. VRE- Hệ Xếp trượt 80", code: "FD-YL02", name: "Cánh hệ xếp trượt", weight: 2.074, qty: 0 },
    { sys: "VII. VRE- Hệ Xếp trượt 80", code: "FD-YL03", name: "Hèm khóa hệ xếp trượt", weight: 0.896, qty: 0 },

    // VIII. VRE- Hệ Lùa 120 & 180
    { sys: "VIII. VRE- Hệ Lùa 120 & 180", code: "YL12001", name: "Khung bao đứng", weight: 2.0, qty: 1 },
    { sys: "VIII. VRE- Hệ Lùa 120 & 180", code: "YL12006", name: "Cánh lùa", weight: 2.02, qty: 0 },

    // IX. HỆ LÙA 94 MỚI
    { sys: "IX. HỆ LÙA 94 MỚI", code: "VRE94-01", name: "Khung cửa 94", weight: 1.425, qty: 1 },
    { sys: "IX. HỆ LÙA 94 MỚI", code: "VRE94-01C", name: "Khung bao 3 ray 94 cao", weight: 2.15, qty: 4 },
    { sys: "IX. HỆ LÙA 94 MỚI", code: "VRE94-01T", name: "Khung bao 3 ray 94 thap", weight: 1.525, qty: 7 },
    { sys: "IX. HỆ LÙA 94 MỚI", code: "VRE94-02", name: "Cánh cửa 94", weight: 1.235, qty: 0 },
    { sys: "IX. HỆ LÙA 94 MỚI", code: "VRE94-03", name: "Ray dưới 94", weight: 1.142, qty: 20 },

    // THỦY LỰC
    { sys: "IX. THỦY LỰC", code: "YL55X200", name: "Khung bao thủy lực 55X200", weight: 2.712, qty: 4 },
    { sys: "IX. THỦY LỰC", code: "DA-TL01", name: "Cánh thủy lực 180", weight: 2.829, qty: 1 }
];

async function updateViralStock(config, label) {
    console.log(`\n--- Updating Viral Stock in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        for (const item of full_data) {
            // 1. Delete by code to handle unique constraint
            await conn.query("DELETE FROM aluminum_systems WHERE code = ? AND color = 'Xám sần'", [item.code]);

            let nextId = null;
            if (label === 'TIDB') {
                const [maxRow] = await conn.query('SELECT MAX(id) as maxId FROM aluminum_systems');
                nextId = (maxRow[0].maxId || 0) + 1;
            }

            // 2. Insert with full detail
            const [result] = await conn.query(
                `INSERT INTO aluminum_systems 
                 (id, code, name, aluminum_system, thickness_mm, weight_per_meter, length_m, quantity, unit_price, color, brand, is_active, category) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'viralwindow')`,
                [nextId, item.code, item.name, item.sys, 1.4, item.weight, 6, item.qty, 195000, 'Xám sần', 'ViralWindow']
            );
            
            const profileId = result.insertId || nextId;

            // 3. Update Warehouse Stock for Kho Viral (ID 1)
            await conn.query("DELETE FROM aluminum_warehouse_stock WHERE aluminum_system_id = ? AND warehouse_id = 1", [profileId]);
            await conn.query(
                "INSERT INTO aluminum_warehouse_stock (aluminum_system_id, warehouse_id, quantity) VALUES (?, 1, ?)",
                [profileId, item.qty]
            );
            
            console.log(`✅ ${item.code}: Imported to Kho Viral.`);
        }
        
    } catch (err) {
        console.error(`❌ ${label} error:`, err.message);
    } finally {
        if (conn) await conn.end();
    }
}

async function start() {
    await updateViralStock(LOCAL, 'LOCAL');
    await updateViralStock(TIDB, 'TIDB');
}

start();
