# -*- coding: utf-8 -*-
"""Xử lý 19 trang có sidebar format khác - tìm và thay theo nhiều pattern"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

FRONTEND = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'
REMAINING = [
    'attendance.html', 'customer-detail.html',
    'finance-dashboard.html', 'finance-debt.html', 'finance-hr.html',
    'finance-payments.html', 'finance-receipts.html', 'finance-reports.html',
    'inventory-warnings.html', 'notifications.html', 'order-tracking.html',
    'project-doors.html', 'reports.html', 'role-management.html',
    'user-management.html', 'warehouse-export-form.html',
    'warehouse-export.html', 'work-plan.html', 'workflow.html'
]

PAGE_ACTIVE = {
    'attendance.html':              'attendance.html',
    'customer-detail.html':         'sales.html',
    'finance-dashboard.html':       'finance-dashboard.html',
    'finance-debt.html':            'finance-debt.html',
    'finance-hr.html':              'finance-dashboard.html',
    'finance-payments.html':        'finance-payments.html',
    'finance-receipts.html':        'finance-receipts.html',
    'finance-reports.html':         'finance-dashboard.html',
    'inventory-warnings.html':      'inventory.html',
    'notifications.html':           'index.html',
    'order-tracking.html':          'production-excel-view.html',
    'project-doors.html':           'projects-new.html',
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

for fname in REMAINING:
    fpath = os.path.join(FRONTEND, fname)
    if not os.path.exists(fpath):
        failed.append(f'{fname} (file not exist)')
        continue
    
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    new_sidebar = make_sidebar(fname)
    replaced = False
    
    # Pattern A: <div class="sidebar (có thể có class khác sau đó)
    # Tìm div sidebar đến đóng </div>
    patterns = [
        r'<div[^>]+class="[^"]*sidebar[^"]*"[^>]*>',
        r'<nav[^>]+class="[^"]*sidebar[^"]*"[^>]*>',
        r'<!-- SIDEBAR',
    ]
    
    for pat in patterns:
        m = re.search(pat, content)
        if m:
            start = m.start()
            # Tìm kết thúc: tìm <!-- MAIN CONTENT hoặc <div class="main-content
            end_markers = ['<!-- MAIN CONTENT', '<div class="main-content', '<main ', '<div id="main']
            end = -1
            for em in end_markers:
                idx = content.find(em, start + 100)
                if idx != -1:
                    end = idx
                    break
            if end != -1:
                # Backup khoảng trắng trước end marker
                ws = ''
                j = end - 1
                while j >= 0 and content[j] in ' \t':
                    ws = content[j] + ws
                    j -= 1
                content = content[:start] + new_sidebar + '\n\n' + ws + content[end:]
                open(fpath, 'w', encoding='utf-8').write(content)
                ok.append(fname)
                print(f"  [OK] {fname}")
                replaced = True
                break
    
    if not replaced:
        # Pattern B: Sidebar nằm trong <body> đến </body> - lấy phần đầu <body>
        body_m = re.search(r'<body[^>]*>', content)
        if body_m:
            body_start = body_m.end()
            # Tìm điểm kết thúc sidebar (thường là đến </aside> hoặc section đầu tiên)
            end_markers2 = ['<section', '<article', '<main', '<!-- CONTENT', '<!-- MAIN']
            end2 = -1
            for em in end_markers2:
                idx = content.find(em, body_start)
                if idx != -1:
                    end2 = idx
                    break
            if end2 != -1:
                content = content[:body_start] + '\n\n' + new_sidebar + '\n\n    ' + content[end2:]
                open(fpath, 'w', encoding='utf-8').write(content)
                ok.append(fname + ' (body)')
                print(f"  [OK-body] {fname}")
                replaced = True
    
    if not replaced:
        failed.append(fname)
        print(f"  [FAIL] {fname}")

print(f"\n=== BATCH 2 KẾT QUẢ ===")
print(f"OK: {len(ok)} | FAIL: {len(failed)}")
if failed:
    print(f"Can xu ly thu cong: {failed}")
