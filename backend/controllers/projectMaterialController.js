const db = require("../config/db");

/**
 * Controller quản lý vật tư xuất cho dự án
 */

// Auto-migrate: Tạo bảng project_materials nếu chưa tồn tại
(async () => {
    try {
        // Tạo bảng với ENUM bao gồm 'phukien'
        await db.query(`
            CREATE TABLE IF NOT EXISTS project_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                material_type ENUM('accessory', 'aluminum', 'glass', 'other', 'phukien') NULL,
                material_id INT NOT NULL,
                material_name VARCHAR(255) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                unit VARCHAR(50) NOT NULL,
                unit_price DECIMAL(15,2) DEFAULT 0,
                total_cost DECIMAL(15,2) DEFAULT 0,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_project_id (project_id),
                INDEX idx_material_type (material_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Bảng project_materials đã sẵn sàng');

        // Migration: Cập nhật ENUM để bao gồm 'phukien' (cho database đã tồn tại)
        try {
            await db.query(`
                ALTER TABLE project_materials 
                MODIFY COLUMN material_type ENUM('accessory', 'aluminum', 'glass', 'other', 'phukien') NULL
            `);
            console.log('✅ Đã cập nhật ENUM material_type để bao gồm phukien');
        } catch (alterErr) {
            // Ignore error if ENUM already has the value
            if (!alterErr.message.includes('Duplicate')) {
                console.log('ℹ️ ENUM material_type:', alterErr.message);
            }
        }
    } catch (err) {
        console.error('❌ Lỗi tạo bảng project_materials:', err.message);
    }
})();

// GET /api/project-materials/:projectId - Lấy danh sách vật tư của dự án
exports.getByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // BƯỚC 1: Lấy thông tin dự án
        const [projectRows] = await db.query(
            `SELECT id, project_code, project_name FROM projects WHERE id = ?`,
            [projectId]
        );
        const project = projectRows[0] || {};

        // BƯỚC 2: Lấy tất cả vật tư đã xuất (từ project_materials) - ĐÂY LÀ "VẬT TƯ ĐÃ XUẤT"
        const [exportedRows] = await db.query(
            `SELECT 
                pm.id,
                pm.project_id,
                pm.material_code,
                -- Xử lý cả dữ liệu cũ và mới: ưu tiên cột mới, nếu null thì dùng cột cũ
                COALESCE(pm.material_name, pm.item_name) as material_name,
                COALESCE(pm.quantity, pm.quantity_used) as quantity,
                COALESCE(pm.unit, pm.item_unit) as unit,
                pm.unit_price,
                pm.total_cost,
                pm.notes,
                pm.created_at,
                pm.updated_at,
                -- Nếu không có material_type, thử suy luận từ inventory_id/accessory_id
                COALESCE(pm.material_type, 
                    CASE 
                        WHEN pm.accessory_id IS NOT NULL THEN 'accessory'
                        WHEN pm.inventory_id IS NOT NULL THEN 
                            COALESCE(
                                (SELECT item_type FROM inventory WHERE id = pm.inventory_id LIMIT 1),
                                'other'
                            )
                        ELSE 'other'
                    END
                ) as material_type,
                -- Material_id: ưu tiên material_id mới, nếu không có thì dùng inventory_id hoặc accessory_id
                COALESCE(pm.material_id, pm.inventory_id, pm.accessory_id) as material_id,
                -- Cột đánh dấu đã trừ kho hay chưa
                COALESCE(pm.stock_deducted, 0) as stock_deducted
             FROM project_materials pm
             WHERE pm.project_id = ?
             ORDER BY pm.created_at DESC`,
            [projectId]
        );

        // BƯỚC 3: Lấy số lượng cần từ BOM (bom_items) - ĐÂY LÀ DANH SÁCH VẬT TƯ CẦN
        // bom_items không có project_id, cần join qua door_designs hoặc project_items
        let bomRequiredMaterials = [];
        try {
            // Thử lấy từ bom_items qua door_designs
            const [bomRows] = await db.query(
                `SELECT 
                    bi.item_type,
                    bi.item_code,
                    bi.item_name,
                    SUM(bi.quantity) as total_required,
                    bi.unit
                 FROM bom_items bi
                 INNER JOIN door_designs dd ON dd.id = bi.design_id
                 WHERE dd.project_id = ?
                 GROUP BY bi.item_type, bi.item_code, bi.item_name, bi.unit`,
                [projectId]
            );

            bomRequiredMaterials = bomRows.map(bom => {
                const itemType = bom.item_type || 'other';
                return {
                    material_type: itemType === 'frame' || itemType === 'mullion' ? 'aluminum' :
                        itemType === 'glass' ? 'glass' :
                            itemType === 'accessory' ? 'accessory' : 'other',
                    material_name: bom.item_name || '',
                    item_code: bom.item_code || '',
                    total_required: parseFloat(bom.total_required) || 0,
                    unit: bom.unit || 'cái'
                };
            });
        } catch (bomErr) {
            console.warn('Could not get BOM requirements:', bomErr.message);
        }

        // BƯỚC 4: Tính tổng số lượng đã xuất cho mỗi vật tư (gom nhóm theo material_id + material_type + material_name)
        const exportedByMaterial = {};
        exportedRows.forEach(item => {
            const key = `${item.material_type}_${item.material_id || 'unknown'}_${item.material_name || ''}`;
            if (!exportedByMaterial[key]) {
                exportedByMaterial[key] = {
                    material_type: item.material_type,
                    material_id: item.material_id,
                    material_name: item.material_name,
                    total_exported: 0,
                    unit: item.unit
                };
            }
            exportedByMaterial[key].total_exported += parseFloat(item.quantity) || 0;
        });

        // BƯỚC 5: Xử lý "VẬT TƯ ĐÃ XUẤT" - Lấy giá và tồn kho từ kho cho mỗi vật tư đã xuất
        const exportedMaterials = await Promise.all(exportedRows.map(async (item) => {
            const materialType = item.material_type;
            let materialId = item.material_id;
            const materialCode = (item.material_code || '').trim(); // Mã vật tư để sync với kho
            const materialName = (item.material_name || '').trim(); // Loại bỏ khoảng trắng thừa
            const exportedQty = parseFloat(item.quantity) || 0; // Số lượng đã xuất (cho record này)

            // Tính tổng số lượng đã xuất cho vật tư này (có thể có nhiều record)
            const exportedKey = `${materialType}_${materialId || 'unknown'}_${materialName}`;
            const totalExportedQty = exportedByMaterial[exportedKey]?.total_exported || exportedQty;

            // Tìm số lượng cần từ BOM (nếu có) - tìm theo tên
            let totalRequiredQty = exportedQty; // Mặc định = số đã xuất
            const bomMatch = bomRequiredMaterials.find(bom =>
                bom.material_name === materialName && bom.material_type === materialType
            );
            if (bomMatch) {
                totalRequiredQty = bomMatch.total_required;
            }

            let availableStock = 0;
            let stockPrice = 0; // Luôn bắt đầu từ 0, sẽ lấy từ kho (không dùng giá đã lưu)
            let stockStatus = 'unknown'; // 'sufficient', 'partial', 'shortage', 'not_found'
            let stockNote = '';
            let foundInInventory = false; // Flag để đánh dấu đã tìm thấy trong kho

            // Tính toán số lượng còn cần và shortage (sẽ được tính sau khi có totalRequiredQty và totalExportedQty)
            let stillNeeded = 0;
            let remainingStock = 0; // Sẽ được cập nhật trong try block
            let shortage = 0; // Sẽ được tính sau khi có remainingStock

            try {
                // Nếu material_id = 0 hoặc null (từ BOM data), tìm theo tên/mã
                if (!materialId || materialId === 0) {
                    // Thử tìm theo tên trong kho
                    let foundInStock = false;

                    if (materialType === 'accessory') {
                        // Tìm trong accessories - ƯU TIÊN TÌM THEO CODE, nếu không có thì tìm theo tên
                        const searchTerm = materialCode || materialName;
                        const [accRows] = await db.query(
                            `SELECT id, stock_quantity, COALESCE(sale_price, purchase_price, 0) as price 
                             FROM accessories 
                             WHERE (code = ? OR name = ? OR code LIKE ? OR name LIKE ?) AND is_active = 1
                             ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END
                             LIMIT 1`,
                            [searchTerm, searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, searchTerm]
                        );
                        if (accRows.length > 0) {
                            materialId = accRows[0].id; // Cập nhật material_id để dùng sau này
                            availableStock = parseFloat(accRows[0].stock_quantity) || 0;
                            stockPrice = parseFloat(accRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                        }
                    } else if (materialType === 'aluminum') {
                        // Tìm trong aluminum_systems - ƯU TIÊN TÌM THEO CODE
                        const searchTerm = materialCode || materialName;
                        const [alumRows] = await db.query(
                            `SELECT id, CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock, unit_price as price 
                             FROM aluminum_systems 
                             WHERE (code = ? OR name = ? OR code LIKE ? OR name LIKE ?) AND is_active = 1
                             ORDER BY CASE WHEN code = ? THEN 0 ELSE 1 END
                             LIMIT 1`,
                            [searchTerm, searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, searchTerm]
                        );
                        if (alumRows.length > 0) {
                            materialId = alumRows[0].id; // Cập nhật material_id để dùng sau này
                            availableStock = parseFloat(alumRows[0].stock) || 0;
                            stockPrice = parseFloat(alumRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                        }
                    } else if (materialType === 'glass') {
                        // ✅ FIX: Glass từ bảng glass_items (đồng bộ với inventory.html và design-new.html)
                        // Tìm theo code hoặc K-{id} format hoặc tên
                        const searchTerm = materialCode || materialName;
                        let glassRows = [];

                        // 1. Thử tìm chính xác theo code trước
                        if (materialCode) {
                            [glassRows] = await db.query(
                                `SELECT id, COALESCE(quantity, 0) as stock, COALESCE(price, 0) as price 
                                 FROM glass_items 
                                 WHERE code = ? OR CONCAT('K-', id) = ?
                                 LIMIT 1`,
                                [materialCode, materialCode]
                            );
                        }
                        // 2. Nếu không tìm thấy theo code, thử tìm theo tên
                        if (glassRows.length === 0 && materialName) {
                            [glassRows] = await db.query(
                                `SELECT id, COALESCE(quantity, 0) as stock, COALESCE(price, 0) as price 
                                 FROM glass_items 
                                 WHERE name = ? OR name LIKE ?
                                 LIMIT 1`,
                                [materialName, `%${materialName}%`]
                            );
                        }
                        if (glassRows.length > 0) {
                            materialId = glassRows[0].id;
                            availableStock = parseFloat(glassRows[0].stock) || 0;
                            stockPrice = parseFloat(glassRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                            console.log(`✅ Tìm thấy glass trong glass_items: code=${materialCode}, name=${materialName}, id=${materialId}, stock=${availableStock}`);
                        } else {
                            console.log(`❌ Không tìm thấy glass trong glass_items: code=${materialCode}, name=${materialName}`);
                        }
                    } else if (materialType === 'other') {
                        // Other từ bảng inventory
                        let invRows = [];
                        if (materialCode) {
                            [invRows] = await db.query(
                                `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                                 FROM inventory 
                                 WHERE item_code = ?
                                 LIMIT 1`,
                                [materialCode]
                            );
                        }
                        if (invRows.length === 0 && materialName) {
                            [invRows] = await db.query(
                                `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                                 FROM inventory 
                                 WHERE item_name = ?
                                 LIMIT 1`,
                                [materialName]
                            );
                        }
                        if (invRows.length > 0) {
                            materialId = invRows[0].id;
                            let stockValue = invRows[0].stock;
                            if (typeof stockValue === 'string') {
                                stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                            }
                            availableStock = parseFloat(stockValue) || 0;
                            stockPrice = parseFloat(invRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                            console.log(`✅ Tìm thấy other trong inventory: code=${materialCode}, name=${materialName}, id=${materialId}, stock=${availableStock}`);
                        } else {
                            console.log(`❌ Không tìm thấy other trong inventory: code=${materialCode}, name=${materialName}`);
                        }
                    }

                    if (!foundInStock) {
                        stockStatus = 'not_found';
                        stockNote = 'Vui lòng nhập vật tư này';
                    }
                } else {
                    // Lấy tồn kho và giá từ bảng tương ứng bằng ID
                    if (materialType === 'accessory') {
                        const [accRows] = await db.query(
                            `SELECT stock_quantity, COALESCE(sale_price, purchase_price, 0) as price 
                             FROM accessories WHERE id = ?`,
                            [materialId]
                        );
                        if (accRows.length > 0) {
                            availableStock = parseFloat(accRows[0].stock_quantity) || 0;
                            stockPrice = parseFloat(accRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Vui lòng nhập vật tư này';
                        }
                    } else if (materialType === 'aluminum') {
                        const [alumRows] = await db.query(
                            `SELECT CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock, unit_price as price 
                             FROM aluminum_systems WHERE id = ?`,
                            [materialId]
                        );
                        if (alumRows.length > 0) {
                            availableStock = parseFloat(alumRows[0].stock) || 0;
                            stockPrice = parseFloat(alumRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Vui lòng nhập vật tư này';
                        }
                    } else if (materialType === 'glass') {
                        // ✅ FIX: Glass từ bảng glass_items (đồng bộ với inventory.html và design-new.html)
                        const [glassRows] = await db.query(
                            `SELECT COALESCE(quantity, 0) as stock, COALESCE(price, 0) as price 
                             FROM glass_items WHERE id = ?`,
                            [materialId]
                        );
                        if (glassRows.length > 0) {
                            availableStock = parseFloat(glassRows[0].stock) || 0;
                            stockPrice = parseFloat(glassRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Vui lòng nhập vật tư này';
                        }
                    } else if (materialType === 'other') {
                        // Other từ bảng inventory
                        const [invRows] = await db.query(
                            `SELECT CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                             FROM inventory WHERE id = ?`,
                            [materialId]
                        );
                        if (invRows.length > 0) {
                            let stockValue = invRows[0].stock;
                            if (typeof stockValue === 'string') {
                                stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                            }
                            availableStock = parseFloat(stockValue) || 0;
                            stockPrice = parseFloat(invRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Vui lòng nhập vật tư này';
                        }
                    }
                }

                // Tính toán số lượng còn cần và shortage sau khi đã có totalRequiredQty và totalExportedQty
                stillNeeded = Math.max(0, totalRequiredQty - totalExportedQty); // Số lượng còn cần = (tổng cần) - (đã xuất)
                remainingStock = availableStock; // Tồn kho hiện tại (đã trừ khi xuất)
                shortage = Math.max(0, stillNeeded - remainingStock); // Số lượng thiếu = (còn cần) - (tồn kho)

                // Xác định trạng thái tồn kho dựa trên số lượng CẦN và số lượng ĐÃ XUẤT
                if (stockStatus === 'unknown') {
                    if (foundInInventory) {
                        // Đã tìm thấy vật tư trong kho
                        // So sánh: (tồn kho hiện tại) với (số lượng còn cần)
                        // QUAN TRỌNG: Nếu kho = 0, LUÔN là "shortage" bất kể đã xuất bao nhiêu
                        if (remainingStock === 0) {
                            // Hết kho - LUÔN đánh dấu là shortage
                            stockStatus = 'shortage';
                            stockNote = 'Kho đã hết hãy cung cấp';
                        } else if (stillNeeded === 0 && remainingStock > 0) {
                            // Đã xuất đủ số lượng cần VÀ kho vẫn còn
                            stockStatus = 'sufficient';
                            stockNote = 'Vật tư còn đủ dùng';
                        } else if (remainingStock >= stillNeeded && remainingStock > 0) {
                            // Tồn kho đủ cho số lượng còn cần VÀ kho vẫn còn
                            stockStatus = 'sufficient';
                            stockNote = 'Vật tư còn đủ dùng';
                        } else if (remainingStock > 0) {
                            // Tồn kho có nhưng không đủ
                            stockStatus = 'partial';
                            stockNote = `Thiếu ${shortage.toFixed(2)} ${item.unit || ''} - Cần bổ sung`;
                        } else {
                            // Case an toàn - không nên đến đây
                            stockStatus = 'shortage';
                            stockNote = 'Kho đã hết hãy cung cấp';
                        }
                    } else {
                        // Không tìm thấy vật tư trong kho
                        stockStatus = 'not_found';
                        stockNote = 'Vui lòng nhập vật tư này';
                    }
                }
                // Nếu stockStatus đã là 'not_found', giữ nguyên (đã được set ở trên)

                // LUÔN cập nhật giá từ kho (lấy giá mới nhất) cho TẤT CẢ record
                // Đảm bảo cùng một vật tư luôn có cùng một giá từ kho
                // Nếu stockPrice = 0, thử lấy lại từ kho (có thể do query lỗi hoặc giá thật sự = 0)
                if (stockPrice <= 0) {
                    // Thử lấy lại giá từ kho một lần nữa để chắc chắn
                    let retryPrice = 0;
                    try {
                        if (materialType === 'accessory') {
                            if (materialId) {
                                // Thử theo ID trước
                                const [retryRows] = await db.query(
                                    'SELECT COALESCE(sale_price, purchase_price, 0) as price FROM accessories WHERE id = ?',
                                    [materialId]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                            // Nếu vẫn không có giá, thử tìm theo tên
                            if (retryPrice <= 0 && materialName) {
                                const [retryRows] = await db.query(
                                    'SELECT COALESCE(sale_price, purchase_price, 0) as price FROM accessories WHERE (name LIKE ? OR code LIKE ?) AND (sale_price > 0 OR purchase_price > 0) LIMIT 1',
                                    [`%${materialName}%`, `%${materialName}%`]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                        } else if (materialType === 'aluminum') {
                            if (materialId) {
                                // Thử theo ID trước
                                const [retryRows] = await db.query(
                                    'SELECT unit_price as price FROM aluminum_systems WHERE id = ? AND unit_price > 0',
                                    [materialId]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                            // Nếu vẫn không có giá, thử tìm theo tên
                            if (retryPrice <= 0 && materialName) {
                                const [retryRows] = await db.query(
                                    'SELECT unit_price as price FROM aluminum_systems WHERE (name LIKE ? OR code LIKE ?) AND unit_price > 0 LIMIT 1',
                                    [`%${materialName}%`, `%${materialName}%`]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                        } else if (materialType === 'glass' || materialType === 'other') {
                            if (materialId) {
                                // Thử theo ID trước
                                const [retryRows] = await db.query(
                                    'SELECT unit_price as price FROM inventory WHERE id = ? AND unit_price > 0',
                                    [materialId]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                            // Nếu vẫn không có giá, thử tìm theo tên
                            if (retryPrice <= 0 && materialName) {
                                const [retryRows] = await db.query(
                                    'SELECT unit_price as price FROM inventory WHERE (item_name LIKE ? OR item_code LIKE ?) AND unit_price > 0 LIMIT 1',
                                    [`%${materialName}%`, `%${materialName}%`]
                                );
                                if (retryRows.length > 0) {
                                    retryPrice = parseFloat(retryRows[0].price) || 0;
                                }
                            }
                        }
                    } catch (retryErr) {
                        console.warn(`Retry price fetch failed for ${materialId || materialName}:`, retryErr);
                    }

                    // Cập nhật stockPrice nếu tìm thấy giá
                    if (retryPrice > 0) {
                        stockPrice = retryPrice;
                    }
                }

                // FALLBACK UNIVERSAL: Nếu vẫn không có giá, tìm trong TẤT CẢ các bảng theo tên
                // Điều này xử lý trường hợp material_type bị sai (ví dụ: lưu là 'other' nhưng thực tế là nhôm)
                if (stockPrice <= 0 && materialName) {
                    console.log(`🔍 [UNIVERSAL FALLBACK] Searching all tables for: "${materialName}"`);
                    let fallbackPrice = 0;
                    let fallbackSource = '';

                    try {
                        // 1. Thử tìm trong accessories
                        if (fallbackPrice <= 0) {
                            const [accRows] = await db.query(
                                `SELECT COALESCE(sale_price, purchase_price, 0) as price, name 
                                 FROM accessories 
                                 WHERE (name LIKE ? OR code LIKE ?) AND (sale_price > 0 OR purchase_price > 0)
                                 LIMIT 1`,
                                [`%${materialName}%`, `%${materialName}%`]
                            );
                            if (accRows.length > 0 && parseFloat(accRows[0].price) > 0) {
                                fallbackPrice = parseFloat(accRows[0].price);
                                fallbackSource = 'accessories';
                                console.log(`   ✅ Found in accessories: ${fallbackPrice} (${accRows[0].name})`);
                            }
                        }

                        // 2. Thử tìm trong aluminum_systems
                        if (fallbackPrice <= 0) {
                            const [alumRows] = await db.query(
                                `SELECT unit_price as price, name 
                                 FROM aluminum_systems 
                                 WHERE (name LIKE ? OR code LIKE ?) AND unit_price > 0
                                 LIMIT 1`,
                                [`%${materialName}%`, `%${materialName}%`]
                            );
                            if (alumRows.length > 0 && parseFloat(alumRows[0].price) > 0) {
                                fallbackPrice = parseFloat(alumRows[0].price);
                                fallbackSource = 'aluminum_systems';
                                console.log(`   ✅ Found in aluminum_systems: ${fallbackPrice} (${alumRows[0].name})`);
                            }
                        }

                        // 3. Thử tìm trong inventory
                        if (fallbackPrice <= 0) {
                            const [invRows] = await db.query(
                                `SELECT unit_price as price, item_name 
                                 FROM inventory 
                                 WHERE (item_name LIKE ? OR item_code LIKE ?) AND unit_price > 0
                                 LIMIT 1`,
                                [`%${materialName}%`, `%${materialName}%`]
                            );
                            if (invRows.length > 0 && parseFloat(invRows[0].price) > 0) {
                                fallbackPrice = parseFloat(invRows[0].price);
                                fallbackSource = 'inventory';
                                console.log(`   ✅ Found in inventory: ${fallbackPrice} (${invRows[0].item_name})`);
                            }
                        }

                        if (fallbackPrice > 0) {
                            stockPrice = fallbackPrice;
                            console.log(`   📦 Using fallback price from ${fallbackSource}: ${stockPrice}`);
                        } else {
                            console.log(`   ❌ No price found in any table for: "${materialName}"`);
                        }
                    } catch (fallbackErr) {
                        console.warn(`   ⚠️ Fallback search failed for "${materialName}":`, fallbackErr.message);
                    }
                }

                // Áp dụng giá cuối cùng
                if (stockPrice > 0) {
                    // Có giá trong kho → luôn dùng giá từ kho (nhất quán)
                    item.unit_price = stockPrice;
                    item.total_cost = exportedQty * stockPrice; // Tính theo số lượng đã xuất (cho record này)
                } else if (item.unit_price > 0) {
                    // Không có giá trong kho nhưng có giá đã lưu → giữ nguyên giá đã lưu
                    item.total_cost = exportedQty * item.unit_price;
                } else {
                    // Không có giá cả trong kho và đã lưu → để 0
                    item.unit_price = 0;
                    item.total_cost = 0;
                }
            } catch (err) {
                console.error(`Error getting stock for material ${materialId || materialName}:`, err);
                stockStatus = 'error';
                stockNote = 'Lỗi kiểm tra kho';
                // Đảm bảo remainingStock và shortage được tính ngay cả khi có lỗi
                stillNeeded = Math.max(0, totalRequiredQty - totalExportedQty);
                remainingStock = availableStock || 0;
                shortage = Math.max(0, stillNeeded - remainingStock);

                // QUAN TRỌNG: Dù có lỗi, vẫn thử tìm giá từ kho theo tên
                if (stockPrice <= 0 && materialName) {
                    console.log(`🔧 [ERROR FALLBACK] Trying to find price despite error for: "${materialName}"`);
                    try {
                        // Tìm trong accessories
                        const [accRows] = await db.query(
                            `SELECT COALESCE(sale_price, purchase_price, 0) as price FROM accessories 
                             WHERE (name LIKE ? OR code LIKE ?) AND (sale_price > 0 OR purchase_price > 0) LIMIT 1`,
                            [`%${materialName}%`, `%${materialName}%`]
                        );
                        if (accRows.length > 0 && parseFloat(accRows[0].price) > 0) {
                            stockPrice = parseFloat(accRows[0].price);
                            item.unit_price = stockPrice;
                            item.total_cost = exportedQty * stockPrice;
                            console.log(`   ✅ Found price in accessories: ${stockPrice}`);
                        }

                        if (stockPrice <= 0) {
                            // Tìm trong aluminum_systems
                            const [alumRows] = await db.query(
                                `SELECT unit_price as price FROM aluminum_systems 
                                 WHERE (name LIKE ? OR code LIKE ?) AND unit_price > 0 LIMIT 1`,
                                [`%${materialName}%`, `%${materialName}%`]
                            );
                            if (alumRows.length > 0 && parseFloat(alumRows[0].price) > 0) {
                                stockPrice = parseFloat(alumRows[0].price);
                                item.unit_price = stockPrice;
                                item.total_cost = exportedQty * stockPrice;
                                console.log(`   ✅ Found price in aluminum_systems: ${stockPrice}`);
                            }
                        }

                        if (stockPrice <= 0) {
                            // Tìm trong inventory
                            const [invRows] = await db.query(
                                `SELECT unit_price as price FROM inventory 
                                 WHERE (item_name LIKE ? OR item_code LIKE ?) AND unit_price > 0 LIMIT 1`,
                                [`%${materialName}%`, `%${materialName}%`]
                            );
                            if (invRows.length > 0 && parseFloat(invRows[0].price) > 0) {
                                stockPrice = parseFloat(invRows[0].price);
                                item.unit_price = stockPrice;
                                item.total_cost = exportedQty * stockPrice;
                                console.log(`   ✅ Found price in inventory: ${stockPrice}`);
                            }
                        }
                    } catch (fallbackErr) {
                        console.error(`   ❌ Error fallback also failed:`, fallbackErr.message);
                    }
                }
            }

            // Xác định xem vật tư này đã xuất đủ chưa
            // CHỈ coi là "đã xuất đủ" khi stockStatus là 'sufficient' (kho đủ)
            // Các trạng thái khác (partial, shortage, not_found, error) đều là "chưa đủ"
            const isFullyExported = stockStatus === 'sufficient';

            return {
                ...item,
                project_code: project.project_code,
                project_name: project.project_name,
                material_code: materialCode, // Mã vật tư để sync với kho
                quantity: exportedQty, // Số lượng đã xuất (cho record này)
                total_required: totalRequiredQty, // Tổng số lượng cần (từ BOM)
                total_exported: totalExportedQty, // Tổng số lượng đã xuất (tất cả record)
                still_needed: Math.max(0, totalRequiredQty - totalExportedQty), // Số lượng còn cần
                available_stock: remainingStock, // Tồn kho hiện tại
                stock_status: stockStatus, // Giữ nguyên stockStatus đã tính toán
                stock_note: stockNote, // Giữ nguyên stockNote đã tính toán  
                shortage: shortage, // Số lượng thiếu
                is_fully_exported: isFullyExported // Flag để phân loại
            };
        }));

        // Phân loại: "Vật tư đã xuất" = đã xuất đủ, "Vật tư chưa đủ" = chưa xuất hoặc chưa đủ
        const fullyExportedMaterials = exportedMaterials.filter(m => m.is_fully_exported);
        const partiallyExportedMaterials = exportedMaterials.filter(m => !m.is_fully_exported);

        // BƯỚC 6: Xử lý "VẬT TƯ CHƯA ĐỦ" - Từ BOM nhưng chưa xuất hoặc chưa đủ
        // Bao gồm cả vật tư đã xuất nhưng chưa đủ (từ partiallyExportedMaterials)
        const insufficientMaterialsFromBOM = await Promise.all(bomRequiredMaterials.map(async (bom) => {
            const materialType = bom.material_type;
            const materialName = bom.material_name;
            const totalRequiredQty = bom.total_required;
            const materialCode = bom.item_code || ''; // Mã vật tư từ BOM
            const unit = bom.unit;

            // Kiểm tra xem vật tư này đã được xuất chưa (tìm theo tên)
            let totalExportedQty = 0;
            for (const key in exportedByMaterial) {
                const exported = exportedByMaterial[key];
                if (exported.material_name === materialName && exported.material_type === materialType) {
                    totalExportedQty = exported.total_exported;
                    break;
                }
            }

            const stillNeeded = Math.max(0, totalRequiredQty - totalExportedQty);

            // Nếu đã xuất đủ, không hiển thị ở "Vật tư chưa đủ"
            if (stillNeeded <= 0) {
                return null;
            }

            // Tìm material_id từ kho (nếu có)
            let materialId = null;
            let availableStock = 0;
            let stockPrice = 0;
            let stockStatus = 'not_found';
            let stockNote = 'Không có trong kho - Cần bổ sung';
            let foundInInventory = false;

            try {
                if (materialType === 'accessory') {
                    const [accRows] = await db.query(
                        `SELECT id, stock_quantity, COALESCE(sale_price, purchase_price, 0) as price 
                         FROM accessories 
                         WHERE (name LIKE ? OR code LIKE ?) AND is_active = 1
                         LIMIT 1`,
                        [`%${materialName}%`, `%${materialName}%`]
                    );
                    if (accRows.length > 0) {
                        materialId = accRows[0].id;
                        availableStock = parseFloat(accRows[0].stock_quantity) || 0;
                        stockPrice = parseFloat(accRows[0].price) || 0;
                        foundInInventory = true;
                    }
                } else if (materialType === 'aluminum') {
                    const [alumRows] = await db.query(
                        `SELECT id, CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock, unit_price as price 
                         FROM aluminum_systems 
                         WHERE (name LIKE ? OR code LIKE ?) AND is_active = 1
                         LIMIT 1`,
                        [`%${materialName}%`, `%${materialName}%`]
                    );
                    if (alumRows.length > 0) {
                        materialId = alumRows[0].id;
                        availableStock = parseFloat(alumRows[0].stock) || 0;
                        stockPrice = parseFloat(alumRows[0].price) || 0;
                        foundInInventory = true;
                    }
                } else if (materialType === 'glass' || materialType === 'other') {
                    // ƯU TIÊN TÌM THEO MÃ VT (item_code) TRƯỚC
                    let invRows = [];
                    const searchCode = bom.item_code || materialCode;
                    // 1. Thử tìm chính xác theo item_code trước
                    if (searchCode) {
                        [invRows] = await db.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                             FROM inventory 
                             WHERE item_code = ?
                             LIMIT 1`,
                            [searchCode]
                        );
                    }
                    // 2. Nếu không tìm thấy theo code, thử tìm theo tên (exact match)
                    if (invRows.length === 0 && materialName) {
                        [invRows] = await db.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                             FROM inventory 
                             WHERE item_name = ?
                             LIMIT 1`,
                            [materialName]
                        );
                    }
                    if (invRows.length > 0) {
                        materialId = invRows[0].id;
                        let stockValue = invRows[0].stock;
                        if (typeof stockValue === 'string') {
                            stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                        }
                        availableStock = parseFloat(stockValue) || 0;
                        stockPrice = parseFloat(invRows[0].price) || 0;
                        foundInInventory = true;
                        console.log(`✅ BOM: Tìm thấy glass/other trong kho: code=${searchCode}, name=${materialName}, stock=${availableStock}`);
                    } else {
                        console.log(`❌ BOM: Không tìm thấy glass/other trong kho: code=${searchCode}, name=${materialName}`);
                    }
                }

                // Xác định trạng thái
                if (foundInInventory) {
                    const shortage = Math.max(0, stillNeeded - availableStock);
                    // QUAN TRỌNG: Nếu kho = 0, LUÔN là "shortage"
                    if (availableStock === 0) {
                        stockStatus = 'shortage';
                        stockNote = 'Kho đã hết hãy cung cấp';
                    } else if (availableStock >= stillNeeded && availableStock > 0) {
                        stockStatus = 'sufficient';
                        stockNote = 'Vật tư còn đủ dùng';
                    } else if (availableStock > 0) {
                        stockStatus = 'partial';
                        stockNote = `Thiếu ${shortage.toFixed(2)} ${unit} - Cần bổ sung`;
                    } else {
                        stockStatus = 'shortage';
                        stockNote = 'Kho đã hết hãy cung cấp';
                    }
                }
            } catch (err) {
                console.error(`Error getting stock for insufficient material ${materialName}:`, err);
                stockStatus = 'error';
                stockNote = 'Lỗi kiểm tra kho';
            }

            return {
                id: null, // Chưa có trong project_materials
                project_id: projectId,
                project_code: project.project_code,
                project_name: project.project_name,
                material_code: materialCode, // Mã vật tư từ BOM
                material_name: materialName,
                material_type: materialType,
                material_id: materialId,
                quantity: 0, // Chưa xuất
                unit: unit,
                total_required: totalRequiredQty,
                total_exported: totalExportedQty,
                still_needed: stillNeeded,
                available_stock: availableStock,
                stock_status: stockStatus,
                stock_note: stockNote,
                shortage: Math.max(0, stillNeeded - availableStock),
                unit_price: stockPrice,
                total_cost: 0,
                notes: '',
                created_at: null,
                updated_at: null
            };
        }));

        // Lọc bỏ các vật tư null (đã xuất đủ)
        const filteredInsufficientFromBOM = insufficientMaterialsFromBOM.filter(m => m !== null);

        // Kết hợp: "Vật tư chưa đủ" = vật tư từ BOM chưa xuất/chưa đủ + vật tư đã xuất nhưng chưa đủ
        // Chuyển đổi partiallyExportedMaterials sang format của insufficient
        const insufficientFromPartiallyExported = partiallyExportedMaterials.map(item => ({
            id: item.id, // Có ID vì đã có trong project_materials
            project_id: item.project_id,
            project_code: item.project_code,
            project_name: item.project_name,
            material_code: item.material_code, // Mã vật tư
            material_name: item.material_name,
            material_type: item.material_type,
            material_id: item.material_id,
            quantity: item.quantity, // Số lượng đã xuất
            unit: item.unit,
            total_required: item.total_required,
            total_exported: item.total_exported,
            still_needed: item.still_needed,
            available_stock: item.available_stock,
            stock_status: item.stock_status,
            stock_note: item.stock_note,
            shortage: item.shortage,
            unit_price: item.unit_price,
            total_cost: item.total_cost,
            notes: item.notes,
            created_at: item.created_at,
            updated_at: item.updated_at
        }));

        // Gộp lại: vật tư từ BOM chưa xuất/chưa đủ + vật tư đã xuất nhưng chưa đủ
        const allInsufficientMaterials = [...filteredInsufficientFromBOM, ...insufficientFromPartiallyExported];

        // Tính tổng chi phí cho TẤT CẢ vật tư đã xuất (không chỉ fully exported)
        const totalCost = exportedMaterials.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);

        // CẬP NHẬT GIÁ VÀO DATABASE để đồng bộ với API danh sách
        // Chỉ cập nhật nếu có sự thay đổi về giá
        try {
            for (const mat of exportedMaterials) {
                if (mat.id && (mat.unit_price > 0 || mat.total_cost > 0)) {
                    await db.query(
                        `UPDATE project_materials 
                         SET unit_price = ?, total_cost = ?, updated_at = NOW() 
                         WHERE id = ?`,
                        [mat.unit_price || 0, mat.total_cost || 0, mat.id]
                    );
                }
            }
            console.log(`💾 Đã cập nhật giá cho ${exportedMaterials.length} vật tư vào database`);
        } catch (updateErr) {
            console.error('⚠️ Lỗi khi cập nhật giá vào database:', updateErr.message);
            // Không throw error, vẫn tiếp tục trả về response
        }

        // Debug log để kiểm tra
        console.log(`📊 Project ${projectId} materials summary:`);
        console.log(`   Fully exported materials: ${fullyExportedMaterials.length}`);
        console.log(`   Partially exported materials: ${partiallyExportedMaterials.length}`);
        console.log(`   Insufficient materials (from BOM): ${filteredInsufficientFromBOM.length}`);
        console.log(`   Total insufficient materials: ${allInsufficientMaterials.length}`);
        console.log(`   Total cost (all exported): ${totalCost}`);

        // Đảm bảo exported và insufficient luôn là arrays
        const response = {
            success: true,
            data: [...fullyExportedMaterials, ...allInsufficientMaterials] || [],
            exported: fullyExportedMaterials || [], // Chỉ vật tư đã xuất ĐỦ
            insufficient: allInsufficientMaterials || [], // Vật tư chưa xuất hoặc chưa đủ
            total_cost: totalCost || 0,
            count: (fullyExportedMaterials.length + allInsufficientMaterials.length) || 0,
            exported_count: fullyExportedMaterials.length || 0,
            insufficient_count: allInsufficientMaterials.length || 0
        };

        // Debug log chi tiết
        console.log(`📊 Project ${projectId} - Final Response:`);
        console.log(`   Total: ${response.count}`);
        console.log(`   Exported: ${response.exported_count} (array length: ${response.exported.length})`);
        console.log(`   Insufficient: ${response.insufficient_count} (array length: ${response.insufficient.length})`);
        if (response.exported.length > 0) {
            console.log(`   Sample exported:`, response.exported[0]);
        }
        if (response.insufficient.length > 0) {
            console.log(`   Sample insufficient:`, response.insufficient[0]);
        }

        res.json(response);
    } catch (err) {
        console.error('Error getting project materials:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách vật tư dự án"
        });
    }
};

// GET /api/project-materials/projects/bom-extraction - Lấy danh sách dự án ở giai đoạn Bóc tách - Sản xuất
exports.getProjectsForExport = async (req, res) => {
    try {
        // Chỉ lấy dự án ở giai đoạn Bóc tách (40-60%) và Sản xuất (60-80%)
        // Các giai đoạn: Báo giá (0-20%), Thiết kế (20-40%), Bóc tách (40-60%), Sản xuất (60-80%), Lắp đặt (80-90%), Bàn giao (90-100%)
        const [rows] = await db.query(
            `SELECT p.id, p.project_code, p.project_name, p.status, p.progress_percent,
                    c.full_name as customer_name,
                    (SELECT COUNT(*) FROM project_materials WHERE project_id = p.id) as material_count
             FROM projects p
             LEFT JOIN customers c ON p.customer_id = c.id
             WHERE p.status NOT IN ('completed', 'cancelled')
               AND p.progress_percent >= 40 
               AND p.progress_percent < 80
             ORDER BY p.created_at DESC`
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('Error getting projects for export:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách dự án"
        });
    }
};

// POST /api/project-materials - Thêm vật tư vào dự án (trừ tồn kho)
exports.create = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { project_id, materials } = req.body;

        if (!project_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn dự án"
            });
        }

        if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn ít nhất 1 vật tư"
            });
        }

        const insertedIds = [];
        const insufficientMaterials = [];

        for (const mat of materials) {
            let { material_type, material_id, material_code, material_name, quantity, unit, unit_price, notes } = mat;

            // DEBUG: Log tất cả dữ liệu nhận được từ frontend
            console.log(`📥 [RECEIVED MATERIAL]`, {
                material_type,
                material_id,
                material_name,
                quantity,
                unit,
                unit_price,
                notes
            });

            if (!material_id || !quantity || quantity <= 0) {
                console.log(`⚠️ [SKIP MATERIAL] Missing required fields:`, { material_type, material_id, quantity });
                continue;
            }

            // TỰ ĐỘNG PHÁT HIỆN material_type nếu không có hoặc không đúng
            // Kiểm tra xem ID có tồn tại trong bảng nào
            if (!material_type) {
                try {
                    // Kiểm tra trong inventory (glass/other)
                    const [invCheck] = await connection.query(
                        `SELECT item_type FROM inventory WHERE id = ? LIMIT 1`,
                        [material_id]
                    );
                    if (invCheck.length > 0) {
                        const itemType = invCheck[0].item_type;
                        if (itemType === 'glass') {
                            material_type = 'glass';
                        } else if (itemType) {
                            material_type = 'other';
                        }
                    } else {
                        // Kiểm tra trong accessories
                        const [accCheck] = await connection.query(
                            `SELECT id FROM accessories WHERE id = ? LIMIT 1`,
                            [material_id]
                        );
                        if (accCheck.length > 0) {
                            material_type = 'accessory';
                        } else {
                            // Kiểm tra trong aluminum_systems
                            const [alumCheck] = await connection.query(
                                `SELECT id FROM aluminum_systems WHERE id = ? LIMIT 1`,
                                [material_id]
                            );
                            if (alumCheck.length > 0) {
                                material_type = 'aluminum';
                            }
                        }
                    }

                    if (material_type) {
                        console.log(`✅ [AUTO-DETECTED TYPE] ID ${material_id} -> ${material_type}`);
                    }
                } catch (detectErr) {
                    console.warn(`Could not auto-detect material type:`, detectErr);
                }
            } else {
                // Kiểm tra xem material_type có đúng không
                try {
                    let actualType = null;
                    // Kiểm tra trong inventory (glass/other)
                    const [invCheck] = await connection.query(
                        `SELECT item_type FROM inventory WHERE id = ? LIMIT 1`,
                        [material_id]
                    );
                    if (invCheck.length > 0) {
                        const itemType = invCheck[0].item_type;
                        if (itemType === 'glass') {
                            actualType = 'glass';
                        } else if (itemType) {
                            actualType = 'other';
                        }
                    } else {
                        // Kiểm tra trong accessories
                        const [accCheck] = await connection.query(
                            `SELECT id FROM accessories WHERE id = ? LIMIT 1`,
                            [material_id]
                        );
                        if (accCheck.length > 0) {
                            actualType = 'accessory';
                        } else {
                            // Kiểm tra trong aluminum_systems
                            const [alumCheck] = await connection.query(
                                `SELECT id FROM aluminum_systems WHERE id = ? LIMIT 1`,
                                [material_id]
                            );
                            if (alumCheck.length > 0) {
                                actualType = 'aluminum';
                            }
                        }
                    }

                    if (actualType && actualType !== material_type) {
                        console.log(`⚠️ [TYPE MISMATCH] Frontend sent: ${material_type}, Actual: ${actualType}. Using actual type.`);
                        material_type = actualType;
                    }
                } catch (detectErr) {
                    console.warn(`Could not verify material type:`, detectErr);
                }
            }

            if (!material_type) {
                console.log(`❌ [SKIP MATERIAL] Cannot determine material type for ID: ${material_id}`);
                continue;
            }

            const requestedQty = parseFloat(quantity) || 0;

            // DEBUG: Log thông tin vật tư được xử lý
            console.log(`📦 [PROCESSING MATERIAL] Type: ${material_type}, ID: ${material_id}, Name: ${material_name}, Qty: ${requestedQty}, Unit: ${unit}`);

            // KIỂM TRA TỒN KHO TRƯỚC KHI THÊM
            let availableStock = 0;
            let stockTable = '';
            let stockColumn = '';

            try {
                // Lấy tồn kho từ bảng tương ứng
                if (material_type === 'accessory') {
                    stockTable = 'accessories';
                    stockColumn = 'stock_quantity';
                    const [accRows] = await connection.query(
                        `SELECT ${stockColumn} FROM ${stockTable} WHERE id = ?`,
                        [material_id]
                    );
                    if (accRows.length > 0) {
                        availableStock = parseFloat(accRows[0][stockColumn]) || 0;
                    } else {
                        insufficientMaterials.push({
                            name: material_name,
                            reason: 'not_found',
                            message: 'Không có trong kho'
                        });
                        continue;
                    }
                } else if (material_type === 'aluminum') {
                    stockTable = 'aluminum_systems';
                    stockColumn = 'CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END';
                    const [alumRows] = await connection.query(
                        `SELECT ${stockColumn} as stock FROM ${stockTable} WHERE id = ?`,
                        [material_id]
                    );
                    if (alumRows.length > 0) {
                        availableStock = parseFloat(alumRows[0].stock) || 0;
                    } else {
                        insufficientMaterials.push({
                            name: material_name,
                            reason: 'not_found',
                            message: 'Không có trong kho'
                        });
                        continue;
                    }
                } else if (material_type === 'glass' || material_type === 'other') {
                    stockTable = 'inventory';
                    stockColumn = 'quantity';
                    // Sử dụng CAST để đảm bảo quantity là số, không phải string
                    const [invRows] = await connection.query(
                        `SELECT CAST(${stockColumn} AS DECIMAL(10,2)) as stock_value, 
                                ${stockColumn} as raw_quantity,
                                item_type, unit, item_code, item_name 
                         FROM ${stockTable} WHERE id = ?`,
                        [material_id]
                    );
                    if (invRows.length > 0) {
                        // Ưu tiên dùng stock_value (đã CAST), nếu không có thì parse từ raw_quantity
                        let rawStock = invRows[0].stock_value !== null && invRows[0].stock_value !== undefined
                            ? invRows[0].stock_value
                            : invRows[0].raw_quantity;

                        // Xử lý trường hợp rawStock là string có chứa "m²" hoặc đơn vị khác
                        if (typeof rawStock === 'string') {
                            // Loại bỏ tất cả ký tự không phải số, dấu chấm, dấu phẩy
                            rawStock = rawStock.replace(/[^\d.,]/g, '').replace(',', '.');
                        }

                        availableStock = parseFloat(rawStock) || 0;

                        // DEBUG: Log thông tin tồn kho kính CHI TIẾT
                        if (material_type === 'glass') {
                            console.log(`🔍 [GLASS STOCK CHECK] Material: ${material_name}, ID: ${material_id}`);
                            console.log(`   - Raw Stock Value (from DB): ${invRows[0].raw_quantity} (type: ${typeof invRows[0].raw_quantity})`);
                            console.log(`   - CAST Stock Value: ${invRows[0].stock_value} (type: ${typeof invRows[0].stock_value})`);
                            console.log(`   - Processed Raw Stock: ${rawStock}`);
                            console.log(`   - Final Available Stock: ${availableStock}`);
                            console.log(`   - Requested Qty: ${requestedQty} (type: ${typeof requestedQty})`);
                            console.log(`   - Item Code: ${invRows[0].item_code}`);
                            console.log(`   - Item Name: ${invRows[0].item_name}`);
                            console.log(`   - Item Type: ${invRows[0].item_type}`);
                            console.log(`   - Unit: ${invRows[0].unit}`);
                            console.log(`   - Comparison: ${requestedQty} <= ${availableStock} = ${requestedQty <= availableStock}`);
                        }
                    } else {
                        console.log(`❌ [GLASS NOT FOUND] Material ID ${material_id} not found in inventory table`);
                        insufficientMaterials.push({
                            name: material_name,
                            reason: 'not_found',
                            message: 'Không có trong kho'
                        });
                        continue;
                    }
                }

                // GHI CHÚ: KHÔNG KIỂM TRA TỒN KHO Ở ĐÂY
                // Vật tư sẽ được thêm vào project_materials dù kho = 0 hoặc thiếu
                // Việc trừ kho sẽ được thực hiện khi confirmExport

                // Debug log tồn kho (chỉ info, không chặn)
                if (availableStock === 0 || availableStock < 0) {
                    console.log(`⚠️ [INFO] ${material_name}: Kho = 0, sẽ cần nhập kho trước khi xuất`);
                } else if (requestedQty > availableStock) {
                    console.log(`⚠️ [INFO] ${material_name}: Yêu cầu ${requestedQty}, kho có ${availableStock} - thiếu ${requestedQty - availableStock}`);
                }

                // DEBUG: Log khi kiểm tra thành công
                if (material_type === 'glass') {
                    console.log(`✅ [GLASS] ${material_name}: Đang thêm ${requestedQty}, kho hiện có ${availableStock}`);
                }

                // Lấy giá từ kho nếu giá = 0 hoặc không có
                let finalUnitPrice = parseFloat(unit_price) || 0;
                if (finalUnitPrice === 0) {
                    // Lấy giá từ kho theo loại vật tư
                    if (material_type === 'accessory') {
                        const [accRows] = await connection.query(
                            'SELECT COALESCE(sale_price, purchase_price, 0) as price FROM accessories WHERE id = ?',
                            [material_id]
                        );
                        if (accRows.length > 0) {
                            finalUnitPrice = parseFloat(accRows[0].price) || 0;
                        }
                    } else if (material_type === 'aluminum') {
                        const [alumRows] = await connection.query(
                            'SELECT unit_price as price FROM aluminum_systems WHERE id = ?',
                            [material_id]
                        );
                        if (alumRows.length > 0) {
                            finalUnitPrice = parseFloat(alumRows[0].price) || 0;
                        }
                    } else if (material_type === 'glass' || material_type === 'other') {
                        const [invRows] = await connection.query(
                            'SELECT unit_price as price FROM inventory WHERE id = ?',
                            [material_id]
                        );
                        if (invRows.length > 0) {
                            finalUnitPrice = parseFloat(invRows[0].price) || 0;
                        }
                    }
                }

                // THÊM VẬT TƯ VÀO PROJECT_MATERIALS (không trừ kho)
                const totalCost = requestedQty * finalUnitPrice;

                const [result] = await connection.query(
                    `INSERT INTO project_materials 
                 (project_id, material_type, material_id, material_code, material_name, quantity, unit, unit_price, total_cost, notes, stock_deducted)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [project_id, material_type, material_id, material_code || null, material_name, requestedQty, unit || 'cái', finalUnitPrice, totalCost, notes || null]
                );

                insertedIds.push(result.insertId);

                // GHI CHÚ: KHÔNG TRỪ KHO Ở ĐÂY - sẽ trừ khi confirmExport
                // await updateInventoryStock(connection, material_type, material_id, -requestedQty);
            } catch (err) {
                console.error(`Error adding material ${material_id}:`, err);
                // Không thêm vào insufficientMaterials để tránh rollback
                // Chỉ log lỗi và tiếp tục với vật tư tiếp theo
                continue;
            }
        }

        // GHI CHÚ: Logic rollback khi có vật tư thiếu kho đã bị xóa
        // Vì bây giờ cho phép thêm TẤT CẢ vật tư, kho sẽ được trừ khi confirmExport

        // 3. Cập nhật material_cost trong projects
        await updateProjectMaterialCost(connection, project_id);

        // Lưu ý: Không tự động chuyển trạng thái ở đây
        // Chỉ chuyển trạng thái khi người dùng nhấn nút "Xác nhận xuất"

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: `Đã thêm ${insertedIds.length} vật tư vào dự án. Vui lòng nhấn "Xác nhận xuất" để chuyển dự án sang giai đoạn Sản xuất.`,
            data: { inserted_ids: insertedIds }
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error adding project materials:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm vật tư: " + err.message
        });
    }
};

