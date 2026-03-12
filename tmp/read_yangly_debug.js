const XLSX = require('xlsx');
const path = require('path');
const db = require('../backend/config/db');

const filePath = path.join('d:', 'ViralWindow_Phan_Mem_Nhom_Kinh', 'Tài liệu', 'Tồn kho KOSO yangly.xlsx');

async function debug() {
    try {
        const workbook = XLSX.readFile(filePath);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        console.log('--- Excel Yangly Content (First 5 rows) ---');
        data.slice(0, 5).forEach((row, index) => console.log(`Row ${index}:`, row));
        
        const [warehouses] = await db.query("SELECT id, warehouse_name FROM inventory_warehouses WHERE warehouse_name LIKE '%YANGKY%'");
        console.log('--- Target Warehouse ---');
        console.log(warehouses);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
