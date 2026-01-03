const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const file1 = path.join(__dirname, 'Tài liệu', 'Chị Vân Anh - Thái Bình.xlsx');
const file2 = path.join(__dirname, 'Tài liệu', 'CT-Mr Mậu Yên Nghĩa.xlsx');

let output = '';

output += "====================================\n";
output += "FILE 1: Chị Vân Anh - Thái Bình.xlsx\n";
output += "====================================\n";

try {
    const wb1 = xlsx.readFile(file1);
    output += 'Sheets: ' + JSON.stringify(wb1.SheetNames) + '\n';

    wb1.SheetNames.forEach(sheetName => {
        output += `\n--- Sheet: ${sheetName} ---\n`;
        const ws = wb1.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        data.slice(0, 35).forEach((row, i) => {
            output += `Row ${i + 1}: ${JSON.stringify(row)}\n`;
        });
    });
} catch (e) {
    output += 'Error: ' + e.message + '\n';
}

output += "\n\n====================================\n";
output += "FILE 2: CT-Mr Mậu Yên Nghĩa.xlsx\n";
output += "====================================\n";

try {
    const wb2 = xlsx.readFile(file2);
    output += 'Sheets: ' + JSON.stringify(wb2.SheetNames) + '\n';

    wb2.SheetNames.forEach(sheetName => {
        output += `\n--- Sheet: ${sheetName} ---\n`;
        const ws = wb2.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        data.slice(0, 35).forEach((row, i) => {
            output += `Row ${i + 1}: ${JSON.stringify(row)}\n`;
        });
    });
} catch (e) {
    output += 'Error: ' + e.message + '\n';
}

fs.writeFileSync('excel_output.txt', output, 'utf8');
console.log('Done! Output saved to excel_output.txt');
