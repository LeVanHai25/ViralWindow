# -*- coding: utf-8 -*-
"""Tim chinh xac doan HTML bi trung - quet toan bo file"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

FRONTEND = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd'
SKIP = {'login.html','register.html','forgot-password.html','company.html',
        'sidebar-template.html','layout-template.html','index-backup.html',
        'sidebar-menu-template.html'}

html_files = [f for f in os.listdir(FRONTEND)
              if f.endswith('.html') and f not in SKIP
              and 'backup' not in f and '_old' not in f
              and not f.startswith('debug') and not f.startswith('test')]

# Tim cac trang co TIN NHAN xuat hien 2 lan trong the <a> (khong tinh comment)
dup_files = []
for fname in sorted(html_files):
    fpath = os.path.join(FRONTEND, fname)
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    # Tim tat ca <a href="messages.html" ...>
    msg_links = list(re.finditer(r'<a[^>]+href=["\']messages\.html["\'][^>]*>', content))
    att_links = list(re.finditer(r'<a[^>]+href=["\']attendance\.html["\'][^>]*>', content))
    if len(msg_links) > 1 or len(att_links) > 1:
        dup_files.append(fname)
        print(f"[DUP] {fname}: messages={len(msg_links)}, attendance={len(att_links)}")

# Kiem tra theo span text
print("\nKiem tra theo span text:")
for fname in sorted(html_files):
    fpath = os.path.join(FRONTEND, fname)
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    spans_tn = re.findall(r'<span[^>]*>TIN NH[^<]+</span>', content)
    spans_cc = re.findall(r'<span[^>]*>CH[^<]+CONG[^<]*</span>', content)
    if len(spans_tn) > 1 or len(spans_cc) > 1:
        print(f"[DUP-SPAN] {fname}: TIN NHAN spans={len(spans_tn)}, CHAM CONG spans={len(spans_cc)}")

print("\nTotal dup files:", len(dup_files))

# Neu co - hien thi noi dung de debug
for fname in dup_files[:3]:
    fpath = os.path.join(FRONTEND, fname)
    content = open(fpath, encoding='utf-8', errors='ignore').read()
    links = list(re.finditer(r'<a[^>]+href=["\']messages\.html["\'][^>]*>', content))
    for i, link in enumerate(links):
        print(f"\n{fname} - link {i+1} at pos {link.start()}:")
        print(content[max(0,link.start()-100):link.end()+200])
