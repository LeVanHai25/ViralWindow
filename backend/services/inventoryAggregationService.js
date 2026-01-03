const db = require("../config/db");

/**
 * Service tổng hợp số liệu tồn kho từ 4 module:
 * - Phụ kiện (accessories)
 * - Hệ nhôm (aluminum_systems)
 * - Kính (glass - nếu có)
 * - Khác (inventory với item_type = 'other')
 */

/**
 * Tính tổng hợp 3 chỉ số từ 4 module
 * @returns {Object} { totalItems, lowStockCount, totalValue }
 */
exports.getAggregatedStatistics = async () => {
    try {
        // 1. PHỤ KIỆN (accessories)
        const [accessoriesStats] = await db.query(`
            SELECT 
                COUNT(*) as total_count,
                SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
                COALESCE(SUM(
                    CASE 
                        WHEN stock_quantity > 0 AND (sale_price > 0 OR purchase_price > 0)
                        THEN stock_quantity * COALESCE(sale_price, purchase_price, 0)
                        ELSE 0
                    END
                ), 0) as total_value
            FROM accessories
            WHERE is_active = 1
        `);

        // 2. HỆ NHÔM (aluminum_systems)
        // Tính tồn kho nhôm: giá trị = quantity (số cây/thanh) * unit_price (giá mỗi cây/thanh)
        let aluminumStats;
        try {
            [aluminumStats] = await db.query(`
                SELECT 
                    COUNT(*) as total_count,
                    0 as low_stock_count, -- Sẽ tính sau dựa trên min_stock_level nếu có
                    COALESCE(SUM(
                        CASE 
                            WHEN quantity IS NOT NULL AND quantity > 0 AND unit_price IS NOT NULL AND unit_price > 0
                            THEN quantity * unit_price
                            ELSE 0
                        END
                    ), 0) as total_value
                FROM aluminum_systems
                WHERE is_active = 1
            `);
        } catch (err) {
            // Nếu có lỗi, log và trả về 0
            console.warn('Error calculating aluminum stats:', err.message);
            aluminumStats = [{ total_count: 0, low_stock_count: 0, total_value: 0 }];
        }

        // Tính cảnh báo cho nhôm (nếu có min_stock_level hoặc quantity_m < threshold)
        // Tạm thời giả sử cảnh báo khi quantity_m < 10m hoặc không có quantity_m
        let aluminumLowStock;
        try {
            [aluminumLowStock] = await db.query(`
                SELECT COUNT(*) as count
                FROM aluminum_systems
                WHERE is_active = 1
                AND (quantity_m IS NULL OR quantity_m < 10 OR quantity_m = 0)
            `);
        } catch (err) {
            // Nếu cột quantity_m chưa tồn tại, bỏ qua
            console.warn('Column quantity_m may not exist yet:', err.message);
            aluminumLowStock = [{ count: 0 }];
        }

        // 3. KÍNH (glass)
        // Giả sử có bảng glass hoặc lưu trong inventory với item_type = 'glass'
        // Nếu chưa có bảng riêng, sẽ tính từ inventory
        let glassStats;
        try {
            [glassStats] = await db.query(`
                SELECT 
                    COUNT(*) as total_count,
                    SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
                    COALESCE(SUM(
                        CASE 
                            WHEN quantity > 0 AND unit_price > 0
                            THEN quantity * unit_price
                            ELSE 0
                        END
                    ), 0) as total_value
                FROM inventory
                WHERE item_type = 'glass'
            `);
        } catch (err) {
            // Nếu không có bảng hoặc cột, trả về 0
            glassStats = [{ total_count: 0, low_stock_count: 0, total_value: 0 }];
        }

        // 4. KHÁC (inventory với item_type = 'other' hoặc không phải glass)
        let otherStats;
        try {
            [otherStats] = await db.query(`
                SELECT 
                    COUNT(*) as total_count,
                    SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
                    COALESCE(SUM(
                        CASE 
                            WHEN quantity > 0 AND unit_price > 0
                            THEN quantity * unit_price
                            ELSE 0
                        END
                    ), 0) as total_value
                FROM inventory
                WHERE item_type NOT IN ('glass', 'aluminum') 
                AND (item_type = 'other' OR item_type IS NULL OR item_type = '')
            `);
        } catch (err) {
            console.error('Error querying other stats:', err);
            otherStats = [{ total_count: 0, low_stock_count: 0, total_value: 0 }];
        }

        // Tổng hợp kết quả
        const accessories = accessoriesStats[0] || { total_count: 0, low_stock_count: 0, total_value: 0 };
        const aluminum = aluminumStats[0] || { total_count: 0, low_stock_count: 0, total_value: 0 };
        const glass = glassStats[0] || { total_count: 0, low_stock_count: 0, total_value: 0 };
        const other = otherStats[0] || { total_count: 0, low_stock_count: 0, total_value: 0 };
        const aluminumLow = aluminumLowStock[0] || { count: 0 };

        console.log('Aggregation results:', {
            accessories: accessories,
            aluminum: aluminum,
            glass: glass,
            other: other,
            aluminumLow: aluminumLow
        });

        // Tính tổng
        const totalItems = 
            parseInt(accessories.total_count || 0) +
            parseInt(aluminum.total_count || 0) +
            parseInt(glass.total_count || 0) +
            parseInt(other.total_count || 0);

        const lowStockCount = 
            parseInt(accessories.low_stock_count || 0) +
            parseInt(aluminumLow.count || 0) +
            parseInt(glass.low_stock_count || 0) +
            parseInt(other.low_stock_count || 0);

        const totalValue = 
            parseFloat(accessories.total_value || 0) +
            parseFloat(aluminum.total_value || 0) +
            parseFloat(glass.total_value || 0) +
            parseFloat(other.total_value || 0);

        console.log('Final stats:', { totalItems, lowStockCount, totalValue });

        return {
            totalItems,
            lowStockCount,
            totalValue,
            breakdown: {
                accessories: {
                    count: parseInt(accessories.total_count || 0),
                    lowStock: parseInt(accessories.low_stock_count || 0),
                    value: parseFloat(accessories.total_value || 0)
                },
                aluminum: {
                    count: parseInt(aluminum.total_count || 0),
                    lowStock: parseInt(aluminumLow.count || 0),
                    value: parseFloat(aluminum.total_value || 0)
                },
                glass: {
                    count: parseInt(glass.total_count || 0),
                    lowStock: parseInt(glass.low_stock_count || 0),
                    value: parseFloat(glass.total_value || 0)
                },
                other: {
                    count: parseInt(other.total_count || 0),
                    lowStock: parseInt(other.low_stock_count || 0),
                    value: parseFloat(other.total_value || 0)
                }
            }
        };
    } catch (err) {
        console.error('Error in getAggregatedStatistics:', err);
        throw err;
    }
};

