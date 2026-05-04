# -*- coding: utf-8 -*-
"""Audit menu consistency across all HTML pages in FontEnd"""
import os, sys
sys.stdout.reconfigure(encoding='utf-8')

frontend = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'

# Menu items chuẩn từ index.html (ảnh 4)
STANDARD_KEYWORDS = {
    'TỔNG QUAN':            ['TỔNG QUAN', 'Tổng quan', 'dashboard'],
    'THEO DÕI DỰ ÁN':       ['Theo dõi dự án', 'order-tracking'],
    'KẾ HOẠCH CÔNG VIỆC':   ['Kế hoạch công việc', 'work-plan'],
    'KINH DOANH':            ['KINH DOANH', 'Khách hàng', 'Dự án', 'Báo giá'],
    'KỸ THUẬT':              ['KỸ THUẬT', 'Thiết kế', 'Bóc tách', 'Yêu cầu vật tư'],
    'KHO & VẬT TƯ':          ['KHO & VẬT TƯ', 'Kho vật tư', 'Xuất vật tư'],
    'THI CÔNG':              ['THI CÔNG', 'Sản xuất sản phẩm', 'Lắp đặt', 'Bàn giao'],
    'TÀI CHÍNH':             ['TÀI CHÍNH', 'Phiếu thu', 'Phiếu chi', 'Công nợ'],
    'AI ASSISTANT':          ['AI ASSISTANT', 'Báo cáo AI', 'Tìm kiếm AI', 'reports-ai'],
    'TIN NHẮN':              ['TIN NHẮN', 'Tin nhắn', 'messages'],
    'CHẤM CÔNG':             ['CHẤM CÔNG', 'Chấm công', 'attendance'],
    'QUẢN TRỊ':              ['QUẢN TRỊ', 'Phân quyền', 'Cài đặt hệ thống', 'Chi nhánh'],
}

# Bỏ qua file không cần sidebar
SKIP = {'login.html','register.html','forgot-password.html',
        'company.html','layout-template.html','sidebar-menu-template.html',
        'sidebar-template.txt','template-library.html'}

html_files = sorted([
    f for f in os.listdir(frontend)
    if f.endswith('.html')
    and f not in SKIP
    and 'backup' not in f and 'old' not in f
    and '.bak' not in f
    and not f.startswith('debug') and not f.startswith('test')
])

results = []
for fname in html_files:
    path = os.path.join(frontend, fname)
    try:
        content = open(path, encoding='utf-8', errors='ignore').read()
    except:
        continue

    found_sections = []
    missing_sections = []
    for section, keywords in STANDARD_KEYWORDS.items():
        if any(kw in content for kw in keywords):
            found_sections.append(section)
        else:
            missing_sections.append(section)

    pct = len(found_sections) / len(STANDARD_KEYWORDS) * 100
    status = 'OK' if pct >= 90 else ('THIẾU' if pct >= 60 else 'LỖI')
    results.append({
        'file': fname,
        'found': len(found_sections),
        'total': len(STANDARD_KEYWORDS),
        'pct': pct,
        'status': status,
        'missing': missing_sections,
    })

# In kết quả
print("=" * 80)
print("AUDIT MENU - VIRALWINDOW FRONTEND")
print("=" * 80)

ok_files = [r for r in results if r['status'] == 'OK']
warn_files = [r for r in results if r['status'] == 'THIẾU']
err_files = [r for r in results if r['status'] == 'LỖI']

print(f"\nTong so file: {len(results)} | OK: {len(ok_files)} | THIEU: {len(warn_files)} | LOI: {len(err_files)}\n")

print("FILES CAN KIEM TRA (< 90% menu items):")
print("-" * 80)
for r in results:
    if r['status'] != 'OK':
        print(f"[{r['status']}] {r['file']:<45} {r['found']}/{r['total']} ({r['pct']:.0f}%)")
        print(f"       Thieu: {', '.join(r['missing'])}")
        print()

print("\nFILES DAT CHUAN (>= 90%):")
print("-" * 80)
for r in results:
    if r['status'] == 'OK':
        print(f"[OK]   {r['file']:<45} {r['found']}/{r['total']} ({r['pct']:.0f}%)")
