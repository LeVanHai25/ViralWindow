import zipfile
import xml.etree.ElementTree as ET

doc_path = r'd:\ViralWindow_Phan_Mem_Nhom_Kinh\Đồ Án Tốt Nghiệp\CNTT_2022605948_Lê Văn Hải_Baocao_Main.docx'

with zipfile.ZipFile(doc_path) as z:
    xml_content = z.read('word/document.xml')

root = ET.fromstring(xml_content)
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

paragraphs = []
for p in root.findall('.//w:p', ns):
    texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
    if texts:
        paragraphs.append(''.join(texts))

with open('docx_paragraphs.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(paragraphs))