// PUT /api/project-materials/:id - Sửa số lượng vật tư (điều chỉnh tồn kho)
exports.update = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { quantity, notes } = req.body;

        // Lấy thông tin hiện tại
        const [currentRows] = await connection.query(
            `SELECT * FROM project_materials WHERE id = ?`,
            [id]
        );

        if (currentRows.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư"
            });
        }

        const current = currentRows[0];
        const oldQuantity = parseFloat(current.quantity) || 0;
        const newQuantity = parseFloat(quantity) || oldQuantity;
        const quantityDiff = newQuantity - oldQuantity;

        const totalCost = newQuantity * (parseFloat(current.unit_price) || 0);

        // 1. Cập nhật project_materials
        await connection.query(
            `UPDATE project_materials 
             SET quantity = ?, total_cost = ?, notes = ?, updated_at = NOW()
             WHERE id = ?`,
            [newQuantity, totalCost, notes !== undefined ? notes : current.notes, id]
        );

        // 2. KHÔNG ĐIỀU CHỈNH TỒN KHO KHI SỬA REQUEST (KiotViet rule)
        // Tồn kho chỉ thay đổi khi Phiếu xuất được Posted
        // if (quantityDiff !== 0) {
        //     await updateInventoryStock(connection, current.material_type, current.material_id, -quantityDiff);
        // }

        // 3. Cập nhật material_cost trong projects
        await updateProjectMaterialCost(connection, current.project_id);

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Cập nhật vật tư thành công"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error updating project material:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật vật tư"
        });
    }
};

