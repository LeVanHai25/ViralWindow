const db = require("../config/db");

/**
 * GET all financial transactions
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { type, startDate, endDate, projectId, customerId, expense_type, status, supplier } = req.query;

        let query = `
            SELECT 
                ft.*,
                p.project_name,
                p.project_code,
                c.full_name AS customer_name
            FROM financial_transactions ft
            LEFT JOIN projects p ON ft.project_id = p.id
            LEFT JOIN customers c ON ft.customer_id = c.id
            WHERE 1=1
        `;
        let params = [];

        if (type) {
            query += " AND ft.transaction_type = ?";
            params.push(type);
        }

        if (startDate) {
            query += " AND ft.transaction_date >= ?";
            params.push(startDate);
        }

        if (endDate) {
            query += " AND ft.transaction_date <= ?";
            params.push(endDate);
        }

        if (projectId) {
            query += " AND ft.project_id = ?";
            params.push(projectId);
        }

        if (customerId) {
            query += " AND ft.customer_id = ?";
            params.push(customerId);
        }

        if (expense_type && expense_type !== 'all') {
            query += " AND ft.expense_type = ?";
            params.push(expense_type);
        }

        // Add status filter
        if (status) {
            query += " AND ft.status = ?";
            params.push(status);
        }

        // Add supplier filter (for payments)
        if (supplier) {
            query += " AND ft.supplier LIKE ?";
            params.push(`%${supplier}%`);
        }

        query += " ORDER BY ft.transaction_date DESC, ft.created_at DESC";

        const [rows] = await db.query(query, params);

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('Error getting transactions:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * GET transaction by ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT 
                ft.*,
                p.project_name,
                p.project_code,
                c.full_name AS customer_name,
                c.phone AS customer_phone
            FROM financial_transactions ft
            LEFT JOIN projects p ON ft.project_id = p.id
            LEFT JOIN customers c ON ft.customer_id = c.id
            WHERE ft.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('Error getting transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * POST create transaction
 */
