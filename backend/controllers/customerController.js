const db = require("../config/db");
const NotificationService = require("../services/notificationService");
const NotificationEventService = require("../services/notificationEventService");

/**
 * Helper function to generate next customer code
 */
async function generateNextCustomerCode() {
    try {
        // Get all customer codes that match the pattern KH-XXX or KHXXX
        const [rows] = await db.query(`
            SELECT customer_code 
            FROM customers 
            WHERE customer_code LIKE 'KH-%' OR customer_code LIKE 'KH%'
        `);

        let maxNumber = 0;

        // Find the maximum number from existing codes
        // Handle both formats: KH-XXX and KHXXX
        if (rows.length > 0) {
            for (const row of rows) {
                if (row.customer_code) {
                    // Match both KH-XXX and KHXXX formats
                    const match = row.customer_code.match(/KH-?(\d+)/);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (!isNaN(num) && num > maxNumber) {
                            maxNumber = num;
                        }
                    }
                }
            }
        }

        // Generate next code with format KH-XXX (3 digits)
        const nextNumber = maxNumber + 1;
        return 'KH-' + String(nextNumber).padStart(3, '0');
    } catch (err) {
        console.error('Error generating customer code:', err);
        // Fallback: return a timestamp-based code if query fails
        const timestamp = Date.now().toString().slice(-6);
        return 'KH-' + timestamp;
    }
}

// GET next customer code (for frontend to display before submit)
exports.getNextCode = async (req, res) => {
    try {
        console.log('GET /api/customers/next-code called');
        const nextCode = await generateNextCustomerCode();
        console.log('Generated customer code:', nextCode);
        res.json({
            success: true,
            data: { customer_code: nextCode }
        });
    } catch (err) {
        console.error('Error in getNextCode:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo mã khách hàng",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT 
                c.*,
                COUNT(DISTINCT q.id) as total_quotations,
                COUNT(DISTINCT p.id) as total_projects,
                SUM(CASE WHEN q.status = 'approved' THEN 1 ELSE 0 END) as approved_quotations
            FROM customers c
            LEFT JOIN quotations q ON c.id = q.customer_id
            LEFT JOIN projects p ON c.id = p.customer_id
        `;
        let params = [];

        if (search) {
            query += " WHERE (c.full_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.customer_code LIKE ?)";
            const searchTerm = `%${search}%`;
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }

        query += " GROUP BY c.id ORDER BY c.created_at DESC";

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
            "SELECT * FROM customers WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng"
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
        let { customer_code, full_name, phone, email, address, tax_code, notes, customer_status, source } = req.body;

        // Tự động tạo mã nếu chưa có
        if (!customer_code || customer_code.trim() === '') {
            customer_code = await generateNextCustomerCode();
        }

        // Check if code already exists
        const [existing] = await db.query(
            "SELECT id FROM customers WHERE customer_code = ?",
            [customer_code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã khách hàng "${customer_code}" đã tồn tại. Vui lòng nhập mã khác hoặc để trống để hệ thống tự tạo.`
            });
        }

        const [result] = await db.query(
            `INSERT INTO customers 
             (customer_code, full_name, phone, email, address, tax_code, notes, customer_status, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer_code, full_name, phone || null, email || null, address || null, tax_code || null, notes || null, customer_status || 'potential', source || null]
        );

        // Tạo thông báo (Event-based)
        await NotificationEventService.emit('customer.created', {
            customer_id: result.insertId,
            customer_name: full_name,
            customer_code: customer_code
        }, {
            createdBy: req.user?.id,
            entityType: 'customer',
            entityId: result.insertId
        });

        res.status(201).json({
            success: true,
            message: "Thêm khách hàng thành công",
            data: { id: result.insertId, customer_code }
        });
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Mã khách hàng đã tồn tại. Vui lòng nhập mã khác hoặc để trống để hệ thống tự tạo."
            });
        }
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm khách hàng"
        });
    }
};

// PUT update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, email, address, tax_code, notes, customer_status, source } = req.body;

        const [result] = await db.query(
            `UPDATE customers 
             SET full_name = ?, phone = ?, email = ?, address = ?, tax_code = ?, notes = ?, customer_status = ?, source = ? 
             WHERE id = ?`,
            [full_name, phone || null, email || null, address || null, tax_code || null, notes || null, customer_status || 'potential', source || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật khách hàng thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật khách hàng"
        });
    }
};

// DELETE
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem khách hàng có tồn tại không
        const [customerRows] = await db.query(
            "SELECT id, full_name, customer_code FROM customers WHERE id = ?",
            [id]
        );

        if (customerRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng"
            });
        }

        const customer = customerRows[0];

        // Kiểm tra xem khách hàng có đang được sử dụng trong quotations không
        const [quotationRows] = await db.query(
            "SELECT COUNT(*) as count FROM quotations WHERE customer_id = ?",
            [id]
        );
        const quotationCount = quotationRows[0]?.count || 0;

        // Kiểm tra xem khách hàng có đang được sử dụng trong projects không
        const [projectRows] = await db.query(
            "SELECT COUNT(*) as count FROM projects WHERE customer_id = ?",
            [id]
        );
        const projectCount = projectRows[0]?.count || 0;

        // Nếu khách hàng đang được sử dụng, không cho xóa
        if (quotationCount > 0 || projectCount > 0) {
            let message = `Không thể xóa khách hàng "${customer.full_name}" (${customer.customer_code}) vì đang được sử dụng trong: `;
            const reasons = [];
            if (quotationCount > 0) {
                reasons.push(`${quotationCount} báo giá`);
            }
            if (projectCount > 0) {
                reasons.push(`${projectCount} dự án`);
            }
            message += reasons.join(' và ');

            return res.status(400).json({
                success: false,
                message: message,
                data: {
                    quotation_count: quotationCount,
                    project_count: projectCount
                }
            });
        }

        // Xóa khách hàng
        const [result] = await db.query(
            "DELETE FROM customers WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khách hàng"
            });
        }

        res.json({
            success: true,
            message: "Xóa khách hàng thành công"
        });
    } catch (err) {
        console.error('Error deleting customer:', err);
        
        // Xử lý lỗi foreign key constraint
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED' || err.code === '23000') {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa khách hàng vì đang được sử dụng trong báo giá hoặc dự án. Vui lòng xóa các báo giá và dự án liên quan trước."
            });
        }

        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa khách hàng",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};






