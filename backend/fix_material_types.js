/**
 * Fix material_type values in order_material_status table
 * Old mapping: KINH, NHOM, PHUKIEN, VATTUPHU (Vietnamese)
 * New mapping: GLASS, ALUMINUM, HARDWARE, ACCESSORY (English - matches productionExcelController)
 */
const db = require('./config/db');

(async () => {
    try {
        const typeMapping = [
            ['KINH', 'GLASS'],
            ['NHOM', 'ALUMINUM'],
            ['PHUKIEN', 'HARDWARE'],
            ['VATTUPHU', 'ACCESSORY']
        ];

        for (const [oldType, newType] of typeMapping) {
            // Delete old English-named rows where Vietnamese ISSUED row exists (to avoid duplicate key)
            const [del] = await db.query(
                `DELETE oms1 FROM order_material_status oms1 
                 INNER JOIN order_material_status oms2 
                 ON oms1.order_id = oms2.order_id 
                 WHERE oms1.material_type = ? AND oms2.material_type = ?`,
                [newType, oldType]
            );
            console.log(`Deleted ${del.affectedRows} old ${newType} rows conflicting with ${oldType}`);

            // Rename Vietnamese to English
            const [upd] = await db.query(
                'UPDATE order_material_status SET material_type = ? WHERE material_type = ?',
                [newType, oldType]
            );
            console.log(`Renamed ${upd.affectedRows} rows: ${oldType} → ${newType}`);
        }

        // Clean up empty rows
        const [clean] = await db.query("DELETE FROM order_material_status WHERE material_type = ''");
        console.log(`Deleted ${clean.affectedRows} empty rows`);

        // Verify
        const [rows] = await db.query(
            'SELECT order_id, material_type, status FROM order_material_status ORDER BY order_id, material_type'
        );
        console.log('\nFinal state:');
        rows.forEach(r => console.log(`  Order ${r.order_id}: ${r.material_type} = ${r.status}`));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
})();
