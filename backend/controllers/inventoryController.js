const db = require("../config/db");
const NotificationService = require("../services/notificationService");
const NotificationEventService = require("../services/notificationEventService");

// GET all inventory items
exports.getAllItems = async (req, res) => {
    try {
        const { item_type } = req.query;
        let query = `SELECT 
                        id, item_code, item_name, item_type, unit, 
                        quantity,
                        quantity as stock_quantity, 
                        min_stock_level, 
                        unit_price,
                        notes,
                        notes as description, 
                        location,
                        created_at, updated_at 
                     FROM inventory WHERE 1=1`;
        let params = [];

        if (item_type && item_type !== 'all') {
            query += " AND item_type = ?";
            params.push(item_type);
        }

        query += " ORDER BY item_name ASC";

        const [rows] = await db.query(query, params);

        // Đảm bảo quantity và unit_price là number cho tất cả items
        rows.forEach(row => {
            row.quantity = parseFloat(row.quantity) || 0;
            row.stock_quantity = parseFloat(row.quantity) || 0;
            row.unit_price = parseFloat(row.unit_price) || 0;
        });

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// GET transactions
exports.getTransactions = async (req, res) => {
    try {
        const { transaction_type } = req.query;
        let query = `
            SELECT 
                it.*,
                i.item_name,
                i.unit
            FROM inventory_transactions it
            LEFT JOIN inventory i ON it.inventory_id = i.id
            WHERE 1=1
        `;
        let params = [];

        if (transaction_type && transaction_type !== 'all') {
            query += " AND it.transaction_type = ?";
            params.push(transaction_type);
        }

        query += " ORDER BY it.transaction_date DESC";

        const [rows] = await db.query(query, params);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// GET scraps
exports.getScraps = async (req, res) => {
    try {
        const { is_used } = req.query;
        let query = "SELECT * FROM aluminum_scraps WHERE 1=1";
        let params = [];

        if (is_used !== undefined) {
            query += " AND is_used = ?";
            params.push(is_used === 'true' ? 1 : 0);
        }

        query += " ORDER BY created_at DESC";

        const [rows] = await db.query(query, params);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// GET statistics - Tổng hợp từ 4 module
exports.getStatistics = async (req, res) => {
    try {
        const aggregationService = require("../services/inventoryAggregationService");
        const stats = await aggregationService.getAggregatedStatistics();

        res.json({
            success: true,
            data: {
                total_items: stats.totalItems,
                low_stock: stats.lowStockCount,
                items_in_stock: stats.itemsInStock, // Số vật tư có stock > 0
                total_value: stats.totalValue,
                breakdown: stats.breakdown
            }
        });
    } catch (err) {
        console.error('Error getting inventory statistics:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// GET by ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT 
                id, item_code, item_name, item_type, unit, 
                quantity,
                quantity as stock_quantity, 
                min_stock_level, 
                unit_price,
                notes,
                notes as description,
                location,
                created_at, updated_at 
             FROM inventory WHERE id = ?`,
            [id]
        );

        // Đảm bảo quantity và unit_price là number
        if (rows.length > 0) {
            rows[0].quantity = parseFloat(rows[0].quantity) || 0;
            rows[0].stock_quantity = parseFloat(rows[0].quantity) || 0;
            rows[0].unit_price = parseFloat(rows[0].unit_price) || 0;
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// POST create
exports.create = async (req, res) => {
    try {
        const { item_code, item_name, item_type, unit, quantity, stock_quantity, min_stock_level, unit_price, description, notes } = req.body;

        // Hỗ trợ cả quantity và stock_quantity - đảm bảo là number
        let qty = 0;
        if (quantity !== undefined && quantity !== null) {
            qty = parseFloat(quantity) || 0;
        } else if (stock_quantity !== undefined && stock_quantity !== null) {
            qty = parseFloat(stock_quantity) || 0;
        }

        // Đảm bảo unit_price là number
        const price = parseFloat(unit_price) || 0;
        const minStock = parseInt(min_stock_level) || 10;

        // Validate required fields
        if (!item_code || !item_name || !item_type || !unit) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc (Mã, Tên, Loại, Đơn vị)"
            });
        }

        // Check if item_code already exists
        const [existing] = await db.query(
            "SELECT id FROM inventory WHERE item_code = ?",
            [item_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Mã vật tư đã tồn tại"
            });
        }

        console.log('Creating inventory item:', { item_code, item_name, quantity: qty, unit_price: price }); // Debug

        // Insert with unit_price
        const [result] = await db.query(
            `INSERT INTO inventory 
             (item_code, item_name, item_type, unit, quantity, min_stock_level, unit_price, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [item_code, item_name, item_type, unit, qty, minStock, price, notes || description || null]
        );

        // Thông báo nhập kho mới (Event-based)
        try {
            await NotificationEventService.emit('inventory.imported', {
                item_id: result.insertId,
                item_name: item_name,
                item_code: item_code,
                quantity: qty,
                unit: unit
            }, {
                createdBy: req.user?.id,
                entityType: 'inventory',
                entityId: result.insertId
            });
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: "Thêm vật tư thành công",
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating inventory item:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm vật tư: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// PUT update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, item_type, unit, quantity, stock_quantity, min_stock_level, unit_price, description, notes } = req.body;

        // Hỗ trợ cả quantity và stock_quantity - đảm bảo là number
        let qty = 0;
        if (quantity !== undefined && quantity !== null) {
            qty = parseFloat(quantity) || 0;
        } else if (stock_quantity !== undefined && stock_quantity !== null) {
            qty = parseFloat(stock_quantity) || 0;
        }

        // Đảm bảo unit_price là number
        const price = parseFloat(unit_price) || 0;
        const minStock = parseInt(min_stock_level) || 10;

        console.log('Updating inventory item:', { id, quantity: qty, unit_price: price }); // Debug

        const [result] = await db.query(
            `UPDATE inventory 
             SET item_name = ?, item_type = ?, unit = ?, quantity = ?, 
             min_stock_level = ?, unit_price = ?, notes = ? 
             WHERE id = ?`,
            [item_name, item_type, unit, qty, minStock, price, notes || description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật vật tư thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật vật tư"
        });
    }
};

// DELETE
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM inventory WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vật tư"
            });
        }

        res.json({
            success: true,
            message: "Xóa vật tư thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa vật tư"
        });
    }
};

// Mark scrap as used
exports.markScrapUsed = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "UPDATE aluminum_scraps SET is_used = 1 WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhôm thừa"
            });
        }

        res.json({
            success: true,
            message: "Đánh dấu nhôm thừa đã sử dụng thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật"
        });
    }
};

