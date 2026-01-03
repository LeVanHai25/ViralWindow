// Script to update aluminum_system to ViralWindow
require('dotenv').config();
const db = require('./config/db');

async function updateAluminumSystem() {
    try {
        // Update all products to use ViralWindow
        const [result] = await db.query(`
            UPDATE product_templates 
            SET aluminum_system = 'ViralWindow' 
            WHERE aluminum_system IN ('XINGFA_55', 'XINGFA_93')
        `);
        console.log('✅ Updated', result.affectedRows, 'products to ViralWindow');

        // Verify
        const [products] = await db.query(`
            SELECT DISTINCT aluminum_system, COUNT(*) as count 
            FROM product_templates 
            GROUP BY aluminum_system
        `);
        console.log('\n📊 Current aluminum systems in products:');
        products.forEach(p => console.log(`   ${p.aluminum_system}: ${p.count} products`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateAluminumSystem();
