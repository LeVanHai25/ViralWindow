const fs=require('fs');
const css=`<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#fff;font-family:'Times New Roman','Segoe UI',serif;padding:15px;display:flex;flex-direction:column;align-items:center}
.cap{font-size:13pt;color:#000;margin:8px 0;font-style:italic;text-align:center}
.cv{position:relative;background:#fff;border:1.5px solid #000;margin-bottom:30px}
svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.e{position:absolute;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.12);font-size:12pt;border:2px solid #666}
.eh{color:#fff;padding:6px 10px;font-weight:700;font-size:13pt;text-align:center}
.er{display:flex;gap:5px;padding:4px 10px;border-bottom:1px solid #ddd;line-height:1.7;align-items:center}
.er:last-child{border-bottom:none}
.fn{flex:1;white-space:nowrap}
.fpk{color:#c62828;font-weight:700}.ffk{color:#1565c0;font-weight:600}.fat{color:#222}
.t{font-size:9pt;font-weight:700;border-radius:3px;padding:1px 5px}
.tpk{background:#ffcdd2;color:#b71c1c;border:1px solid #e57373}
.tfk{background:#bbdefb;color:#1565c0;border:1px solid #64b5f6}
.h1{background:#1a3a6c}.h2{background:#2e7d32}.h3{background:#6a1b9a}
.h4{background:#c62828}.h5{background:#e65100}.h6{background:#00838f}.h7{background:#455a64}
</style>`;
const mkr=`<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><path d="M0,0L0,7L8,3.5z" fill="#4a6fa5"/></marker></defs>`;

function page(title,w,h,tables,lines){
let s=`<p class="cap">${title}</p><div class="cv" style="width:${w}px;height:${h}px"><svg>${mkr}</svg>`;
for(const t of tables)s+=t;
s+=`</div><script>(function(){const cv=document.querySelectorAll('.cv'),sg=cv[cv.length-1].querySelector('svg');const S='http://www.w3.org/2000/svg';function bx(id){const e=document.getElementById(id),c=e.closest('.cv').getBoundingClientRect(),r=e.getBoundingClientRect();return{l:r.left-c.left,r:r.right-c.left,t:r.top-c.top,b:r.bottom-c.top,cx:r.left-c.left+r.width/2,cy:r.top-c.top+r.height/2}}function pl(pts){const p=document.createElementNS(S,'polyline');p.setAttribute('points',pts.map(v=>v.join(',')).join(' '));p.setAttribute('fill','none');p.setAttribute('stroke','#4a6fa5');p.setAttribute('stroke-width','2');p.setAttribute('stroke-dasharray','6,3');p.setAttribute('marker-end','url(#a)');sg.appendChild(p)}function tx(x,y,t){const e=document.createElementNS(S,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('text-anchor','middle');e.setAttribute('font-size','12');e.setAttribute('fill','#c62828');e.setAttribute('font-weight','700');e.textContent=t;sg.appendChild(e)}${lines}})();<\/script>`;
return s;}

let html=`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>ERD ViralWindow</title>${css}</head><body>`;

