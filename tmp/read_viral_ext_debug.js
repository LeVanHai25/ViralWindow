const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join('d:', 'ViralWindow_Phan_Mem_Nhom_Kinh', 'Tài liệu', 'Tồn kho nhôm VIRAL kho viral.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log('--- Excel Viral Extended Content (First 10 rows) ---');
    data.slice(0, 10).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
    });
    console.log('------------------------------------');
} catch (err) {
    console.error('Error reading excel:', err);
}
