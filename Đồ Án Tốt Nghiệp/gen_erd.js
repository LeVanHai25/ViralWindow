const fs = require('fs');

const H = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function makeEntityHTML(name, color, rows) {
  const pkStyle = `color:#b71c1c;font-weight:bold;background:#ffcdd2;width:26px;font-size:8px;padding:1px 2px`;
  const fkStyle = `color:#0d47a1;font-weight:bold;background:#bbdefb;width:26px;font-size:8px;padding:1px 2px`;
  const pkfkStyle = `color:#4a148c;font-weight:bold;background:#ce93d8;width:36px;font-size:7px;padding:1px 2px`;
  const pkTextStyle = `color:#b71c1c;font-weight:bold`;
  const fkTextStyle = `color:#0d47a1;font-weight:bold`;
  let html = `<table width="100%" cellpadding="2" cellspacing="0" style="font-family:Arial;font-size:10px;border-collapse:collapse">`;
  html += `<tr><td colspan="2" style="background:${color};color:#fff;font-weight:bold;text-align:center;padding:5px;font-size:11px">${name}</td></tr>`;
  for (const [t, f] of rows) {
    if (t === 'PK') html += `<tr style="border-bottom:1px solid #eee"><td style="${pkStyle}">PK</td><td style="${pkTextStyle}">${f}</td></tr>`;
    else if (t === 'FK') html += `<tr style="border-bottom:1px solid #eee"><td style="${fkStyle}">FK</td><td style="${fkTextStyle}">${f}</td></tr>`;
    else if (t === 'PKFK') html += `<tr style="border-bottom:1px solid #eee"><td style="${pkfkStyle}">PK FK</td><td style="${pkfkStyle}">${f}</td></tr>`;
    else html += `<tr style="border-bottom:1px solid #eee"><td></td><td>${f}</td></tr>`;
  }
  html += `</table>`;
  return H(html);
}

function cell(id, value, style, x, y, w, h) {
  return `<mxCell id="${id}" value="${value}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`;
}
function edge(id, style, src, tgt, label='') {
  return `<mxCell id="${id}" value="${H(label)}" style="${style}" edge="1" source="${src}" target="${tgt}" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>`;
}

const ES = `text;html=1;align=left;verticalAlign=top;overflow=fill;rotatable=0;whiteSpace=wrap;`;
const EM1N = `edgeStyle=entityRelationEdgeStyle;startArrow=ERmandOne;endArrow=ERzeroToMany;fontSize=10;`;
const EM11 = `edgeStyle=entityRelationEdgeStyle;startArrow=ERmandOne;endArrow=ERmandMany;fontSize=10;`;
const E01N = `edgeStyle=entityRelationEdgeStyle;startArrow=ERzeroToOne;endArrow=ERzeroToMany;fontSize=10;`;
const E11N = `edgeStyle=entityRelationEdgeStyle;startArrow=ERmandOne;endArrow=ERmandMany;fontSize=10;`;

