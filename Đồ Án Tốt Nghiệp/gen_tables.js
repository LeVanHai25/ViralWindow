const fs = require('fs');

const tables = [
  {
    num:'2.14', name:'CHUC_VU', title:'Chức vụ / Vai trò',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh tự tăng của chức vụ'],
      ['ten','NVARCHAR(100)','NOT NULL, UNIQUE','','Tên chức vụ'],
      ['mo_ta','NVARCHAR(MAX)','NULL','','Mô tả chi tiết chức vụ'],
      ['la_he_thong','BIT','NOT NULL, DEFAULT 0','','Đây có phải chức vụ hệ thống không (1=Có)'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo bản ghi'],
    ]
  },
  {
    num:'2.15', name:'QUYEN_HAN', title:'Quyền hạn / Permissions',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh của quyền hạn'],
      ['ma_code','NVARCHAR(100)','NOT NULL, UNIQUE','','Mã code định danh quyền (VD: project.view)'],
      ['ten','NVARCHAR(200)','NOT NULL','','Tên hiển thị của quyền hạn'],
      ['module','NVARCHAR(100)','NOT NULL','','Module chức năng chứa quyền này'],
      ['thu_tu','INT','NULL, DEFAULT 0','','Thứ tự hiển thị trong danh sách'],
    ]
  },
  {
    num:'2.16', name:'CHUC_VU_QUYEN', title:'Phân quyền theo Chức vụ',
    rows:[
      ['ma_chuc_vu','INT','NOT NULL','PK, FK','Mã chức vụ (tham chiếu CHUC_VU.id)'],
      ['ma_quyen','INT','NOT NULL','PK, FK','Mã quyền hạn (tham chiếu QUYEN_HAN.id)'],
    ]
  },
  {
    num:'2.17', name:'NGUOI_DUNG', title:'Người dùng',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh tự tăng của người dùng'],
      ['ma_chuc_vu','INT','NULL','FK','Chức vụ của người dùng (tham chiếu CHUC_VU.id)'],
      ['email','NVARCHAR(100)','NOT NULL, UNIQUE','','Địa chỉ email đăng nhập hệ thống'],
      ['mat_khau','NVARCHAR(255)','NOT NULL','','Mật khẩu đã mã hóa (Bcrypt)'],
      ['ho_ten','NVARCHAR(100)','NOT NULL','','Họ và tên đầy đủ của người dùng'],
      ['loai_tai_khoan','NVARCHAR(10)','NOT NULL, DEFAULT N\'user\'','','Loại tài khoản (admin / user)'],
      ['trang_thai','BIT','NOT NULL, DEFAULT 1','','Trạng thái hoạt động (1: Hoạt động, 0: Khóa)'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo tài khoản'],
    ]
  },
  {
    num:'2.18', name:'PHIEN_DANG_NHAP', title:'Phiên đăng nhập',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh phiên đăng nhập'],
      ['ma_nguoi_dung','INT','NOT NULL','FK','Người dùng của phiên (tham chiếu NGUOI_DUNG.id)'],
      ['token_phien','NVARCHAR(MAX)','NOT NULL','','JWT token của phiên đăng nhập'],
      ['dang_hoat_dong','BIT','NOT NULL, DEFAULT 1','','Phiên còn hiệu lực không (1=Có)'],
      ['thoi_gian_dang_nhap','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời điểm đăng nhập'],
      ['dia_chi_ip','NVARCHAR(45)','NULL','','Địa chỉ IP của thiết bị đăng nhập'],
    ]
  },
  {
    num:'2.19', name:'KHACH_HANG', title:'Khách hàng',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh tự tăng của khách hàng'],
      ['ma_khach_hang','NVARCHAR(20)','NOT NULL, UNIQUE','','Mã khách hàng (VD: KH-0001)'],
      ['ho_ten','NVARCHAR(100)','NOT NULL','','Họ tên hoặc tên công ty khách hàng'],
      ['dien_thoai','NVARCHAR(15)','NULL','','Số điện thoại liên hệ'],
      ['email','NVARCHAR(100)','NULL','','Địa chỉ email liên hệ'],
      ['dia_chi','NVARCHAR(MAX)','NULL','','Địa chỉ khách hàng'],
      ['ma_so_thue','NVARCHAR(20)','NULL','','Mã số thuế (nếu là doanh nghiệp)'],
      ['trang_thai_kh','NVARCHAR(20)','NULL, DEFAULT N\'potential\'','','Trạng thái KH (potential / active)'],
      ['nguon_kh','NVARCHAR(100)','NULL','','Nguồn tiếp cận khách hàng'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo hồ sơ khách hàng'],
    ]
  },
  {
    num:'2.20', name:'DU_AN', title:'Dự án',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh tự tăng của dự án'],
      ['ma_khach_hang','INT','NOT NULL','FK','Khách hàng của dự án (tham chiếu KHACH_HANG.id)'],
      ['ma_du_an','NVARCHAR(20)','NOT NULL, UNIQUE','','Mã dự án (VD: DA-2024-001)'],
      ['ten_du_an','NVARCHAR(200)','NOT NULL','','Tên công trình / dự án'],
      ['trang_thai','NVARCHAR(20)','NOT NULL, DEFAULT N\'new\'','','Trạng thái dự án (new/designing/production/installing/completed/cancelled)'],
      ['ngay_bat_dau','DATE','NULL','','Ngày bắt đầu triển khai'],
      ['han_hoan_thanh','DATE','NULL','','Hạn hoàn thành công trình'],
      ['dia_chi_thi_cong','NVARCHAR(MAX)','NULL','','Địa chỉ thi công thực tế'],
      ['ghi_chu','NVARCHAR(MAX)','NULL','','Ghi chú thêm về dự án'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian khởi tạo dự án'],
    ]
  },
  {
    num:'2.21', name:'MAU_SAN_PHAM', title:'Mẫu sản phẩm (Template)',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh của mẫu sản phẩm'],
      ['ma_code','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã code mẫu (VD: VWDOOR_1L)'],
      ['ten_san_pham','NVARCHAR(200)','NOT NULL','','Tên mẫu sản phẩm'],
      ['loai_san_pham','NVARCHAR(20)','NOT NULL','','Loại sản phẩm (door/window/glass_wall/railing)'],
      ['danh_muc','NVARCHAR(100)','NULL','','Danh mục phân loại sản phẩm'],
      ['chieu_rong_mac_dinh','INT','NULL','','Chiều rộng mặc định (mm)'],
      ['chieu_cao_mac_dinh','INT','NULL','','Chiều cao mặc định (mm)'],
      ['cau_truc_json','NVARCHAR(MAX)','NULL','','Cấu trúc thiết kế dạng JSON'],
      ['anh_dai_dien','NVARCHAR(MAX)','NULL','','URL hình ảnh đại diện sản phẩm'],
    ]
  },
  {
    num:'2.22', name:'SAN_PHAM_DU_AN', title:'Sản phẩm trong Dự án',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh sản phẩm trong dự án'],
      ['ma_du_an','INT','NOT NULL','FK','Dự án chứa sản phẩm (tham chiếu DU_AN.id)'],
      ['ma_mau_san_pham','INT','NOT NULL','FK','Mẫu sản phẩm được dùng (tham chiếu MAU_SAN_PHAM.id)'],
      ['ma_bao_gia_goc','INT','NULL','FK','Báo giá nguồn gốc (tham chiếu BAO_GIA.id)'],
      ['ten_rieng','NVARCHAR(200)','NULL','','Tên riêng đặt cho sản phẩm trong dự án'],
      ['he_nhom_su_dung','NVARCHAR(50)','NULL','','Mã hệ nhôm áp dụng'],
      ['so_luong','INT','NOT NULL, DEFAULT 1','','Số lượng sản phẩm'],
      ['chieu_rong_tuy_chinh','INT','NULL','','Chiều rộng tùy chỉnh (mm)'],
      ['chieu_cao_tuy_chinh','INT','NULL','','Chiều cao tùy chỉnh (mm)'],
      ['cau_hinh_snapshot','NVARCHAR(MAX)','NULL','','Ảnh chụp cấu hình BOM tại thời điểm thêm'],
      ['vi_tri_lap_dat','NVARCHAR(200)','NULL','','Vị trí lắp đặt trong công trình'],
      ['trang_thai','NVARCHAR(50)','NULL','','Trạng thái sản xuất / lắp đặt'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian thêm sản phẩm vào dự án'],
    ]
  },
  {
    num:'2.23', name:'HE_NHOM', title:'Hệ nhôm',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh hệ nhôm'],
      ['ma_code','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã hệ nhôm (VD: VW-AL55)'],
      ['ten_he','NVARCHAR(100)','NOT NULL','','Tên hệ nhôm'],
      ['ty_trong','DECIMAL(6,3)','NULL','','Tỷ trọng nhôm (kg/dm³)'],
      ['gia_theo_kg','DECIMAL(12,2)','NULL','','Đơn giá theo kg (VNĐ)'],
      ['so_luong_ton','DECIMAL(12,2)','NULL, DEFAULT 0','','Số lượng tồn kho (thanh)'],
    ]
  },
  {
    num:'2.24', name:'PROFILE_NHOM', title:'Profile nhôm',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh profile nhôm'],
      ['ma_he_nhom','INT','NOT NULL','FK','Hệ nhôm chứa profile (tham chiếu HE_NHOM.id)'],
      ['ma_code','NVARCHAR(100)','NOT NULL, UNIQUE','','Mã code profile (VD: VW55-FRAME-V)'],
      ['loai_profile','NVARCHAR(50)','NULL','','Loại profile (frame/sash/mullion/bead...)'],
      ['ten_profile','NVARCHAR(200)','NULL','','Tên mô tả profile'],
      ['trong_luong_theo_met','DECIMAL(8,4)','NULL','','Khối lượng theo chiều dài (kg/m)'],
      ['gia_theo_met','DECIMAL(12,2)','NULL','','Đơn giá theo mét dài (VNĐ)'],
    ]
  },
  {
    num:'2.25', name:'BAO_GIA', title:'Báo giá',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh báo giá'],
      ['ma_du_an','INT','NULL','FK','Dự án được báo giá (tham chiếu DU_AN.id)'],
      ['ma_khach_hang','INT','NOT NULL','FK','Khách hàng nhận báo giá (tham chiếu KHACH_HANG.id)'],
      ['ma_bao_gia_goc','INT','NULL','FK','Báo giá gốc khi tạo phiên bản mới (tự tham chiếu)'],
      ['ma_bao_gia','NVARCHAR(30)','NOT NULL, UNIQUE','','Số báo giá (VD: BG-2024-001)'],
      ['ngay_bao_gia','DATE','NOT NULL','','Ngày lập báo giá'],
      ['so_ngay_hieu_luc','INT','NULL, DEFAULT 30','','Số ngày báo giá còn hiệu lực'],
      ['phien_ban','INT','NOT NULL, DEFAULT 1','','Phiên bản báo giá'],
      ['trang_thai','NVARCHAR(20)','NOT NULL, DEFAULT N\'draft\'','','Trạng thái (draft/sent/approved/rejected/contract_signed)'],
      ['phan_tram_loi_nhuan','DECIMAL(5,2)','NULL','','Phần trăm lợi nhuận (%)'],
      ['phan_tram_vat','DECIMAL(5,2)','NULL','','Phần trăm VAT (%)'],
      ['phan_tram_chiet_khau','DECIMAL(5,2)','NULL','','Phần trăm chiết khấu (%)'],
      ['phi_van_chuyen','DECIMAL(15,2)','NULL','','Phí vận chuyển (VNĐ)'],
      ['tong_tien_cuoi','DECIMAL(15,2)','NULL','','Tổng tiền cuối cùng sau VAT, CK (VNĐ)'],
      ['so_tien_dat_coc','DECIMAL(15,2)','NULL','','Số tiền đặt cọc (VNĐ)'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo báo giá'],
    ]
  },
  {
    num:'2.26', name:'CHI_TIET_BAO_GIA', title:'Chi tiết Báo giá',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dòng chi tiết báo giá'],
      ['ma_bao_gia','INT','NOT NULL','FK','Báo giá chứa dòng này (tham chiếu BAO_GIA.id)'],
      ['ten_san_pham','NVARCHAR(200)','NOT NULL','','Tên sản phẩm trong dòng báo giá'],
      ['chieu_rong','DECIMAL(10,2)','NULL','','Chiều rộng sản phẩm (mm)'],
      ['chieu_cao','DECIMAL(10,2)','NULL','','Chiều cao sản phẩm (mm)'],
      ['so_luong','INT','NOT NULL, DEFAULT 1','','Số lượng'],
      ['don_gia','DECIMAL(15,2)','NULL','','Đơn giá (VNĐ)'],
      ['thanh_tien','DECIMAL(15,2)','NULL','','Thành tiền = Số lượng × Đơn giá (VNĐ)'],
      ['ghi_chu','NVARCHAR(MAX)','NULL','','Ghi chú thêm cho dòng sản phẩm'],
    ]
  },
  {
    num:'2.27', name:'GIAO_DICH_TAI_CHINH', title:'Giao dịch Tài chính',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh giao dịch tài chính'],
      ['ma_du_an','INT','NULL','FK','Dự án liên quan (tham chiếu DU_AN.id)'],
      ['ma_khach_hang','INT','NULL','FK','Khách hàng liên quan (tham chiếu KHACH_HANG.id)'],
      ['ma_giao_dich','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã số giao dịch (VD: GD-2024-001)'],
      ['ngay_giao_dich','DATE','NOT NULL','','Ngày thực hiện giao dịch'],
      ['loai_giao_dich','NVARCHAR(10)','NOT NULL','','Loại giao dịch (revenue: Thu / expense: Chi)'],
      ['danh_muc','NVARCHAR(100)','NULL','','Danh mục giao dịch (đặt cọc, thanh toán lần 1...)'],
      ['so_tien','DECIMAL(15,2)','NOT NULL','','Số tiền giao dịch (VNĐ)'],
      ['dien_giai','NVARCHAR(MAX)','NULL','','Diễn giải nội dung giao dịch'],
      ['trang_thai','NVARCHAR(15)','NOT NULL, DEFAULT N\'draft\'','','Trạng thái (draft / posted / cancelled)'],
      ['phuong_thuc_thanh_toan','NVARCHAR(50)','NULL','','Phương thức thanh toán (Tiền mặt, CK...)'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo bản ghi'],
    ]
  },
  {
    num:'2.28', name:'CHI_TIET_GIAO_DICH', title:'Chi tiết Giao dịch Tài chính',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dòng chi tiết giao dịch'],
      ['ma_giao_dich','INT','NOT NULL','FK','Giao dịch chứa dòng này (tham chiếu GIAO_DICH_TAI_CHINH.id)'],
      ['ten_muc','NVARCHAR(200)','NOT NULL','','Tên mục chi tiết'],
      ['so_luong','INT','NULL, DEFAULT 1','','Số lượng'],
      ['don_gia','DECIMAL(15,2)','NULL','','Đơn giá (VNĐ)'],
      ['thanh_tien','DECIMAL(15,2)','NOT NULL','','Thành tiền (VNĐ)'],
    ]
  },
  {
    num:'2.29', name:'CONG_NO', title:'Công nợ',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh bản ghi công nợ'],
      ['ma_khach_hang','INT','NULL','FK','Khách hàng liên quan (tham chiếu KHACH_HANG.id)'],
      ['ma_du_an','INT','NULL','FK','Dự án liên quan (tham chiếu DU_AN.id)'],
      ['loai_cong_no','NVARCHAR(15)','NOT NULL','','Loại công nợ (receivable: Phải thu / payable: Phải trả)'],
      ['nha_cung_cap','NVARCHAR(200)','NULL','','Nhà cung cấp (nếu là công nợ phải trả)'],
      ['tong_no','DECIMAL(15,2)','NOT NULL, DEFAULT 0','','Tổng giá trị công nợ (VNĐ)'],
      ['da_thanh_toan','DECIMAL(15,2)','NOT NULL, DEFAULT 0','','Số tiền đã thanh toán (VNĐ)'],
      ['so_tien_con_lai','DECIMAL(15,2)','NOT NULL, DEFAULT 0','','Số tiền còn lại chưa thanh toán (VNĐ)'],
      ['trang_thai','NVARCHAR(10)','NOT NULL, DEFAULT N\'pending\'','','Trạng thái (pending / partial / paid)'],
      ['ghi_chu','NVARCHAR(MAX)','NULL','','Ghi chú về công nợ'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo bản ghi công nợ'],
    ]
  },
  {
    num:'2.30', name:'THONG_BAO', title:'Thông báo',
    rows:[
      ['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh thông báo'],
      ['ma_nguoi_dung','INT','NOT NULL','FK','Người nhận thông báo (tham chiếu NGUOI_DUNG.id)'],
      ['tieu_de','NVARCHAR(255)','NOT NULL','','Tiêu đề tóm tắt thông báo'],
      ['noi_dung','NVARCHAR(MAX)','NULL','','Nội dung chi tiết thông báo'],
      ['da_doc','BIT','NOT NULL, DEFAULT 0','','Trạng thái đã đọc (1: Đã đọc, 0: Chưa đọc)'],
      ['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo thông báo'],
    ]
  },
];

