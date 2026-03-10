const inventoryExportService = require('./backend/services/inventoryExportService');
const fs = require('fs');
const path = require('path');

async function testExport() {
    console.log('🚀 Starting Professional Excel Export Verification...');

    const mockData = [
        {
            code: 'VR001',
            name: 'Bản lề 4D Cmech',
            unit: 'Cái',
            stock: 13,
            min: 10,
            max: 50,
            restock: 37,
            price: 150000,
            totalValue: 1950000
        },
        {
            code: 'VR002',
            name: 'Tay nắm cửa đi',
            unit: 'Bộ',
            stock: 128,
            min: 20,
            max: 100,
            restock: 0,
            price: 450000,
            totalValue: 57600000
        }
    ];

    const options = {
        title: 'BÁO CÁO TỒN KHO PHỤ KIỆN',
        generatedBy: 'Senior Architectural Programmer'
    };

    try {
        const buffer = await inventoryExportService.exportToExcel('accessory', mockData, options);
        console.log('✅ Export successful! Buffer size:', buffer.length);

        const outputPath = path.join('d:/ViralWindow_Phan_Mem_Nhom_Kinh/', 'professional_export_result.xlsx');
        fs.writeFileSync(outputPath, buffer);
        console.log('📂 File saved for manual inspection:', outputPath);

        process.exit(0);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

testExport();
