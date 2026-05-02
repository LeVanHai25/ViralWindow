import sys, xml.etree.ElementTree as ET, zipfile, json
sys.stdout.reconfigure(encoding='utf-8')

W  = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'

def twip2cm(t):
    try: return round(int(t)*2.54/1440, 2)
    except: return t

# ========== STANDARD (from LevanHai_2022605948_Bao_Cao.docx) ==========
STD = {
    'page_w_cm': 21.0, 'page_h_cm': 29.7,
    'margin_top': 2.5, 'margin_bottom': 2.0, 'margin_left': 3.0, 'margin_right': 2.0,
    'margin_header': 1.27, 'margin_footer': 1.27,
    'normal_font': 'Times New Roman', 'normal_sz_half': '28', 'normal_sz_pt': 14,
    'normal_line': '360', 'normal_line_desc': '1.5 lines',
    'normal_align': 'both',
    'normal_firstLine': '567', 'normal_firstLine_cm': 1.0,
    'h1_bold': True, 'h1_align': 'center', 'h1_sz_half': '28',
    'h2_bold': True, 'h2_align': 'both', 'h2_color': '000000',
    'h3_bold': True, 'h3_italic': True, 'h3_color': '000000',
}

# ========== EXTRACT FROM TARGET FILE ==========
p = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\CNTT_2022605948_Lê Văn Hải_Baocao_Main.docx'
with zipfile.ZipFile(p, 'r') as z:
    doc_xml = z.read('word/document.xml').decode('utf-8')
    styles_xml = z.read('word/styles.xml').decode('utf-8')
    # Check for numbering
    has_numbering = 'word/numbering.xml' in z.namelist()

doc_root = ET.fromstring(doc_xml)
sty_root = ET.fromstring(styles_xml)

issues = []
info = []

# ===================== 1. PAGE SETUP =====================
print('='*70)
print('1. PAGE SETUP')
print('='*70)
sectPrs = doc_root.findall('.//{%s}sectPr' % W)
for si, sectPr in enumerate(sectPrs):
    pgSz = sectPr.find('{%s}pgSz' % W)
    pgMar = sectPr.find('{%s}pgMar' % W)
    if pgSz is not None:
        pw = twip2cm(pgSz.get('{%s}w' % W))
        ph = twip2cm(pgSz.get('{%s}h' % W))
        print(f'  Page: {pw}cm x {ph}cm')
        if abs(pw - 21.0) > 0.5 or abs(ph - 29.7) > 0.5:
            issues.append(f'[PAGE] Kho giay KHONG phai A4: {pw}x{ph}cm (chuan: 21x29.7)')
        else:
            info.append('[PAGE] Kho giay A4 OK')
    if pgMar is not None:
        margins = {}
        for key in ['top','right','bottom','left','header','footer']:
            v = pgMar.get('{%s}%s' % (W, key))
            if v: margins[key] = twip2cm(v)
        print(f'  Margins: {margins}')
        
        if abs(margins.get('top',0) - STD['margin_top']) > 0.15:
            issues.append(f'[MARGIN] Le tren = {margins.get("top")}cm (chuan: {STD["margin_top"]}cm)')
        if abs(margins.get('bottom',0) - STD['margin_bottom']) > 0.15:
            issues.append(f'[MARGIN] Le duoi = {margins.get("bottom")}cm (chuan: {STD["margin_bottom"]}cm)')
        if abs(margins.get('left',0) - STD['margin_left']) > 0.15:
            issues.append(f'[MARGIN] Le trai = {margins.get("left")}cm (chuan: {STD["margin_left"]}cm)')
        if abs(margins.get('right',0) - STD['margin_right']) > 0.15:
            issues.append(f'[MARGIN] Le phai = {margins.get("right")}cm (chuan: {STD["margin_right"]}cm)')
        if abs(margins.get('header',0) - STD['margin_header']) > 0.15:
            issues.append(f'[MARGIN] Header = {margins.get("header")}cm (chuan: {STD["margin_header"]}cm)')
        if abs(margins.get('footer',0) - STD['margin_footer']) > 0.15:
            issues.append(f'[MARGIN] Footer = {margins.get("footer")}cm (chuan: {STD["margin_footer"]}cm)')
        
        if not any('[MARGIN]' in i for i in issues):
            info.append('[MARGIN] Tat ca le trang OK')

# ===================== 2. STYLES CHECK =====================
print('\n' + '='*70)
print('2. STYLES CHECK')
print('='*70)