// DELETE /api/project-materials/:id - Xóa vật tư (hoàn lại tồn kho)
exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Lấy thông tin vật tư
        const [rows] = await connection.query(
            `SELECT * FROM project_materials WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư"
            });
        }

        const material = rows[0];

        // 1. KHÔNG HOÀN TỒN KHO KHI HỦY REQUEST (KiotViet rule)
        // Request chưa xuất thật (stock_deducted = 0) thì không có gì để hoàn
        // Nếu đã xuất (stock_deducted = 1) thì phải tạo Phiếu trả kho, không xóa trực tiếp
        // await updateInventoryStock(connection, material.material_type, material.material_id, material.quantity);

        // 2. Xóa khỏi project_materials
        await connection.query(
            `DELETE FROM project_materials WHERE id = ?`,
            [id]
        );

        // 3. Cập nhật material_cost trong projects
        await updateProjectMaterialCost(connection, material.project_id);

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Đã hủy yêu cầu xuất vật tư"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error deleting project material:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa vật tư"
        });
    }
};

// POST /api/project-materials/confirm-export/:projectId - Xác nhận xuất vật tư và chuyển trạng thái dự án
exports.confirmExport = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { projectId } = req.params;

        // Kiểm tra xem dự án có vật tư được xuất chưa
        const hasMaterials = await hasExportedMaterials(connection, projectId);
        if (!hasMaterials) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Chưa có vật tư nào được xuất. Vui lòng thêm vật tư trước khi xác nhận xuất."
            });
        }

        // Lấy thông tin dự án
        const [projectRows] = await connection.query(
            `SELECT id, progress_percent, status FROM projects WHERE id = ?`,
            [projectId]
        );

        if (projectRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const project = projectRows[0];
        const currentProgress = parseFloat(project.progress_percent) || 0;

        // Nếu dự án đã hoàn thành, không cho phép xuất thêm
        if (currentProgress >= 100 || project.status === 'completed') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Dự án đã hoàn thành. Không thể xuất vật tư thêm."
            });
        }

        // ========== LUÔN TRỪ KHO TRƯỚC - dù dự án ở giai đoạn nào ==========
        // Lấy tất cả vật tư đã xuất nhưng chưa trừ kho
        const [materialsToDeduct] = await connection.query(
            `SELECT id, material_type, material_id, material_name, quantity, material_code
             FROM project_materials 
             WHERE project_id = ? AND (stock_deducted IS NULL OR stock_deducted = 0)`,
            [projectId]
        );

        console.log(`📦 Found ${materialsToDeduct.length} materials to deduct stock for project ${projectId}`);

        // Trừ kho cho từng vật tư - CHỈ TRỪ NẾU CÓ ĐỦ KHO
        const exportedMaterials = []; // Vật tư đã xuất thành công
        const insufficientMaterials = []; // Vật tư không đủ kho

        for (const mat of materialsToDeduct) {
            const { id, material_type, material_id, material_name, quantity, material_code } = mat;
            const qty = parseFloat(quantity) || 0;

            if (qty <= 0) continue;

            console.log(`🔍 Checking stock for: ${material_name} (type: ${material_type}, qty: ${qty})`);

            try {
                // BƯỚC 1: KIỂM TRA TỒN KHO TRƯỚC KHI TRỪ
                let availableStock = 0;
                let stockTable = '';
                let stockColumn = '';
                let foundMaterialId = null;

                if (material_type === 'accessory') {
                    // Tìm trong accessories
                    let accRows = [];
                    if (material_id && material_id !== 0) {
                        [accRows] = await connection.query(
                            `SELECT id, stock_quantity FROM accessories WHERE id = ?`, [material_id]
                        );
                    } else if (material_code) {
                        [accRows] = await connection.query(
                            `SELECT id, stock_quantity FROM accessories WHERE code = ?`, [material_code]
                        );
                    }
                    if (accRows.length === 0 && material_name) {
                        [accRows] = await connection.query(
                            `SELECT id, stock_quantity FROM accessories WHERE name = ? OR name LIKE ? LIMIT 1`,
                            [material_name, `%${material_name}%`]
                        );
                    }
                    if (accRows.length > 0) {
                        availableStock = parseFloat(accRows[0].stock_quantity) || 0;
                        foundMaterialId = accRows[0].id;
                        stockTable = 'accessories';
                        stockColumn = 'stock_quantity';
                    }
                } else if (material_type === 'aluminum') {
                    // Tìm trong aluminum_systems
                    let alumRows = [];
                    if (material_id && material_id !== 0) {
                        [alumRows] = await connection.query(
                            `SELECT id, CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock FROM aluminum_systems WHERE id = ?`, [material_id]
                        );
                    } else if (material_code) {
                        [alumRows] = await connection.query(
                            `SELECT id, CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock FROM aluminum_systems WHERE code = ?`, [material_code]
                        );
                    }
                    if (alumRows.length === 0 && material_name) {
                        [alumRows] = await connection.query(
                            `SELECT id, CASE WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity ELSE COALESCE(quantity_m, 0) END as stock FROM aluminum_systems WHERE name = ? OR name LIKE ? LIMIT 1`,
                            [material_name, `%${material_name}%`]
                        );
                    }
                    if (alumRows.length > 0) {
                        availableStock = parseFloat(alumRows[0].stock) || 0;
                        foundMaterialId = alumRows[0].id;
                        stockTable = 'aluminum_systems';
                        stockColumn = 'quantity';
                    }
                } else if (material_type === 'glass' || material_type === 'other') {
                    // Tìm trong inventory
                    let invRows = [];
                    if (material_id && material_id !== 0) {
                        [invRows] = await connection.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock FROM inventory WHERE id = ?`, [material_id]
                        );
                    } else if (material_code) {
                        [invRows] = await connection.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock FROM inventory WHERE item_code = ?`, [material_code]
                        );
                    }
                    if (invRows.length === 0 && material_name) {
                        [invRows] = await connection.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock FROM inventory WHERE item_name = ? OR item_name LIKE ? LIMIT 1`,
                            [material_name, `%${material_name}%`]
                        );
                    }
                    if (invRows.length > 0) {
                        availableStock = parseFloat(invRows[0].stock) || 0;
                        foundMaterialId = invRows[0].id;
                        stockTable = 'inventory';
                        stockColumn = 'quantity';
                    }
                }

                // BƯỚC 2: KIỂM TRA NẾU ĐỦ KHO
                if (!foundMaterialId) {
                    // Không tìm thấy vật tư trong kho
                    console.warn(`⚠️ Không tìm thấy trong kho: ${material_name}`);
                    insufficientMaterials.push({
                        name: material_name,
                        required: qty,
                        available: 0,
                        reason: 'not_found',
                        message: 'Không có trong kho'
                    });
                    continue;
                }

                if (availableStock < qty) {
                    // Không đủ kho - KHÔNG TRỪ, giữ lại để xuất sau
                    console.warn(`⚠️ Không đủ kho: ${material_name} (cần: ${qty}, có: ${availableStock})`);
                    insufficientMaterials.push({
                        name: material_name,
                        required: qty,
                        available: availableStock,
                        shortage: qty - availableStock,
                        reason: 'insufficient',
                        message: `Cần ${qty}, kho chỉ có ${availableStock}`
                    });
                    // KHÔNG đánh dấu stock_deducted = 1, để lần sau xuất được
                    continue;
                }

                // BƯỚC 3: ĐỦ KHO - TIẾN HÀNH TRỪ
                console.log(`✅ Đủ kho: ${material_name} (cần: ${qty}, có: ${availableStock}) → Đang trừ...`);

                const [updateResult] = await connection.query(
                    `UPDATE ${stockTable} SET ${stockColumn} = ${stockColumn} - ? WHERE id = ?`,
                    [qty, foundMaterialId]
                );

                if (updateResult.affectedRows > 0) {
                    // Trừ thành công - đánh dấu stock_deducted = 1
                    await connection.query(
                        `UPDATE project_materials SET stock_deducted = 1 WHERE id = ?`,
                        [id]
                    );
                    console.log(`✅ Đã trừ ${qty} từ ${material_name} (ID: ${foundMaterialId})`);
                    exportedMaterials.push({
                        name: material_name,
                        quantity: qty,
                        stockBefore: availableStock,
                        stockAfter: availableStock - qty
                    });
                } else {
                    console.error(`❌ Không thể trừ kho cho ${material_name}`);
                }
            } catch (deductError) {
                console.error(`❌ Error deducting stock for ${material_name}:`, deductError);
            }
        }
        // ========== KẾT THÚC LOGIC TRỪ KHO ==========

        // Tạo thông báo chi tiết
        let message = '';
        if (exportedMaterials.length > 0) {
            message += `✅ Đã xuất thành công ${exportedMaterials.length} vật tư.\n`;
        }
        if (insufficientMaterials.length > 0) {
            message += `⚠️ Có ${insufficientMaterials.length} vật tư chưa đủ kho (chờ nhập kho rồi xuất sau).\n`;
        }

        // Nếu dự án đã ở giai đoạn Sản xuất trở đi (>= 60%), chỉ trừ kho, không chuyển status
        if (currentProgress >= 60) {
            await connection.commit();
            connection.release();
            return res.json({
                success: true,
                message: message || `Dự án đang ở giai đoạn Sản xuất (${currentProgress}%).`,
                exported: exportedMaterials,
                insufficient: insufficientMaterials,
                summary: {
                    total: materialsToDeduct.length,
                    exported: exportedMaterials.length,
                    pending: insufficientMaterials.length
                }
            });
        }

        // Chuyển dự án sang giai đoạn Sản xuất (60%) - CHỈ KHI CÓ ÍT NHẤT 1 VẬT TƯ ĐÃ XUẤT
        if (exportedMaterials.length > 0) {
            const newProgress = 60;

            await connection.query(
                `UPDATE projects 
                 SET progress_percent = ?, 
                     status = 'in_production'
                 WHERE id = ?`,
                [newProgress, projectId]
            );

            message += `📦 Dự án đã chuyển sang giai đoạn Sản xuất (${newProgress}%).`;
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: message || 'Không có vật tư nào được xuất.',
            exported: exportedMaterials,
            insufficient: insufficientMaterials,
            summary: {
                total: materialsToDeduct.length,
                exported: exportedMaterials.length,
                pending: insufficientMaterials.length
            }
        });

    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error confirming export:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xác nhận xuất vật tư: " + err.message
        });
    }
};

