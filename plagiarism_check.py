# -*- coding: utf-8 -*-
import re, json
from docx import Document

doc_path = r"D:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\CNTT_2022605948_Lê Văn Hải_Baocao_Main.docx"
doc = Document(doc_path)

paragraphs = []
for p in doc.paragraphs:
    t = p.text.strip()
    if len(t) > 40:
        paragraphs.append(t)

# Known high-risk phrases (common in Vietnamese CS theses - textbook-like definitions)
HIGH_RISK_PATTERNS = [
    ("HTML (Hypertext Markup Language", "Định nghĩa HTML – xuất hiện trong hàng trăm đồ án CNTT", 95),
    ("CSS (Cascading Style Sheets) là một ngôn ngữ quy định cách trình bày", "Định nghĩa CSS – rất phổ biến", 92),
    ("MySQL là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS", "Định nghĩa MySQL – rất phổ biến", 90),
    ("Node.js là một môi trường chạy (runtime) cho JavaScript phía máy chủ", "Định nghĩa Node.js – phổ biến", 88),
    ("SQL là ngôn ngữ tiêu chuẩn dùng để làm việc với các hệ quản trị", "Định nghĩa SQL – giáo khoa", 85),
    ("Responsive web design (RWD) là một phương pháp thiết kế web", "Định nghĩa RWD – phổ biến", 82),
    ("Express.js là một framework web tối giản và linh hoạt", "Định nghĩa Express.js – phổ biến", 80),
    ("Role-Based Access Control", "Thuật ngữ RBAC – chuyên ngành", 30),
    ("JSON Web Token", "Thuật ngữ JWT – chuyên ngành", 25),
    ("Defense in Depth", "Thuật ngữ bảo mật – chuyên ngành", 20),
    ("Cách mạng công nghiệp 4.0, chuyển đổi số đã trở thành yêu cầu tất yếu", "Câu mở đầu phổ biến", 75),
    ("Google Generative AI là nền tảng trí tuệ nhân tạo do Google phát triển", "Mô tả Gemini – có thể từ docs Google", 70),
]

results = []
for para in paragraphs:
    matched = False
    for pattern, reason, score in HIGH_RISK_PATTERNS:
        if pattern.lower() in para.lower():
            results.append({
                "text": para[:200],
                "reason": reason,
                "score": score,
                "matched": pattern[:60]
            })
            matched = True
            break
    if not matched:
        results.append({
            "text": para[:200],
            "reason": "Nội dung gốc / chưa phát hiện trùng lặp",
            "score": 5,
            "matched": ""
        })

# Stats
high = [r for r in results if r["score"] >= 70]
med  = [r for r in results if 30 <= r["score"] < 70]
low  = [r for r in results if r["score"] < 30]

total_para = len(results)
avg_score = sum(r["score"] for r in results) / total_para if total_para else 0

print(json.dumps({
    "total": total_para,
    "high_count": len(high),
    "med_count": len(med),
    "low_count": len(low),
    "avg_score": round(avg_score, 2),
    "high_samples": high[:10],
    "med_samples": med[:5],
}, ensure_ascii=False, indent=2))
