# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

INPUT = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\Drafts\DATN_NGOCHAN_V3.docx'
OUTPUT = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\Drafts\DATN_NGOCHAN_V4_FINAL.docx'

doc = Document(INPUT)

# 1. CĂN LỀ TRANG (Margins: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
for section in doc.sections:
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2)

empty_paras_to_remove = []
empty_count = 0

for para in doc.paragraphs:
    # 2. XÓA KHOẢNG TRẮNG THỪA (Multiple empty lines)
    if not para.text.strip():
        empty_count += 1
        if empty_count > 1:
            empty_paras_to_remove.append(para)
            continue
    else:
        empty_count = 0
    
    # 3. ĐỒNG BỘ FONT (Times New Roman) & JUSTIFY
    # Only justify if it's a normal body paragraph (not centered, not right aligned, not a heading)
    is_heading = para.style.name.startswith('Heading') or (para.runs and para.runs[0].bold and len(para.text) < 100)
    
    if not is_heading and para.alignment is None:
        para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    for run in para.runs:
        if run.text.strip():
            # Set font name
            run.font.name = 'Times New Roman'
            rPr = run._element.get_or_add_rPr()
            rF = rPr.find(qn('w:rFonts'))
            if rF is None:
                rF = run._element.makeelement(qn('w:rFonts'), {})
                rPr.insert(0, rF)
            rF.set(qn('w:eastAsia'), 'Times New Roman')
            rF.set(qn('w:cs'), 'Times New Roman')

# Remove extra empty paragraphs safely
for para in empty_paras_to_remove:
    p = para._element
    p.getparent().remove(p)
    p._p = p._element = None

doc.save(OUTPUT)
print(f'DONE! Saved: {OUTPUT}')
print(f'Formatting applied: Margins (3-2-2-2), Times New Roman enforced, Justified alignment, removed {len(empty_paras_to_remove)} extra blank lines.')