// GET /api/project-materials/check-export-requirement/:projectId - Kiểm tra điều kiện xuất vật tư
exports.checkExportRequirement = async (req, res) => {
    console.log('🔍 checkExportRequirement được gọi với projectId:', req.params.projectId);
    try {
        const { projectId } = req.params;

        // Lấy thông tin dự án
        const [projectRows] = await db.query(
            `SELECT id, progress_percent, status FROM projects WHERE id = ?`,
            [projectId]
        );

        if (projectRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const project = projectRows[0];
        const currentProgress = parseFloat(project.progress_percent) || 0;

        // Kiểm tra xem đã có vật tư được xuất chưa
        const [materialRows] = await db.query(
            `SELECT COUNT(*) as count FROM project_materials WHERE project_id = ?`,
            [projectId]
        );

        const hasExportedMaterials = parseInt(materialRows[0]?.count || 0) > 0;

        // Dự án có thể xuất vật tư nếu chưa hoàn thành (< 100%)
        const canExport = currentProgress < 100 && project.status !== 'completed';

        // Cần xuất vật tư để chuyển sang sản xuất nếu progress < 60%
        const needsMaterialExport = currentProgress < 60;

        res.json({
            success: true,
            data: {
                project_id: parseInt(projectId),
                current_progress: currentProgress,
                current_status: project.status,
                has_exported_materials: hasExportedMaterials,
                needs_material_export: needsMaterialExport,
                can_export: canExport,
                can_move_to_production: hasExportedMaterials && canExport,
                message: !canExport
                    ? "Dự án đã hoàn thành, không thể xuất vật tư thêm."
                    : (!hasExportedMaterials
                        ? "Chưa có vật tư nào được xuất. Vui lòng thêm vật tư trước khi xác nhận."
                        : null)
            }
        });
    } catch (err) {
        console.error('Error checking export requirement:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi kiểm tra điều kiện xuất vật tư"
        });
    }
};

