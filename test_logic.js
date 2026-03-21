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

const exportedItemsMap = {};
// simulate one row from DB with both item_code and item_name equal "8.38 mm Flim Grey", qty 4
const el = { item_code: '8.38 mm Flim Grey', item_name: '8.38 mm Flim Grey', total_exported: 4 };

const codeKey = (el.item_code || '').toLowerCase();
const nameKey = (el.item_name || '').toLowerCase();
const qty = parseFloat(el.total_exported) || 0;
if (codeKey) exportedItemsMap[codeKey] = (exportedItemsMap[codeKey] || 0) + qty;
if (nameKey) exportedItemsMap[nameKey] = (exportedItemsMap[nameKey] || 0) + qty;
const normCode = normalizeCode(el.item_code || '');
const normName = normalizeCode(el.item_name || '');
if (normCode) exportedItemsMap[normCode] = (exportedItemsMap[normCode] || 0) + qty;
if (normName) exportedItemsMap[normName] = (exportedItemsMap[normName] || 0) + qty;

console.log("Dictionary state after 1 row of qty 4:", exportedItemsMap);

let exportedQty = exportedItemsMap[normCode] || exportedItemsMap[codeKey] || exportedItemsMap[normName] || exportedItemsMap[nameKey] || 0;
console.log("Extracted exportedQty:", exportedQty);

