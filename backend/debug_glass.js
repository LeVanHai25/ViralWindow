const db = require('./config/db');

async function debug() {
    try {
        // Check glass_items - use correct columns
        const [glass] = await db.query(`SELECT id, code, name, quantity FROM glass_items LIMIT 15`);
        console.log('=== glass_items ===');
        glass.forEach(g => console.log(`id=${g.id}, code="${g.code}", name="${g.name?.substring(0, 30)}", qty=${g.quantity}`));

        // Check project_materials for project 15
        const [pm] = await db.query(`SELECT material_code, material_name, quantity, notes FROM project_materials WHERE project_id = 15 AND material_type = 'glass'`);
        console.log('\n=== project_materials (project 15, glass) ===');
        pm.forEach(p => console.log(`code="${p.material_code}", name="${p.material_name?.substring(0, 30)}", qty=${p.quantity}`));

        // Build glassStock map to see what keys are available
        console.log('\n=== Normalized map test ===');
        const normalizeCode = (code) => {
            if (!code) return '';
            return code.toString().replace(/[-\s]/g, '').toLowerCase().trim();
        };

        const glassStock = {};
        glass.forEach(g => {
            // Use 'name' instead of 'glass_type'
            const rawCode = g.code || g.name || '';
            const rawKey = rawCode.toLowerCase();
            const normalizedKey = normalizeCode(rawCode);
            const qty = parseFloat(g.quantity) || 0;

            glassStock[rawKey] = (glassStock[rawKey] || 0) + qty;
            if (normalizedKey && normalizedKey !== rawKey) {
                glassStock[normalizedKey] = (glassStock[normalizedKey] || 0) + qty;
            }
        });

        console.log('glassStock keys:', Object.keys(glassStock).slice(0, 20));

        // Check if project_materials codes match
        console.log('\n=== Lookup test ===');
        pm.forEach(p => {
            const code = (p.material_code || p.material_name || '').toLowerCase();
            const normCode = normalizeCode(code);
            const available = glassStock[normCode] || glassStock[code] || 0;
            console.log(`BOM code="${p.material_code}" -> raw="${code}", norm="${normCode}", stock=${available}`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit();
    }
}

debug();