// GET /api/project-materials/inventory/:type - Lấy vật tư kho theo loại
exports.getInventoryByType = async (req, res) => {
    try {
        const { type } = req.params;
        let query = '';

        switch (type) {
            case 'accessory':
                // Phụ kiện: Chỉ lấy các category thuộc nhóm Phụ kiện
                query = `SELECT id, code, name, category, unit, 
                         COALESCE(sale_price, purchase_price, 0) as price, 
                         stock_quantity as stock, min_stock_level
                         FROM accessories 
                         WHERE is_active = 1 
                         AND category IN ('Khóa', 'Bản lề', 'Tay nắm', 'Phụ kiện lùa', 'Phụ kiện khác')
                         ORDER BY category, name`;
                break;
            case 'aluminum':
                // ✅ FIX: Use CASE WHEN to match frontend logic (quantity || quantity_m)
                // Frontend uses: system.quantity || system.quantity_m
                // This means: if quantity > 0, use quantity; else use quantity_m
                query = `SELECT id, 
                         COALESCE(code, name) as code, 
                         name, 
                         aluminum_system, 
                         'cây' as unit, 
                         unit_price as price, 
                         CASE 
                             WHEN quantity IS NOT NULL AND quantity > 0 THEN quantity
                             ELSE COALESCE(quantity_m, 0)
                         END as stock,
                         quantity as qty_cay,
                         quantity_m as qty_m,
                         length_m,
                         density
                         FROM aluminum_systems 
                         WHERE is_active = 1 
                         ORDER BY aluminum_system, name`;
                break;
            case 'glass':
                // ✅ FIX: Kính được lưu trong bảng glass_items, KHÔNG PHẢI inventory
                // Đồng bộ với inventory.html loadGlassItems() - line 10481
                query = `SELECT id, 
                         COALESCE(code, CONCAT('K-', id)) as code, 
                         name, 
                         'glass' as type, 
                         'tấm' as unit, 
                         COALESCE(price, 0) as price, 
                         COALESCE(quantity, 0) as stock,
                         structure,
                         supplier_id
                         FROM glass_items 
                         WHERE 1=1
                         ORDER BY name`;
                break;
            case 'other':
            case 'consumable':
                // Vật tư phụ: Lấy các category thuộc nhóm Vật tư phụ từ bảng accessories
                query = `SELECT id, code, name, category, unit, 
                         COALESCE(sale_price, purchase_price, 0) as price, 
                         stock_quantity as stock, min_stock_level
                         FROM accessories 
                         WHERE is_active = 1 
                         AND category IN ('Ke', 'Gioăng', 'Nhựa ốp', 'Keo', 'Khác')
                         ORDER BY category, name`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Loại vật tư không hợp lệ"
                });
        }

        console.log(`📦 Getting inventory for type: ${type}`);
        console.log(`📝 Query: ${query.substring(0, 100)}...`);

        const [rows] = await db.query(query);

        console.log(`✅ Found ${rows.length} items for type: ${type}`);
        if (rows.length > 0) {
            console.log(`📋 Sample item:`, {
                id: rows[0].id,
                code: rows[0].code,
                name: rows[0].name?.substring(0, 30),
                price: rows[0].price,
                stock: rows[0].stock
            });
        }

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('❌ Error getting inventory by type:', err);
        console.error('❌ Error details:', {
            type: req.params.type,
            message: err.message,
            sqlMessage: err.sqlMessage,
            code: err.code
        });
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách vật tư kho: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// GET /api/project-materials/exported - Lấy danh sách vật tư đã xuất (dự án đã chuyển sang sản xuất)
// ✅ FIXED: Now uses same calculation logic as detail view (BOM data + inventory prices)
exports.getExportedMaterials = async (req, res) => {
    try {
        // Lấy các dự án đã xuất vật tư (status = 'in_production' hoặc progress >= 60%)
        const [projectRows] = await db.query(
            `SELECT 
                p.id,
                p.project_code,
                p.project_name,
                p.status,
                p.progress_percent,
                c.full_name as customer_name
             FROM projects p
             LEFT JOIN customers c ON p.customer_id = c.id
             WHERE p.status = 'in_production' OR p.progress_percent >= 60
             ORDER BY p.updated_at DESC, p.created_at DESC`
        );

        // ✅ Build price maps from ALL inventory tables (same as detail view)
        // IMPORTANT: Use only VERIFIED column names that exist in each table
        const priceMap = {};
        const stockMap = {};

        // Accessories prices & stock - use sale_price first, fallback to purchase_price
        try {
            const [accessories] = await db.query(`SELECT code, name, sale_price, purchase_price, stock_quantity FROM accessories`);
            accessories.forEach(acc => {
                const price = parseFloat(acc.sale_price) || parseFloat(acc.purchase_price) || 0;
                const stock = parseFloat(acc.stock_quantity) || 0;
                if (acc.code) { priceMap[acc.code.toLowerCase()] = price; priceMap[acc.code.toUpperCase()] = price; stockMap[acc.code.toLowerCase()] = stock; }
                if (acc.name) { priceMap[acc.name.toLowerCase()] = price; stockMap[acc.name.toLowerCase()] = stock; }
            });
            console.log(`📊 Loaded ${accessories.length} accessories`);
        } catch (e) { console.error('Error loading accessories prices:', e.message); }

        // Aluminum prices & stock - has unit_price column
        try {
            const [aluminum] = await db.query(`SELECT code, name, unit_price, quantity FROM aluminum_systems`);
            aluminum.forEach(alu => {
                const price = parseFloat(alu.unit_price) || 0;
                const stock = parseFloat(alu.quantity) || 0;
                if (alu.code) { priceMap[alu.code.toLowerCase()] = price; priceMap[alu.code.toUpperCase()] = price; stockMap[alu.code.toLowerCase()] = stock; }
                if (alu.name) { priceMap[alu.name.toLowerCase()] = price; stockMap[alu.name.toLowerCase()] = stock; }
            });
            console.log(`📊 Loaded ${aluminum.length} aluminum, sample prices:`, aluminum.slice(0, 3).map(a => ({ code: a.code, price: a.unit_price })));
        } catch (e) { console.error('Error loading aluminum prices:', e.message); }

        // Glass prices & stock - use price column (NOT unit_price)
        try {
            const [glass] = await db.query(`SELECT code, name, price, quantity FROM glass_items`);
            glass.forEach(g => {
                const price = parseFloat(g.price) || 0;
                const stock = parseFloat(g.quantity) || 0;
                if (g.code) { priceMap[g.code.toLowerCase()] = price; priceMap[g.code.toUpperCase()] = price; stockMap[g.code.toLowerCase()] = stock; }
                if (g.name) { priceMap[g.name.toLowerCase()] = price; stockMap[g.name.toLowerCase()] = stock; }
            });
            console.log(`📊 Loaded ${glass.length} glass items, sample prices:`, glass.slice(0, 3).map(g => ({ code: g.code, price: g.price })));
        } catch (e) { console.error('Error loading glass prices:', e.message); }

        // General inventory prices & stock - has unit_price column
        try {
            const [inv] = await db.query(`SELECT item_code, item_name, unit_price, quantity FROM inventory`);
            inv.forEach(i => {
                const price = parseFloat(i.unit_price) || 0;
                const stock = parseFloat(i.quantity) || 0;
                if (i.item_code) { priceMap[i.item_code.toLowerCase()] = price; priceMap[i.item_code.toUpperCase()] = price; stockMap[i.item_code.toLowerCase()] = stock; }
                if (i.item_name) { priceMap[i.item_name.toLowerCase()] = price; stockMap[i.item_name.toLowerCase()] = stock; }
            });
            console.log(`📊 Loaded ${inv.length} inventory items`);
        } catch (e) { console.error('Error loading inventory prices:', e.message); }

        console.log(`📊 Total priceMap entries: ${Object.keys(priceMap).length}`);
        // Debug: Check if specific BOM codes exist in priceMap
        ['al5506', 'AL5506', 'ke-cl12006', 'KE-CL12006', 'cm-bl4d-b', 'CM-BL4D-B'].forEach(key => {
            console.log(`   priceMap['${key}'] = ${priceMap[key] || 'NOT FOUND'}`);
        });


        // ✅ For each project, get BOM data using SAME query as getBOMData
        const projectSummaries = {};
        for (const project of projectRows) {
            const projectId = project.id;

            // ✅ Use exact same query as getBOMData (line 2228-2232)
            const [bomRows] = await db.query(
                `SELECT * FROM project_materials 
                 WHERE project_id = ? 
                 AND material_type IN ('aluminum', 'glass', 'accessory', 'phukien')
                 ORDER BY material_type, created_at`,
                [projectId]
            );

            let totalCost = 0;
            let materialsCount = bomRows.length;

            // Calculate total cost using inventory prices (same logic as frontend detail view)
            bomRows.forEach(row => {
                const code = (row.material_code || '').toLowerCase();
                const name = (row.material_name || '').toLowerCase();
                const codeUpper = (row.material_code || '').toUpperCase();
                const qty = parseFloat(row.quantity) || 0;

                // Try to find price from inventory (try multiple lookups)
                const priceByCode = priceMap[code] || priceMap[codeUpper] || 0;
                const priceByName = priceMap[name] || 0;
                const priceFromDB = parseFloat(row.unit_price) || 0;
                const price = priceByCode || priceByName || priceFromDB;

                const itemCost = qty * price;
                totalCost += itemCost;
            });

            projectSummaries[projectId] = {
                total_cost: totalCost,
                materials_count: materialsCount
            };
        }

        // Merge summaries with project data
        const projectsWithCost = projectRows.map(p => ({
            ...p,
            total_cost: projectSummaries[p.id]?.total_cost || 0,
            materials_count: projectSummaries[p.id]?.materials_count || 0
        }));

        console.log('📊 getExportedMaterials (FIXED) - Projects with costs:', projectsWithCost.map(p => ({
            id: p.id,
            code: p.project_code,
            total_cost: p.total_cost,
            materials_count: p.materials_count
        })));

        res.json({
            success: true,
            data: {
                projects: projectsWithCost,
                materials: [] // Not used in list view, leave empty for performance
            },
            count: {
                projects: projectRows.length,
                materials: 0
            }
        });
    } catch (err) {
        console.error('Error getting exported materials:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách vật tư đã xuất: " + err.message
        });
    }
};

