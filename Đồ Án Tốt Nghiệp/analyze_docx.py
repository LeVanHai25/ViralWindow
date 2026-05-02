import sys, xml.etree.ElementTree as ET, zipfile, json
sys.stdout.reconfigure(encoding='utf-8')

W   = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
WP  = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'

def twip2cm(t):
    try: return round(int(t)*2.54/1440, 2)
    except: return t

# Extract XMLs from docx
p = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\LevanHai_2022605948_Bao_Cao.docx'
with zipfile.ZipFile(p, 'r') as z:
    doc_xml = z.read('word/document.xml').decode('utf-8')
    styles_xml = z.read('word/styles.xml').decode('utf-8')

doc_root = ET.fromstring(doc_xml)
sty_root = ET.fromstring(styles_xml)

# ===================== PAGE SETUP =====================
sectPr = doc_root.find('.//{%s}sectPr' % W)
if sectPr is not None:
    pgSz = sectPr.find('{%s}pgSz' % W)
    pgMar = sectPr.find('{%s}pgMar' % W)
    print('=== PAGE SETUP ===')
    if pgSz is not None:
        w_val = pgSz.get('{%s}w' % W)
        h_val = pgSz.get('{%s}h' % W)
        print(f'  Page: {twip2cm(w_val)}cm x {twip2cm(h_val)}cm (A4)')
    if pgMar is not None:
        for key in ['top','right','bottom','left','header','footer']:
            v = pgMar.get('{%s}%s' % (W, key))
            if v: print(f'  Margin {key}: {v} twips = {twip2cm(v)} cm')

# ===================== KEY STYLES =====================
print('\n=== KEY STYLES ===')
for style in sty_root.findall('.//{%s}style' % W):
    sid = style.get('{%s}styleId' % W)
    if sid not in ('Normal','Heading1','Heading2','Heading3','Heading4','1hinh','1bang','Caption'): continue
    stype = style.get('{%s}type' % W)
    name_el = style.find('{%s}name' % W)
    name = name_el.get('{%s}val' % W) if name_el is not None else ''
    print(f'\n  [{sid}] ({name}):')
    pPr = style.find('{%s}pPr' % W)
    rPr = style.find('{%s}rPr' % W)
    if pPr is not None:
        jc = pPr.find('{%s}jc' % W)
        sp = pPr.find('{%s}spacing' % W)
        ind = pPr.find('{%s}ind' % W)
        ol = pPr.find('{%s}outlineLvl' % W)
        kn = pPr.find('{%s}keepNext' % W)
        kl = pPr.find('{%s}keepLines' % W)
        if jc is not None: print(f'    align: {jc.get("{%s}val" % W)}')
        if sp is not None:
            sp_d = {k.split("}")[1]: v for k,v in sp.attrib.items()}
            print(f'    spacing: {sp_d}')
        if ind is not None:
            ind_d = {k.split("}")[1]: v for k,v in ind.attrib.items()}
            print(f'    indent: {ind_d}')
        if ol is not None: print(f'    outlineLevel: {ol.get("{%s}val" % W)}')
        if kn is not None: print(f'    keepNext: true')
        if kl is not None: print(f'    keepLines: true')
    if rPr is not None:
        sz = rPr.find('{%s}sz' % W)
        szCs = rPr.find('{%s}szCs' % W)
        b = rPr.find('{%s}b' % W)
        i = rPr.find('{%s}i' % W)
        color = rPr.find('{%s}color' % W)
        fonts = rPr.find('{%s}rFonts' % W)
        if sz is not None: print(f'    fontSize: {int(sz.get("{%s}val" % W))//2}pt (half-pt val={sz.get("{%s}val" % W)})')
        if szCs is not None: print(f'    fontSizeCs: {int(szCs.get("{%s}val" % W))//2}pt')
        if b is not None: print(f'    bold: true')
        if i is not None: print(f'    italic: true')
        if color is not None: print(f'    color: {color.get("{%s}val" % W)}')
        if fonts is not None:
            fd = {k.split("}")[1]: v for k,v in fonts.attrib.items()}
            print(f'    fonts: {fd}')

# ===================== IMAGES =====================
drawings = doc_root.findall('.//{%s}drawing' % W)
print(f'\n=== IMAGES ({len(drawings)} total) ===')
for i, drw in enumerate(drawings[:8]):
    inline = drw.find('{%s}inline' % WP)
    anchor = drw.find('{%s}anchor' % WP)
    node = inline if inline is not None else anchor
    mode = 'inline' if inline is not None else 'anchor'
    if node is not None:
        extent = node.find('{%s}extent' % WP)
        if extent is not None:
            cx = int(extent.get('cx', 0))
            cy = int(extent.get('cy', 0))
            print(f'  Image {i+1}: {mode}, {cx/360000:.1f}cm x {cy/360000:.1f}cm')