// Delete scrap
exports.deleteScrap = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM aluminum_scraps WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhôm thừa"
            });
        }

        res.json({
            success: true,
            message: "Xóa nhôm thừa thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa nhôm thừa"
        });
    }
};

// GET aggregated items from all modules (for dashboard)
exports.getAggregatedItems = async (req, res) => {
    try {
        const aggregationService = require("../services/inventoryAggregationService");
        const items = await aggregationService.getAllItems();

        res.json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (err) {
        console.error('Error getting aggregated items:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// GET low stock items from all modules
exports.getLowStockItems = async (req, res) => {
    try {
        const aggregationService = require("../services/inventoryAggregationService");
        const items = await aggregationService.getLowStockItems();

        res.json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (err) {
        console.error('Error getting low stock items:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// GET next VRPK code for accessories and other items
exports.getNextVRPKCode = async (req, res) => {
    try {
        // Tìm mã VRPK lớn nhất trong cả accessories và inventory (item_type = 'other')
        const [accessoryRows] = await db.query(
            "SELECT code FROM accessories WHERE code LIKE 'VRPK%' AND is_active = 1 ORDER BY code DESC LIMIT 1"
        );

        const [inventoryRows] = await db.query(
            "SELECT item_code as code FROM inventory WHERE item_code LIKE 'VRPK%' AND item_type IN ('accessory', 'other') ORDER BY item_code DESC LIMIT 1"
        );

        let maxCode = 0;

        // Parse mã từ accessories
        if (accessoryRows.length > 0) {
            const code = accessoryRows[0].code;
            const match = code.match(/VRPK(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxCode) maxCode = num;
            }
        }

        // Parse mã từ inventory
        if (inventoryRows.length > 0) {
            const code = inventoryRows[0].code;
            const match = code.match(/VRPK(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxCode) maxCode = num;
            }
        }

        // Tạo mã mới
        const nextNum = maxCode + 1;
        const nextCode = `VRPK${String(nextNum).padStart(3, '0')}`;

        res.json({
            success: true,
            data: { code: nextCode }
        });
    } catch (err) {
        console.error('Error getting next VRPK code:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// DELETE all inventory data
exports.deleteAllInventory = async (req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Xóa tất cả dữ liệu từ các bảng liên quan
            await connection.query("DELETE FROM inventory_transactions");
            await connection.query("DELETE FROM inventory_in_items");
            await connection.query("DELETE FROM inventory_in");
            await connection.query("DELETE FROM inventory_out_items");
            await connection.query("DELETE FROM inventory_out");
            await connection.query("DELETE FROM inventory");
            await connection.query("DELETE FROM accessories WHERE is_active = 1");
            await connection.query("DELETE FROM aluminum_scraps");

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: "Đã xóa toàn bộ dữ liệu kho thành công"
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (err) {
        console.error('Error deleting all inventory:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa dữ liệu: " + (err.message || 'Lỗi không xác định')
        });
    }
};

