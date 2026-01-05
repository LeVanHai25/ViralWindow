const db = require("../config/db");

/**
 * GET all debts
 */
exports.getAllDebts = async (req, res) => {
    try {
        const { type, status, customerId, projectId } = req.query;

        let query = `
            SELECT 
                d.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                p.project_name,
                p.project_code,
                q.quotation_code
            FROM debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN projects p ON d.project_id = p.id
            LEFT JOIN quotations q ON d.quotation_id = q.id
            WHERE 1=1
        `;
        let params = [];

        if (type) {
            query += " AND d.debt_type = ?";
            params.push(type);
        }

        if (status) {
            query += " AND d.status = ?";
            params.push(status);
        }

        if (customerId) {
            query += " AND d.customer_id = ?";
            params.push(customerId);
        }

        if (projectId) {
            query += " AND d.project_id = ?";
            params.push(projectId);
        }

        query += " ORDER BY d.due_date ASC, d.created_at DESC";

        const [rows] = await db.query(query, params);

        // Update overdue status
        const today = new Date().toISOString().split('T')[0];
        rows.forEach(debt => {
            if (debt.due_date && debt.due_date < today && debt.status !== 'paid') {
                debt.status = 'overdue';
            }
        });

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('Error getting debts:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * GET debt by ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT 
                d.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.address AS customer_address,
                p.project_name,
                p.project_code,
                q.quotation_code,
                q.total_amount AS quotation_amount
            FROM debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN projects p ON d.project_id = p.id
            LEFT JOIN quotations q ON d.quotation_id = q.id
            WHERE d.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công nợ"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting debt:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * POST create debt
 */
exports.create = async (req, res) => {
    try {
        const {
            debt_type,
            customer_id,
            supplier,
            project_id,
            quotation_id,
            total_amount,
            due_date,
            notes
        } = req.body;

        // Validate required fields
        if (!debt_type || !total_amount) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc"
            });
        }

        if (debt_type === 'receivable' && !customer_id) {
            return res.status(400).json({
                success: false,
                message: "Công nợ phải thu cần có khách hàng"
            });
        }

        if (debt_type === 'payable' && !supplier) {
            return res.status(400).json({
                success: false,
                message: "Công nợ phải trả cần có nhà cung cấp"
            });
        }

        const remaining_amount = total_amount;
        const status = 'pending';

        const [result] = await db.query(`
            INSERT INTO debts
            (debt_type, customer_id, supplier, project_id, quotation_id, total_amount,
             paid_amount, remaining_amount, due_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
        `, [
            debt_type,
            customer_id || null,
            supplier || null,
            project_id || null,
            quotation_id || null,
            total_amount,
            remaining_amount,
            due_date || null,
            status,
            notes || null
        ]);

        res.status(201).json({
            success: true,
            message: "Tạo công nợ thành công",
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating debt:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo công nợ: " + err.message
        });
    }
};

/**
 * PUT update debt
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customer_id,
            supplier,
            project_id,
            quotation_id,
            total_amount,
            due_date,
            notes
        } = req.body;

        // Get current debt
        const [currentRows] = await db.query(
            "SELECT * FROM debts WHERE id = ?",
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công nợ"
            });
        }

        const currentDebt = currentRows[0];
        const paidAmount = currentDebt.paid_amount;
        const newTotalAmount = total_amount || currentDebt.total_amount;
        const newRemainingAmount = newTotalAmount - paidAmount;

        // Update status
        let newStatus = 'pending';
        if (newRemainingAmount <= 0) {
            newStatus = 'paid';
        } else if (paidAmount > 0) {
            newStatus = 'partial';
        }

        // Check overdue
        const today = new Date().toISOString().split('T')[0];
        if (due_date && due_date < today && newStatus !== 'paid') {
            newStatus = 'overdue';
        }

        const [result] = await db.query(`
            UPDATE debts
            SET customer_id = ?, supplier = ?, project_id = ?, quotation_id = ?,
                total_amount = ?, remaining_amount = ?, due_date = ?, status = ?, notes = ?
            WHERE id = ?
        `, [
            customer_id || null,
            supplier || null,
            project_id || null,
            quotation_id || null,
            newTotalAmount,
            newRemainingAmount,
            due_date || null,
            newStatus,
            notes || null,
            id
        ]);

        res.json({
            success: true,
            message: "Cập nhật công nợ thành công"
        });
    } catch (err) {
        console.error('Error updating debt:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật công nợ: " + err.message
        });
    }
};

/**
 * POST record payment
 */
