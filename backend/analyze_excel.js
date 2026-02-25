const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Tài liệu', 'CT-Mr Mậu Yên Nghĩa.xlsx');

console.log('Starting to read file:', filePath);

try {
    const wb = XLSX.readFile(filePath);
    console.log('SUCCESS: File loaded');
    console.log('Sheets:', wb.SheetNames);

    wb.SheetNames.forEach(sheetName => {
        console.log('\n[SHEET]:', sheetName);
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        console.log('Rows count:', data.length);

        // Print max 80 rows
        for (let i = 0; i < Math.min(data.length, 80); i++) {
            const row = data[i];
            if (row && row.some(cell => cell !== '')) {
                console.log(`R${i + 1}:`, row.map(c => String(c || '').substring(0, 35)).join(' | '));
            }
        }
    });
} catch (error) {
    console.error('Error:', error.message);
}
