const fs=require('fs');
const T=[
{n:'2.14',name:'CHUC_VU',t:'Chức vụ / Vai trò',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh tự tăng của chức vụ'],
['ten','NVARCHAR(100)','NOT NULL, UNIQUE','','Tên chức vụ'],
['mo_ta','NVARCHAR(MAX)','NULL','','Mô tả chi tiết chức vụ'],
['la_he_thong','BIT','NOT NULL, DEFAULT 0','','Chức vụ hệ thống (1: Có, 0: Không)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo bản ghi']]},
{n:'2.15',name:'QUYEN_HAN',t:'Quyền hạn',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh quyền hạn'],
['ma_code','NVARCHAR(100)','NOT NULL, UNIQUE','','Mã code quyền (VD: project.view)'],
['ten','NVARCHAR(200)','NOT NULL','','Tên hiển thị quyền hạn'],
['module','NVARCHAR(100)','NOT NULL','','Module chức năng chứa quyền'],
['thu_tu','INT','NULL, DEFAULT 0','','Thứ tự hiển thị trong danh sách']]},
{n:'2.16',name:'CHUC_VU_QUYEN',t:'Phân quyền theo Chức vụ (M-N)',r:[
['ma_chuc_vu','INT','NOT NULL','PK, FK','Mã chức vụ (tham chiếu CHUC_VU.id)'],
['ma_quyen','INT','NOT NULL','PK, FK','Mã quyền hạn (tham chiếu QUYEN_HAN.id)']]},
{n:'2.17',name:'NGUOI_DUNG',t:'Người dùng',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh người dùng'],
['ma_chuc_vu','INT','NULL','FK','Chức vụ người dùng (tham chiếu CHUC_VU.id)'],
['email','NVARCHAR(100)','NOT NULL, UNIQUE','','Email đăng nhập hệ thống'],
['mat_khau','NVARCHAR(255)','NOT NULL','','Mật khẩu mã hóa Bcrypt'],
['ho_ten','NVARCHAR(100)','NOT NULL','','Họ và tên đầy đủ'],
['loai_tai_khoan','NVARCHAR(10)','NOT NULL, DEFAULT N\'user\'','','Loại tài khoản (admin / user)'],
['trang_thai','BIT','NOT NULL, DEFAULT 1','','Trạng thái (1: Hoạt động, 0: Khóa)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo tài khoản']]},
{n:'2.18',name:'PHIEN_DANG_NHAP',t:'Phiên đăng nhập',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh phiên'],
['ma_nguoi_dung','INT','NOT NULL','FK','Người dùng (tham chiếu NGUOI_DUNG.id)'],
['token_phien','NVARCHAR(MAX)','NOT NULL','','JWT token của phiên'],
['dang_hoat_dong','BIT','NOT NULL, DEFAULT 1','','Phiên còn hiệu lực (1: Có)'],
['thoi_gian_dang_nhap','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời điểm đăng nhập'],
['dia_chi_ip','NVARCHAR(45)','NULL','','Địa chỉ IP thiết bị']]},
{n:'2.19',name:'THONG_BAO',t:'Thông báo hệ thống',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh thông báo'],
['ma_nguoi_dung','INT','NOT NULL','FK','Người nhận (tham chiếu NGUOI_DUNG.id)'],
['tieu_de','NVARCHAR(255)','NOT NULL','','Tiêu đề thông báo'],
['noi_dung','NVARCHAR(MAX)','NULL','','Nội dung chi tiết'],
['da_doc','BIT','NOT NULL, DEFAULT 0','','Trạng thái đọc (1: Đã đọc)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo thông báo']]},
{n:'2.20',name:'KHACH_HANG',t:'Khách hàng',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh khách hàng'],
['ma_khach_hang','NVARCHAR(20)','NOT NULL, UNIQUE','','Mã KH (VD: KH-0001)'],
['ho_ten','NVARCHAR(100)','NOT NULL','','Tên khách hàng / công ty'],
['dien_thoai','NVARCHAR(15)','NULL','','Số điện thoại liên hệ'],
['email','NVARCHAR(100)','NULL','','Email liên hệ'],
['dia_chi','NVARCHAR(MAX)','NULL','','Địa chỉ khách hàng'],
['ma_so_thue','NVARCHAR(20)','NULL','','Mã số thuế (nếu doanh nghiệp)'],
['trang_thai_kh','NVARCHAR(20)','NULL, DEFAULT N\'potential\'','','Trạng thái (potential / active)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo hồ sơ']]},
{n:'2.21',name:'DU_AN',t:'Dự án',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dự án'],
['ma_khach_hang','INT','NOT NULL','FK','Khách hàng (tham chiếu KHACH_HANG.id)'],
['ma_du_an','NVARCHAR(20)','NOT NULL, UNIQUE','','Mã dự án (VD: DA-2024-001)'],
['ten_du_an','NVARCHAR(200)','NOT NULL','','Tên công trình / dự án'],
['trang_thai','NVARCHAR(20)','NOT NULL, DEFAULT N\'new\'','','Trạng thái (new / designing / production / installing / completed / cancelled)'],
['ngay_bat_dau','DATE','NULL','','Ngày bắt đầu triển khai'],
['han_hoan_thanh','DATE','NULL','','Hạn hoàn thành công trình'],
['dia_chi_thi_cong','NVARCHAR(MAX)','NULL','','Địa chỉ thi công thực tế'],
['ghi_chu','NVARCHAR(MAX)','NULL','','Ghi chú về dự án'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian khởi tạo dự án']]},
{n:'2.22',name:'MAU_SAN_PHAM',t:'Mẫu sản phẩm (Template)',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh mẫu sản phẩm'],
['ma_code','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã code mẫu (VD: VWDOOR_1L)'],
['ten_san_pham','NVARCHAR(200)','NOT NULL','','Tên mẫu sản phẩm'],
['loai_san_pham','NVARCHAR(20)','NOT NULL','','Loại (door / window / glass_wall / railing)'],
['danh_muc','NVARCHAR(100)','NULL','','Danh mục phân loại'],
['chieu_rong_mac_dinh','INT','NULL','','Chiều rộng mặc định (mm)'],
['chieu_cao_mac_dinh','INT','NULL','','Chiều cao mặc định (mm)'],
['cau_truc_json','NVARCHAR(MAX)','NULL','','Cấu trúc thiết kế dạng JSON'],
['anh_dai_dien','NVARCHAR(MAX)','NULL','','URL hình ảnh đại diện']]},
{n:'2.23',name:'SAN_PHAM_DU_AN',t:'Sản phẩm trong Dự án',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh sản phẩm dự án'],
['ma_du_an','INT','NOT NULL','FK','Dự án chứa SP (tham chiếu DU_AN.id)'],
['ma_mau_san_pham','INT','NOT NULL','FK','Mẫu SP sử dụng (tham chiếu MAU_SAN_PHAM.id)'],
['ten_rieng','NVARCHAR(200)','NULL','','Tên riêng đặt cho SP trong dự án'],
['so_luong','INT','NOT NULL, DEFAULT 1','','Số lượng sản phẩm'],
['chieu_rong_tuy_chinh','INT','NULL','','Chiều rộng tùy chỉnh (mm)'],
['chieu_cao_tuy_chinh','INT','NULL','','Chiều cao tùy chỉnh (mm)'],
['cau_hinh_snapshot','NVARCHAR(MAX)','NULL','','Ảnh chụp cấu hình BOM tại thời điểm thêm'],
['vi_tri_lap_dat','NVARCHAR(200)','NULL','','Vị trí lắp đặt trong công trình'],
['trang_thai','NVARCHAR(50)','NULL','','Trạng thái sản xuất / lắp đặt'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian thêm SP vào dự án']]},
{n:'2.24',name:'VAT_TU_BOM',t:'Bóc tách vật tư sản phẩm (BOM)',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dòng vật tư BOM'],
['ma_san_pham_du_an','INT','NOT NULL','FK','SP dự án (tham chiếu SAN_PHAM_DU_AN.id)'],
['ma_ton_kho','INT','NULL','FK','Liên kết kho (tham chiếu TON_KHO.id)'],
['loai_vat_tu','NVARCHAR(50)','NOT NULL','','Loại vật tư (profile / glass / accessory / gasket)'],
['ma_code','NVARCHAR(100)','NULL','','Mã code vật tư'],
['ten_vat_tu','NVARCHAR(255)','NOT NULL','','Tên vật tư'],
['chieu_dai_mm','INT','NULL','','Chiều dài cắt (mm) – dùng cho profile'],
['so_luong','DECIMAL(10,3)','NOT NULL, DEFAULT 1','','Số lượng'],
['hao_hut_mm','INT','NULL','','Hao hụt cắt (mm)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian bóc tách']]},
{n:'2.25',name:'BAO_GIA',t:'Báo giá',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh báo giá'],
['ma_du_an','INT','NULL','FK','Dự án được báo giá (tham chiếu DU_AN.id)'],
['ma_bao_gia','NVARCHAR(30)','NOT NULL, UNIQUE','','Số báo giá (VD: BG-2024-001)'],
['ngay_bao_gia','DATE','NOT NULL','','Ngày lập báo giá'],
['phien_ban','INT','NOT NULL, DEFAULT 1','','Phiên bản báo giá'],
['trang_thai','NVARCHAR(20)','NOT NULL, DEFAULT N\'draft\'','','Trạng thái (draft / sent / approved / rejected / contract_signed)'],
['phan_tram_loi_nhuan','DECIMAL(5,2)','NULL','','Phần trăm lợi nhuận (%)'],
['phan_tram_vat','DECIMAL(5,2)','NULL','','Phần trăm VAT (%)'],
['phi_van_chuyen','DECIMAL(15,2)','NULL','','Phí vận chuyển (VNĐ)'],
['tong_tien_cuoi','DECIMAL(15,2)','NULL','','Tổng tiền sau VAT, CK (VNĐ)'],
['so_tien_dat_coc','DECIMAL(15,2)','NULL','','Số tiền đặt cọc (VNĐ)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo báo giá']]},
{n:'2.26',name:'CHI_TIET_BAO_GIA',t:'Chi tiết Báo giá',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dòng chi tiết'],
['ma_bao_gia','INT','NOT NULL','FK','Báo giá cha (tham chiếu BAO_GIA.id)'],
['ma_mau_san_pham','INT','NULL','FK','Mẫu SP tham chiếu (tham chiếu MAU_SAN_PHAM.id)'],
['ten_san_pham','NVARCHAR(200)','NOT NULL','','Tên hiển thị sản phẩm (cache)'],
['chieu_rong','DECIMAL(10,2)','NULL','','Chiều rộng (mm)'],
['chieu_cao','DECIMAL(10,2)','NULL','','Chiều cao (mm)'],
['so_luong','INT','NOT NULL, DEFAULT 1','','Số lượng'],
['don_gia','DECIMAL(15,2)','NULL','','Đơn giá (VNĐ)'],
['thanh_tien','DECIMAL(15,2)','NULL','','Thành tiền (VNĐ)']]},
{n:'2.27',name:'GIAO_DICH_TAI_CHINH',t:'Giao dịch Tài chính',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh giao dịch'],
['ma_du_an','INT','NULL','FK','Dự án liên quan (tham chiếu DU_AN.id)'],
['ma_bao_gia','INT','NULL','FK','Báo giá nguồn (tham chiếu BAO_GIA.id)'],
['ma_giao_dich','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã giao dịch (VD: GD-2024-001)'],
['ngay_giao_dich','DATE','NOT NULL','','Ngày thực hiện giao dịch'],
['loai_giao_dich','NVARCHAR(10)','NOT NULL','','Loại (revenue: Thu / expense: Chi)'],
['danh_muc','NVARCHAR(100)','NULL','','Danh mục (đặt cọc, thanh toán...)'],
['so_tien','DECIMAL(15,2)','NOT NULL','','Số tiền giao dịch (VNĐ)'],
['dien_giai','NVARCHAR(MAX)','NULL','','Diễn giải nội dung'],
['trang_thai','NVARCHAR(15)','NOT NULL, DEFAULT N\'draft\'','','Trạng thái (draft / posted / cancelled)'],
['phuong_thuc_thanh_toan','NVARCHAR(50)','NULL','','Phương thức (Tiền mặt, CK...)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo bản ghi']]},
{n:'2.28',name:'CHI_TIET_GIAO_DICH',t:'Chi tiết Giao dịch',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh dòng chi tiết'],
['ma_giao_dich','INT','NOT NULL','FK','Giao dịch cha (tham chiếu GIAO_DICH_TAI_CHINH.id)'],
['ten_muc','NVARCHAR(200)','NOT NULL','','Tên mục chi tiết'],
['so_luong','INT','NULL, DEFAULT 1','','Số lượng'],
['don_gia','DECIMAL(15,2)','NULL','','Đơn giá (VNĐ)'],
['thanh_tien','DECIMAL(15,2)','NOT NULL','','Thành tiền (VNĐ)']]},
{n:'2.29',name:'CONG_NO',t:'Công nợ',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh công nợ'],
['ma_du_an','INT','NULL','FK','Dự án liên quan (tham chiếu DU_AN.id)'],
['loai_cong_no','NVARCHAR(15)','NOT NULL','','Loại (receivable: Phải thu / payable: Phải trả)'],
['nha_cung_cap','NVARCHAR(200)','NULL','','Nhà cung cấp (nếu phải trả)'],
['tong_no','DECIMAL(15,2)','NOT NULL, DEFAULT 0','','Tổng giá trị công nợ (VNĐ)'],
['da_thanh_toan','DECIMAL(15,2)','NOT NULL, DEFAULT 0','','Số tiền đã thanh toán (VNĐ)'],
['trang_thai','NVARCHAR(10)','NOT NULL, DEFAULT N\'pending\'','','Trạng thái (pending / partial / paid)'],
['ngay_tao','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian tạo công nợ']]},
{n:'2.30',name:'TON_KHO',t:'Tồn kho vật tư',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh vật tư kho'],
['ma_vat_tu','NVARCHAR(50)','NOT NULL, UNIQUE','','Mã vật tư (VD: XFA55-KD)'],
['ten_vat_tu','NVARCHAR(255)','NOT NULL','','Tên vật tư'],
['loai_vat_tu','NVARCHAR(50)','NOT NULL','','Loại (profile / glass / accessory / gasket)'],
['don_vi','NVARCHAR(50)','NULL, DEFAULT N\'cái\'','','Đơn vị tính (m, m2, cái, bộ)'],
['don_gia','DECIMAL(15,2)','NULL','','Đơn giá nhập (VNĐ)'],
['nha_cung_cap','NVARCHAR(200)','NULL','','Nhà cung cấp'],
['muc_canh_bao_ton','INT','NULL','','Mức tồn kho tối thiểu để cảnh báo']]},
{n:'2.31',name:'GIAO_DICH_KHO',t:'Giao dịch Kho (Nhập/Xuất)',r:[
['id','INT IDENTITY(1,1)','NOT NULL','PK','Mã định danh giao dịch kho'],
['ma_ton_kho','INT','NOT NULL','FK','Vật tư kho (tham chiếu TON_KHO.id)'],
['ma_du_an','INT','NULL','FK','Dự án xuất kho (tham chiếu DU_AN.id)'],
['loai_giao_dich','NVARCHAR(10)','NOT NULL','','Loại (import: Nhập / export: Xuất)'],
['so_luong','DECIMAL(10,2)','NOT NULL','','Số lượng nhập/xuất'],
['ghi_chu','NVARCHAR(MAX)','NULL','','Ghi chú giao dịch'],
['ngay_giao_dich','DATETIME2','NOT NULL, DEFAULT GETDATE()','','Thời gian giao dịch']]}
];
function rw(r){const[fn,dt,rb,key,desc]=r;
const isPK=key.includes('PK'),isFK=key.includes('FK');
const s=isPK?'color:#b71c1c;font-weight:700':isFK?'color:#1565c0;font-weight:600':'color:#333';
const kh=key.split(',').map(k=>k.trim()).filter(Boolean)
.map(k=>`<span style="font-size:10px;font-weight:700;border-radius:3px;padding:1px 4px;${k==='PK'?'background:#fde8e8;color:#b71c1c;border:1px solid #e57373':'background:#e3eeff;color:#1565c0;border:1px solid #90caf9'}">${k}</span>`).join(' ');
return `<tr><td style="${s}">${fn}</td><td>${dt}</td><td>${rb}</td><td style="text-align:center;white-space:nowrap">${kh}</td><td>${desc}</td></tr>`;}
let h=`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Chi tiết Bảng CSDL v4</title>
<style>body{font-family:'Times New Roman',serif;font-size:13pt;background:#fff;color:#000;padding:36px 54px;max-width:980px;margin:auto}
.cap{text-align:center;font-style:italic;font-size:12pt;margin:26px 0 8px}
table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11.5pt}
th{background:#1a2540;color:#fff;border:1px solid #333;padding:6px 8px;text-align:center}
td{border:1px solid #555;padding:5px 7px;vertical-align:middle}
tr:nth-child(even) td{background:#f6f8fb}
h2{text-align:center;font-size:14pt;font-weight:700;margin:0 0 20px}</style></head><body>`;
h+=`<h2>2.4.2. Thiết kế chi tiết các bảng cơ sở dữ liệu</h2>`;
for(const t of T){
h+=`<div class="cap">Bảng ${t.n}. Chi tiết bảng ${t.name} (${t.t})</div>`;
h+=`<table><tr><th>Tên trường</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Khóa</th><th>Mô tả</th></tr>`;
h+=t.r.map(rw).join('');h+=`</table>`;}
h+=`</body></html>`;
fs.writeFileSync('Bang_Chi_Tiet_CSDL_v4.html',h,'utf8');
console.log('Done! Created Bang_Chi_Tiet_CSDL_v4.html');
