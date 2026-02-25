const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'Tài liệu', 'CT-Mr Mậu Yên Nghĩa.xlsx');

console.log('Reading file:', filePath);

try {
    const wb = XLSX.readFile(filePath);
    console.log('\n==============================');
    console.log('FILE ANALYSIS REPORT');
    console.log('==============================');
    console.log('Total Sheets:', wb.SheetNames.length);
    console.log('Sheet Names:', wb.SheetNames.join(', '));

    wb.SheetNames.forEach(sheetName => {
        console.log('\n==============================');
        console.log('SHEET:', sheetName);
        console.log('==============================');

        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        console.log('Total Rows:', data.length);

        // Print first 100 rows
        const maxRows = Math.min(data.length, 100);
        for (let i = 0; i < maxRows; i++) {
            const row = data[i];
            if (row && row.some(cell => cell !== '')) {
                const rowStr = row.map((cell, idx) => {
                    let val = String(cell || '').trim();
                    if (val.length > 30) val = val.substring(0, 27) + '...';
                    return val;
                }).join(' | ');
                console.log(`Row ${i + 1}: ${rowStr}`);
            }
        }
    });
} catch (error) {
    console.error('Error reading file:', error.message);
}