/**
 * Lấy danh sách vật tư vi phạm cảnh báo từ tất cả module
 * @returns {Array} Danh sách vật tư cần cảnh báo
 */
exports.getLowStockItems = async () => {
    try {
        const lowStockItems = [];

        // 1. Phụ kiện vi phạm
        const [accessories] = await db.query(`
            SELECT 
                id,
                code as item_code,
                name as item_name,
                'accessory' as module_type,
                'Phụ kiện' as module_name,
                category as item_type,
                stock_quantity as quantity,
                min_stock_level,
                unit,
                COALESCE(sale_price, purchase_price, 0) as unit_price,
                (stock_quantity * COALESCE(sale_price, purchase_price, 0)) as total_value
            FROM accessories
            WHERE is_active = 1 
            AND stock_quantity <= min_stock_level
            ORDER BY stock_quantity ASC
        `);

        accessories.forEach(item => {
            lowStockItems.push({
                ...item,
                module_type: 'accessory',
                module_name: 'Phụ kiện'
            });
        });

        // 2. Hệ nhôm vi phạm (quantity_m < 10m hoặc NULL)
        let aluminum = [];
        try {
            const [aluminumRows] = await db.query(`
                SELECT 
                    id,
                    code as item_code,
                    name as item_name,
                    'aluminum' as module_type,
                    'Hệ nhôm' as module_name,
                    'Hệ nhôm' as item_type,
                    COALESCE(quantity_m, 0) as quantity,
                    10 as min_stock_level,
                    'm' as unit,
                    COALESCE(unit_price, 0) as unit_price,
                    (COALESCE(quantity_m, 0) * COALESCE(unit_price, 0)) as total_value
                FROM aluminum_systems
                WHERE is_active = 1
                AND (quantity_m IS NULL OR quantity_m < 10 OR quantity_m = 0)
                ORDER BY COALESCE(quantity_m, 0) ASC
            `);
            aluminum = aluminumRows || [];
        } catch (err) {
            // Nếu cột quantity_m chưa tồn tại, dùng length_m
            console.warn('Column quantity_m may not exist, using length_m:', err.message);
            try {
                const [aluminumRows] = await db.query(`
                    SELECT 
                        id,
                        code as item_code,
                        name as item_name,
                        'aluminum' as module_type,
                        'Hệ nhôm' as module_name,
                        'Hệ nhôm' as item_type,
                        COALESCE(length_m, 0) as quantity,
                        10 as min_stock_level,
                        'm' as unit,
                        COALESCE(unit_price, 0) as unit_price,
                        (COALESCE(length_m, 0) * COALESCE(unit_price, 0)) as total_value
                    FROM aluminum_systems
                    WHERE is_active = 1
                    AND (length_m IS NULL OR length_m < 10 OR length_m = 0)
                    ORDER BY COALESCE(length_m, 0) ASC
                `);
                aluminum = aluminumRows || [];
            } catch (err2) {
                aluminum = [];
            }
        }

        aluminum.forEach(item => {
            lowStockItems.push({
                ...item,
                module_type: 'aluminum',
                module_name: 'Hệ nhôm'
            });
        });

        // 3. Kính vi phạm
        let glass = [];
        try {
            const [glassRows] = await db.query(`
                SELECT 
                    id,
                    item_code,
                    item_name,
                    'glass' as module_type,
                    'Kính' as module_name,
                    item_type,
                    quantity,
                    min_stock_level,
                    unit,
                    COALESCE(unit_price, 0) as unit_price,
                    (quantity * COALESCE(unit_price, 0)) as total_value
                FROM inventory
                WHERE item_type = 'glass'
                AND quantity <= min_stock_level
                ORDER BY quantity ASC
            `);
            glass = glassRows || [];
        } catch (err) {
            // Bảng không tồn tại hoặc lỗi, bỏ qua
            glass = [];
        }

        glass.forEach(item => {
            lowStockItems.push({
                ...item,
                module_type: 'glass',
                module_name: 'Kính'
            });
        });

        // 4. Khác vi phạm
        const [other] = await db.query(`
            SELECT 
                id,
                item_code,
                item_name,
                'other' as module_type,
                'Khác' as module_name,
                item_type,
                quantity,
                min_stock_level,
                unit,
                COALESCE(unit_price, 0) as unit_price,
                (quantity * COALESCE(unit_price, 0)) as total_value
            FROM inventory
            WHERE item_type NOT IN ('glass', 'aluminum')
            AND (item_type = 'other' OR item_type IS NULL)
            AND quantity <= min_stock_level
            ORDER BY quantity ASC
        `);

        other.forEach(item => {
            lowStockItems.push({
                ...item,
                module_type: 'other',
                module_name: 'Khác'
            });
        });

        return lowStockItems;
    } catch (err) {
        console.error('Error in getLowStockItems:', err);
        throw err;
    }
};

