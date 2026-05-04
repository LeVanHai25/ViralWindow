# -*- coding: utf-8 -*-
"""
Đồng bộ sidebar chuẩn cho toàn bộ frontend ViralWindow
Strategy: Trích sidebar từ index.html, thêm TIN NHẮN & CHẤM CÔNG, áp dụng cho tất cả trang
"""
import os, sys, shutil, re
sys.stdout.reconfigure(encoding='utf-8')

FRONTEND = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'

# === MAP active href cho từng trang ===
PAGE_ACTIVE = {
    'index.html':                   'index.html',
    'sales.html':                   'sales.html',
    'projects-new.html':            'projects-new.html',
    'production.html':              'production.html',
    'product-catalog-v2.html':      'product-catalog-v2.html',
    'quotation-new.html':           'quotation-new.html',
    'pending-quotations.html':      'quotation-new.html',
    'customer-detail.html':         'sales.html',
    'design-new.html':              'design-new.html',
    'material-requests.html':       'material-requests.html',
    'material-requests-clean.html': 'material-requests.html',
    'purchase-request.html':        'purchase-request.html',
    'inventory.html':               'inventory.html',
    'exported-materials.html':      'exported-materials.html',
    'warehouse-export.html':        'exported-materials.html',
    'warehouse-export-form.html':   'exported-materials.html',
    'inventory-warnings.html':      'inventory.html',
    'product-manufacturing.html':   'product-manufacturing.html',
    'installation.html':            'installation.html',
    'handover.html':                'handover.html',
    'production-excel-view.html':   'production-excel-view.html',
    'finance-dashboard.html':       'finance-dashboard.html',
    'finance-receipts.html':        'finance-receipts.html',
    'finance-payments.html':        'finance-payments.html',
    'finance-debt.html':            'finance-debt.html',
    'finance-reports.html':         'finance-dashboard.html',
    'finance-hr.html':              'finance-dashboard.html',
    'reports-ai.html':              'reports-ai.html',
    'messages.html':                'messages.html',
    'attendance.html':              'attendance.html',
    'notifications.html':           'index.html',
    'work-plan.html':               'work-plan.html',
    'order-tracking.html':          'production-excel-view.html',
    'admin-management.html':        'admin-management.html',
    'settings.html':                'settings.html',
    'agencies.html':                'agencies.html',
    'user-management.html':         'admin-management.html',
    'role-management.html':         'admin-management.html',
    'activity-log.html':            'admin-management.html',
    'project-detail.html':          'projects-new.html',
    'project-logs.html':            'projects-new.html',
    'project-doors.html':           'projects-new.html',
    'cancelled-projects.html':      'projects-new.html',
    'completed-projects.html':      'projects-new.html',
    'profile.html':                 'index.html',
    'reports.html':                 'finance-dashboard.html',
    'workflow.html':                'production.html',
}

# === Đọc sidebar template từ index.html ===
index_path = os.path.join(FRONTEND, 'index.html')
index_content = open(index_path, encoding='utf-8', errors='ignore').read()

# Tìm sidebar block: từ <!-- SIDEBAR --> đến </div>\n\n    <!-- MAIN CONTENT
sidebar_start = index_content.find('    <!-- SIDEBAR -->')
sidebar_end = index_content.find('    <!-- MAIN CONTENT -->')
if sidebar_start == -1 or sidebar_end == -1:
    # Fallback: tìm theo div.sidebar
    sidebar_start = index_content.find('    <div class="sidebar')
    sidebar_end = index_content.find('    <!-- MAIN CONTENT -->')

SIDEBAR_TEMPLATE = index_content[sidebar_start:sidebar_end].rstrip()
print(f"Sidebar template extracted: {len(SIDEBAR_TEMPLATE)} chars")

# === Thêm TIN NHẮN và CHẤM CÔNG vào template ===
TIN_NHAN_HTML = '''
            <!-- TIN NHẮN -->
            <a href="messages.html" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>TIN NHẮN</span>
            </a>

            <!-- CHẤM CÔNG -->
            <a href="attendance.html" class="nav-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>CHẤM CÔNG</span>
            </a>

'''

# Chèn trước <!-- QUẢN TRỊ -->
QUANRI_MARKER = '            <!-- QUẢN TRỊ -->'
if QUANRI_MARKER in SIDEBAR_TEMPLATE:
    SIDEBAR_TEMPLATE = SIDEBAR_TEMPLATE.replace(QUANRI_MARKER, TIN_NHAN_HTML + QUANRI_MARKER)
    print("Added TIN NHAN & CHAM CONG to template")
