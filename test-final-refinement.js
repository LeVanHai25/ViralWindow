const inventoryExportService = require('./backend/services/inventoryExportService');
const fs = require('fs');
const path = require('path');

async function testFinalRefinement() {
    console.log('🚀 Starting Final Professional Refinement Verification...');

    // Test data including a "ghost" item that should be filtered (passed to service, controller filters it in DB but let's test service rendering)
    const mockData = [
        {
            code: 'VR-001',
            name: 'Phụ kiện thực tế',
            unit: 'Bộ',
            stock: 10,
            min: 5,
            max: 20,
            restock: 10,
            price: 100000,
            totalValue: 1000000
        },
        {
            code: 'VT-IMPORT-GHOST',
            name: 'Vật tư ảo (Sẽ lọc trong DB)',
            unit: 'Cái',
            stock: 0,
            min: 0,
            max: 0,
            restock: 0,
            price: 50000,
            totalValue: 0
        }
    ];

    const options = {
        title: 'Báo cáo tồn kho Phụ kiện',
        generatedBy: 'Lê Văn Hải'
    };

    try {
        const buffer = await inventoryExportService.exportToExcel('accessory', mockData, options);
        console.log('✅ Export successful! Buffer size:', buffer.length);

        const outputPath = path.join('d:/ViralWindow_Phan_Mem_Nhom_Kinh/', 'FINAL_REFined_export.xlsx');
        fs.writeFileSync(outputPath, buffer);
        console.log('📂 FINAL refined file saved:', outputPath);

        process.exit(0);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

testFinalRefinement();