/**
 * Lấy danh sách tất cả vật tư từ 4 module (để hiển thị trong dashboard)
 * @returns {Array} Danh sách tất cả vật tư
 */
exports.getAllItems = async () => {
    try {
        const allItems = [];

        // 1. Phụ kiện
        const [accessories] = await db.query(`
            SELECT 
                id,
                code as item_code,
                name as item_name,
                'accessory' as module_type,
                'Phụ kiện' as module_name,
                category as item_type,
                stock_quantity as quantity,
                min_stock_level,
                unit,
                COALESCE(sale_price, purchase_price, 0) as unit_price,
                (stock_quantity * COALESCE(sale_price, purchase_price, 0)) as total_value,
                CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END as is_low_stock
            FROM accessories
            WHERE is_active = 1
            ORDER BY code ASC
        `);

        accessories.forEach(item => {
            allItems.push({
                ...item,
                module_type: 'accessory',
                module_name: 'Phụ kiện'
            });
        });

        // 2. Hệ nhôm
        let aluminum = [];
        try {
            const [aluminumRows] = await db.query(`
                SELECT 
                    id,
                    code as item_code,
                    name as item_name,
                    'aluminum' as module_type,
                    'Hệ nhôm' as module_name,
                    'Hệ nhôm' as item_type,
                    COALESCE(quantity_m, 0) as quantity,
                    10 as min_stock_level,
                    'm' as unit,
                    COALESCE(unit_price, 0) as unit_price,
                    (COALESCE(quantity_m, 0) * COALESCE(unit_price, 0)) as total_value,
                    CASE WHEN COALESCE(quantity_m, 0) < 10 THEN 1 ELSE 0 END as is_low_stock
                FROM aluminum_systems
                WHERE is_active = 1
                ORDER BY code ASC
            `);
            aluminum = aluminumRows || [];
        } catch (err) {
            // Nếu cột quantity_m chưa tồn tại, dùng length_m
            console.warn('Column quantity_m may not exist, using length_m:', err.message);
            try {
                const [aluminumRows] = await db.query(`
                    SELECT 
                        id,
                        code as item_code,
                        name as item_name,
                        'aluminum' as module_type,
                        'Hệ nhôm' as module_name,
                        'Hệ nhôm' as item_type,
                        COALESCE(length_m, 0) as quantity,
                        10 as min_stock_level,
                        'm' as unit,
                        COALESCE(unit_price, 0) as unit_price,
                        (COALESCE(length_m, 0) * COALESCE(unit_price, 0)) as total_value,
                        CASE WHEN COALESCE(length_m, 0) < 10 THEN 1 ELSE 0 END as is_low_stock
                    FROM aluminum_systems
                    WHERE is_active = 1
                    ORDER BY code ASC
                `);
                aluminum = aluminumRows || [];
            } catch (err2) {
                aluminum = [];
            }
        }

        aluminum.forEach(item => {
            allItems.push({
                ...item,
                module_type: 'aluminum',
                module_name: 'Hệ nhôm'
            });
        });

        // 3. Kính
        let glass = [];
        try {
            const [glassRows] = await db.query(`
                SELECT 
                    id,
                    item_code,
                    item_name,
                    'glass' as module_type,
                    'Kính' as module_name,
                    item_type,
                    quantity,
                    min_stock_level,
                    unit,
                    COALESCE(unit_price, 0) as unit_price,
                    (quantity * COALESCE(unit_price, 0)) as total_value,
                    CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END as is_low_stock
                FROM inventory
                WHERE item_type = 'glass'
                ORDER BY item_code ASC
            `);
            glass = glassRows || [];
        } catch (err) {
            // Bảng không tồn tại hoặc lỗi, bỏ qua
            glass = [];
        }

        glass.forEach(item => {
            allItems.push({
                ...item,
                module_type: 'glass',
                module_name: 'Kính'
            });
        });

        // 4. Khác
        const [other] = await db.query(`
            SELECT 
                id,
                item_code,
                item_name,
                'other' as module_type,
                'Khác' as module_name,
                item_type,
                quantity,
                min_stock_level,
                unit,
                COALESCE(unit_price, 0) as unit_price,
                (quantity * COALESCE(unit_price, 0)) as total_value,
                CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END as is_low_stock
            FROM inventory
            WHERE item_type NOT IN ('glass', 'aluminum')
            AND (item_type = 'other' OR item_type IS NULL)
            ORDER BY item_code ASC
        `);

        other.forEach(item => {
            allItems.push({
                ...item,
                module_type: 'other',
                module_name: 'Khác'
            });
        });

        return allItems;
    } catch (err) {
        console.error('Error in getAllItems:', err);
        throw err;
    }
};

