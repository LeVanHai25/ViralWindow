const XLSX = require('xlsx');
const path = require('path');

const filePath = 'D:\\ViralWindow_Phan_Mem_Nhom_Kinh\\Tài liệu\\Data vật tư trong Sản phẩm.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
} catch (error) {
    console.error('Error reading Excel:', error);
}
