const inventoryExportService = require('./backend/services/inventoryExportService');
const fs = require('fs');
const path = require('path');

async function testExport() {
    console.log('🚀 Starting Final Professional Excel Export Verification...');

    // 10 columns according to dynamicHeaders
    const mockData = [
        {
            code: 'VR-TEST-001',
            name: 'Bản lề 4D Cmech (Test)',
            unit: 'Bộ',
            stock: 25,
            min: 10,
            max: 100,
            restock: 75,
            price: 150000,
            totalValue: 3750000
        }
    ];

    const options = {
        title: 'Báo cáo tồn kho Phụ kiện', // Will be converted to UPPERCASE in service
        generatedBy: 'Lê Văn Hải'
    };

    try {
        const buffer = await inventoryExportService.exportToExcel('accessory', mockData, options);
        console.log('✅ Export successful! Buffer size:', buffer.length);

        const outputPath = path.join('d:/ViralWindow_Phan_Mem_Nhom_Kinh/', 'FINAL_professional_export.xlsx');
        fs.writeFileSync(outputPath, buffer);
        console.log('📂 FINAL file saved for inspection:', outputPath);

        process.exit(0);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

testExport();
