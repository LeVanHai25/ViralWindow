const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'templates', 'PhieuXuatKho_Template.xlsx');

console.log('--- Analyzing Template:', filePath, '---');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);
    const sheetName = workbook.SheetNames[0];
    const datasheet = workbook.Sheets[sheetName];

    // Get all cells
    const range = XLSX.utils.decode_range(datasheet['!ref']);

    for (let R = 0; R < 15; ++R) {
        let rowData = [];
        for (let C = 0; C < 10; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = datasheet[cellRef];
            rowData.push(cell ? cell.v : '');
        }
        console.log(`Row ${R + 1}:`, rowData.join(' | '));
    }
} catch (err) {
    console.error('Error:', err.message);
}