# ===================== CAPTIONS =====================
paras = doc_root.findall('.//{%s}p' % W)
print(f'\n=== CAPTIONS ===')
cap_count = 0
for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    if style not in ('1hinh', '1bang'): continue
    text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
    jc_el = pPr.find('{%s}jc' % W) if pPr is not None else None
    jc = jc_el.get('{%s}val' % W) if jc_el is not None else None
    italic = any(rPr.find('{%s}i' % W) is not None for rPr in p.findall('.//{%s}rPr' % W))
    bold = any(rPr.find('{%s}b' % W) is not None for rPr in p.findall('.//{%s}rPr' % W))
    szs = set()
    for rPr in p.findall('.//{%s}rPr' % W):
        sz = rPr.find('{%s}sz' % W)
        if sz is not None: szs.add(sz.get('{%s}val' % W))
    print(f'  [{style}] align={jc}, italic={italic}, bold={bold}, sz={szs}: {text[:70]}')
    cap_count += 1
    if cap_count >= 15: break

# ===================== TABLE FORMATTING =====================
tables = doc_root.findall('.//{%s}tbl' % W)
print(f'\n=== TABLES ({len(tables)} total) ===')
for ti, tbl in enumerate(tables[:6]):
    tblPr = tbl.find('{%s}tblPr' % W)
    rows = tbl.findall('{%s}tr' % W)
    cols = len(rows[0].findall('{%s}tc' % W)) if rows else 0
    # header text
    headers = []
    if rows:
        for cell in rows[0].findall('{%s}tc' % W):
            t = ''.join(x.text or '' for x in cell.findall('.//{%s}t' % W)).strip()[:25]
            headers.append(t)
    # header cell shading
    shd_fill = None
    if rows:
        first_cell = rows[0].findall('{%s}tc' % W)
        if first_cell:
            tcPr = first_cell[0].find('{%s}tcPr' % W)
            if tcPr is not None:
                shd = tcPr.find('{%s}shd' % W)
                if shd is not None:
                    shd_fill = shd.get('{%s}fill' % W)
    # header bold?
    hdr_bold = False
    if rows:
        for rPr in rows[0].findall('.//{%s}rPr' % W):
            if rPr.find('{%s}b' % W) is not None:
                hdr_bold = True
                break
    # alignment in header
    hdr_align = None
    if rows:
        for pPr in rows[0].findall('.//{%s}pPr' % W):
            jc = pPr.find('{%s}jc' % W)
            if jc is not None:
                hdr_align = jc.get('{%s}val' % W)
                break
    print(f'  Table {ti+1}: {len(rows)} rows x {cols} cols, hdrBold={hdr_bold}, hdrAlign={hdr_align}, hdrFill={shd_fill}')
    print(f'    Headers: {headers}')

# ===================== BODY TEXT STATS =====================
print('\n=== BODY TEXT STATISTICS ===')
indent_firsts = {}
alignments = {}
spacings_line = {}
for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    if style != 'Normal': continue
    text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
    if not text: continue
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

print('  First-line indent (twips -> cm):')
for k, v in sorted(indent_firsts.items(), key=lambda x: -x[1]):
    print(f'    {k} twips ({twip2cm(k)} cm): {v} paragraphs')
print(f'  Alignments: {alignments}')
print(f'  Line spacings (240=single, 360=1.5x, 480=double): {spacings_line}')

# ===================== HEADING STRUCTURE =====================
print('\n=== DOCUMENT HEADING STRUCTURE (first 40 headings) ===')
hdr_count = 0
for p in paras:
    pPr = p.find('{%s}pPr' % W)
    style_el = pPr.find('{%s}pStyle' % W) if pPr is not None else None
    style = style_el.get('{%s}val' % W) if style_el is not None else 'Normal'
    if style.startswith('Heading'):
        text = ''.join(t.text or '' for t in p.findall('.//{%s}t' % W)).strip()
        if text:
            level = style.replace('Heading','')
            indent = '  ' * int(level)
            print(f'  {indent}[H{level}] {text[:70]}')
            hdr_count += 1
            if hdr_count >= 40: break

print('\n=== ANALYSIS COMPLETE ===')