// PAGE 1: Auth + Customer/Project
html+=page('Hình 2.25a. Biểu đồ ERD – Module Người dùng, Khách hàng & Dự án',900,620,[
`<div class="e" id="p1a" style="left:20px;top:20px;width:200px"><div class="eh h1">CHUC_VU</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn fat">ten</span></div><div class="er"><span class="fn fat">mo_ta</span></div>
<div class="er"><span class="fn fat">la_he_thong</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p1b" style="left:20px;top:215px;width:200px"><div class="eh h1">QUYEN_HAN</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn fat">ma_code</span></div><div class="er"><span class="fn fat">ten</span></div>
<div class="er"><span class="fn fat">module</span></div><div class="er"><span class="fn fat">thu_tu</span></div></div>`,
`<div class="e" id="p1c" style="left:20px;top:420px;width:200px"><div class="eh h1">CHUC_VU_QUYEN</div>
<div class="er"><span class="fn ffk">ma_chuc_vu</span><span class="t tpk">PK</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_quyen</span><span class="t tpk">PK</span><span class="t tfk">FK</span></div></div>`,
`<div class="e" id="p1d" style="left:250px;top:20px;width:230px"><div class="eh h1">NGUOI_DUNG</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_chuc_vu</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">email</span></div><div class="er"><span class="fn fat">mat_khau</span></div>
<div class="er"><span class="fn fat">ho_ten</span></div><div class="er"><span class="fn fat">loai_tai_khoan</span></div>
<div class="er"><span class="fn fat">trang_thai</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p1e" style="left:250px;top:310px;width:230px"><div class="eh h1">PHIEN_DANG_NHAP</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_nguoi_dung</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">token_phien</span></div><div class="er"><span class="fn fat">dang_hoat_dong</span></div>
<div class="er"><span class="fn fat">thoi_gian_dang_nhap</span></div><div class="er"><span class="fn fat">dia_chi_ip</span></div></div>`,
`<div class="e" id="p1f" style="left:510px;top:20px;width:180px"><div class="eh h7">THONG_BAO</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_nguoi_dung</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">tieu_de</span></div><div class="er"><span class="fn fat">noi_dung</span></div>
<div class="er"><span class="fn fat">da_doc</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p1g" style="left:510px;top:250px;width:220px"><div class="eh h2">KHACH_HANG</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn fat">ma_khach_hang</span></div><div class="er"><span class="fn fat">ho_ten</span></div>
<div class="er"><span class="fn fat">dien_thoai</span></div><div class="er"><span class="fn fat">email</span></div>
<div class="er"><span class="fn fat">dia_chi</span></div><div class="er"><span class="fn fat">ma_so_thue</span></div>
<div class="er"><span class="fn fat">trang_thai_kh</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p1h" style="left:760px;top:20px;width:120px;border-color:#2e7d32;border-width:3px;text-align:center;font-size:11pt;padding:12px"><div class="eh h2">DU_AN</div>
<div class="er"><span class="fn ffk">ma_khach_hang</span><span class="t tfk">FK</span></div>
<div class="er" style="font-style:italic;color:#888;font-size:10pt"><span class="fn">(xem Hình 2.25b)</span></div></div>`
],`
const a=bx('p1a'),b=bx('p1b'),c=bx('p1c'),d=bx('p1d'),e=bx('p1e'),f=bx('p1f'),g=bx('p1g'),h=bx('p1h');
pl([[a.r,a.cy],[d.l,d.cy]]);tx(a.r+10,a.cy-6,'1');tx(d.l-10,d.cy-6,'N');
pl([[a.cx,a.b],[a.cx,c.t]]);tx(a.cx+12,a.b+14,'1');tx(a.cx+12,c.t-6,'N');
pl([[b.cx,b.b],[b.cx,c.t]]);tx(b.cx-12,b.b+14,'1');tx(b.cx-12,c.t-6,'N');
pl([[d.cx,d.b],[d.cx,e.t]]);tx(d.cx+12,d.b+14,'1');tx(d.cx+12,e.t-6,'N');
pl([[d.r,d.cy],[f.l,f.cy]]);tx(d.r+10,d.cy-6,'1');tx(f.l-10,f.cy-6,'N');
pl([[g.cx,g.t],[g.cx,g.t-15],[h.l,g.t-15],[h.l,h.cy+10],[h.l,h.cy]]);tx(g.cx+12,g.t-20,'1');tx(h.l-10,h.cy-4,'N');
`);

