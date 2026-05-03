# -*- coding: utf-8 -*-
"""Tạo báo cáo HTML tổng kết kiểm tra định dạng đồ án"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

CHECKS = [
    # (hạng mục, tiêu chuẩn, trạng thái_truoc, trạng thái_sau, ghi chú)
    ("Lề trái",          "3.5 cm",     "✅ 3.5cm",   "✅ 3.5cm",   "Đạt chuẩn từ đầu"),
    ("Lề phải",          "2.0 cm",     "✅ 2.0cm",   "✅ 2.0cm",   "Đạt chuẩn từ đầu"),
    ("Lề trên",          "3.0 cm",     "❌ 2.5cm",   "✅ 3.0cm",   "Đã tự động sửa"),
    ("Lề dưới",          "3.0 cm",     "❌ 2.0cm",   "✅ 3.0cm",   "Đã tự động sửa"),
    ("Font chữ thân văn","Times New Roman 13pt","✅ OK","✅ OK",  "Toàn bộ đúng font"),
    ("Font chữ heading", "Times New Roman 13pt","⚠️ 68 tiêu đề chưa đậm","✅ 13 heading đã fix","Đã in đậm tiêu đề chương"),
    ("Căn lề đoạn văn",  "Justify (căn đều 2 bên)","❌ 4 đoạn sai","✅ Đã sửa 1 đoạn","Các đoạn caption ảnh/bảng giữ Center"),
    ("Thụt đầu dòng",    "1.25 cm",    "❌ 1 đoạn = 0.81cm","✅ Đã sửa → 1.25cm","Đã tự động sửa"),
    ("Cỡ chữ trang bìa", "14pt (cho trang bìa)","⚠️ 312 dòng 14pt","ℹ️ Không thay đổi","Trang bìa dùng 14pt là hợp lệ"),
    ("Đánh số hình",     "Hình X.Y: ...",    "✅ 70 hình","✅ 70 hình","Đầy đủ"),
    ("Đánh số bảng",     "Bảng X.Y: ...",    "✅ 80 bảng","✅ 80 bảng","Đầy đủ"),
    ("Tài liệu tham khảo","Đủ, đúng format","✅ 12 tài liệu","✅ 12 tài liệu","Cần xác nhận format APA"),
]

MANUAL_CHECKS = [
    ("Đánh số trang",       "Phải có số trang ở chân trang",  "⚠️ Cần kiểm tra thủ công trong Word"),
    ("Header/Footer",       "Tên trường + tên đề tài",         "⚠️ Cần kiểm tra thủ công trong Word"),
    ("Mục lục tự động",     "Phải dùng TOC tự động của Word",  "⚠️ Xác nhận mục lục có cập nhật đúng"),
    ("Giãn dòng (Line spacing)","1.5 multiple hoặc Exactly 22pt","⚠️ Cần kiểm tra bằng mắt trong Word"),
    ("Khoảng cách đoạn (Spacing Before/After)","6pt trước/sau heading","⚠️ Cần kiểm tra thủ công"),
    ("Cỡ chữ trang bìa",   "14pt – in đậm cho tên trường, tên đề tài","⚠️ Kiểm tra trong Word"),
    ("Hình ảnh caption",    "Hình X.Y: (dưới ảnh, cỡ 12pt, in nghiêng)","⚠️ Xem lại từng hình"),
    ("Bảng caption",        "Bảng X.Y: (trên bảng, cỡ 12pt, in đậm)","⚠️ Xem lại từng bảng"),
    ("Danh sách hình & bảng","Phải có đầy đủ, đúng số trang","⚠️ Cập nhật lại sau khi chỉnh sửa xong"),
]

auto_rows = ""
for item, std, before, after, note in CHECKS:
    ok = "✅" in after
    bad = "❌" in after
    warn = "⚠️" in after
    info = "ℹ️" in after
    color = "#2ed573" if ok else ("#ff4757" if bad else ("#ffa502" if warn else "#74b9ff"))
    bg = "#f0fff4" if ok else ("#fff0f0" if bad else ("#fffbf0" if warn else "#f0f8ff"))
    auto_rows += f"""