function row(r) {
  const [fn, dt, rb, key, desc] = r;
  const isPK = key.includes('PK');
  const isFK = key.includes('FK');
  const fnStyle = isPK ? 'color:#b71c1c;font-weight:700' : isFK ? 'color:#1565c0;font-weight:600' : 'color:#333';
  const keyHtml = key.split(',').map(k => k.trim()).filter(Boolean)
    .map(k => `<span style="font-size:10px;font-weight:700;border-radius:3px;padding:1px 4px;${k==='PK'?'background:#fde8e8;color:#b71c1c;border:1px solid #e57373':'background:#e3eeff;color:#1565c0;border:1px solid #90caf9'}">${k}</span>`)
    .join(' ');
  const bg = isPK || isFK ? '' : '';
  return `<tr><td style="${fnStyle}">${fn}</td><td>${dt}</td><td>${rb}</td><td style="text-align:center;white-space:nowrap">${keyHtml}</td><td>${desc}</td></tr>`;
}

const css = `<style>
body{font-family:'Times New Roman',serif;font-size:13pt;background:#fff;color:#000;padding:36px 54px;max-width:980px;margin:auto;}
.cap{text-align:center;font-style:italic;font-size:12pt;margin:28px 0 8px;}
table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11.5pt;}
th{background:#1a2540;color:#fff;border:1px solid #333;padding:6px 8px;text-align:center;}
td{border:1px solid #555;padding:5px 7px;vertical-align:middle;}
tr:nth-child(even) td{background:#f6f8fb;}
h2{text-align:center;font-size:14pt;font-weight:700;margin:0 0 24px;}
</style>`;

let html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Chi tiết Bảng CSDL - ViralWindow</title>${css}</head><body>`;
html += `<h2>2.4.2. Thiết kế chi tiết các bảng cơ sở dữ liệu</h2>`;

for (const t of tables) {
  html += `<div class="cap">Bảng ${t.num}. Chi tiết bảng ${t.name} (${t.title})</div>`;
  html += `<table><tr><th>Tên trường</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Khóa</th><th>Mô tả</th></tr>`;
  html += t.rows.map(row).join('');
  html += `</table>`;
}

html += `</body></html>`;

fs.writeFileSync('Bang_Chi_Tiet_CSDL_Full.html', html, 'utf8');
console.log('Done! Created Bang_Chi_Tiet_CSDL_Full.html');
