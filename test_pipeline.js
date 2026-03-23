const db = require('./backend/config/db');

function normalizeCode(code) {
    if (!code) return '';
    const map = {
        'd': 'd', 'Ð': 'D',
        'á': 'a', 'à': 'a', '?': 'a', 'ã': 'a', '?': 'a',
        'a': 'a', '?': 'a', '?': 'a', '?': 'a', '?': 'a', '?': 'a',
        'â': 'a', '?': 'a', '?': 'a', '?': 'a', '?': 'a', '?': 'a',
        'é': 'e', 'è': 'e', '?': 'e', '?': 'e', '?': 'e',
        'ê': 'e', '?': 'e', '?': 'e', '?': 'e', '?': 'e', '?': 'e',
        'í': 'i', 'ì': 'i', '?': 'i', 'i': 'i', '?': 'i',
        'ó': 'o', 'ò': 'o', '?': 'o', 'õ': 'o', '?': 'o',
        'ô': 'o', '?': 'o', '?': 'o', '?': 'o', '?': 'o', '?': 'o',
        'o': 'o', '?': 'o', '?': 'o', '?': 'o', '?': 'o', '?': 'o',
        'ú': 'u', 'ù': 'u', '?': 'u', 'u': 'u', '?': 'u',
        'u': 'u', '?': 'u', '?': 'u', '?': 'u', '?': 'u', '?': 'u',
        'ý': 'y', '?': 'y', '?': 'y', '?': 'y', '?': 'y'
    };
    return code
        .toLowerCase()
        .replace(/./g, char => map[char] || char)
        .replace(/[^a-z0-9]/g, '');
}

async function check() {
    try {
        const id = 17; // VR018
        const groupType = 'glass';
        const groupUpper = 'GLASS';

        const [bomRows] = await db.query(\
            SELECT 
                pm.material_code,
                pm.material_name,
                pm.quantity,
                pm.unit,
                pm.notes
            FROM project_materials pm
            WHERE pm.project_id = ? 
              AND pm.material_type = ?
        \, [id, groupType]);

        let groupStoredStatus = null;
        let exportedItemsMap = {};

        const [storedRows] = await db.query(
            'SELECT status FROM order_material_status WHERE order_id = ? AND material_type = ?',
            [id, groupUpper]
        );
        if (storedRows.length > 0) {
            groupStoredStatus = storedRows[0].status;
        }

        console.log("Group Stored Status:", groupStoredStatus);

        if (groupStoredStatus === 'ISSUED') {
            const [exportLines] = await db.query(\
                SELECT l.item_code, l.item_name, SUM(l.qty) as total_exported
                FROM stock_document_lines l
                JOIN stock_documents d ON l.document_id = d.id
                WHERE d.doc_type = 'export'
                  AND d.status = 'posted'
                  AND (l.project_id = ? OR d.project_id = ?)
                GROUP BY l.item_code, l.item_name
            \, [id, id]);
            
            console.log("Export lines:", exportLines);

            exportLines.forEach(el => {
                const codeKey = (el.item_code || '').toLowerCase();
                const nameKey = (el.item_name || '').toLowerCase();
                const normCode = normalizeCode(el.item_code || '');
                const normName = normalizeCode(el.item_name || '');
                const qty = parseFloat(el.total_exported) || 0;
                
                const uniqueKeys = new Set();
                if (codeKey) uniqueKeys.add(codeKey);
                if (nameKey) uniqueKeys.add(nameKey);
                if (normCode) uniqueKeys.add(normCode);
                if (normName) uniqueKeys.add(normName);
                
                uniqueKeys.forEach(key => {
                    exportedItemsMap[key] = (exportedItemsMap[key] || 0) + qty;
                });
            });
            console.log("Exported items map:", exportedItemsMap);
        }

        for (const row of bomRows) {
            let extraData = {};
            try { if (row.notes) extraData = JSON.parse(row.notes); } catch (e) {}

            const code = row.material_code || extraData.code || '';
            const name = row.material_name || extraData.name || '';
            const requiredQty = parseFloat(row.quantity) || 0;

            const codeKey = code.toLowerCase();
            const nameKey = name.toLowerCase();
            const normalizedCodeKey = normalizeCode(code);
            const normalizedNameKey = normalizeCode(name);

            let exportedQty = 0;
            if (groupStoredStatus === 'ISSUED') {
                exportedQty = exportedItemsMap[normalizedCodeKey]
                    || exportedItemsMap[codeKey]
                    || exportedItemsMap[normalizedNameKey]
                    || exportedItemsMap[nameKey]
                    || 0;
            }

            console.log("Evaluating BOM row:", { code, name, requiredQty, exportedQty });
            console.log("Keys checked:", { normalizedCodeKey, codeKey, normalizedNameKey, nameKey });
        }
        process.exit(0);
    } catch(e) { console.error(e); process.exit(1); }
}
check();
