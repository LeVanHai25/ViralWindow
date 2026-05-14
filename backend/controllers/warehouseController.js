const pool = require("../config/db");

// GET all warehouses for a specific inventory type
exports.getWarehouses = async (req, res) => {
    try {
        const { type } = req.query; // 'aluminum', 'accessory', etc.
        let query = "SELECT * FROM inventory_warehouses WHERE is_active = 1";
        let params = [];

        if (type) {
            query += " AND inventory_type = ?";
            params.push(type);
        }

        query += " ORDER BY id ASC";

        const [rows] = await pool.query(query, params);

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.warn('⚠️ inventory_warehouses table missing. Migration required.');
            return res.json({
                success: true,
                data: [] // Return empty list instead of 500 error
            });
        }
        console.error('Error getting warehouses:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách kho"
        });
    }
};

// UPDATE warehouse information (name)
exports.updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { warehouse_name, is_active } = req.body;

        if (!warehouse_name) {
            return res.status(400).json({
                success: false,
                message: "Tên kho không được để trống"
            });
        }

        const [result] = await pool.query(
            "UPDATE inventory_warehouses SET warehouse_name = ?, is_active = ? WHERE id = ?",
            [warehouse_name, is_active !== undefined ? is_active : 1, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kho để cập nhật"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật kho thành công"
        });
    } catch (err) {
        console.error('Error updating warehouse:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật kho"
        });
    }
};

// CREATE new warehouse
exports.createWarehouse = async (req, res) => {
    try {
        const { warehouse_name, inventory_type } = req.body;

        if (!warehouse_name || !inventory_type) {
            return res.status(400).json({
                success: false,
                message: "Tên kho và loại kho không được để trống"
            });
        }

        // Generate a simple code if not provided
        const [countResult] = await pool.query("SELECT COUNT(*) as count FROM inventory_warehouses WHERE inventory_type = ?", [inventory_type]);
        const nextIdx = countResult[0].count + 1;
        const prefix = inventory_type === 'aluminum' ? 'ALU' : 'ACC';
        const warehouse_code = `${prefix}_${String(nextIdx).padStart(2, '0')}`;

        const [result] = await pool.query(
            "INSERT INTO inventory_warehouses (warehouse_code, warehouse_name, inventory_type, is_active) VALUES (?, ?, ?, 1)",
            [warehouse_code, warehouse_name, inventory_type]
        );

        res.json({
            success: true,
            message: "Tạo kho mới thành công",
            data: { id: result.insertId, warehouse_code, warehouse_name }
        });
    } catch (err) {
        console.error('Error creating warehouse:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo kho"
        });
    }
};

// DELETE (Soft delete or deactivate) warehouse
exports.deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.params;

        // Note: In a real system, you'd check if the warehouse has items first
        const [result] = await pool.query(
            "UPDATE inventory_warehouses SET is_active = 0 WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy kho để xóa"
            });
        }

        res.json({
            success: true,
            message: "Xóa kho thành công"
        });
    } catch (err) {
        console.error('Error deleting warehouse:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi xóa kho"
        });
    }
};