styles_data = {}
for style in sty_root.findall('.//{%s}style' % W):
    sid = style.get('{%s}styleId' % W)
    if sid not in ('Normal','Heading1','Heading2','Heading3','Heading4','1hinh','1bang','Caption'): continue
    sdata = {'id': sid}
    pPr = style.find('{%s}pPr' % W)
    rPr = style.find('{%s}rPr' % W)
    if pPr is not None:
        jc = pPr.find('{%s}jc' % W)
        sp = pPr.find('{%s}spacing' % W)
        ind = pPr.find('{%s}ind' % W)
        if jc is not None: sdata['align'] = jc.get('{%s}val' % W)
        if sp is not None: sdata['spacing'] = {k.split('}')[1]: v for k,v in sp.attrib.items()}
        if ind is not None: sdata['indent'] = {k.split('}')[1]: v for k,v in ind.attrib.items()}
    if rPr is not None:
        sz = rPr.find('{%s}sz' % W)
        b = rPr.find('{%s}b' % W)
        i_el = rPr.find('{%s}i' % W)
        color = rPr.find('{%s}color' % W)
        fonts = rPr.find('{%s}rFonts' % W)
        if sz is not None: sdata['sz'] = sz.get('{%s}val' % W)
        if b is not None: sdata['bold'] = True
        if i_el is not None: sdata['italic'] = True
        if color is not None: sdata['color'] = color.get('{%s}val' % W)
        if fonts is not None: sdata['fonts'] = {k.split('}')[1]: v for k,v in fonts.attrib.items()}
    styles_data[sid] = sdata
    print(f'  [{sid}]: {sdata}')

# Check Normal style
ns = styles_data.get('Normal', {})
ns_font = ns.get('fonts', {}).get('ascii', 'MISSING')
ns_sz = ns.get('sz', 'MISSING')
ns_line = ns.get('spacing', {}).get('line', 'MISSING')
ns_align = ns.get('align', 'MISSING')
ns_fl = ns.get('indent', {}).get('firstLine', 'MISSING')

if ns_font != STD['normal_font']:
    issues.append(f'[NORMAL] Font = "{ns_font}" (chuan: "{STD["normal_font"]}")')
else:
    info.append(f'[NORMAL] Font Times New Roman OK')

if ns_sz != STD['normal_sz_half']:
    pt = int(ns_sz)//2 if ns_sz != 'MISSING' else '?'
    issues.append(f'[NORMAL] Co chu = {pt}pt (half={ns_sz}) (chuan: {STD["normal_sz_pt"]}pt, half={STD["normal_sz_half"]})')
else:
    info.append(f'[NORMAL] Co chu 14pt OK')

if ns_line != STD['normal_line']:
    issues.append(f'[NORMAL] Gian dong = {ns_line} (chuan: {STD["normal_line"]} = 1.5 lines)')
else:
    info.append('[NORMAL] Gian dong 1.5 OK')

# Check Heading1
h1 = styles_data.get('Heading1', {})
if not h1.get('bold'):
    issues.append('[H1] Heading 1 KHONG in dam (chuan: Bold)')
else:
    info.append('[H1] Bold OK')
if h1.get('align') != STD['h1_align']:
    issues.append(f'[H1] Heading 1 can le = "{h1.get("align")}" (chuan: "center")')
else:
    info.append('[H1] Can giua OK')

# Check Heading2
h2 = styles_data.get('Heading2', {})
if not h2.get('bold'):
    issues.append('[H2] Heading 2 KHONG in dam (chuan: Bold)')
else:
    info.append('[H2] Bold OK')
if h2.get('align') != STD['h2_align']:
    issues.append(f'[H2] Heading 2 can le = "{h2.get("align")}" (chuan: "both/justify")')

# Check Heading3
h3 = styles_data.get('Heading3', {})
if not h3.get('bold'):
    issues.append('[H3] Heading 3 KHONG in dam (chuan: Bold)')
if not h3.get('italic'):
    issues.append('[H3] Heading 3 KHONG in nghieng (chuan: Bold + Italic)')
else:
    info.append('[H3] Bold+Italic OK')

# ===================== 3. PARAGRAPH ANALYSIS =====================
print('\n' + '='*70)
print('3. PARAGRAPH ANALYSIS')
print('='*70)

paras = doc_root.findall('.//{%s}p' % W)
print(f'  Total paragraphs: {len(paras)}')

# Stats
style_counts = {}
indent_firsts = {}
alignments = {}
spacings_line = {}
font_issues_count = 0
sz_issues_count = 0
normal_count = 0
wrong_font_samples = []
wrong_sz_samples = []