exports.create = async (req, res) => {
    try {
        const {
            transaction_date,
            transaction_type,
            category,
            expense_type,
            supplier,
            amount,
            description,
            project_id,
            customer_id,
            production_order_id,
            payment_method,
            reference_number
        } = req.body;

        // Validate required fields
        if (!transaction_date || !transaction_type || !amount) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc"
            });
        }

        // Generate transaction code
        const year = new Date(transaction_date).getFullYear();
        const [countRows] = await db.query(
            "SELECT COUNT(*) as count FROM financial_transactions WHERE YEAR(transaction_date) = ?",
            [year]
        );
        const count = countRows[0].count + 1;
        const prefix = transaction_type === 'revenue' ? 'THU' : 'CHI';
        const transaction_code = `${prefix}-${year}-${String(count).padStart(4, '0')}`;

        const [result] = await db.query(`
            INSERT INTO financial_transactions
            (transaction_code, transaction_date, transaction_type, category, expense_type, supplier, 
             amount, description, project_id, customer_id, production_order_id, payment_method, reference_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            transaction_code,
            transaction_date,
            transaction_type,
            category || null,
            expense_type || null,
            supplier || null,
            amount,
            description || null,
            project_id || null,
            customer_id || null,
            production_order_id || null,
            payment_method || null,
            reference_number || null
        ]);

        res.status(201).json({
            success: true,
            message: "Tạo giao dịch thành công",
            data: { id: result.insertId, transaction_code }
        });
    } catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo giao dịch: " + err.message
        });
    }
};

/**
 * PUT update transaction
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            transaction_date,
            transaction_type,
            category,
            expense_type,
            supplier,
            amount,
            description,
            project_id,
            customer_id,
            production_order_id,
            payment_method,
            reference_number
        } = req.body;

        const [result] = await db.query(`
            UPDATE financial_transactions
            SET transaction_date = ?, transaction_type = ?, category = ?, expense_type = ?, supplier = ?,
                amount = ?, description = ?, project_id = ?, customer_id = ?, production_order_id = ?,
                payment_method = ?, reference_number = ?
            WHERE id = ?
        `, [
            transaction_date,
            transaction_type,
            category || null,
            expense_type || null,
            supplier || null,
            amount,
            description || null,
            project_id || null,
            customer_id || null,
            production_order_id || null,
            payment_method || null,
            reference_number || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json({
            success: true,
            message: "Cập nhật giao dịch thành công"
        });
    } catch (err) {
        console.error('Error updating transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật giao dịch: " + err.message
        });
    }
};

/**
 * DELETE transaction
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM financial_transactions WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        res.json({
            success: true,
            message: "Xóa giao dịch thành công"
        });
    } catch (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa giao dịch: " + err.message
        });
    }
};

/**
 * GET statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = "WHERE 1=1";
        let params = [];

        if (startDate && endDate) {
            dateFilter += " AND transaction_date >= ? AND transaction_date <= ?";
            params = [startDate, endDate];
        }

        // Total revenue
        const [revenueRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'revenue'
        `, params);

        // Total expense
        const [expenseRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense'
        `, params);

        // Revenue by category
        const [revenueByCategory] = await db.query(`
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'revenue'
            GROUP BY category
            ORDER BY total DESC
        `, params);

        // Expense by category
        const [expenseByCategory] = await db.query(`
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense'
            GROUP BY category
            ORDER BY total DESC
        `, params);

        // Expense by expense_type
        const [expenseByType] = await db.query(`
            SELECT expense_type, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense' AND expense_type IS NOT NULL
            GROUP BY expense_type
            ORDER BY total DESC
        `, params);

        const totalRevenue = parseFloat(revenueRows[0].total) || 0;
        const totalExpense = parseFloat(expenseRows[0].total) || 0;
        const profit = totalRevenue - totalExpense;

        res.json({
            success: true,
            data: {
                total_revenue: totalRevenue,
                total_expense: totalExpense,
                profit: profit,
                revenue_by_category: revenueByCategory,
                expense_by_category: expenseByCategory,
                expense_by_type: expenseByType
            }
        });
    } catch (err) {
        console.error('Error getting statistics:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * POST sync financial data from projects
 * Đồng bộ dữ liệu tài chính từ:
 * - Tiền cọc từ báo giá đã duyệt (revenue)
 * - Chi phí vật tư từ project_materials (expense)
 */
exports.syncFromProjects = async (req, res) => {
    try {
        let revenueCount = 0;
        let expenseCount = 0;
        const today = new Date().toISOString().split('T')[0];
        const year = new Date().getFullYear();

        // 1. Sync revenue from approved quotations (advance_amount)
        const [approvedQuotations] = await db.query(`
            SELECT q.*, c.full_name AS customer_name, p.project_name
            FROM quotations q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN projects p ON q.project_id = p.id
            WHERE q.status = 'approved' AND q.advance_amount > 0
        `);

        for (const q of approvedQuotations) {
            const refNumber = `QUO-ADV-${q.id}`;

            // Check if already synced
            const [existing] = await db.query(
                "SELECT id FROM financial_transactions WHERE reference_number = ?",
                [refNumber]
            );

            if (existing.length === 0) {
                // Calculate transaction code
                const [countRows] = await db.query(
                    "SELECT COUNT(*) as count FROM financial_transactions WHERE YEAR(transaction_date) = ? AND transaction_type = 'revenue'",
                    [year]
                );
                const count = countRows[0].count + revenueCount + 1;
                const transCode = `THU-${year}-${String(count).padStart(4, '0')}`;

                await db.query(`
                    INSERT INTO financial_transactions
                    (transaction_code, transaction_date, transaction_type, category, amount, 
                     description, project_id, customer_id, reference_number)
                    VALUES (?, ?, 'revenue', 'Tiền cọc báo giá', ?, ?, ?, ?, ?)
                `, [
                    transCode,
                    q.quotation_date || today,
                    q.advance_amount,
                    `Thu tiền cọc từ báo giá ${q.quotation_code} - ${q.customer_name || 'Khách hàng'}`,
                    q.project_id,
                    q.customer_id,
                    refNumber
                ]);
                revenueCount++;
            }
        }

        // 2. Sync expenses from project_materials (materials used)
        const [projectMaterials] = await db.query(`
            SELECT pm.*, p.project_name, p.project_code
            FROM project_materials pm
            LEFT JOIN projects p ON pm.project_id = p.id
            WHERE pm.total_cost > 0
        `);

        for (const pm of projectMaterials) {
            const refNumber = `PMAT-${pm.id}`;

            // Check if already synced
            const [existing] = await db.query(
                "SELECT id FROM financial_transactions WHERE reference_number = ?",
                [refNumber]
            );

            if (existing.length === 0) {
                // Calculate transaction code
                const [countRows] = await db.query(
                    "SELECT COUNT(*) as count FROM financial_transactions WHERE YEAR(transaction_date) = ? AND transaction_type = 'expense'",
                    [year]
                );
                const count = countRows[0].count + expenseCount + 1;
                const transCode = `CHI-${year}-${String(count).padStart(4, '0')}`;

                const materialName = pm.material_name || pm.item_name || 'Vật tư';

                await db.query(`
                    INSERT INTO financial_transactions
                    (transaction_code, transaction_date, transaction_type, category, expense_type, amount, 
                     description, project_id, reference_number)
                    VALUES (?, ?, 'expense', 'Chi phí vật tư', 'material', ?, ?, ?, ?)
                `, [
                    transCode,
                    pm.created_at ? new Date(pm.created_at).toISOString().split('T')[0] : today,
                    pm.total_cost,
                    `Chi phí ${materialName} cho dự án ${pm.project_name || pm.project_code || pm.project_id}`,
                    pm.project_id,
                    refNumber
                ]);
                expenseCount++;
            }
        }

        res.json({
            success: true,
            message: `Đồng bộ thành công: ${revenueCount} giao dịch thu, ${expenseCount} giao dịch chi`,
            data: {
                revenue_synced: revenueCount,
                expense_synced: expenseCount
            }
        });
    } catch (err) {
        console.error('Error syncing from projects:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi đồng bộ: " + err.message
        });
    }
};

/**
 * GET dashboard summary for finance
 * Lấy dữ liệu tổng hợp cho dashboard tài chính
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        // Today's revenue
        const [todayRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date = ? AND transaction_type = 'revenue'
        `, [today]);

        // Today's expense
        const [todayExpense] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date = ? AND transaction_type = 'expense'
        `, [today]);

        // Month's revenue
        const [monthRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date >= ? AND transaction_date <= ? AND transaction_type = 'revenue'
        `, [firstDayOfMonth, lastDayOfMonth]);

        // Month's expense
        const [monthExpense] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date >= ? AND transaction_date <= ? AND transaction_type = 'expense'
        `, [firstDayOfMonth, lastDayOfMonth]);

        // Total receivable (from debts)
        const [receivable] = await db.query(`
            SELECT COALESCE(SUM(remaining_amount), 0) as total
            FROM debts
            WHERE debt_type = 'receivable' AND status != 'paid'
        `);

        // Total payable (from debts)
        const [payable] = await db.query(`
            SELECT COALESCE(SUM(remaining_amount), 0) as total
            FROM debts
            WHERE debt_type = 'payable' AND status != 'paid'
        `);

        // Overdue debts count
        const [overdueDebts] = await db.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total
            FROM debts
            WHERE due_date < ? AND status != 'paid'
        `, [today]);

        // Projects with negative balance (expenses > revenue)
        const [negativeProjects] = await db.query(`
            SELECT 
                p.id, p.project_name, p.project_code,
                COALESCE(rev.total, 0) as total_revenue,
                COALESCE(exp.total, 0) as total_expense,
                (COALESCE(rev.total, 0) - COALESCE(exp.total, 0)) as balance
            FROM projects p
            LEFT JOIN (
                SELECT project_id, SUM(amount) as total
                FROM financial_transactions
                WHERE transaction_type = 'revenue'
                GROUP BY project_id
            ) rev ON p.id = rev.project_id
            LEFT JOIN (
                SELECT project_id, SUM(amount) as total
                FROM financial_transactions
                WHERE transaction_type = 'expense'
                GROUP BY project_id
            ) exp ON p.id = exp.project_id
            WHERE (COALESCE(rev.total, 0) - COALESCE(exp.total, 0)) < 0
        `);

        res.json({
            success: true,
            data: {
                today_revenue: parseFloat(todayRevenue[0].total) || 0,
                today_expense: parseFloat(todayExpense[0].total) || 0,
                month_revenue: parseFloat(monthRevenue[0].total) || 0,
                month_expense: parseFloat(monthExpense[0].total) || 0,
                month_profit: (parseFloat(monthRevenue[0].total) || 0) - (parseFloat(monthExpense[0].total) || 0),
                total_receivable: parseFloat(receivable[0].total) || 0,
                total_payable: parseFloat(payable[0].total) || 0,
                overdue_debts_count: overdueDebts[0].count,
                overdue_debts_amount: parseFloat(overdueDebts[0].total) || 0,
                negative_balance_projects: negativeProjects
            }
        });
    } catch (err) {
        console.error('Error getting dashboard summary:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * Migration: Add status column to financial_transactions table
 */
exports.migrateAddStatus = async (req, res) => {
    try {
        // Check if status column exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'financial_transactions' 
            AND COLUMN_NAME = 'status'
        `);

        if (columns.length > 0) {
            res.json({
                success: true,
                message: "Cột status đã tồn tại"
            });
            return;
        }

        // Add status column
        await db.query(`
            ALTER TABLE financial_transactions 
            ADD COLUMN status ENUM('draft', 'posted', 'cancelled') NOT NULL DEFAULT 'draft' 
            COMMENT 'Trạng thái: nháp, đã ghi sổ, đã hủy'
        `);

        // Add index for status
        await db.query(`
            ALTER TABLE financial_transactions 
            ADD INDEX idx_status (status)
        `);

        res.json({
            success: true,
            message: "Đã thêm cột status thành công"
        });
    } catch (err) {
        console.error('Error in migration:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi migration: " + err.message
        });
    }
};
