const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function analyze() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'templates', 'PhieuXuatKho_Template.xlsx');

    console.log('--- Analyzing Template with ExcelJS:', filePath, '---');

    try {
        await workbook.xlsx.readFile(filePath);
        let output = `--- Analyzing Template with ExcelJS: ${filePath} ---\n`;
        output += `Sheet Names: ${workbook.worksheets.map(w => w.name).join(', ')}\n`;

        // Use sheet 6 or sheet with name like PHIỄU XUÂT KHO
        const sheet = workbook.worksheets.find(w => w.name.includes('PHIỄU XUÂT KHO')) || workbook.getWorksheet(6) || workbook.getWorksheet(1);
        output += `Using Sheet: ${sheet.name}\n`;

        for (let r = 1; r <= 35; r++) {
            const row = sheet.getRow(r);
            let rowData = [];
            for (let c = 1; c <= 15; c++) {
                const cell = row.getCell(c);
                let val = cell.value;
                if (val && typeof val === 'object') {
                    if (val.richText) {
                        val = val.richText.map(t => t.text).join('');
                    } else if (val.formula) {
                        val = `FORMULA: ${val.formula}`;
                    } else {
                        val = JSON.stringify(val);
                    }
                }
                rowData.push(val || '');
            }
            output += `Row ${r}: ${rowData.join(' | ')}\n`;
        }
        fs.writeFileSync('debug_template_output.txt', output);
        console.log('Analysis written to debug_template_output.txt');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

analyze();
