const mysql = require('mysql2/promise');

const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

const data = [
    { code: 'V01', name: 'Ấn khoát công trình', unit: 'Chiếc', qty: 10, cat: 'Vật tư khác' },
    { code: 'V02', name: 'Áo phông size L', unit: 'Chiếc', qty: 5, cat: 'Vật tư khác' },
    { code: 'V03', name: 'Áo phông size XL', unit: 'Chiếc', qty: 1, cat: 'Vật tư khác' },
    { code: 'V04', name: 'Áo phông size XXL', unit: 'Chiếc', qty: 11, cat: 'Vật tư khác' },
    { code: 'V05', name: 'Băng dính giấy', unit: 'Cuộn', qty: 5, cat: 'Vật tư khác' },
    { code: 'V06', name: 'Bịt đầu đố động Xingfa Phải', unit: 'Cái', qty: 50, cat: 'Nhựa ốp' },
    { code: 'V07', name: 'Bịt đầu đố động Xingfa Trái', unit: 'Cái', qty: 111, cat: 'Nhựa ốp' },
    { code: 'V08', name: 'Bịt đố động hệ 65', unit: 'Cái', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V09', name: 'Bịt đố động hệ 65 2 vế', unit: 'cặp', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V10', name: 'Bịt đố động trên dưới phải', unit: 'Cái', qty: 40, cat: 'Nhựa ốp' },
    { code: 'V11', name: 'Bịt đố động trên dưới Trái', unit: 'Cái', qty: 40, cat: 'Nhựa ốp' },
    { code: 'V12', name: 'Bịt ốp chân XF (bịt đáy cửa đi) vế P', unit: 'Cái', qty: 96, cat: 'Nhựa ốp' },
    { code: 'V13', name: 'Bịt ốp chân XF (bịt đáy cửa đi) vế T', unit: 'Cái', qty: 96, cat: 'Nhựa ốp' },
    { code: 'V14', name: 'Bịt nhựa chân cánh trái', unit: 'Cái', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V15', name: 'Bịt nhựa chân cánh Phải', unit: 'Cái', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V16', name: 'Bộ bít chân', unit: 'Bộ', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V17', name: 'Chốt cánh phụ lùa vuông', unit: 'Chiếc', qty: 0, cat: 'Vật tư khác' },
    { code: 'V18', name: 'Chốt cửa lùa tò vò', unit: 'Chiếc', qty: 0, cat: 'Vật tư khác' },
    { code: 'V19', name: 'Chốt cửa lùa tổ thấp', unit: 'Chiếc', qty: 5, cat: 'Vật tư khác' },
    { code: 'V20', name: 'Dẫn hướng cửa lùa 93 Xingfa', unit: 'Cái', qty: 29, cat: 'Vật tư khác' },
    { code: 'V21', name: 'Dẫn hướng xingfa 65-31 (cần trên)', unit: 'Chiếc', qty: 55, cat: 'Vật tư khác' },
    { code: 'V22', name: 'Dẫn hướng xingfa 65-31 (cần dưới)', unit: 'Chiếc', qty: 55, cat: 'Vật tư khác' },
    { code: 'V23', name: 'Dẫn hướng xingfa 65-31 (cần trên)', unit: 'Chiếc', qty: 57, cat: 'Vật tư khác' },
    { code: 'V24', name: 'Dẫn hướng xingfa 65-31 (cần dưới)', unit: 'Chiếc', qty: 57, cat: 'Vật tư khác' },
    { code: 'V25', name: 'Chống nhấc thanh (Nhựa đỏ)', unit: 'Chiếc', qty: 44, cat: 'Nhựa ốp' },
    { code: 'V26', name: 'Đầu bít chốt cánh phụ Cmech', unit: 'Cái', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V27', name: 'Dẫn hướng Cmech đen', unit: 'Cái', qty: 0, cat: 'Vật tư khác' },
    { code: 'V28', name: 'Đầu bịt Draho', unit: 'Cái', qty: 19, cat: 'Nhựa ốp' },
    { code: 'V29', name: 'Đầu bịt hệ 95 nhôm bạc', unit: 'Cái', qty: 0, cat: 'Nhựa ốp' },
    { code: 'V30', name: 'Đầu bịt Viral', unit: 'Cái', qty: 5, cat: 'Nhựa ốp' },
    { code: 'V31', name: 'Đệm chống vệ chữ nhật', unit: 'Chiếc', qty: 240, cat: 'Vật tư khác' },
    { code: 'V32', name: 'Đệm chống vệ vuông', unit: 'Chiếc', qty: 127, cat: 'Vật tư khác' },
    { code: 'V33', name: 'Đệm chốt cánh phụ', unit: 'Chiếc', qty: 0, cat: 'Vật tư khác' },
    { code: 'V34', name: 'Đệm dẫn hướng bên cửa lùa 93', unit: 'Chiếc', qty: 0, cat: 'Vật tư khác' },
    { code: 'L12', name: 'gioăng chèn kính L12', unit: 'Cuộn', qty: 0, cat: 'Gioăng' },
    { code: 'L6', name: 'gioăng chèn kính L6', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'L7', name: 'gioăng chèn kính L7', unit: 'Cuộn', qty: 2, cat: 'Gioăng' },
    { code: 'L8', name: 'gioăng chèn kính L8', unit: 'Cuộn', qty: 4, cat: 'Gioăng' },
    { code: 'L9', name: 'gioăng chèn kính L9', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'L10', name: 'gioăng chèn kính L10', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'J00', name: 'Gioăng chèn chân sập Châu Âu', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'J12', name: 'Giăng chống đập L94 (giăng đầu cánh)', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'J10', name: 'Gioăng J10 (gioăng khung cách 65)', unit: 'Cuộn', qty: 2, cat: 'Gioăng' },
    { code: 'J15', name: 'Gioăng J15', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'J04', name: 'Gioăng khung bịt rãnh C', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'J02', name: 'Gioăng khung cánh C65D-PMI', unit: 'Cuộn', qty: 0, cat: 'Gioăng' },
    { code: 'J23', name: 'Gioăng J23', unit: 'Cuộn', qty: 0, cat: 'Gioăng' },
    { code: 'GL01', name: 'Gioăng Lông 5*6 bộ ốp đẩy rãnh C', unit: 'Cuộn', qty: 0, cat: 'Gioăng' },
    { code: 'GL02', name: 'Gioăng Lông 5*4 màu đen', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'GL10', name: 'Gioăng Lông 5*7 màu đen', unit: 'Cuộn', qty: 5, cat: 'Gioăng' },
    { code: 'GL04', name: 'Gioăng Lông 5*9 màu đen', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'GL14', name: 'Gioăng Lông 5*9 màu ghi', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'GL06', name: 'Gioăng Lông 8*6 màu ghi', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'GL19', name: 'Gioăng Lông 5*12 màu ghi (Thân lùa)', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'NG55', name: 'Gioăng nối góc 55 rãnh C', unit: 'Cái', qty: 0, cat: 'Gioăng' },
    { code: 'NG11', name: 'Gioang nối góc trung gian hệ 65 JJ011', unit: 'Cái', qty: 32, cat: 'Gioăng' },
    { code: 'J01', name: 'Gioăng ống khung cánh XF55 J01', unit: 'Cuộn', qty: 2, cat: 'Gioăng' },
    { code: 'J11', name: 'gioăng trung gian C65 C55', unit: 'Cuộn', qty: 1, cat: 'Gioăng' },
    { code: 'Y35', name: 'Hố thoát nước', unit: 'Cái', qty: 12, cat: 'Khác' },
    { code: 'Y36', name: 'Ray lùa 94+120+150', unit: 'Cây', qty: 12, cat: 'Khác' },
    { code: 'Y37', name: 'Ke L bắt đố T', unit: 'Cái', qty: 1, cat: 'Ke' },
    { code: 'Y38', name: 'Ke tăng cứng 50', unit: 'Cái', qty: 340, cat: 'Ke' },
    { code: 'Y39', name: 'Ke tăng cứng 13', unit: 'Cái', qty: 219, cat: 'Ke' },
    { code: 'Y40', name: 'Ke tăng cứng 12.5', unit: 'Cái', qty: 157, cat: 'Ke' },
    { code: 'Y41', name: 'Ke tăng cứng 14', unit: 'Cái', qty: 361, cat: 'Ke' },
    { code: 'Y42', name: 'Ke tăng cứng 15', unit: 'Cái', qty: 48, cat: 'Ke' },
    { code: 'Y43', name: 'Ke tăng cứng 16', unit: 'Cái', qty: 450, cat: 'Ke' },
    { code: 'Y44', name: 'Ke tăng cứng 22', unit: 'Cái', qty: 9, cat: 'Ke' },
    { code: 'Y45', name: 'Ke tomahuk 14*23 (ke vít)', unit: 'Cái', qty: 47, cat: 'Ke' },
    { code: 'Y46', name: 'Ke tomahuk 14*42 khung bao cửa sổ', unit: 'Cái', qty: 323, cat: 'Ke' },
    { code: 'Y47', name: 'Ke tomahuk 14*52', unit: 'Cái', qty: 709, cat: 'Ke' },
    { code: 'Y48', name: 'Ke tomahuk 25*14 bản lề', unit: 'Cái', qty: 55, cat: 'Ke' },
    { code: 'Y49', name: 'Ke tomahuk 25*23 bản lề', unit: 'Cái', qty: 40, cat: 'Ke' },
    { code: 'Y50', name: 'Ke tomahuk 25*43 cánh cửa lùa VRA', unit: 'Cái', qty: 137, cat: 'Ke' },
    { code: 'Y51', name: 'Ke tomahuk 31*42 cánh cửa sổ 55', unit: 'Cái', qty: 22, cat: 'Ke' },
    { code: 'Y52', name: 'Ke tomahuk 31*60', unit: 'Cái', qty: 55, cat: 'Ke' },
    { code: 'Y53', name: 'Ke tomahuk 32*43 khung bao cửa đi', unit: 'Cái', qty: 200, cat: 'Ke' },
    { code: 'Y54', name: 'Ke tomahuk 36*43 cánh cửa VRA 55', unit: 'Cái', qty: 103, cat: 'Ke' },
    { code: 'Y55', name: 'Ke tomahuk 36*60', unit: 'Cái', qty: 195, cat: 'Ke' },
    { code: 'Y56', name: 'Ke tomahuk 38*60', unit: 'Cái', qty: 45, cat: 'Ke' },
    { code: 'Y57', name: 'Ke vĩnh cửu 14*20 khung bao lùa 120', unit: 'Cái', qty: 17, cat: 'Ke' },
    { code: 'Y58', name: 'Ke vĩnh cửu 14*23 đố động 56', unit: 'Cái', qty: 206, cat: 'Ke' },
    { code: 'Y59', name: 'Ke vĩnh cửu 14*30 cánh lùa 54', unit: 'Cái', qty: 364, cat: 'Ke' },
    { code: 'Y60', name: 'Ke vĩnh cửu 14*40 khung bao lùa 94', unit: 'Cái', qty: 105, cat: 'Ke' },
    { code: 'Y61', name: 'Ke vĩnh cửu 14*51', unit: 'Cái', qty: 396, cat: 'Ke' },
    { code: 'Y62', name: 'Ke vĩnh cửu 25*30', unit: 'Cái', qty: 575, cat: 'Ke' },
    { code: 'Y63', name: 'Ke vĩnh cửu 25*43 cánh lùa 120', unit: 'Cái', qty: 9, cat: 'Ke' },
    { code: 'Y64', name: 'Ke vĩnh cửu 32*54', unit: 'Cái', qty: 6, cat: 'Ke' },
    { code: 'Y65', name: 'Keo màu đen', unit: 'Chai', qty: 6, cat: 'Keo' },
    { code: 'Y66', name: 'Keo màu xám', unit: 'chai', qty: 135, cat: 'Keo' },
    { code: 'Y67', name: 'Keo PU 88', unit: 'Chai', qty: 14, cat: 'Keo' },
    { code: 'Y68', name: 'Keo trắng sữa A500', unit: 'Chai', qty: 38, cat: 'Keo' },
    { code: 'Y69', name: 'Keo trắng trong A500', unit: 'Chai', qty: 22, cat: 'Keo' },
    { code: 'Y70', name: 'Keo xúc xích Kcc', unit: 'Cái', qty: 50, cat: 'Keo' },
    { code: 'Y71', name: 'Keo xúc xích SS621', unit: 'Cái', qty: 11, cat: 'Keo' },
    { code: 'Y72', name: 'Lưới chống muỗi', unit: 'm2', qty: 0, cat: 'Khác' },
    { code: 'Y73', name: 'Nắp bịt hố thoát nước chữ nhật', unit: 'Cái', qty: 165, cat: 'Nhựa ốp' },
    { code: 'Y74', name: 'Nắp bịt hố thoát nước tròn', unit: 'Cái', qty: 157, cat: 'Nhựa ốp' },
    { code: 'Y75', name: 'Nắp bịt lỗ vít', unit: 'Cái', qty: 45, cat: 'Nhựa ốp' },
    { code: 'Y76', name: 'Núm bằng 2mm', unit: 'Kg', qty: 0, cat: 'Khác' },
    { code: 'Y77', name: 'Núm bằng 4mm', unit: 'Kg', qty: 3, cat: 'Khác' },
    { code: 'Y78', name: 'Núm vát', unit: 'Kg', qty: 7, cat: 'Khác' },
    { code: 'Y79', name: 'Nhựa bịt hèm đón khóa', unit: 'cây', qty: 26, cat: 'Nhựa ốp' },
    { code: 'Y80', name: 'Nhựa bịt cửa lùa 93 (trên dưới)', unit: 'cây', qty: 40, cat: 'Nhựa ốp' },
    { code: 'Y81', name: 'Tem dán', unit: 'Cuộn', qty: 4, cat: 'Khác' },
    { code: 'Y82', name: 'Trên dưới cửa lùa 93', unit: 'Cái', qty: 55, cat: 'Vật tư khác' },
    { code: 'V83', name: 'Vấu 1 cánh Cmech', unit: 'Cái', qty: 0, cat: 'Khác' },
    { code: 'V84', name: 'Vấu 1 cánh KinLong', unit: 'Cái', qty: 0, cat: 'Khác' },
    { code: 'V85', name: 'Vấu cửa đi Draho Viral', unit: 'Cái', qty: 32, cat: 'Khác' },
    { code: 'V86', name: 'Vấu cửa sổ Draho Viral', unit: 'Cái', qty: 28, cat: 'Khác' },
    { code: 'V87', name: 'Vấu hèm lùa 2 cánh Cmech', unit: 'Cái', qty: 0, cat: 'Khác' },
    { code: 'V88', name: 'Vấu hèm lùa 2 cánh Xingfa', unit: 'Cái', qty: 30, cat: 'Khác' },
    { code: 'V89', name: 'Vấu khóa cửa 2 cánh Xingfa', unit: 'Cái', qty: 3, cat: 'Khác' },
    { code: 'V90', name: 'Vít nở khung bao', unit: 'bộ', qty: 5, cat: 'Khác' },
    { code: 'V91', name: 'Vít lắp đặt 1', unit: 'Túi', qty: 3, cat: 'Khác' },
    { code: 'V92', name: 'Vít lắp đặt 10', unit: 'Túi', qty: 3, cat: 'Khác' },
    { code: 'V93', name: 'Vít xử lý cửa đi hai cánh', unit: 'Cái', qty: 0, cat: 'Khác' }
];

async function replaceOtherItems(config, label) {
    console.log(`\n--- Replacing Other Items in ${label} ---`);
    let conn;
    try {
        conn = await mysql.createConnection(config);
        
        // 1. Delete all existing 'other' items
        const [delResult] = await conn.query("DELETE FROM inventory WHERE item_type = 'other'");
        console.log(`🗑  Deleted ${delResult.affectedRows} existing other items.`);

        // 2. Insert new items
        for (const item of data) {
            const price = Math.floor(Math.random() * (100000 - 5000) + 5000); // Reasonable random price
            
            let nextId = null;
            if (label === 'TIDB') {
                const [maxRow] = await conn.query('SELECT MAX(id) as maxId FROM inventory');
                nextId = (maxRow[0].maxId || 0) + 1;
            }

            await conn.query(
                `INSERT INTO inventory (id, item_code, item_name, item_type, unit, quantity, min_stock_level, unit_price, notes) 
                 VALUES (?, ?, ?, 'other', ?, ?, 10, ?, ?)`,
                [nextId, item.code, item.name, item.unit, item.qty, price, item.cat]
            );
        }
        console.log(`✅ Inserted ${data.length} new other items.`);
        
    } catch (err) {
        console.error(`❌ ${label} error:`, err.message);
    } finally {
        if (conn) await conn.end();
    }
}

async function start() {
    await replaceOtherItems(LOCAL, 'LOCAL');
    await replaceOtherItems(TIDB, 'TIDB');
}

start();
