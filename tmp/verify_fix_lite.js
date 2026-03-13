const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function verifyFix() {
    const API_BASE = 'http://localhost:5000/api';
    console.log('--- Verifying Aluminum Warehouse Sync Fix (Dependency-free) ---');

    try {
        // 1. Check aggregate stock
        console.log('\nChecking aggregate stock:');
        const itemsAll = await get(`${API_BASE}/project-materials/inventory/aluminum`);
        const sampleAll = itemsAll[0];
        console.log(`Sample Item [${sampleAll.code}]: stock=${sampleAll.stock}, quantity=${sampleAll.quantity}`);
        
        // 2. Check specific warehouse stock
        console.log('\nChecking specific warehouse stock (warehouse_id=1):');
        const itemsWh = await get(`${API_BASE}/api/project-materials/inventory/aluminum?warehouse_id=1`);
        // Note: The previous get call was missing /api/ in the first case, but itemsAll worked? 
        // Wait, looking at routes: router.get('/inventory/:type', ...)
        // Usually API_BASE includes /api. 
        
        const sampleWh = itemsWh.find(i => i.code === sampleAll.code);
        if (sampleWh) {
            console.log(`Sample Item [${sampleWh.code}] in Warehouse 1: stock=${sampleWh.stock}, quantity=${sampleWh.quantity}`);
            if (sampleWh.stock === sampleWh.quantity) {
                console.log('✅ Warehouse-specific fields match.');
            } else {
                console.log('❌ Warehouse-specific fields MISMATCH!');
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

verifyFix();
