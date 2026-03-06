const db = require('./config/db');

async function checkCounts() {
    try {
        const [materials] = await db.query('SELECT COUNT(*) as count FROM materials');
        const [accessories] = await db.query('SELECT COUNT(*) as count FROM accessories');
        const [glass_items] = await db.query('SELECT COUNT(*) as count FROM glass_items');
        const [product_materials] = await db.query('SELECT COUNT(*) as count FROM product_materials');

        console.log('materials:', materials[0].count);
        console.log('accessories:', accessories[0].count);
        console.log('glass_items:', glass_items[0].count);
        console.log('product_materials:', product_materials[0].count);

        if (materials[0].count > 0) {
            const [mSample] = await db.query('SELECT name FROM materials LIMIT 5');
            console.log('materials sample:', mSample.map(r => r.name));
        }
        if (product_materials[0].count > 0) {
            const [pmSample] = await db.query('SELECT name FROM product_materials LIMIT 5');
            console.log('product_materials sample:', pmSample.map(r => r.name));
        }

    } catch (error) {
        console.error('Error checking counts:', error);
    } finally {
        process.exit();
    }
}

checkCounts();