const ENTITIES = [
  // [id, x, y, w, color, name, [[type, field],...]]
  ['e10', 20,  20, 220, '#1a3a6c', 'CHUC_VU', [['PK','id'],['','ten'],['','mo_ta'],['','la_he_thong'],['','ngay_tao']]],
  ['e11',270,  20, 220, '#1a3a6c', 'NGUOI_DUNG', [['PK','id'],['FK','ma_chuc_vu'],['','email'],['','mat_khau'],['','ho_ten'],['','loai_tai_khoan'],['','trang_thai'],['','ngay_tao']]],
  ['e12',530,  20, 230, '#2e7d32', 'KHACH_HANG', [['PK','id'],['','ma_khach_hang'],['','ho_ten'],['','dien_thoai'],['','email'],['','dia_chi'],['','ma_so_thue'],['','trang_thai_kh'],['','ngay_tao']]],
  ['e13',790,  20, 240, '#6a1b9a', 'MAU_SAN_PHAM', [['PK','id'],['','ma_code'],['','ten_san_pham'],['','loai_san_pham'],['','danh_muc'],['','chieu_rong_mac_dinh'],['','chieu_cao_mac_dinh'],['','cau_truc_json'],['','anh_dai_dien']]],
  ['e14',1060, 20, 240, '#c62828', 'BAO_GIA', [['PK','id'],['FK','ma_du_an'],['','ma_bao_gia'],['','ngay_bao_gia'],['','phien_ban'],['','trang_thai'],['','phan_tram_loi_nhuan'],['','phan_tram_vat'],['','phi_van_chuyen'],['','tong_tien_cuoi'],['','so_tien_dat_coc'],['','ngay_tao']]],
  ['e15',1330, 20, 250, '#e65100', 'GIAO_DICH_TAI_CHINH', [['PK','id'],['FK','ma_du_an'],['FK','ma_bao_gia'],['','ma_giao_dich'],['','ngay_giao_dich'],['','loai_giao_dich'],['','danh_muc'],['','so_tien'],['','dien_giai'],['','trang_thai'],['','phuong_thuc_tt'],['','ngay_tao']]],
  ['e16',1610, 20, 230, '#00695c', 'TON_KHO', [['PK','id'],['','ma_vat_tu'],['','ten_vat_tu'],['','loai_vat_tu'],['','don_vi'],['','don_gia'],['','nha_cung_cap'],['','muc_canh_bao_ton']]],
  ['e17', 20, 390, 220, '#1a3a6c', 'QUYEN_HAN', [['PK','id'],['','ma_code'],['','ten'],['','module'],['','thu_tu']]],
  ['e18',270, 390, 220, '#1a3a6c', 'PHIEN_DANG_NHAP', [['PK','id'],['FK','ma_nguoi_dung'],['','token_phien'],['','dang_hoat_dong'],['','thoi_gian_dang_nhap'],['','dia_chi_ip']]],
  ['e19',530, 390, 230, '#2e7d32', 'DU_AN', [['PK','id'],['FK','ma_khach_hang'],['','ma_du_an'],['','ten_du_an'],['','trang_thai'],['','ngay_bat_dau'],['','han_hoan_thanh'],['','dia_chi_thi_cong'],['','ghi_chu'],['','ngay_tao']]],
  ['e20',790, 390, 240, '#6a1b9a', 'SAN_PHAM_DU_AN', [['PK','id'],['FK','ma_du_an'],['FK','ma_mau_san_pham'],['','ten_rieng'],['','so_luong'],['','chieu_rong_tuy_chinh'],['','chieu_cao_tuy_chinh'],['','cau_hinh_snapshot'],['','vi_tri_lap_dat'],['','trang_thai'],['','ngay_tao']]],
  ['e21',1060,390, 240, '#c62828', 'CHI_TIET_BAO_GIA', [['PK','id'],['FK','ma_bao_gia'],['FK','ma_mau_san_pham'],['','ten_san_pham'],['','chieu_rong'],['','chieu_cao'],['','so_luong'],['','don_gia'],['','thanh_tien']]],
  ['e22',1330,390, 250, '#e65100', 'CHI_TIET_GIAO_DICH', [['PK','id'],['FK','ma_giao_dich'],['','ten_muc'],['','so_luong'],['','don_gia'],['','thanh_tien']]],
  ['e23',1610,390, 230, '#00695c', 'GIAO_DICH_KHO', [['PK','id'],['FK','ma_ton_kho'],['FK','ma_du_an'],['','loai_giao_dich'],['','so_luong'],['','ghi_chu'],['','ngay_giao_dich']]],
  ['e24', 20, 720, 220, '#37474f', 'CHUC_VU_QUYEN', [['PKFK','ma_chuc_vu'],['PKFK','ma_quyen']]],
  ['e25',270, 720, 220, '#455a64', 'THONG_BAO', [['PK','id'],['FK','ma_nguoi_dung'],['','tieu_de'],['','noi_dung'],['','da_doc'],['','ngay_tao']]],
  ['e26',790, 720, 240, '#6a1b9a', 'VAT_TU_BOM', [['PK','id'],['FK','ma_san_pham_du_an'],['FK','ma_ton_kho'],['','loai_vat_tu'],['','ma_code'],['','ten_vat_tu'],['','chieu_dai_mm'],['','so_luong'],['','hao_hut_mm'],['','ngay_tao']]],
  ['e27',1330,720, 250, '#e65100', 'CONG_NO', [['PK','id'],['FK','ma_du_an'],['','loai_cong_no'],['','nha_cung_cap'],['','tong_no'],['','da_thanh_toan'],['','trang_thai'],['','ngay_tao']]],
];

const ROW_H = 22, HDR_H = 30;

let cells = [];
for (const [id, x, y, w, color, name, rows] of ENTITIES) {
  const h = HDR_H + rows.length * ROW_H;
  const val = makeEntityHTML(name, color, rows);
  cells.push(cell(id, val, ES + `strokeColor=${color};strokeWidth=2;`, x, y, w, h));
}

const EDGES = [
  ['ed1', EM11, 'e10','e11', '1 có N'],
  ['ed2', EM11, 'e10','e24', '1 gán N'],
  ['ed3', EM11, 'e17','e24', '1 gán N'],
  ['ed4', EM1N, 'e11','e18', '1 đăng nhập 0..N'],
  ['ed5', EM1N, 'e11','e25', '1 nhận 0..N'],
  ['ed6', EM1N, 'e12','e19', '1 sở hữu 0..N'],
  ['ed7', EM1N, 'e13','e20', '1 áp dụng 0..N'],
  ['ed8', EM1N, 'e19','e20', '1 chứa 0..N'],
  ['ed9', EM1N, 'e20','e26', '1 bóc tách 0..N'],
  ['ed10',EM1N, 'e19','e14', '1 tạo 0..N'],
  ['ed11',EM11, 'e14','e21', '1 gồm N'],
  ['ed12',E01N, 'e13','e21', '0..1 tham chiếu 0..N'],
  ['ed13',EM1N, 'e19','e15', '1 phát sinh 0..N'],
  ['ed14',E01N, 'e14','e15', '0..1 thanh toán 0..N'],
  ['ed15',EM1N, 'e15','e22', '1 gồm 0..N'],
  ['ed16',EM1N, 'e19','e27', '1 công nợ 0..N'],
  ['ed17',EM1N, 'e16','e23', '1 xuất/nhập 0..N'],
  ['ed18',E01N, 'e19','e23', '0..1 xuất kho 0..N'],
  ['ed19',EM1N, 'e16','e26', '1 tra cứu 0..N'],
];

for (const [id, style, src, tgt, lbl] of EDGES) {
  cells.push(edge(id, style, src, tgt, lbl));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="21.0.0">
  <diagram name="ERD ViralWindow">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1854" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

const out = 'd:\\ViralWindow_Phan_Mem_Nhom_Kinh\\Đồ Án Tốt Nghiệp\\erd_viralwindow.drawio';
fs.writeFileSync(out, xml, 'utf8');
console.log('✅ Đã tạo:', out);
