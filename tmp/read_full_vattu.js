const XLSX = require('xlsx');
const path = require('path');

const filePath = 'D:\\ViralWindow_Phan_Mem_Nhom_Kinh\\Tài liệu\\Data vật tư trong Sản phẩm.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Vật tư';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row
    const rows = data.slice(1).filter(r => r[1]); // Filter if name is present

    console.log(`Total rows to process: ${rows.length}`);
    console.log('First 5 rows:', JSON.stringify(rows.slice(0, 5), null, 2));
    console.log('Last 5 rows:', JSON.stringify(rows.slice(-5), null, 2));

} catch (error) {
    console.error('Error reading Excel:', error);
}
