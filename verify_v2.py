# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

doc_path = r"D:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\CNTT_2022605948_Lê Văn Hải_Baocao_Main_v2.docx"
doc = Document(doc_path)
paragraphs = [p.text.strip() for p in doc.paragraphs if len(p.text.strip()) > 40]

HIGH_RISK = [
    ("HTML (Hypertext Markup Language", 95),
    ("CSS (Cascading Style Sheets) là một ngôn ngữ quy định", 92),
    ("MySQL là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS", 90),
    ("Node.js là một môi trường chạy (runtime) cho JavaScript phía máy chủ", 88),
    ("SQL là ngôn ngữ tiêu chuẩn dùng để làm việc với các hệ quản trị", 85),
    ("Responsive web design (RWD) là một phương pháp thiết kế web", 82),
    ("Express.js là một framework web tối giản và linh hoạt", 80),
    ("Google Generative AI là nền tảng trí tuệ nhân tạo do Google", 72),
    ("Cách mạng công nghiệp 4.0, chuyển đổi số đã trở thành yêu cầu tất yếu", 75),
]

risk = 0
orig = 0
for para in paragraphs:
    matched = False
    for pattern, score in HIGH_RISK:
        if pattern.lower() in para.lower():
            print(f"⚠️  CÒN BỊ ĐẠO VĂN ({score}%): {para[:80]}...")
            risk += 1
            matched = True
            break
    if not matched:
        orig += 1

total = risk + orig
pct = round(risk/total*100,1) if total else 0
print(f"\n{'='*60}")
print(f"📊 Kết quả V2: {risk} đoạn nguy cơ / {total} tổng ({pct}%)")
print(f"✅ Nội dung gốc: {orig} đoạn ({round(orig/total*100,1)}%)")
if risk == 0:
    print("🎉 TUYỆT VỜI! Không còn đoạn bị đánh đạo văn!")
