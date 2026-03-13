const axios = require('axios');

async function verifyFix() {
    const API_BASE = 'http://localhost:5000/api';
    console.log('--- Verifying Aluminum Warehouse Sync Fix ---');

    // 1. Check aggregate stock (no warehouse_id)
    try {
        console.log('\nChecking aggregate stock (no warehouse_id):');
        const resAll = await axios.get(`${API_BASE}/project-materials/inventory/aluminum`);
        const sampleAll = resAll.data[0];
        console.log(`Sample Item [${sampleAll.code}]: stock=${sampleAll.stock}, quantity=${sampleAll.quantity}`);
        if (sampleAll.stock === sampleAll.quantity) {
            console.log('✅ Aggregated fields match.');
        } else {
            console.log('❌ Aggregated fields MISMATCH!');
        }

        // 2. Check specific warehouse stock
        const warehouseId = 1; // Assuming warehouse 1 exists
        console.log(`\nChecking specific warehouse stock (warehouse_id=${warehouseId}):`);
        const resWh = await axios.get(`${API_BASE}/project-materials/inventory/aluminum?warehouse_id=${warehouseId}`);
        const sampleWh = resWh.data.find(i => i.code === sampleAll.code);
        if (sampleWh) {
            console.log(`Sample Item [${sampleWh.code}] in Warehouse ${warehouseId}: stock=${sampleWh.stock}, quantity=${sampleWh.quantity}`);
            if (sampleWh.stock === sampleWh.quantity) {
                console.log('✅ Warehouse-specific fields match.');
            } else {
                console.log('❌ Warehouse-specific fields MISMATCH!');
            }
        } else {
            console.log('⚠️ Could not find sample item in warehouse data.');
        }

    } catch (err) {
        console.error('Error during verification:', err.message);
    }
}

verifyFix();
