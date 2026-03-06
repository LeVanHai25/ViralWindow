const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function analyze() {
    const workbook = new ExcelJS.Workbook();
    const templates = ['accessory_report_template.xlsx', 'PhieuXuatKho_Template.xlsx'];
    let finalOutput = '';

    for (const t of templates) {
        const filePath = path.join(__dirname, 'templates', t);
        try {
            await workbook.xlsx.readFile(filePath);
            const sheet = workbook.getWorksheet(1);
            finalOutput += `\n--- Template: ${t} ---\n`;
            for (let r = 1; r <= 15; r++) {
                const row = sheet.getRow(r);
                let rowData = [];
                for (let c = 1; c <= 8; c++) {
                    const cell = row.getCell(c);
                    rowData.push(cell.value || '');
                }
                finalOutput += `Row ${r}: ${rowData.join(' | ')}\n`;
            }
        } catch (e) {
            finalOutput += `Error reading ${t}: ${e.message}\n`;
        }
    }
    fs.writeFileSync('template_comparison.txt', finalOutput);
}

analyze();