else:
    # Fallback: thêm trước nav-item QUẢN TRỊ
    qt_idx = SIDEBAR_TEMPLATE.rfind('<div class="nav-item has-submenu">')
    SIDEBAR_TEMPLATE = SIDEBAR_TEMPLATE[:qt_idx] + TIN_NHAN_HTML + '            ' + SIDEBAR_TEMPLATE[qt_idx:]
    print("Added TIN NHAN & CHAM CONG (fallback) to template")

# Lưu template
template_path = os.path.join(FRONTEND, 'sidebar-template.html')
open(template_path, 'w', encoding='utf-8').write(SIDEBAR_TEMPLATE)
print(f"Template saved to sidebar-template.html ({len(SIDEBAR_TEMPLATE)} chars)")

# === Hàm thay sidebar trong từng trang ===
def replace_sidebar(content, page_file, sidebar_tpl):
    # Tạo sidebar với active class đúng trang
    active_href = PAGE_ACTIVE.get(page_file, 'index.html')
    
    # Reset tất cả active, set đúng 1 cái
    new_sidebar = re.sub(r'class="nav-item active"', 'class="nav-item"', sidebar_tpl)
    new_sidebar = re.sub(r'class="submenu-item active"', 'class="submenu-item"', new_sidebar)
    
    # Set active cho trang hiện tại
    new_sidebar = new_sidebar.replace(
        f'href="{active_href}" class="nav-item"',
        f'href="{active_href}" class="nav-item active"'
    )
    new_sidebar = new_sidebar.replace(
        f'href="{active_href}" class="submenu-item"',
        f'href="{active_href}" class="submenu-item active"'
    )
    
    # Tìm và thay sidebar block trong trang
    # Marker 1: <!-- SIDEBAR --> ... <!-- MAIN CONTENT -->
    m_start = content.find('    <!-- SIDEBAR -->')
    m_end = content.find('    <!-- MAIN CONTENT -->')
    if m_start != -1 and m_end != -1:
        return content[:m_start] + new_sidebar + '\n\n    ' + content[m_end:], 'marker'
    
    # Marker 2: <div class="sidebar ... đến </div>\n\n    <div class="main-content
    m_start = content.find('    <div class="sidebar')
    if m_start != -1:
        # Tìm closing div của sidebar
        depth = 0
        i = m_start
        while i < len(content):
            if content[i:i+4] == '<div':
                depth += 1
            elif content[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    m_end_tag = i + 6
                    break
            i += 1
        # Tìm <!-- MAIN CONTENT --> hoặc <div class="main-content
        m_end2 = content.find('    <!-- MAIN CONTENT -->', m_end_tag)
        if m_end2 == -1:
            m_end2 = content.find('    <div class="main-content', m_end_tag)
        if m_end2 != -1:
            return content[:m_start] + new_sidebar + '\n\n    ' + content[m_end2:], 'div_scan'
    
    return content, 'not_found'

# === Xử lý tất cả các trang ===
SKIP = {'login.html','register.html','forgot-password.html','company.html',
        'sidebar-template.html','layout-template.html','index-backup.html',
        'sidebar-menu-template.html'}

results = {'ok': [], 'not_found': [], 'skip': []}

for fname in sorted(PAGE_ACTIVE.keys()):
    if fname in SKIP:
        results['skip'].append(fname)
        continue
    fpath = os.path.join(FRONTEND, fname)
    if not os.path.exists(fpath):
        results['skip'].append(f'{fname} (not found)')
        continue
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    new_content, method = replace_sidebar(content, fname, SIDEBAR_TEMPLATE)
    if method != 'not_found':
        open(fpath, 'w', encoding='utf-8').write(new_content)
        results['ok'].append(f'{fname} ({method})')
        print(f"  [OK] {fname} via {method}")
    else:
        results['not_found'].append(fname)
        print(f"  [SKIP] {fname} - no sidebar marker found")

print(f"\n=== KẾT QUẢ ===")
print(f"Cap nhat thanh cong: {len(results['ok'])} trang")
print(f"Khong tim thay sidebar: {len(results['not_found'])} trang: {results['not_found']}")
print(f"Bo qua: {len(results['skip'])} trang")
