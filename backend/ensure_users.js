const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const LOCAL = {host:'localhost',port:3306,user:'root',password:'',database:'viral_window_db',charset:'utf8mb4'};
const TIDB  = {host:'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',port:4000,user:'3LmszoG1PiqurSq.root',password:'Lym4NIfWcVyhJt2V',database:'viral_window_db',ssl:{minVersion:'TLSv1.2',rejectUnauthorized:true}};

// Danh sách email từ ảnh (bỏ 2 số điện thoại bị gạch X)
const DESIRED = [
    { email:'hai2504@gmail.com',    name:'Hải VW',         role_id:8 },
    { email:'hai2504le@gmail.com',  name:'Lê Văn Hải',     role_id:1 },
    { email:'hoakt@gmail.com',      name:'Hoa Kế Toán',    role_id:3 },
    { email:'longkt2@gmail.com',    name:'Long Kĩ Thuật',  role_id:4 },
    { email:'ly@gmail.com',         name:'Lý Nhân Viên',   role_id:8 },
    { email:'ngochan@gmail.com',    name:'Ngọc Hân',       role_id:8 },
    { email:'phongvr@gmail.com',    name:'Phong VR',       role_id:8 },
    { email:'truong@gmail.com',     name:'Trường NV',      role_id:8 },
    { email:'tuoi@gmail.com',       name:'Tươi Quản Kho',  role_id:6 },
];

async function main() {
    console.log('\n👤 Kiểm tra & tạo tài khoản\n' + '='.repeat(50));
    const pass = await bcrypt.hash('abc123', 10);

    for (const [label, cfg] of [['LOCAL', LOCAL], ['TiDB', TIDB]]) {
        let conn;
        try { conn = await mysql.createConnection(cfg); }
        catch(e) { console.log(`\n⚠️  [${label}] Không kết nối được: ${e.message.substring(0,50)}`); continue; }

        await conn.query("SET FOREIGN_KEY_CHECKS=0");

        // Lấy danh sách email đang có
        const [existing] = await conn.query('SELECT email FROM users');
        const existingEmails = new Set(existing.map(r => r.email.toLowerCase()));

        console.log(`\n[${label}] Đang có ${existingEmails.size} tài khoản:`);

        for (const u of DESIRED) {
            if (existingEmails.has(u.email.toLowerCase())) {
                // Đã có → chỉ cập nhật mật khẩu thành abc123
                await conn.query('UPDATE users SET password=?, is_active=1 WHERE email=?', [pass, u.email]);
                console.log(`  ✅ Đã có: ${u.email} → reset password abc123`);
            } else {
                // Chưa có → tạo mới
                const [rows] = await conn.query('SELECT MAX(id) mx FROM users');
                const newId = (rows[0].mx || 0) + 1;
                await conn.query(
                    `INSERT INTO users (id,full_name,email,phone,password,user_type,role_id,is_active,created_at)
                     VALUES (?,?,?,NULL,?,'user',?,1,NOW())`,
                    [newId, u.name, u.email, pass, u.role_id]
                );
                console.log(`  🆕 Tạo mới: ${u.email} (${u.name})`);
            }
        }

        await conn.query("SET FOREIGN_KEY_CHECKS=1");
        const [[{cnt}]] = await conn.query('SELECT COUNT(*) cnt FROM users');
        console.log(`  📊 Tổng tài khoản [${label}]: ${cnt}`);
        await conn.end();
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Hoàn tất! Tất cả mật khẩu: abc123\n');
    console.log('DANH SÁCH TÀI KHOẢN:');
    DESIRED.forEach(u => console.log(`  ${u.email.padEnd(30)} → abc123`));
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