/**
 * Helper: Cập nhật tồn kho
 */
async function updateInventoryStock(connection, materialType, materialId, quantityChange) {
    let tableName = '';
    let stockColumn = 'quantity';

    switch (materialType) {
        case 'accessory':
            tableName = 'accessories';
            stockColumn = 'stock_quantity';
            break;
        case 'aluminum':
            tableName = 'aluminum_systems';
            stockColumn = 'quantity_m'; // aluminum_systems dùng quantity_m
            break;
        case 'glass':
        case 'other':
            tableName = 'inventory';
            stockColumn = 'quantity'; // bảng inventory dùng quantity
            break;
        default:
            console.warn(`Unknown material type: ${materialType}`);
            return;
    }

    await connection.query(
        `UPDATE ${tableName} 
         SET ${stockColumn} = GREATEST(0, ${stockColumn} + ?)
         WHERE id = ?`,
        [quantityChange, materialId]
    );

    console.log(`Updated ${tableName} id=${materialId} ${stockColumn} by ${quantityChange}`);
}

/**
 * Helper: Cập nhật tổng chi phí vật tư trong bảng projects
 */
async function updateProjectMaterialCost(connection, projectId) {
    const [result] = await connection.query(
        `SELECT SUM(total_cost) as total FROM project_materials WHERE project_id = ?`,
        [projectId]
    );

    const totalCost = parseFloat(result[0]?.total || 0);

    await connection.query(
        `UPDATE projects SET material_cost = ? WHERE id = ?`,
        [totalCost, projectId]
    );

    console.log(`Updated project ${projectId} material_cost to ${totalCost}`);
}