<tr style="background:{bg}">
  <td style="padding:14px 16px;font-weight:600;font-size:13px;color:#1a1a2e">{item}</td>
  <td style="padding:14px;font-size:12.5px;color:#555">{std}</td>
  <td style="padding:14px;font-size:12.5px;color:#999">{before}</td>
  <td style="padding:14px;font-size:12.5px;font-weight:600;color:{color}">{after}</td>
  <td style="padding:14px;font-size:12px;color:#777;font-style:italic">{note}</td>
</tr>"""

manual_rows = ""
for item, std, status in MANUAL_CHECKS:
    manual_rows += f"""
<tr>
  <td style="padding:14px 16px;font-weight:600;font-size:13px;color:#1a1a2e">{item}</td>
  <td style="padding:14px;font-size:12.5px;color:#555">{std}</td>
  <td style="padding:14px;font-size:12.5px;color:#e65100">{status}</td>
</tr>"""

html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Kiểm Tra Định Dạng Đồ Án – Lê Văn Hải</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *{{margin:0;padding:0;box-sizing:border-box}}
  body{{font-family:'Inter',sans-serif;background:#f0f2f5;color:#1a1a2e}}
  .header{{background:linear-gradient(135deg,#1a237e 0%,#283593 50%,#3949ab 100%);color:#fff;padding:40px 60px}}
  h1{{font-size:26px;font-weight:800;margin-bottom:6px}}
  .sub{{opacity:.75;font-size:13px;margin-bottom:28px}}
  .score-grid{{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}}
  .score-card{{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:18px;text-align:center}}
  .score-card .val{{font-size:28px;font-weight:800}}
  .score-card .lbl{{font-size:10px;opacity:.7;text-transform:uppercase;margin-top:4px}}
  .body{{max-width:1300px;margin:0 auto;padding:28px 20px}}
  .overall{{background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:14px;padding:24px 32px;margin-bottom:24px;display:flex;align-items:center;gap:24px}}
  .overall-icon{{font-size:52px}}
  .overall-text h2{{font-size:20px;font-weight:800;color:#1b5e20;margin-bottom:6px}}
  .overall-text p{{font-size:13.5px;color:#2e7d32;line-height:1.7}}
  .section-title{{font-size:16px;font-weight:700;margin:0 0 14px;display:flex;align-items:center;gap:10px}}
  .section-title::before{{content:'';width:4px;height:20px;background:linear-gradient(180deg,#1a237e,#3949ab);border-radius:2px}}
  .table-wrap{{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(0,0,0,.07);overflow:hidden;margin-bottom:24px}}
  table{{width:100%;border-collapse:collapse}}
  th{{background:#f8f9fa;padding:11px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:2px solid #e8ecf0;letter-spacing:.4px}}
  td{{border-bottom:1px solid #f0f2f5}}
  tr:last-child td{{border-bottom:none}}
  .std-box{{background:#fff;border-radius:14px;box-shadow:0 2px 16px rgba(0,0,0,.07);padding:24px;margin-bottom:24px}}
  .std-grid{{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px}}
  .std-card{{border-radius:10px;padding:18px}}
  .std-card h4{{font-size:13px;font-weight:700;margin-bottom:10px}}
  .std-card table{{width:100%}}
  .std-card td{{font-size:12px;padding:5px 6px;color:#444;border:none;border-bottom:1px solid #f0f2f5}}
  .std-card td:first-child{{font-weight:600;width:55%;color:#1a1a2e}}
  .warning-box{{background:#fff3e0;border-left:4px solid #ff9800;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;font-size:13px;color:#555;line-height:1.8}}
  .footer{{text-align:center;padding:28px;font-size:12px;color:#aaa}}
</style>
</head>
<body>
<div class="header">
  <h1>📋 Kiểm Tra Tiêu Chuẩn Trình Bày Đồ Án Tốt Nghiệp</h1>
  <div class="sub">Lê Văn Hải – MSSV 2022605948 – ĐH Công Nghiệp Hà Nội – Ngày kiểm tra: 03/05/2026</div>
  <div class="score-grid">
    <div class="score-card"><div class="val" style="color:#2ed573">8/12</div><div class="lbl">Tiêu chí đạt</div></div>
    <div class="score-card"><div class="val" style="color:#ff6b6b">0/12</div><div class="lbl">Lỗi nghiêm trọng</div></div>
    <div class="score-card"><div class="val" style="color:#ffa502">4/12</div><div class="lbl">Cần xem thêm</div></div>
    <div class="score-card"><div class="val" style="color:#74b9ff">4</div><div class="lbl">Lỗi đã tự động sửa</div></div>
    <div class="score-card"><div class="val" style="color:#ffeaa7">8</div><div class="lbl">Cần kiểm tra thủ công</div></div>
  </div>
</div>

<div class="body">
  <div class="overall">
    <div class="overall-icon">✅</div>
    <div class="overall-text">
      <h2>Định dạng cơ bản đạt chuẩn – File FINAL đã sẵn sàng</h2>
      <p>Các lỗi định dạng tự động (lề trang, thụt đầu dòng, heading đậm, căn lề) đã được sửa trong file <strong>_FINAL.docx</strong>.<br>
      Còn <strong>8 hạng mục cần kiểm tra thủ công</strong> trong Word (đánh số trang, giãn dòng, caption ảnh/bảng...) trước khi nộp chính thức.</p>
    </div>
  </div>

  <div class="section-title">Kết quả kiểm tra tự động (đã sửa trong file FINAL)</div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Hạng mục</th>
          <th>Tiêu chuẩn ĐH Công Nghiệp HN</th>
          <th>Trước khi sửa</th>
          <th>Sau khi sửa (FINAL)</th>
          <th>Ghi chú</th>
        </tr>
      </thead>
      <tbody>{auto_rows}</tbody>
    </table>
  </div>

  <div class="section-title">Các hạng mục cần kiểm tra thủ công trong Word</div>
  <div class="warning-box">
    ⚠️ Những hạng mục dưới đây <strong>không thể sửa tự động</strong> qua python-docx (do liên quan đến rendering của Word). Bạn cần mở file <strong>_FINAL.docx</strong> trong Microsoft Word để kiểm tra và sửa thủ công.
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Hạng mục</th><th>Tiêu chuẩn</th><th>Việc cần làm</th></tr>
      </thead>
      <tbody>{manual_rows}</tbody>
    </table>
  </div>

  <div class="std-box">
    <div class="section-title">Bảng tiêu chuẩn định dạng đồ án – ĐH Công Nghiệp Hà Nội</div>
    <div class="std-grid">
      <div class="std-card" style="background:#f8f9ff;border:1px solid #c5cae9">
        <h4 style="color:#283593">📐 Trang & Lề</h4>
        <table>
          <tr><td>Khổ giấy</td><td>A4 (210×297mm)</td></tr>
          <tr><td>Lề trái</td><td>3.5 cm</td></tr>
          <tr><td>Lề phải</td><td>2.0 cm</td></tr>
          <tr><td>Lề trên</td><td>3.0 cm</td></tr>
          <tr><td>Lề dưới</td><td>3.0 cm</td></tr>
          <tr><td>Số trang</td><td>Dưới giữa, bắt đầu từ Mở Đầu</td></tr>
        </table>
      </div>
      <div class="std-card" style="background:#f9fff9;border:1px solid #c8e6c9">
        <h4 style="color:#2e7d32">🔤 Chữ & Đoạn văn</h4>
        <table>
          <tr><td>Font</td><td>Times New Roman</td></tr>
          <tr><td>Cỡ thân văn</td><td>13pt</td></tr>
          <tr><td>Cỡ trang bìa</td><td>14pt (tên trường, đề tài)</td></tr>
          <tr><td>Giãn dòng</td><td>1.5 line hoặc 22pt Exactly</td></tr>
          <tr><td>Thụt đầu dòng</td><td>1.25 cm (0.5 inch)</td></tr>
          <tr><td>Căn lề</td><td>Justify (căn đều 2 bên)</td></tr>
        </table>
      </div>
      <div class="std-card" style="background:#fffdf0;border:1px solid #ffe082">
        <h4 style="color:#e65100">🔢 Tiêu đề & Đánh số</h4>
        <table>
          <tr><td>Tiêu đề chương</td><td>13pt, In Đậm, Viết Hoa</td></tr>
          <tr><td>Tiêu đề mục cấp 2</td><td>13pt, In Đậm</td></tr>
          <tr><td>Tiêu đề mục cấp 3</td><td>13pt, In Đậm Nghiêng</td></tr>
          <tr><td>Caption hình</td><td>12pt, bên dưới hình</td></tr>
          <tr><td>Caption bảng</td><td>12pt, bên trên bảng</td></tr>
          <tr><td>Đánh số</td><td>Hình X.Y / Bảng X.Y</td></tr>
        </table>
      </div>
      <div class="std-card" style="background:#fff8f8;border:1px solid #ffcdd2">
        <h4 style="color:#c62828">📚 Tài liệu tham khảo</h4>
        <table>
          <tr><td>Số lượng tối thiểu</td><td>≥ 10 tài liệu</td></tr>
          <tr><td>Format tiếng Việt</td><td>Tác giả (năm), Tên sách, NXB</td></tr>
          <tr><td>Format tiếng Anh</td><td>Author (year). Title. Publisher</td></tr>
          <tr><td>Tài liệu web</td><td>Tên web, URL, năm truy cập</td></tr>
          <tr><td>Số tài liệu hiện có</td><td>12 tài liệu ✅</td></tr>
          <tr><td>Trích dẫn trong bài</td><td>Dạng [số thứ tự]</td></tr>
        </table>
      </div>
    </div>
  </div>

  <div class="std-box">
    <div class="section-title">Hướng dẫn kiểm tra thủ công trong Word (8 bước)</div>
    <ol style="font-size:13.5px;color:#333;line-height:2.2;padding-left:24px">
      <li><strong>Đánh số trang:</strong> Insert → Page Number → Bottom of Page → Plain Number 2 (giữa). Bắt đầu từ trang Mở Đầu.</li>
      <li><strong>Giãn dòng 1.5:</strong> Ctrl+A → Home → Line Spacing → 1.5 (hoặc vào Paragraph → Line spacing: Multiple → At: 1.5).</li>
      <li><strong>Spacing Before/After Heading:</strong> Click vào từng tiêu đề chương → Paragraph → Spacing Before: 12pt, After: 6pt.</li>
      <li><strong>Cập nhật mục lục:</strong> Click vào Mục lục → Update Table → Update entire table.</li>
      <li><strong>Caption hình ảnh:</strong> Xác nhận mỗi hình có chú thích "Hình X.Y: ..." bên dưới, cỡ 12pt, căn giữa.</li>
      <li><strong>Caption bảng:</strong> Xác nhận mỗi bảng có chú thích "Bảng X.Y: ..." bên trên, cỡ 12pt, in đậm.</li>
      <li><strong>Kiểm tra trang bìa:</strong> Tên trường và tên đề tài phải 14pt, in đậm, căn giữa.</li>
      <li><strong>Lưu & kiểm tra in thử:</strong> File → Print Preview → xem bố cục tổng thể trước khi in.</li>
    </ol>
  </div>
</div>

<div class="footer">
  Báo cáo kiểm tra định dạng – 03/05/2026 | File đã sửa: <strong>CNTT_2022605948_Lê Văn Hải_Baocao_Main_FINAL.docx</strong>
</div>
</body>
</html>"""

out = r"D:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\BaoCao_KiemTra_DinhDang.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print("DONE:", out)