for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    style_counts[style] = style_counts.get(style, 0) + 1
    
    text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
    if not text: continue
    
    if style == 'Normal':
        normal_count += 1
        if pPr is not None:
            ind_el = pPr.find('{%s}ind' % W)
            jc_el = pPr.find('{%s}jc' % W)
            sp_el = pPr.find('{%s}spacing' % W)
            if ind_el is not None:
                fl = ind_el.get('{%s}firstLine' % W)
                if fl: indent_firsts[fl] = indent_firsts.get(fl, 0) + 1
            if jc_el is not None:
                v = jc_el.get('{%s}val' % W)
                alignments[v] = alignments.get(v, 0) + 1
            if sp_el is not None:
                ln = sp_el.get('{%s}line' % W)
                if ln: spacings_line[ln] = spacings_line.get(ln, 0) + 1
        
        # Check run-level font and size overrides
        for r in p.findall('{%s}r' % W):
            rPr = r.find('{%s}rPr' % W)
            if rPr is not None:
                fonts = rPr.find('{%s}rFonts' % W)
                sz = rPr.find('{%s}sz' % W)
                rtext = ''.join(t.text or '' for t in r.findall('{%s}t' % W)).strip()
                if fonts is not None:
                    ascii_f = fonts.get('{%s}ascii' % W)
                    if ascii_f and ascii_f != 'Times New Roman' and ascii_f not in ('Symbol', 'Wingdings'):
                        font_issues_count += 1
                        if len(wrong_font_samples) < 8:
                            wrong_font_samples.append(f'Font "{ascii_f}": "{rtext[:40]}"')
                if sz is not None:
                    sv = sz.get('{%s}val' % W)
                    if sv != '28' and sv != '26':
                        sz_issues_count += 1
                        if len(wrong_sz_samples) < 8:
                            wrong_sz_samples.append(f'Size {int(sv)//2}pt (half={sv}): "{rtext[:40]}"')

print(f'  Normal paragraphs with text: {normal_count}')
print(f'  Style distribution: {dict(sorted(style_counts.items(), key=lambda x:-x[1])[:15])}')
print(f'  First-line indent (twips): {indent_firsts}')
print(f'  Alignments: {alignments}')
print(f'  Line spacings: {spacings_line}')
print(f'  Font override issues: {font_issues_count}')
print(f'  Size override issues: {sz_issues_count}')

if font_issues_count > 0:
    issues.append(f'[FONT] {font_issues_count} doan van dung font SAI (khong phai Times New Roman)')
    for s in wrong_font_samples:
        issues.append(f'  -> {s}')

if sz_issues_count > 5:
    issues.append(f'[SIZE] {sz_issues_count} doan van co chu SAI (khong phai 14pt)')
    for s in wrong_sz_samples:
        issues.append(f'  -> {s}')

# Check first-line indent
no_indent = normal_count - sum(indent_firsts.values())
if no_indent > 20:
    issues.append(f'[INDENT] {no_indent}/{normal_count} doan Normal KHONG co thut dau dong (chuan: firstLine 1.0cm)')
wrong_indent = sum(v for k,v in indent_firsts.items() if k != '567')
if wrong_indent > 5:
    issues.append(f'[INDENT] {wrong_indent} doan co thut dau dong SAI (khong phai 567 twips = 1cm)')
    for k,v in indent_firsts.items():
        if k != '567':
            issues.append(f'  -> {k} twips ({twip2cm(k)}cm): {v} doan')

# Check alignment
not_justify = sum(v for k,v in alignments.items() if k != 'both' and k != 'center')
if not_justify > 10:
    issues.append(f'[ALIGN] {not_justify} doan Normal KHONG can deu (khong phai justify/center)')

# Check line spacing
wrong_spacing = sum(v for k,v in spacings_line.items() if k not in ('360', '336'))
if wrong_spacing > 10:
    issues.append(f'[SPACING] {wrong_spacing} doan co gian dong SAI (khong phai 1.5 lines)')
    for k,v in spacings_line.items():
        if k not in ('360',):
            desc = {'240': 'single', '276': '1.15x', '288': '1.2x', '336': '1.4x', '480': 'double'}.get(k, k)
            issues.append(f'  -> {k} twips ({desc}): {v} doan')

# ===================== 4. HEADINGS STRUCTURE =====================
print('\n' + '='*70)
print('4. HEADING STRUCTURE')
print('='*70)