/**
 * Helper: Kiểm tra xem dự án đã có vật tư được xuất chưa
 */
async function hasExportedMaterials(connection, projectId) {
    try {
        const [result] = await connection.query(
            `SELECT COUNT(*) as count FROM project_materials WHERE project_id = ?`,
            [projectId]
        );
        return parseInt(result[0]?.count || 0) > 0;
    } catch (err) {
        console.error(`Error checking exported materials:`, err);
        return false;
    }
}

/**
 * Helper: Tự động chuyển trạng thái dự án từ Bóc tách sang Sản xuất khi xuất vật tư
 * Điều kiện: Dự án đang ở giai đoạn Bóc tách (40-60%) sẽ chuyển sang Sản xuất (60-80%)
 */
async function updateProjectStatusForMaterialExport(connection, projectId) {
    try {
        // Lấy thông tin dự án hiện tại
        const [projectRows] = await connection.query(
            `SELECT id, progress_percent, status FROM projects WHERE id = ?`,
            [projectId]
        );

        if (projectRows.length === 0) {
            console.warn(`Project ${projectId} not found`);
            return;
        }

        const project = projectRows[0];
        const currentProgress = parseFloat(project.progress_percent) || 0;

        // Kiểm tra xem dự án có đang ở giai đoạn Bóc tách (40-60%) không
        // Nếu có, chuyển sang Sản xuất (60-80%)
        if (currentProgress >= 40 && currentProgress < 60) {
            const newProgress = 60; // Chuyển sang giai đoạn Sản xuất (60-80%)

            await connection.query(
                `UPDATE projects 
                 SET progress_percent = ?, 
                     status = CASE 
                         WHEN status IN ('waiting_quotation', 'quotation_pending', 'quotation_approved', 'designing') 
                         THEN 'in_production'
                         WHEN status IS NULL OR status = '' 
                         THEN 'in_production'
                         ELSE status
                     END
                 WHERE id = ?`,
                [newProgress, projectId]
            );

            console.log(`✅ Project ${projectId} chuyển từ Bóc tách (${currentProgress}%) sang Sản xuất (${newProgress}%) sau khi xuất vật tư`);
        }
    } catch (err) {
        console.error(`Error updating project status for material export:`, err);
        // Không throw error để không làm gián đoạn quá trình thêm vật tư
    }
}