// PAGE 2: Product + Quotation
html+=page('Hình 2.25b. Biểu đồ ERD – Module Sản phẩm, BOM & Báo giá',900,650,[
`<div class="e" id="p2a" style="left:20px;top:20px;width:230px"><div class="eh h2">DU_AN</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_khach_hang</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ma_du_an</span></div><div class="er"><span class="fn fat">ten_du_an</span></div>
<div class="er"><span class="fn fat">trang_thai</span></div><div class="er"><span class="fn fat">ngay_bat_dau</span></div>
<div class="er"><span class="fn fat">han_hoan_thanh</span></div><div class="er"><span class="fn fat">dia_chi_thi_cong</span></div>
<div class="er"><span class="fn fat">ghi_chu</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p2b" style="left:290px;top:20px;width:240px"><div class="eh h3">MAU_SAN_PHAM</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn fat">ma_code</span></div><div class="er"><span class="fn fat">ten_san_pham</span></div>
<div class="er"><span class="fn fat">loai_san_pham</span></div><div class="er"><span class="fn fat">danh_muc</span></div>
<div class="er"><span class="fn fat">chieu_rong_mac_dinh</span></div><div class="er"><span class="fn fat">chieu_cao_mac_dinh</span></div>
<div class="er"><span class="fn fat">cau_truc_json</span></div><div class="er"><span class="fn fat">anh_dai_dien</span></div></div>`,
`<div class="e" id="p2c" style="left:290px;top:340px;width:250px"><div class="eh h3">SAN_PHAM_DU_AN</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_mau_san_pham</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ten_rieng</span></div><div class="er"><span class="fn fat">so_luong</span></div>
<div class="er"><span class="fn fat">chieu_rong_tuy_chinh</span></div><div class="er"><span class="fn fat">chieu_cao_tuy_chinh</span></div>
<div class="er"><span class="fn fat">vi_tri_lap_dat</span></div><div class="er"><span class="fn fat">trang_thai</span></div>
<div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p2d" style="left:20px;top:340px;width:240px"><div class="eh h3">VAT_TU_BOM</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_san_pham_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_ton_kho</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">loai_vat_tu</span></div><div class="er"><span class="fn fat">ma_code</span></div>
<div class="er"><span class="fn fat">ten_vat_tu</span></div><div class="er"><span class="fn fat">chieu_dai_mm</span></div>
<div class="er"><span class="fn fat">so_luong</span></div><div class="er"><span class="fn fat">hao_hut_mm</span></div>
<div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p2e" style="left:580px;top:20px;width:250px"><div class="eh h4">BAO_GIA</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ma_bao_gia</span></div><div class="er"><span class="fn fat">ngay_bao_gia</span></div>
<div class="er"><span class="fn fat">phien_ban</span></div><div class="er"><span class="fn fat">trang_thai</span></div>
<div class="er"><span class="fn fat">phan_tram_loi_nhuan</span></div><div class="er"><span class="fn fat">phan_tram_vat</span></div>
<div class="er"><span class="fn fat">tong_tien_cuoi</span></div><div class="er"><span class="fn fat">so_tien_dat_coc</span></div>
<div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p2f" style="left:580px;top:390px;width:250px"><div class="eh h4">CHI_TIET_BAO_GIA</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_bao_gia</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_mau_san_pham</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ten_san_pham</span></div><div class="er"><span class="fn fat">so_luong</span></div>
<div class="er"><span class="fn fat">don_gia</span></div><div class="er"><span class="fn fat">thanh_tien</span></div></div>`
],`
const a=bx('p2a'),b=bx('p2b'),c=bx('p2c'),d=bx('p2d'),e=bx('p2e'),f=bx('p2f');
pl([[a.r,a.cy+20],[a.r+15,a.cy+20],[a.r+15,c.cy],[c.l,c.cy]]);tx(a.r+20,a.cy+16,'1');tx(c.l-10,c.cy-6,'N');
pl([[b.cx,b.b],[b.cx,c.t]]);tx(b.cx+12,b.b+14,'1');tx(b.cx+12,c.t-6,'N');
pl([[c.l,c.cy+20],[c.l-15,c.cy+20],[c.l-15,d.t+20],[d.r,d.t+20]]);tx(c.l-20,c.cy+16,'1');tx(d.r+10,d.t+16,'N');
pl([[a.r,a.t+20],[a.r+20,a.t+20],[a.r+20,15],[e.cx,15],[e.cx,e.t]]);tx(a.r+25,a.t+16,'1');tx(e.cx+12,e.t-6,'N');
pl([[e.cx,e.b],[e.cx,f.t]]);tx(e.cx+12,e.b+14,'1');tx(e.cx+12,f.t-6,'N');
pl([[b.r,b.b-20],[b.r+10,b.b-20],[b.r+10,f.cy],[f.l,f.cy]]);tx(b.r+15,b.b-24,'1');tx(f.l-10,f.cy-6,'N');
`);

