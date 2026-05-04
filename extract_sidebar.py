# -*- coding: utf-8 -*-
"""Extract sidebar from index.html and analyze all pages"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

INDEX = r'D:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd\index.html'
content = open(INDEX, encoding='utf-8', errors='ignore').read()

# Tìm sidebar block
for marker in ['<aside', 'id="sidebar"', 'class="sidebar"']:
    idx = content.find(marker)
    if idx != -1:
        print(f"Found sidebar at: {marker}, pos={idx}")
        print(f"Context: {content[idx:idx+200]}")
        print()
        break

# Tìm tất cả href trong sidebar để xác định menu items
hrefs = re.findall(r'href=["\']([^"\']+)["\']', content)
nav_items = [h for h in hrefs if '.html' in h or h.startswith('#')]
print(f"\nTotal href links in index.html: {len(nav_items)}")
print("\nNav items:")
for h in nav_items[:50]:
    print(f"  {h}")

# Xem text của các menu section headers
headers = re.findall(r'<span[^>]*class="[^"]*nav-section[^"]*"[^>]*>([^<]+)</span>', content)
if not headers:
    headers = re.findall(r'class="[^"]*section-title[^"]*"[^>]*>([^<]+)<', content)
print(f"\nSection headers found: {headers}")