exports.recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_amount, payment_date, payment_method, notes } = req.body;

        if (!payment_amount || payment_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số tiền thanh toán không hợp lệ"
            });
        }

        // Get current debt
        const [debtRows] = await db.query(
            "SELECT * FROM debts WHERE id = ?",
            [id]
        );

        if (debtRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công nợ"
            });
        }

        const debt = debtRows[0];
        const newPaidAmount = parseFloat(debt.paid_amount) + parseFloat(payment_amount);
        const newRemainingAmount = parseFloat(debt.total_amount) - newPaidAmount;

        // Update status
        let newStatus = 'pending';
        if (newRemainingAmount <= 0) {
            newStatus = 'paid';
        } else if (newPaidAmount > 0) {
            newStatus = 'partial';
        }

        // Update debt
        await db.query(`
            UPDATE debts
            SET paid_amount = ?, remaining_amount = ?, status = ?
            WHERE id = ?
        `, [newPaidAmount, newRemainingAmount, newStatus, id]);

        // Create financial transaction
        const transactionType = debt.debt_type === 'receivable' ? 'revenue' : 'expense';
        const year = new Date(payment_date || new Date()).getFullYear();
        const prefix = transactionType === 'revenue' ? 'THU' : 'CHI';
        
        // Generate unique transaction code
        let transaction_code;
        let maxAttempts = 10;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            const [maxCodeRows] = await db.query(`
                SELECT transaction_code 
                FROM financial_transactions 
                WHERE transaction_code LIKE ? AND transaction_type = ?
                ORDER BY CAST(SUBSTRING(transaction_code, 9) AS UNSIGNED) DESC
                LIMIT 1
            `, [`${prefix}-${year}-%`, transactionType]);
            
            let nextNumber = 1;
            if (maxCodeRows.length > 0 && maxCodeRows[0].transaction_code) {
                const match = maxCodeRows[0].transaction_code.match(new RegExp(`${prefix}-\\d+-(\\d+)`));
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
            
            transaction_code = `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
            
            // Kiểm tra xem code đã tồn tại chưa
            const [checkExisting] = await db.query(
                "SELECT id FROM financial_transactions WHERE transaction_code = ?",
                [transaction_code]
            );
            
            if (checkExisting.length === 0) {
                // Code chưa tồn tại, có thể sử dụng
                break;
            }
            
            // Code đã tồn tại, thử số tiếp theo
            nextNumber++;
            attempt++;
        }
        
        if (attempt >= maxAttempts) {
            // Fallback: sử dụng timestamp để đảm bảo unique
            const timestamp = Date.now().toString().slice(-6);
            transaction_code = `${prefix}-${year}-${timestamp}`;
        }

        // Tạo financial transaction với status = 'posted' vì đây là thanh toán thực tế
        await db.query(`
            INSERT INTO financial_transactions
            (transaction_code, transaction_date, transaction_type, category, amount, description,
             project_id, customer_id, payment_method, reference_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted')
        `, [
            transaction_code,
            payment_date || new Date().toISOString().split('T')[0],
            transactionType,
            debt.debt_type === 'receivable' ? 'Thu công nợ' : 'Trả công nợ',
            payment_amount,
            notes || `Thanh toán công nợ #${id}`,
            debt.project_id,
            debt.customer_id,
            payment_method || null,
            `DEBT-${id}`
        ]);

        res.json({
            success: true,
            message: "Ghi nhận thanh toán thành công"
        });
    } catch (err) {
        console.error('Error recording payment:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi ghi nhận thanh toán: " + err.message
        });
    }
};

/**
 * DELETE debt
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM debts WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công nợ"
            });
        }

        res.json({
            success: true,
            message: "Xóa công nợ thành công"
        });
    } catch (err) {
        console.error('Error deleting debt:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa công nợ: " + err.message
        });
    }
};

/**
 * GET statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        // Receivable statistics
        // Chỉ tính các debts chưa thanh toán xong (status != 'paid')
        // "Tổng phải thu" = Tổng số tiền ban đầu từ các debts chưa thanh toán xong
        const [receivableRows] = await db.query(`
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(total_amount), 0) as total_amount,
                COALESCE(SUM(paid_amount), 0) as paid_amount,
                COALESCE(SUM(remaining_amount), 0) as remaining_amount
            FROM debts
            WHERE debt_type = 'receivable' AND status != 'paid'
        `);

        // Payable statistics
        // Chỉ tính các debts chưa thanh toán xong (status != 'paid')
        const [payableRows] = await db.query(`
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(total_amount), 0) as total_amount,
                COALESCE(SUM(paid_amount), 0) as paid_amount,
                COALESCE(SUM(remaining_amount), 0) as remaining_amount
            FROM debts
            WHERE debt_type = 'payable' AND status != 'paid'
        `);

        // Overdue debts
        const today = new Date().toISOString().split('T')[0];
        const [overdueRows] = await db.query(`
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(remaining_amount), 0) as total_amount
            FROM debts
            WHERE due_date < ? AND status != 'paid'
        `, [today]);

        res.json({
            success: true,
            data: {
                receivable: receivableRows[0],
                payable: payableRows[0],
                overdue: overdueRows[0]
            }
        });
    } catch (err) {
        console.error('Error getting debt statistics:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};




























