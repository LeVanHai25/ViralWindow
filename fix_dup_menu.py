# -*- coding: utf-8 -*-
"""Xoa sidebar trung lap - xoa lan thu 2 cua TIN NHAN / CHAM CONG"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

FRONTEND = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'
SKIP = {'login.html','register.html','forgot-password.html','company.html',
        'sidebar-template.html','layout-template.html','index-backup.html',
        'index-backup-v2.html','sidebar-menu-template.html'}

html_files = [f for f in os.listdir(FRONTEND)
              if f.endswith('.html') and f not in SKIP
              and 'backup' not in f and '_old' not in f
              and not f.startswith('debug') and not f.startswith('test')]

fixed = []
for fname in sorted(html_files):
    fpath = os.path.join(FRONTEND, fname)
    content = open(fpath, encoding='utf-8', errors='ignore').read()

    # Đếm số lần xuất hiện của TIN NHẮN và CHẤM CÔNG dưới dạng nav-item
    tin_nhan_count = content.count('>TIN NHẮN<') + content.count('>Tin nhắn<')
    cham_cong_count = content.count('>CHẤM CÔNG<') + content.count('>Chấm công<')

    changed = False

    # Nếu TIN NHẮN xuất hiện >1 lần, xóa lần xuất hiện thứ 2 trở đi
    if tin_nhan_count > 1:
        # Tìm và xóa nav-item block chứa TIN NHẮN lần thứ 2
        # Pattern: <a href="messages.html" class="nav-item...">...</a>
        pattern = r'\n\s*<!--\s*TIN\s*NH[ẮA]N\s*-->\s*\n\s*<a\s+href="messages\.html"[^>]*>.*?</a>'
        matches = list(re.finditer(pattern, content, re.DOTALL))
        if len(matches) > 1:
            # Xóa tất cả trừ lần đầu
            for m in reversed(matches[1:]):
                content = content[:m.start()] + content[m.end():]
            changed = True
            print(f"  [FIX TIN NHAN] {fname}: removed {len(matches)-1} duplicate(s)")
        else:
            # Fallback: tìm theo pattern đơn giản hơn
            all_idx = []
            search = 'href="messages.html"'
            idx = content.find(search)
            while idx != -1:
                all_idx.append(idx)
                idx = content.find(search, idx + 1)
            if len(all_idx) > 1:
                # Xóa các href messages.html thứ 2 trở đi (nav-item block)
                for dup_idx in reversed(all_idx[1:]):
                    # Tìm điểm đầu của <a tag
                    a_start = content.rfind('<a ', 0, dup_idx)
                    # Tìm điểm cuối </a>
                    a_end = content.find('</a>', dup_idx) + 4
                    # Xóa thêm whitespace/newline xung quanh
                    while a_start > 0 and content[a_start-1] in ' \t':
                        a_start -= 1
                    if a_start > 0 and content[a_start-1] == '\n':
                        a_start -= 1
                    content = content[:a_start] + content[a_end:]
                changed = True
                print(f"  [FIX TIN NHAN-fallback] {fname}: removed {len(all_idx)-1} dup(s)")

    # Nếu CHẤM CÔNG xuất hiện >1 lần
    if cham_cong_count > 1:
        all_idx = []
        search = 'href="attendance.html"'
        idx = content.find(search)
        while idx != -1:
            all_idx.append(idx)
            idx = content.find(search, idx + 1)
        if len(all_idx) > 1:
            for dup_idx in reversed(all_idx[1:]):
                a_start = content.rfind('<a ', 0, dup_idx)
                a_end = content.find('</a>', dup_idx) + 4
                while a_start > 0 and content[a_start-1] in ' \t':
                    a_start -= 1
                if a_start > 0 and content[a_start-1] == '\n':
                    a_start -= 1
                content = content[:a_start] + content[a_end:]
            changed = True
            print(f"  [FIX CHAM CONG] {fname}: removed {len(all_idx)-1} dup(s)")

    if changed:
        open(fpath, 'w', encoding='utf-8').write(content)
        fixed.append(fname)

print(f"\n=== KET QUA ===")
print(f"Da sua: {len(fixed)} trang")
print(f"Files: {fixed}")

# Kiem tra lai
print("\nKiem tra lai sau sua:")
for fname in sorted(html_files):
    fpath = os.path.join(FRONTEND, fname)
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    tn = content.count('>TIN NHẮN<') + content.count('>Tin nhắn<')
    cc = content.count('>CHẤM CÔNG<') + content.count('>Chấm công<')
    if tn > 1 or cc > 1:
        print(f"  [STILL DUP] {fname}: TIN NHAN={tn}, CHAM CONG={cc}")
print("  Hoan thanh!")
