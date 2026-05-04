# -*- coding: utf-8 -*-
"""Xử lý 12 trang cuối có cấu trúc body flex khác"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

FRONTEND = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'

PAGE_ACTIVE = {
    'attendance.html':              'attendance.html',
    'finance-hr.html':              'finance-dashboard.html',
    'inventory-warnings.html':      'inventory.html',
    'notifications.html':           'index.html',
    'order-tracking.html':          'production-excel-view.html',
    'reports.html':                 'finance-dashboard.html',
    'role-management.html':         'admin-management.html',
    'user-management.html':         'admin-management.html',
    'warehouse-export-form.html':   'exported-materials.html',
    'warehouse-export.html':        'exported-materials.html',
    'work-plan.html':               'work-plan.html',
    'workflow.html':                'production.html',
}

# Load template
tpl_path = os.path.join(FRONTEND, 'sidebar-template.html')
SIDEBAR_TEMPLATE = open(tpl_path, encoding='utf-8').read()

def make_sidebar(fname):
    active_href = PAGE_ACTIVE.get(fname, 'index.html')
    s = re.sub(r'class="nav-item active"', 'class="nav-item"', SIDEBAR_TEMPLATE)
    s = re.sub(r'class="submenu-item active"', 'class="submenu-item"', s)
    s = s.replace(f'href="{active_href}" class="nav-item"', f'href="{active_href}" class="nav-item active"')
    s = s.replace(f'href="{active_href}" class="submenu-item"', f'href="{active_href}" class="submenu-item active"')
    return s

ok, failed = [], []

for fname in sorted(PAGE_ACTIVE.keys()):
    fpath = os.path.join(FRONTEND, fname)
    if not os.path.exists(fpath):
        failed.append(f'{fname} (not exist)')
        continue

    content = open(fpath, encoding='utf-8', errors='ignore').read()
    new_sidebar = make_sidebar(fname)
    replaced = False

    # Tìm <body...> 
    body_m = re.search(r'<body[^>]*>', content, re.IGNORECASE)
    if not body_m:
        failed.append(fname + ' (no body tag)')
        continue
    body_end = body_m.end()

    # Tìm kết thúc sidebar - thử nhiều pattern
    end_candidates = []
    for pat in [
        r'<div[^>]+class="[^"]*(?:main-content|content-wrapper|main-wrapper|page-content)[^"]*"',
        r'<main[^>]*>',
        r'<div[^>]+id="(?:main|content|wrapper|app)"',
        r'<!-- MAIN',
        r'<!-- CONTENT',
    ]:
        m = re.search(pat, content[body_end:], re.IGNORECASE)
        if m:
            end_candidates.append(body_end + m.start())

    if end_candidates:
        end_pos = min(end_candidates)
        # Trích phần giữa body và main content (sidebar cũ)
        old_sidebar_block = content[body_end:end_pos]
        # Chỉ thay nếu có sidebar (có 'nav' hoặc 'sidebar')
        if 'nav' in old_sidebar_block.lower() or 'sidebar' in old_sidebar_block.lower() or len(old_sidebar_block) > 200:
            content = content[:body_end] + '\n\n' + new_sidebar + '\n\n    ' + content[end_pos:]
            open(fpath, 'w', encoding='utf-8').write(content)
            ok.append(fname)
            print(f"  [OK] {fname} (body+scan, removed {len(old_sidebar_block)} chars old sidebar)")
            replaced = True
        else:
            # Không có sidebar cũ - chèn vào sau body
            content = content[:body_end] + '\n\n' + new_sidebar + '\n\n    ' + content[body_end:]
            open(fpath, 'w', encoding='utf-8').write(content)
            ok.append(fname + ' (inserted)')
            print(f"  [OK-insert] {fname}")
            replaced = True

    if not replaced:
        # Fallback cuối: inject ngay sau <body>
        content = content[:body_end] + '\n\n' + new_sidebar + '\n\n' + content[body_end:]
        open(fpath, 'w', encoding='utf-8').write(content)
        ok.append(fname + ' (forced)')
        print(f"  [OK-force] {fname}")

print(f"\n=== BATCH 3 KẾT QUẢ ===")
print(f"OK: {len(ok)} | FAIL: {len(failed)}")
print(f"Failed: {failed}")