heading_issues = []
for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    if not style.startswith('Heading'): continue
    text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
    if not text: continue
    level = style.replace('Heading', '')
    indent = '  ' * int(level)
    print(f'  {indent}[H{level}] {text[:70]}')
    
    # Check H1 is uppercase
    if level == '1' and text != text.upper():
        heading_issues.append(f'[H1] KHONG viet in hoa: "{text[:50]}"')
    
    # Check inline overrides on headings
    if pPr is not None:
        jc_el = pPr.find('{%s}jc' % W)
        if level == '1' and jc_el is not None and jc_el.get('{%s}val' % W) != 'center':
            heading_issues.append(f'[H1] KHONG can giua: "{text[:50]}" (align={jc_el.get("{%s}val" % W)})')

for hi in heading_issues:
    issues.append(hi)

# ===================== 5. TABLES =====================
print('\n' + '='*70)
print('5. TABLES')
print('='*70)

tables = doc_root.findall('.//{%s}tbl' % W)
print(f'  Total tables: {len(tables)}')

for ti, tbl in enumerate(tables[:20]):
    rows = tbl.findall('{%s}tr' % W)
    cols = len(rows[0].findall('{%s}tc' % W)) if rows else 0
    headers = []
    if rows:
        for cell in rows[0].findall('{%s}tc' % W):
            t = ''.join(x.text or '' for x in cell.findall('.//{%s}t' % W)).strip()[:25]
            headers.append(t)
    
    # Check header bold
    hdr_bold = False
    hdr_center = False
    if rows:
        for rPr in rows[0].findall('.//{%s}rPr' % W):
            if rPr.find('{%s}b' % W) is not None: hdr_bold = True
        for pPr in rows[0].findall('.//{%s}pPr' % W):
            jc = pPr.find('{%s}jc' % W)
            if jc is not None and jc.get('{%s}val' % W) == 'center': hdr_center = True
    
    # Check borders
    tblPr = tbl.find('{%s}tblPr' % W)
    has_borders = False
    if tblPr is not None:
        tblBorders = tblPr.find('{%s}tblBorders' % W)
        if tblBorders is not None: has_borders = True
    
    print(f'  Table {ti+1}: {len(rows)}x{cols}, bold={hdr_bold}, center={hdr_center}, borders={has_borders}')
    print(f'    Headers: {headers}')
    
    if not hdr_bold:
        issues.append(f'[TABLE {ti+1}] Header KHONG in dam (headers: {headers[:3]})')
    if not hdr_center:
        issues.append(f'[TABLE {ti+1}] Header KHONG can giua (headers: {headers[:3]})')

# ===================== 6. IMAGES & CAPTIONS =====================
print('\n' + '='*70)
print('6. IMAGES & CAPTIONS')
print('='*70)

drawings = doc_root.findall('.//{%s}drawing' % W)
print(f'  Total images: {len(drawings)}')

# Check captions
caption_styles = {'1hinh': 0, '1bang': 0, 'Caption': 0}
caption_missing_pattern = 0
all_captions = []
for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    if style in caption_styles:
        caption_styles[style] += 1
        text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
        all_captions.append(text)
        if style == '1hinh' and not text.startswith('Hình'):
            caption_missing_pattern += 1
            if caption_missing_pattern <= 3:
                issues.append(f'[CAPTION] Chu thich hinh SAI pattern: "{text[:50]}" (chuan: "Hinh X: ...")')
        if style == '1bang' and not text.startswith('Bảng') and not text.startswith('Bang'):
            issues.append(f'[CAPTION] Chu thich bang SAI pattern: "{text[:50]}" (chuan: "Bang X: ...")')

print(f'  Caption styles: {caption_styles}')
print(f'  Captions found:')
for c in all_captions[:10]:
    print(f'    "{c[:70]}"')

if caption_styles['1hinh'] == 0 and caption_styles['1bang'] == 0 and caption_styles['Caption'] == 0:
    if len(drawings) > 0:
        issues.append(f'[CAPTION] Co {len(drawings)} hinh nhung KHONG co caption style (1hinh/1bang) nao!')

# ===================== SUMMARY =====================
print('\n' + '='*70)
print('SUMMARY')
print('='*70)

if issues:
    print(f'\n  !!! TIM THAY {len(issues)} VAN DE CAN SUA !!!\n')
    for idx, issue in enumerate(issues, 1):
        print(f'  {idx:3d}. {issue}')
else:
    print('\n  OK - Khong tim thay van de lon.')

print(f'\n  --- Cac muc DA DAT CHUAN ---')
for i in info:
    print(f'    OK: {i}')

print('\nDONE.')