// PAGE 3: Finance + Warehouse
html+=page('Hình 2.25c. Biểu đồ ERD – Module Tài chính & Kho',900,550,[
`<div class="e" id="p3a" style="left:20px;top:20px;width:260px"><div class="eh h5">GIAO_DICH_TAI_CHINH</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_bao_gia</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ma_giao_dich</span></div><div class="er"><span class="fn fat">ngay_giao_dich</span></div>
<div class="er"><span class="fn fat">loai_giao_dich</span></div><div class="er"><span class="fn fat">danh_muc</span></div>
<div class="er"><span class="fn fat">so_tien</span></div><div class="er"><span class="fn fat">dien_giai</span></div>
<div class="er"><span class="fn fat">trang_thai</span></div><div class="er"><span class="fn fat">phuong_thuc_thanh_toan</span></div>
<div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p3b" style="left:20px;top:370px;width:260px"><div class="eh h5">CHI_TIET_GIAO_DICH</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_giao_dich</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">ten_muc</span></div><div class="er"><span class="fn fat">so_luong</span></div>
<div class="er"><span class="fn fat">don_gia</span></div><div class="er"><span class="fn fat">thanh_tien</span></div></div>`,
`<div class="e" id="p3c" style="left:320px;top:20px;width:260px"><div class="eh h5">CONG_NO</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">loai_cong_no</span></div><div class="er"><span class="fn fat">nha_cung_cap</span></div>
<div class="er"><span class="fn fat">tong_no</span></div><div class="er"><span class="fn fat">da_thanh_toan</span></div>
<div class="er"><span class="fn fat">trang_thai</span></div><div class="er"><span class="fn fat">ngay_tao</span></div></div>`,
`<div class="e" id="p3d" style="left:620px;top:20px;width:240px"><div class="eh h6">TON_KHO</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn fat">ma_vat_tu</span></div><div class="er"><span class="fn fat">ten_vat_tu</span></div>
<div class="er"><span class="fn fat">loai_vat_tu</span></div><div class="er"><span class="fn fat">don_vi</span></div>
<div class="er"><span class="fn fat">don_gia</span></div><div class="er"><span class="fn fat">nha_cung_cap</span></div>
<div class="er"><span class="fn fat">muc_canh_bao_ton</span></div></div>`,
`<div class="e" id="p3e" style="left:620px;top:320px;width:240px"><div class="eh h6">GIAO_DICH_KHO</div>
<div class="er"><span class="fn fpk">id</span><span class="t tpk">PK</span></div>
<div class="er"><span class="fn ffk">ma_ton_kho</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn ffk">ma_du_an</span><span class="t tfk">FK</span></div>
<div class="er"><span class="fn fat">loai_giao_dich</span></div><div class="er"><span class="fn fat">so_luong</span></div>
<div class="er"><span class="fn fat">ghi_chu</span></div><div class="er"><span class="fn fat">ngay_giao_dich</span></div></div>`
],`
const a=bx('p3a'),b=bx('p3b'),c=bx('p3c'),d=bx('p3d'),e=bx('p3e');
pl([[a.cx,a.b],[a.cx,b.t]]);tx(a.cx+12,a.b+14,'1');tx(a.cx+12,b.t-6,'N');
pl([[d.cx,d.b],[d.cx,e.t]]);tx(d.cx+12,d.b+14,'1');tx(d.cx+12,e.t-6,'N');
`);

html+=`</body></html>`;
fs.writeFileSync('ERD_3_Pages.html',html,'utf8');
console.log('OK - Created ERD_3_Pages.html');