// Aliases cho tương thích với routes cũ trong projects.js
exports.getProjectMaterials = async (req, res) => {
    req.params.projectId = req.params.id;
    return exports.getByProject(req, res);
};

exports.deleteProjectMaterial = async (req, res) => {
    req.params.id = req.params.materialId;
    return exports.delete(req, res);
};

// ============================================
// LƯU/LOAD DỮ LIỆU BÓC TÁCH (Nhôm, Kính, Vật tư Phụ)
// ============================================

/**
 * POST /api/project-materials/:projectId/bom-data
 * Lưu dữ liệu Bóc tách (nhôm, kính, vật tư phụ) vào database
 */
exports.saveBOMData = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { projectId } = req.params;
        const { nhom, kinh, vattu, phukien } = req.body;

        console.log('📦 saveBOMData called for project:', projectId);
        console.log('📦 Received data counts:', {
            nhom: nhom?.length || 0,
            kinh: kinh?.length || 0,
            vattu: vattu?.length || 0,
            phukien: phukien?.length || 0
        });
        if (phukien && phukien.length > 0) {
            console.log('📦 Phukien items:', JSON.stringify(phukien, null, 2));
        }

        await connection.beginTransaction();

        // Xóa dữ liệu cũ của project này (nếu có) - bao gồm cả phukien
        await connection.query(
            `DELETE FROM project_materials 
             WHERE project_id = ? 
             AND material_type IN ('aluminum', 'glass', 'accessory', 'phukien')`,
            [projectId]
        );

        // Lưu dữ liệu Nhôm
        if (nhom && Array.isArray(nhom) && nhom.length > 0) {
            for (const item of nhom) {
                await connection.query(
                    `INSERT INTO project_materials 
                    (project_id, material_type, material_id, material_code, material_name, quantity, unit, notes)
                    VALUES (?, 'aluminum', 0, ?, ?, ?, ?, ?)`,
                    [
                        projectId,
                        item.code || item.item_code || null,
                        item.name || item.item_name || '',
                        item.quantity || 0,
                        item.unit || 'cây',
                        JSON.stringify({
                            code: item.code || item.item_code,
                            density: item.density,
                            length_m: item.length_m,
                            weight_kg: item.weight_kg,
                            user_notes: item.notes || ''
                        })
                    ]
                );
            }
        }

        // Lưu dữ liệu Kính
        if (kinh && Array.isArray(kinh) && kinh.length > 0) {
            for (const item of kinh) {
                await connection.query(
                    `INSERT INTO project_materials 
                    (project_id, material_type, material_id, material_code, material_name, quantity, unit, notes)
                    VALUES (?, 'glass', 0, ?, ?, ?, ?, ?)`,
                    [
                        projectId,
                        // ✅ FIX: Thêm item_code vào fallback để lấy đúng mã kính từ BOM (VD: K22, K-902)
                        item.code || item.item_code || item.glass_code || null,
                        // ✅ FIX: Thêm item_name vào fallback để lấy đúng tên kính
                        item.name || item.item_name || item.type || item.glass_type || '',
                        item.quantity || 1,
                        item.unit || 'tấm',
                        JSON.stringify({
                            code: item.code || item.item_code || item.glass_code,
                            width_mm: item.width_mm || item.width,
                            height_mm: item.height_mm || item.height,
                            area_m2: item.area_m2,
                            position: item.position || item.location
                        })
                    ]
                );
            }
        }


        // Lưu dữ liệu Vật tư Phụ
        if (vattu && Array.isArray(vattu) && vattu.length > 0) {
            for (const item of vattu) {
                await connection.query(
                    `INSERT INTO project_materials 
                    (project_id, material_type, material_id, material_code, material_name, quantity, unit, notes)
                    VALUES (?, 'accessory', 0, ?, ?, ?, ?, ?)`,
                    [
                        projectId,
                        item.code || item.item_code || null,
                        item.name || item.item_name || '',
                        item.quantity || 0,
                        item.unit || 'cái',
                        JSON.stringify({
                            code: item.code || item.item_code,
                            category: item.category || item.type || '',
                            user_notes: item.notes || ''
                        })
                    ]
                );
            }
        }

        // ✅ Lưu dữ liệu Phụ kiện (riêng biệt với Vật tư phụ)
        if (phukien && Array.isArray(phukien) && phukien.length > 0) {
            console.log('📦 Inserting', phukien.length, 'phukien items...');
            for (const item of phukien) {
                console.log('📦 Inserting phukien:', item.name, 'with material_type=phukien');
                const [insertResult] = await connection.query(
                    `INSERT INTO project_materials 
                    (project_id, material_type, material_id, material_code, material_name, quantity, unit, notes)
                    VALUES (?, 'phukien', 0, ?, ?, ?, ?, ?)`,
                    [
                        projectId,
                        item.code || item.item_code || null,
                        item.name || item.item_name || '',
                        item.quantity || 0,
                        item.unit || 'cái',
                        JSON.stringify({
                            code: item.code || item.item_code,
                            category: item.category || '',
                            user_notes: item.notes || ''
                        })
                    ]
                );
                console.log('📦 Insert result:', insertResult.insertId, 'affectedRows:', insertResult.affectedRows);
            }
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Đã lưu dữ liệu Bóc tách thành công',
            data: {
                nhom_count: nhom?.length || 0,
                kinh_count: kinh?.length || 0,
                vattu_count: vattu?.length || 0,
                phukien_count: phukien?.length || 0
            }
        });

    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error saving BOM data:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu dữ liệu Bóc tách: ' + err.message
        });
    }
};

/**
 * GET /api/project-materials/:projectId/bom-data
 * Load dữ liệu Bóc tách đã lưu
 */
exports.getBOMData = async (req, res) => {
    try {
        const { projectId } = req.params;

        // ✅ Bao gồm cả 'phukien' trong query
        const [rows] = await db.query(
            `SELECT * FROM project_materials 
             WHERE project_id = ? 
             AND material_type IN ('aluminum', 'glass', 'accessory', 'phukien')
             ORDER BY material_type, created_at`,
            [projectId]
        );

        console.log('📥 getBOMData for project:', projectId);
        console.log('📥 Query returned rows:', rows.length);
        if (rows.length > 0) {
            console.log('📥 Material types found:', [...new Set(rows.map(r => r.material_type))]);
            const phukienRows = rows.filter(r => r.material_type === 'phukien');
            console.log('📥 Phukien rows found:', phukienRows.length);
            if (phukienRows.length > 0) {
                console.log('📥 Sample phukien row:', phukienRows[0]);
            }
        }

        // Phân loại dữ liệu - bao gồm phukien
        const nhom = [];
        const kinh = [];
        const vattu = [];
        const phukien = [];

        rows.forEach(row => {
            let extraData = {};
            try {
                if (row.notes) {
                    extraData = JSON.parse(row.notes);
                }
            } catch (e) {
                // Ignore JSON parse errors
            }

            const baseItem = {
                id: row.id,
                name: row.material_name,
                quantity: parseFloat(row.quantity),
                unit: row.unit,
                ...extraData
            };

            if (row.material_type === 'aluminum') {
                nhom.push({
                    ...baseItem,
                    item_name: row.material_name,
                    item_code: extraData.code,
                    density: extraData.density,
                    length_m: extraData.length_m,
                    weight_kg: extraData.weight_kg,
                    notes: extraData.user_notes || ''
                });
            } else if (row.material_type === 'glass') {
                kinh.push({
                    ...baseItem,
                    glass_type: row.material_name,
                    type: row.material_name,
                    glass_code: extraData.code,
                    code: extraData.code,
                    width_mm: extraData.width_mm,
                    width: extraData.width_mm,
                    height_mm: extraData.height_mm,
                    height: extraData.height_mm,
                    area_m2: extraData.area_m2,
                    position: extraData.position,
                    location: extraData.position
                });
            } else if (row.material_type === 'accessory') {
                // Vật tư phụ
                vattu.push({
                    ...baseItem,
                    item_name: row.material_name,
                    item_code: extraData.code,
                    category: extraData.category || '',
                    notes: extraData.user_notes || ''
                });
            } else if (row.material_type === 'phukien') {
                // ✅ Phụ kiện (riêng biệt)
                phukien.push({
                    ...baseItem,
                    item_name: row.material_name,
                    item_code: extraData.code,
                    code: extraData.code,
                    category: extraData.category || '',
                    notes: extraData.user_notes || ''
                });
            }
        });

        res.json({
            success: true,
            data: {
                nhom,
                kinh,
                vattu,
                phukien
            }
        });

    } catch (err) {
        console.error('Error getting BOM data:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu Bóc tách: ' + err.message
        });
    }
};

