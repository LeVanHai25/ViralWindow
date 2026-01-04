const db = require("../config/db");

/**
 * Controller quản lý vật tư xuất cho dự án
 */

// Auto-migrate: Tạo bảng project_materials nếu chưa tồn tại
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS project_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                material_type ENUM('accessory', 'aluminum', 'glass', 'other') NOT NULL,
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
                COALESCE(pm.material_id, pm.inventory_id, pm.accessory_id) as material_id
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
                        // Tìm trong accessories theo tên
                        const [accRows] = await db.query(
                            `SELECT id, stock_quantity, COALESCE(sale_price, purchase_price, 0) as price 
                             FROM accessories 
                             WHERE name LIKE ? OR code LIKE ? 
                             LIMIT 1`,
                            [`%${materialName}%`, `%${materialName}%`]
                        );
                        if (accRows.length > 0) {
                            materialId = accRows[0].id; // Cập nhật material_id để dùng sau này
                            availableStock = parseFloat(accRows[0].stock_quantity) || 0;
                            stockPrice = parseFloat(accRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                        }
                    } else if (materialType === 'aluminum') {
                        // Tìm trong aluminum_systems theo tên
                        const [alumRows] = await db.query(
                            `SELECT id, COALESCE(quantity, quantity_m, 0) as stock, unit_price as price 
                             FROM aluminum_systems 
                             WHERE name LIKE ? OR code LIKE ? 
                             LIMIT 1`,
                            [`%${materialName}%`, `%${materialName}%`]
                        );
                        if (alumRows.length > 0) {
                            materialId = alumRows[0].id; // Cập nhật material_id để dùng sau này
                            availableStock = parseFloat(alumRows[0].stock) || 0;
                            stockPrice = parseFloat(alumRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                        }
                    } else if (materialType === 'glass' || materialType === 'other') {
                        // Tìm trong inventory theo tên
                        const [invRows] = await db.query(
                            `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                             FROM inventory 
                             WHERE item_name LIKE ? OR item_code LIKE ? 
                             LIMIT 1`,
                            [`%${materialName}%`, `%${materialName}%`]
                        );
                        if (invRows.length > 0) {
                            materialId = invRows[0].id; // Cập nhật material_id để dùng sau này
                            let stockValue = invRows[0].stock;
                            if (typeof stockValue === 'string') {
                                stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                            }
                            availableStock = parseFloat(stockValue) || 0;
                            stockPrice = parseFloat(invRows[0].price) || 0;
                            foundInStock = true;
                            foundInInventory = true;
                        }
                    }

                    if (!foundInStock) {
                        stockStatus = 'not_found';
                        stockNote = 'Không có trong kho - Cần bổ sung';
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
                            stockNote = 'Không có trong kho - Cần bổ sung';
                        }
                    } else if (materialType === 'aluminum') {
                        const [alumRows] = await db.query(
                            `SELECT COALESCE(quantity, quantity_m, 0) as stock, unit_price as price 
                             FROM aluminum_systems WHERE id = ?`,
                            [materialId]
                        );
                        if (alumRows.length > 0) {
                            availableStock = parseFloat(alumRows[0].stock) || 0;
                            stockPrice = parseFloat(alumRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Không có trong kho - Cần bổ sung';
                        }
                    } else if (materialType === 'glass' || materialType === 'other') {
                        const [invRows] = await db.query(
                            `SELECT CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                             FROM inventory WHERE id = ?`,
                            [materialId]
                        );
                        if (invRows.length > 0) {
                            // Xử lý trường hợp stock có thể là string
                            let stockValue = invRows[0].stock;
                            if (typeof stockValue === 'string') {
                                stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                            }
                            availableStock = parseFloat(stockValue) || 0;
                            stockPrice = parseFloat(invRows[0].price) || 0;
                            foundInInventory = true;
                        } else {
                            stockStatus = 'not_found';
                            stockNote = 'Không có trong kho - Cần bổ sung';
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
                        if (stillNeeded === 0) {
                            // Đã xuất đủ số lượng cần
                            stockStatus = 'sufficient';
                            stockNote = 'Đã xuất đủ';
                        } else if (remainingStock >= stillNeeded) {
                            // Tồn kho đủ cho số lượng còn cần
                            stockStatus = 'sufficient';
                            stockNote = 'Đủ kho';
                        } else if (remainingStock > 0) {
                            // Tồn kho có nhưng không đủ
                            stockStatus = 'partial';
                            stockNote = `Thiếu ${shortage.toFixed(2)} ${item.unit || ''} - Cần bổ sung`;
                        } else {
                            // Hết kho
                            stockStatus = 'shortage';
                            stockNote = 'Hết kho - Cần bổ sung';
                        }
                    } else {
                        // Không tìm thấy vật tư trong kho
                        stockStatus = 'not_found';
                        stockNote = 'Không có trong kho - Cần bổ sung';
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
            const isFullyExported = totalExportedQty >= totalRequiredQty;

            return {
                ...item,
                project_code: project.project_code,
                project_name: project.project_name,
                quantity: exportedQty, // Số lượng đã xuất (cho record này)
                total_required: totalRequiredQty, // Tổng số lượng cần (từ BOM)
                total_exported: totalExportedQty, // Tổng số lượng đã xuất (tất cả record)
                still_needed: Math.max(0, totalRequiredQty - totalExportedQty), // Số lượng còn cần
                available_stock: remainingStock, // Tồn kho hiện tại
                stock_status: isFullyExported ? 'sufficient' : stockStatus, // Chỉ sufficient nếu đã xuất đủ
                stock_note: stockNote || (isFullyExported ? 'Đã xuất đủ' : 'Đã xuất nhưng chưa đủ'),
                shortage: isFullyExported ? 0 : shortage, // Có shortage nếu chưa xuất đủ
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
                         WHERE name LIKE ? OR code LIKE ? 
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
                        `SELECT id, COALESCE(quantity, quantity_m, 0) as stock, unit_price as price 
                         FROM aluminum_systems 
                         WHERE name LIKE ? OR code LIKE ? 
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
                    const [invRows] = await db.query(
                        `SELECT id, CAST(quantity AS DECIMAL(10,2)) as stock, unit_price as price 
                         FROM inventory 
                         WHERE item_name LIKE ? OR item_code LIKE ? 
                         LIMIT 1`,
                        [`%${materialName}%`, `%${materialName}%`]
                    );
                    if (invRows.length > 0) {
                        materialId = invRows[0].id;
                        let stockValue = invRows[0].stock;
                        if (typeof stockValue === 'string') {
                            stockValue = stockValue.replace(/[^\d.,]/g, '').replace(',', '.');
                        }
                        availableStock = parseFloat(stockValue) || 0;
                        stockPrice = parseFloat(invRows[0].price) || 0;
                        foundInInventory = true;
                    }
                }

                // Xác định trạng thái
                if (foundInInventory) {
                    const shortage = Math.max(0, stillNeeded - availableStock);
                    if (availableStock >= stillNeeded) {
                        stockStatus = 'sufficient';
                        stockNote = 'Đủ kho';
                    } else if (availableStock > 0) {
                        stockStatus = 'partial';
                        stockNote = `Thiếu ${shortage.toFixed(2)} ${unit} - Cần bổ sung`;
                    } else {
                        stockStatus = 'shortage';
                        stockNote = 'Hết kho - Cần bổ sung';
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
            let { material_type, material_id, material_name, quantity, unit, unit_price, notes } = mat;

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
                    stockColumn = 'COALESCE(quantity, quantity_m, 0)';
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

                // KIỂM TRA: Nếu tồn kho = 0, KHÔNG CHO PHÉP THÊM
                // Lưu ý: Với kính, availableStock đã là số tấm (không phải m²)
                if (availableStock === 0 || availableStock < 0) {
                    console.log(`❌ [STOCK CHECK FAILED] ${material_name}: availableStock = ${availableStock}, requestedQty = ${requestedQty}`);
                    insufficientMaterials.push({
                        name: material_name,
                        required: requestedQty,
                        available: 0,
                        reason: 'no_stock',
                        message: 'Không có để xuất (tồn kho = 0)'
                    });
                    continue; // Bỏ qua vật tư không có trong kho
                }

                // KIỂM TRA: Nếu số lượng yêu cầu > tồn kho, KHÔNG CHO PHÉP THÊM
                // Lưu ý: Với kính, cả requestedQty và availableStock đều là số tấm
                if (requestedQty > availableStock) {
                    console.log(`⚠️ [STOCK CHECK FAILED] ${material_name}: requestedQty (${requestedQty}) > availableStock (${availableStock})`);
                    insufficientMaterials.push({
                        name: material_name,
                        required: requestedQty,
                        available: availableStock,
                        shortage: requestedQty - availableStock,
                        reason: 'insufficient',
                        message: `Không đủ (cần ${requestedQty}, kho có ${availableStock})`
                    });
                    continue; // Bỏ qua vật tư không đủ
                }

                // DEBUG: Log khi kiểm tra thành công
                if (material_type === 'glass') {
                    console.log(`✅ [GLASS STOCK CHECK PASSED] ${material_name}: requestedQty (${requestedQty}) <= availableStock (${availableStock})`);
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

                // CHỈ THÊM NẾU: requestedQty > 0 && requestedQty <= availableStock && availableStock > 0
                const totalCost = requestedQty * finalUnitPrice;

                // 1. Thêm vào project_materials
                const [result] = await connection.query(
                    `INSERT INTO project_materials 
                 (project_id, material_type, material_id, material_name, quantity, unit, unit_price, total_cost, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [project_id, material_type, material_id, material_name, requestedQty, unit || 'cái', finalUnitPrice, totalCost, notes || null]
                );

                insertedIds.push(result.insertId);

                // 2. Trừ tồn kho theo loại vật tư (chỉ khi đã kiểm tra đủ)
                await updateInventoryStock(connection, material_type, material_id, -requestedQty);
            } catch (err) {
                console.error(`Error checking stock for material ${material_id}:`, err);
                insufficientMaterials.push({
                    name: material_name,
                    reason: 'error',
                    message: 'Lỗi kiểm tra kho: ' + err.message
                });
                continue;
            }
        }

        // Nếu có vật tư không đủ, trả về lỗi với danh sách chi tiết
        if (insufficientMaterials.length > 0) {
            await connection.rollback();
            connection.release();

            const noStockItems = insufficientMaterials.filter(m => m.reason === 'no_stock' || m.reason === 'not_found');
            const insufficientItems = insufficientMaterials.filter(m => m.reason === 'insufficient');

            let errorMessage = '❌ KHÔNG THỂ THÊM VẬT TƯ!\n\n';
            if (noStockItems.length > 0) {
                errorMessage += `Có ${noStockItems.length} vật tư KHÔNG CÓ trong kho:\n`;
                noStockItems.forEach(item => {
                    errorMessage += `• ${item.name}: ${item.message}\n`;
                });
                errorMessage += '\n';
            }
            if (insufficientItems.length > 0) {
                errorMessage += `Có ${insufficientItems.length} vật tư KHÔNG ĐỦ số lượng:\n`;
                insufficientItems.forEach(item => {
                    errorMessage += `• ${item.name}: ${item.message}\n`;
                });
            }

            return res.status(400).json({
                success: false,
                message: errorMessage,
                insufficient_materials: insufficientMaterials
            });
        }

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

        // 2. Điều chỉnh tồn kho (nếu số lượng thay đổi)
        if (quantityDiff !== 0) {
            await updateInventoryStock(connection, current.material_type, current.material_id, -quantityDiff);
        }

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

        // 1. Hoàn lại tồn kho
        await updateInventoryStock(connection, material.material_type, material.material_id, material.quantity);

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
            message: "Đã xóa vật tư và hoàn lại tồn kho"
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

        // Nếu dự án đã ở giai đoạn Sản xuất trở đi (>= 60%), không cần chuyển nữa
        if (currentProgress >= 60) {
            await connection.commit();
            connection.release();
            return res.json({
                success: true,
                message: `Dự án đã ở giai đoạn Sản xuất (${currentProgress}%). Vật tư đã được xuất thành công.`
            });
        }

        // Chuyển dự án sang giai đoạn Sản xuất (60%)
        const newProgress = 60;

        await connection.query(
            `UPDATE projects 
             SET progress_percent = ?, 
                 status = 'in_production'
             WHERE id = ?`,
            [newProgress, projectId]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: `Xác nhận xuất vật tư thành công! Dự án đã chuyển từ ${currentProgress}% sang Sản xuất (${newProgress}%).`
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
                query = `SELECT id, code, name, aluminum_system, 'm' as unit, unit_price as price, 
                         COALESCE(quantity, quantity_m, 0) as stock, length_m
                         FROM aluminum_systems 
                         WHERE is_active = 1 
                         ORDER BY aluminum_system, name`;
                break;
            case 'glass':
                // Kính nằm trong bảng inventory với item_type = 'glass'
                query = `SELECT id, item_code as code, item_name as name, item_type as type, unit, unit_price as price, quantity as stock, min_stock_level
                         FROM inventory WHERE item_type = 'glass' ORDER BY item_name`;
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

        // Lấy tất cả vật tư của các dự án đã xuất
        const projectIds = projectRows.map(p => p.id);
        let materials = [];

        if (projectIds.length > 0) {
            const placeholders = projectIds.map(() => '?').join(',');
            const [materialRows] = await db.query(
                `SELECT 
                    pm.id,
                    pm.project_id,
                    COALESCE(pm.material_name, pm.item_name) as material_name,
                    COALESCE(pm.quantity, pm.quantity_used) as quantity,
                    COALESCE(pm.unit, pm.item_unit) as unit,
                    pm.unit_price,
                    pm.total_cost,
                    pm.notes,
                    pm.created_at,
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
                    ) as material_type
                 FROM project_materials pm
                 WHERE pm.project_id IN (${placeholders})
                 ORDER BY pm.project_id, pm.created_at DESC`,
                projectIds
            );
            materials = materialRows;
        }

        // Tính tổng cost cho mỗi dự án từ materials
        const projectCosts = {};
        const projectMaterialCounts = {};
        materials.forEach(m => {
            if (!projectCosts[m.project_id]) {
                projectCosts[m.project_id] = 0;
                projectMaterialCounts[m.project_id] = 0;
            }
            projectCosts[m.project_id] += parseFloat(m.total_cost || 0);
            projectMaterialCounts[m.project_id]++;
        });

        // Gắn total_cost và materials_count vào mỗi project
        const projectsWithCost = projectRows.map(p => ({
            ...p,
            total_cost: projectCosts[p.id] || 0,
            materials_count: projectMaterialCounts[p.id] || 0
        }));

        console.log('📊 getExportedMaterials - Projects with costs:', projectsWithCost.map(p => ({
            id: p.id,
            name: p.project_name,
            total_cost: p.total_cost,
            materials_count: p.materials_count
        })));

        res.json({
            success: true,
            data: {
                projects: projectsWithCost,
                materials: materials
            },
            count: {
                projects: projectRows.length,
                materials: materials.length
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
        const { nhom, kinh, vattu } = req.body;

        await connection.beginTransaction();

        // Xóa dữ liệu cũ của project này (nếu có)
        await connection.query(
            `DELETE FROM project_materials 
             WHERE project_id = ? 
             AND material_type IN ('aluminum', 'glass', 'accessory')`,
            [projectId]
        );

        // Lưu dữ liệu Nhôm
        if (nhom && Array.isArray(nhom) && nhom.length > 0) {
            for (const item of nhom) {
                await connection.query(
                    `INSERT INTO project_materials 
                    (project_id, material_type, material_id, material_name, quantity, unit, notes)
                    VALUES (?, 'aluminum', 0, ?, ?, ?, ?)`,
                    [
                        projectId,
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
                    (project_id, material_type, material_id, material_name, quantity, unit, notes)
                    VALUES (?, 'glass', 0, ?, ?, ?, ?)`,
                    [
                        projectId,
                        item.type || item.glass_type || '',
                        item.quantity || 1,
                        item.unit || 'tấm',
                        JSON.stringify({
                            code: item.code || item.glass_code,
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
                    (project_id, material_type, material_id, material_name, quantity, unit, notes)
                    VALUES (?, 'accessory', 0, ?, ?, ?, ?)`,
                    [
                        projectId,
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

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: 'Đã lưu dữ liệu Bóc tách thành công',
            data: {
                nhom_count: nhom?.length || 0,
                kinh_count: kinh?.length || 0,
                vattu_count: vattu?.length || 0
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

        const [rows] = await db.query(
            `SELECT * FROM project_materials 
             WHERE project_id = ? 
             AND material_type IN ('aluminum', 'glass', 'accessory')
             ORDER BY material_type, created_at`,
            [projectId]
        );

        // Phân loại dữ liệu
        const nhom = [];
        const kinh = [];
        const vattu = [];

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
                vattu.push({
                    ...baseItem,
                    item_name: row.material_name,
                    item_code: extraData.code,
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
                vattu
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

