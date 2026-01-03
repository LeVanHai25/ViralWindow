const db = require("../config/db");

// GET all accessories
exports.getAllAccessories = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = "SELECT * FROM accessories WHERE is_active = 1";
        let params = [];

        if (search) {
            query += " AND (code LIKE ? OR name LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (category && category !== 'all') {
            query += " AND category = ?";
            params.push(category);
        }

        query += " ORDER BY code ASC";

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

// GET by ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            "SELECT * FROM accessories WHERE id = ? AND is_active = 1",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phụ kiện"
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

// GET statistics
exports.getStatistics = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN stock_quantity >= min_stock_level THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN stock_quantity < min_stock_level THEN 1 ELSE 0 END) as need_restock,
                COUNT(DISTINCT category) as categories
            FROM accessories
            WHERE is_active = 1
        `);

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
        const { 
            code, name, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, description,
            supplier, supplier_code, application_types, usage_rules
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO accessories 
             (code, name, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, description,
              supplier, supplier_code, application_types, usage_rules) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                code, name, category, unit, purchase_price || 0, sale_price || 0, stock_quantity || 0, min_stock_level || 10, description || null,
                supplier || null, supplier_code || null,
                application_types ? JSON.stringify(application_types) : null,
                usage_rules ? JSON.stringify(usage_rules) : null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Thêm phụ kiện thành công",
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Mã phụ kiện đã tồn tại"
            });
        }
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm phụ kiện"
        });
    }
};

// PUT update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, description,
            supplier, supplier_code, application_types, usage_rules
        } = req.body;

        const [result] = await db.query(
            `UPDATE accessories 
             SET name = ?, category = ?, unit = ?, purchase_price = ?, sale_price = ?, 
                 stock_quantity = ?, min_stock_level = ?, description = ?,
                 supplier = ?, supplier_code = ?, application_types = ?, usage_rules = ?
             WHERE id = ?`,
            [
                name, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, description || null,
                supplier || null, supplier_code || null,
                application_types ? JSON.stringify(application_types) : null,
                usage_rules ? JSON.stringify(usage_rules) : null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phụ kiện"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật phụ kiện thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật phụ kiện"
        });
    }
};

// DELETE (soft delete)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "UPDATE accessories SET is_active = 0 WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy phụ kiện"
            });
        }

        res.json({
            success: true,
            message: "Xóa phụ kiện thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa phụ kiện"
        });
    }
};






