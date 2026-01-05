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
            reference_number,
            status
        } = req.body;

        // Validate required fields
        if (!transaction_date || !transaction_type || !amount) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc"
            });
        }

        // Generate unique transaction code
        const year = new Date(transaction_date).getFullYear();
        const prefix = transaction_type === 'revenue' ? 'THU' : 'CHI';
        
        // Tìm transaction_code lớn nhất trong năm để tránh duplicate
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
            `, [`${prefix}-${year}-%`, transaction_type]);
            
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

        // Mặc định status = 'draft' nếu không được chỉ định
        const transactionStatus = status || 'draft';

        const [result] = await db.query(`
            INSERT INTO financial_transactions
            (transaction_code, transaction_date, transaction_type, category, expense_type, supplier, 
             amount, description, project_id, customer_id, production_order_id, payment_method, reference_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            reference_number || null,
            transactionStatus
        ]);

        // Nếu status = 'posted' ngay khi tạo, tự động tạo/cập nhật công nợ
        if (transactionStatus === 'posted') {
            try {
                if (transaction_type === 'revenue' && customer_id) {
                    // Phiếu Thu: Giảm công nợ phải thu
                    const [existingDebt] = await db.query(`
                        SELECT id, total_amount, paid_amount, remaining_amount 
                        FROM debts 
                        WHERE debt_type = 'receivable' 
                        AND customer_id = ? 
                        AND project_id = ?
                        AND status != 'paid'
                        ORDER BY created_at DESC
                        LIMIT 1
                    `, [customer_id, project_id || null]);

                    if (existingDebt.length > 0) {
                        const debt = existingDebt[0];
                        const newPaidAmount = parseFloat(debt.paid_amount) + parseFloat(amount);
                        const newRemainingAmount = parseFloat(debt.remaining_amount) - parseFloat(amount);
                        const newStatus = newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

                        await db.query(`
                            UPDATE debts 
                            SET paid_amount = ?, remaining_amount = ?, status = ?
                            WHERE id = ?
                        `, [newPaidAmount, newRemainingAmount, newStatus, debt.id]);
                    }
                } else if (transaction_type === 'expense' && !payment_method) {
                    // Phiếu Chi: Tăng công nợ phải trả (nếu chưa thanh toán)
                    // Nếu không có supplier, dùng "Chi phí dự án" hoặc "Khác"
                    const supplierName = supplier && supplier.trim() && supplier !== 'N/A' 
                        ? supplier 
                        : (project_id ? `Chi phí dự án` : 'Khác');
                    
                    const [existingDebt] = await db.query(`
                        SELECT id, total_amount, paid_amount, remaining_amount 
                        FROM debts 
                        WHERE debt_type = 'payable' 
                        AND supplier = ? 
                        AND project_id = ?
                        AND status != 'paid'
                        ORDER BY created_at DESC
                        LIMIT 1
                    `, [supplierName, project_id || null]);

                    if (existingDebt.length > 0) {
                        const debt = existingDebt[0];
                        const newTotalAmount = parseFloat(debt.total_amount) + parseFloat(amount);
                        const newRemainingAmount = parseFloat(debt.remaining_amount) + parseFloat(amount);

                        await db.query(`
                            UPDATE debts 
                            SET total_amount = ?, remaining_amount = ?, status = 'pending'
                            WHERE id = ?
                        `, [newTotalAmount, newRemainingAmount, debt.id]);
                    } else {
                        await db.query(`
                            INSERT INTO debts
                            (debt_type, supplier, project_id, total_amount, paid_amount, remaining_amount, status, notes)
                            VALUES ('payable', ?, ?, ?, 0, ?, 'pending', ?)
                        `, [
                            supplierName,
                            project_id || null,
                            amount,
                            amount,
                            description || `Công nợ từ phiếu chi ${transaction_code}`
                        ]);
                    }
                }
            } catch (debtError) {
                console.error('Error creating/updating debt:', debtError);
                // Không fail việc tạo transaction nếu lỗi tạo công nợ
            }
        }

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

        // Kiểm tra trạng thái hiện tại
        const [currentRows] = await db.query(
            "SELECT status FROM financial_transactions WHERE id = ?",
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        const currentStatus = currentRows[0].status;

        // Nếu đã "Đã ghi sổ" hoặc "Đã hủy", chỉ cho phép sửa description (ghi chú)
        if (currentStatus === 'posted' || currentStatus === 'cancelled') {
            if (description !== undefined) {
                await db.query(
                    "UPDATE financial_transactions SET description = ? WHERE id = ?",
                    [description, id]
                );
                return res.json({
                    success: true,
                    message: "Đã cập nhật ghi chú thành công"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể sửa phiếu đã ghi sổ hoặc đã hủy. Chỉ có thể sửa ghi chú."
                });
            }
        }

        // Nếu còn "Nháp", cho phép sửa tất cả
        const [result] = await db.query(`
            UPDATE financial_transactions
            SET transaction_date = ?, transaction_type = ?, category = ?, expense_type = ?, supplier = ?,
                amount = ?, description = ?, project_id = ?, customer_id = ?, production_order_id = ?,
                payment_method = ?, reference_number = ?
            WHERE id = ? AND status = 'draft'
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
                message: "Không tìm thấy giao dịch hoặc giao dịch không ở trạng thái 'Nháp'"
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
 * CHỈ cho phép xóa khi status = 'draft'
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra trạng thái
        const [currentRows] = await db.query(
            "SELECT status FROM financial_transactions WHERE id = ?",
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        if (currentRows[0].status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể xóa phiếu ở trạng thái 'Nháp'. Để hủy phiếu đã ghi sổ, vui lòng sử dụng chức năng 'Hủy'."
            });
        }

        const [result] = await db.query(
            "DELETE FROM financial_transactions WHERE id = ? AND status = 'draft'",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch hoặc giao dịch không ở trạng thái 'Nháp'"
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

        // Total revenue - CHỈ tính các transaction đã "Đã ghi sổ"
        const [revenueRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'revenue' AND status = 'posted'
        `, params);

        // Total expense - CHỈ tính các transaction đã "Đã ghi sổ"
        const [expenseRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense' AND status = 'posted'
        `, params);

        // Revenue by category - CHỈ tính các transaction đã "Đã ghi sổ"
        const [revenueByCategory] = await db.query(`
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'revenue' AND status = 'posted'
            GROUP BY category
            ORDER BY total DESC
        `, params);

        // Expense by category - CHỈ tính các transaction đã "Đã ghi sổ"
        const [expenseByCategory] = await db.query(`
            SELECT category, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense' AND status = 'posted'
            GROUP BY category
            ORDER BY total DESC
        `, params);

        // Expense by expense_type - CHỈ tính các transaction đã "Đã ghi sổ"
        const [expenseByType] = await db.query(`
            SELECT expense_type, COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            ${dateFilter} AND transaction_type = 'expense' AND expense_type IS NOT NULL AND status = 'posted'
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
                // Generate unique transaction code
                // Tìm transaction_code lớn nhất trong năm để tránh duplicate
                let transCode;
                let maxAttempts = 10;
                let attempt = 0;
                
                while (attempt < maxAttempts) {
                    const [maxCodeRows] = await db.query(`
                        SELECT transaction_code 
                        FROM financial_transactions 
                        WHERE transaction_code LIKE ? AND transaction_type = 'revenue'
                        ORDER BY CAST(SUBSTRING(transaction_code, 9) AS UNSIGNED) DESC
                        LIMIT 1
                    `, [`THU-${year}-%`]);
                    
                    let nextNumber = 1;
                    if (maxCodeRows.length > 0 && maxCodeRows[0].transaction_code) {
                        const match = maxCodeRows[0].transaction_code.match(/THU-\d+-(\d+)/);
                        if (match) {
                            nextNumber = parseInt(match[1], 10) + 1;
                        }
                    }
                    
                    transCode = `THU-${year}-${String(nextNumber).padStart(4, '0')}`;
                    
                    // Kiểm tra xem code đã tồn tại chưa
                    const [checkExisting] = await db.query(
                        "SELECT id FROM financial_transactions WHERE transaction_code = ?",
                        [transCode]
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
                    transCode = `THU-${year}-${timestamp}`;
                }

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
                // Generate unique transaction code
                // Tìm transaction_code lớn nhất trong năm để tránh duplicate
                let transCode;
                let maxAttempts = 10;
                let attempt = 0;
                
                while (attempt < maxAttempts) {
                    const [maxCodeRows] = await db.query(`
                        SELECT transaction_code 
                        FROM financial_transactions 
                        WHERE transaction_code LIKE ? AND transaction_type = 'expense'
                        ORDER BY CAST(SUBSTRING(transaction_code, 9) AS UNSIGNED) DESC
                        LIMIT 1
                    `, [`CHI-${year}-%`]);
                    
                    let nextNumber = 1;
                    if (maxCodeRows.length > 0 && maxCodeRows[0].transaction_code) {
                        const match = maxCodeRows[0].transaction_code.match(/CHI-\d+-(\d+)/);
                        if (match) {
                            nextNumber = parseInt(match[1], 10) + 1;
                        }
                    }
                    
                    transCode = `CHI-${year}-${String(nextNumber).padStart(4, '0')}`;
                    
                    // Kiểm tra xem code đã tồn tại chưa
                    const [checkExisting] = await db.query(
                        "SELECT id FROM financial_transactions WHERE transaction_code = ?",
                        [transCode]
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
                    transCode = `CHI-${year}-${timestamp}`;
                }

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

        // 3. Sync payable debts from expense transactions
        // CHỈ sync các transaction đã "Đã ghi sổ" (status = 'posted')
        let payableDebtCount = 0;
        const [expenseTransactions] = await db.query(`
            SELECT ft.*, p.project_name
            FROM financial_transactions ft
            LEFT JOIN projects p ON ft.project_id = p.id
            WHERE ft.transaction_type = 'expense' 
            AND (ft.payment_method IS NULL OR ft.payment_method = '')
            AND ft.status = 'posted'
        `);

        for (const exp of expenseTransactions) {
            // Kiểm tra xem đã có công nợ phải trả cho transaction này chưa (dựa vào notes)
            const [existingDebt] = await db.query(`
                SELECT id FROM debts 
                WHERE notes LIKE ?
            `, [`%${exp.transaction_code}%`]);

            if (existingDebt.length === 0) {
                // Nếu không có supplier, dùng "Chi phí dự án" hoặc "Khác"
                const supplierName = exp.supplier && exp.supplier.trim() && exp.supplier !== 'N/A' 
                    ? exp.supplier 
                    : (exp.project_id ? `Chi phí dự án` : 'Khác');
                
                // Kiểm tra xem đã có công nợ phải trả cho supplier này trong project này chưa
                const [existingSupplierDebt] = await db.query(`
                    SELECT id, total_amount, paid_amount, remaining_amount 
                    FROM debts 
                    WHERE debt_type = 'payable' 
                    AND supplier = ? 
                    AND project_id = ? 
                    AND status != 'paid'
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [supplierName, exp.project_id || null]);

                if (existingSupplierDebt.length > 0) {
                    // Cập nhật công nợ hiện có
                    const debt = existingSupplierDebt[0];
                    const newTotalAmount = parseFloat(debt.total_amount) + parseFloat(exp.amount);
                    const newRemainingAmount = parseFloat(debt.remaining_amount) + parseFloat(exp.amount);
                    
                    // Cập nhật notes để bao gồm transaction_code mới
                    const updatedNotes = debt.notes 
                        ? `${debt.notes}; ${exp.transaction_code}` 
                        : `Công nợ từ phiếu chi ${exp.transaction_code}`;
                    
                    await db.query(`
                        UPDATE debts 
                        SET total_amount = ?, remaining_amount = ?, status = 'pending', notes = ?
                        WHERE id = ?
                    `, [newTotalAmount, newRemainingAmount, updatedNotes, debt.id]);
                    payableDebtCount++;
                } else {
                    // Tạo công nợ mới
                    await db.query(`
                        INSERT INTO debts
                        (debt_type, supplier, project_id, total_amount, paid_amount, remaining_amount, status, notes)
                        VALUES ('payable', ?, ?, ?, 0, ?, 'pending', ?)
                    `, [
                        supplierName,
                        exp.project_id || null,
                        exp.amount,
                        exp.amount,
                        exp.description || `Công nợ từ phiếu chi ${exp.transaction_code}`
                    ]);
                    payableDebtCount++;
                }
            }
        }

        res.json({
            success: true,
            message: `Đồng bộ thành công: ${revenueCount} giao dịch thu, ${expenseCount} giao dịch chi, ${payableDebtCount} công nợ phải trả`,
            data: {
                revenue_synced: revenueCount,
                expense_synced: expenseCount,
                payable_debt_synced: payableDebtCount
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

        // Today's revenue - CHỈ tính các transaction đã "Đã ghi sổ"
        const [todayRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date = ? AND transaction_type = 'revenue' AND status = 'posted'
        `, [today]);

        // Today's expense - CHỈ tính các transaction đã "Đã ghi sổ"
        const [todayExpense] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date = ? AND transaction_type = 'expense' AND status = 'posted'
        `, [today]);

        // Month's revenue - CHỈ tính các transaction đã "Đã ghi sổ"
        const [monthRevenue] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date >= ? AND transaction_date <= ? AND transaction_type = 'revenue' AND status = 'posted'
        `, [firstDayOfMonth, lastDayOfMonth]);

        // Month's expense - CHỈ tính các transaction đã "Đã ghi sổ"
        const [monthExpense] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date >= ? AND transaction_date <= ? AND transaction_type = 'expense' AND status = 'posted'
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

/**
 * POST post transaction (Ghi sổ)
 * Chuyển trạng thái từ "Nháp" sang "Đã ghi sổ" và tạo/cập nhật công nợ
 */
exports.postTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin transaction
        const [transactionRows] = await db.query(
            "SELECT * FROM financial_transactions WHERE id = ?",
            [id]
        );

        if (transactionRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        const transaction = transactionRows[0];

        // Kiểm tra trạng thái hiện tại
        if (transaction.status === 'posted') {
            return res.status(400).json({
                success: false,
                message: "Giao dịch đã được ghi sổ rồi"
            });
        }

        if (transaction.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Không thể ghi sổ giao dịch đã hủy"
            });
        }

        // Cập nhật status = 'posted'
        await db.query(
            "UPDATE financial_transactions SET status = 'posted' WHERE id = ?",
            [id]
        );

        // Tạo/cập nhật công nợ nếu cần
        if (transaction.transaction_type === 'revenue' && transaction.customer_id) {
            // Phiếu Thu: Giảm công nợ phải thu
            const [existingDebt] = await db.query(`
                SELECT id, total_amount, paid_amount, remaining_amount 
                FROM debts 
                WHERE debt_type = 'receivable' 
                AND customer_id = ? 
                AND project_id = ?
                AND status != 'paid'
                ORDER BY created_at DESC
                LIMIT 1
            `, [transaction.customer_id, transaction.project_id || null]);

            if (existingDebt.length > 0) {
                // Cập nhật công nợ: tăng paid_amount, giảm remaining_amount
                const debt = existingDebt[0];
                const newPaidAmount = parseFloat(debt.paid_amount) + parseFloat(transaction.amount);
                const newRemainingAmount = parseFloat(debt.remaining_amount) - parseFloat(transaction.amount);
                const newStatus = newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

                await db.query(`
                    UPDATE debts 
                    SET paid_amount = ?, remaining_amount = ?, status = ?
                    WHERE id = ?
                `, [newPaidAmount, newRemainingAmount, newStatus, debt.id]);
            }
        } else if (transaction.transaction_type === 'expense' && !transaction.payment_method) {
            // Phiếu Chi: Tăng công nợ phải trả (nếu chưa thanh toán)
            // Nếu không có supplier, dùng "Khác" hoặc tổng hợp theo dự án
            const supplierName = transaction.supplier && transaction.supplier.trim() && transaction.supplier !== 'N/A' 
                ? transaction.supplier 
                : (transaction.project_id ? `Chi phí dự án` : 'Khác');
            
            const [existingDebt] = await db.query(`
                SELECT id, total_amount, paid_amount, remaining_amount 
                FROM debts 
                WHERE debt_type = 'payable' 
                AND supplier = ? 
                AND project_id = ?
                AND status != 'paid'
                ORDER BY created_at DESC
                LIMIT 1
            `, [supplierName, transaction.project_id || null]);

            if (existingDebt.length > 0) {
                // Cập nhật công nợ: tăng total_amount và remaining_amount
                const debt = existingDebt[0];
                const newTotalAmount = parseFloat(debt.total_amount) + parseFloat(transaction.amount);
                const newRemainingAmount = parseFloat(debt.remaining_amount) + parseFloat(transaction.amount);

                await db.query(`
                    UPDATE debts 
                    SET total_amount = ?, remaining_amount = ?, status = 'pending'
                    WHERE id = ?
                `, [newTotalAmount, newRemainingAmount, debt.id]);
            } else {
                // Tạo công nợ mới
                await db.query(`
                    INSERT INTO debts
                    (debt_type, supplier, project_id, total_amount, paid_amount, remaining_amount, status, notes)
                    VALUES ('payable', ?, ?, ?, 0, ?, 'pending', ?)
                `, [
                    supplierName,
                    transaction.project_id || null,
                    transaction.amount,
                    transaction.amount,
                    transaction.description || `Công nợ từ phiếu chi ${transaction.transaction_code}`
                ]);
            }
        }

        res.json({
            success: true,
            message: "Đã ghi sổ thành công"
        });
    } catch (err) {
        console.error('Error posting transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi ghi sổ: " + err.message
        });
    }
};

/**
 * POST cancel transaction (Hủy)
 * Nếu đã ghi sổ: tạo phiếu đảo (reversal)
 * Nếu còn nháp: chỉ đổi status = 'cancelled'
 */
exports.cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancel_reason } = req.body;

        if (!cancel_reason) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập lý do hủy"
            });
        }

        // Lấy thông tin transaction
        const [transactionRows] = await db.query(
            "SELECT * FROM financial_transactions WHERE id = ?",
            [id]
        );

        if (transactionRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giao dịch"
            });
        }

        const transaction = transactionRows[0];

        if (transaction.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Giao dịch đã bị hủy rồi"
            });
        }

        // Nếu đã ghi sổ: tạo phiếu đảo
        if (transaction.status === 'posted') {
            const year = new Date(transaction.transaction_date).getFullYear();
            const prefix = transaction.transaction_type === 'revenue' ? 'CHI' : 'THU';
            
            // Generate unique transaction code cho phiếu đảo
            let reversalCode;
            let maxAttempts = 10;
            let attempt = 0;
            
            while (attempt < maxAttempts) {
                const [maxCodeRows] = await db.query(`
                    SELECT transaction_code 
                    FROM financial_transactions 
                    WHERE transaction_code LIKE ? AND transaction_type = ?
                    ORDER BY CAST(SUBSTRING(transaction_code, 9) AS UNSIGNED) DESC
                    LIMIT 1
                `, [`${prefix}-${year}-%`, transaction.transaction_type === 'revenue' ? 'expense' : 'revenue']);
                
                let nextNumber = 1;
                if (maxCodeRows.length > 0 && maxCodeRows[0].transaction_code) {
                    const match = maxCodeRows[0].transaction_code.match(new RegExp(`${prefix}-\\d+-(\\d+)`));
                    if (match) {
                        nextNumber = parseInt(match[1], 10) + 1;
                    }
                }
                
                reversalCode = `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
                
                const [checkExisting] = await db.query(
                    "SELECT id FROM financial_transactions WHERE transaction_code = ?",
                    [reversalCode]
                );
                
                if (checkExisting.length === 0) {
                    break;
                }
                
                nextNumber++;
                attempt++;
            }
            
            if (attempt >= maxAttempts) {
                const timestamp = Date.now().toString().slice(-6);
                reversalCode = `${prefix}-${year}-${timestamp}`;
            }

            // Tạo phiếu đảo
            const reversalType = transaction.transaction_type === 'revenue' ? 'expense' : 'revenue';
            const [reversalResult] = await db.query(`
                INSERT INTO financial_transactions
                (transaction_code, transaction_date, transaction_type, category, expense_type, supplier,
                 amount, description, project_id, customer_id, payment_method, reference_number, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted')
            `, [
                reversalCode,
                new Date().toISOString().split('T')[0],
                reversalType,
                transaction.category || null,
                transaction.expense_type || null,
                transaction.supplier || null,
                transaction.amount,
                `Phiếu đảo của ${transaction.transaction_code}: ${cancel_reason}`,
                transaction.project_id || null,
                transaction.customer_id || null,
                transaction.payment_method || null,
                `REVERSAL-${id}`,
            ]);

            // Cập nhật công nợ ngược lại
            if (transaction.transaction_type === 'revenue' && transaction.customer_id) {
                // Phiếu Thu bị hủy → tăng lại công nợ phải thu
                const [existingDebt] = await db.query(`
                    SELECT id, total_amount, paid_amount, remaining_amount 
                    FROM debts 
                    WHERE debt_type = 'receivable' 
                    AND customer_id = ? 
                    AND project_id = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [transaction.customer_id, transaction.project_id || null]);

                if (existingDebt.length > 0) {
                    const debt = existingDebt[0];
                    const newPaidAmount = Math.max(0, parseFloat(debt.paid_amount) - parseFloat(transaction.amount));
                    const newRemainingAmount = parseFloat(debt.total_amount) - newPaidAmount;
                    const newStatus = newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

                    await db.query(`
                        UPDATE debts 
                        SET paid_amount = ?, remaining_amount = ?, status = ?
                        WHERE id = ?
                    `, [newPaidAmount, newRemainingAmount, newStatus, debt.id]);
                }
            } else if (transaction.transaction_type === 'expense') {
                // Phiếu Chi bị hủy → giảm lại công nợ phải trả
                // Nếu không có supplier, dùng "Chi phí dự án" hoặc "Khác"
                const supplierName = transaction.supplier && transaction.supplier.trim() && transaction.supplier !== 'N/A' 
                    ? transaction.supplier 
                    : (transaction.project_id ? `Chi phí dự án` : 'Khác');
                
                const [existingDebt] = await db.query(`
                    SELECT id, total_amount, paid_amount, remaining_amount 
                    FROM debts 
                    WHERE debt_type = 'payable' 
                    AND supplier = ? 
                    AND project_id = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [supplierName, transaction.project_id || null]);

                if (existingDebt.length > 0) {
                    const debt = existingDebt[0];
                    const newTotalAmount = Math.max(0, parseFloat(debt.total_amount) - parseFloat(transaction.amount));
                    const newRemainingAmount = Math.max(0, parseFloat(debt.remaining_amount) - parseFloat(transaction.amount));
                    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'pending';

                    await db.query(`
                        UPDATE debts 
                        SET total_amount = ?, remaining_amount = ?, status = ?
                        WHERE id = ?
                    `, [newTotalAmount, newRemainingAmount, newStatus, debt.id]);
                }
            }
        }

        // Cập nhật status = 'cancelled' và lưu lý do
        await db.query(
            "UPDATE financial_transactions SET status = 'cancelled', description = CONCAT(COALESCE(description, ''), ' [HỦY: ', ?, ']') WHERE id = ?",
            [cancel_reason, id]
        );

        res.json({
            success: true,
            message: transaction.status === 'posted' ? "Đã hủy và tạo phiếu đảo thành công" : "Đã hủy thành công"
        });
    } catch (err) {
        console.error('Error cancelling transaction:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi hủy: " + err.message
        });
    }
};

/**
 * POST sync payable debts from posted expense transactions
 * Đồng bộ lại công nợ phải trả từ các phiếu chi đã ghi sổ
 */
exports.syncPayableDebts = async (req, res) => {
    try {
        // Lấy tất cả các phiếu chi đã ghi sổ nhưng chưa có công nợ
        const [expenseTransactions] = await db.query(`
            SELECT ft.*, p.project_name
            FROM financial_transactions ft
            LEFT JOIN projects p ON ft.project_id = p.id
            WHERE ft.transaction_type = 'expense' 
            AND (ft.payment_method IS NULL OR ft.payment_method = '')
            AND ft.status = 'posted'
        `);

        let createdCount = 0;
        let updatedCount = 0;

        for (const exp of expenseTransactions) {
            // Kiểm tra xem đã có công nợ phải trả cho transaction này chưa (dựa vào notes)
            const [existingDebt] = await db.query(`
                SELECT id FROM debts 
                WHERE notes LIKE ?
            `, [`%${exp.transaction_code}%`]);

            if (existingDebt.length === 0) {
                // Nếu không có supplier, dùng "Chi phí dự án" hoặc "Khác"
                const supplierName = exp.supplier && exp.supplier.trim() && exp.supplier !== 'N/A' 
                    ? exp.supplier 
                    : (exp.project_id ? `Chi phí dự án` : 'Khác');
                
                // Kiểm tra xem đã có công nợ phải trả cho supplier này trong project này chưa
                const [existingSupplierDebt] = await db.query(`
                    SELECT id, total_amount, paid_amount, remaining_amount, notes
                    FROM debts 
                    WHERE debt_type = 'payable' 
                    AND supplier = ? 
                    AND project_id = ? 
                    AND status != 'paid'
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [supplierName, exp.project_id || null]);

                if (existingSupplierDebt.length > 0) {
                    // Cập nhật công nợ hiện có
                    const debt = existingSupplierDebt[0];
                    const newTotalAmount = parseFloat(debt.total_amount) + parseFloat(exp.amount);
                    const newRemainingAmount = parseFloat(debt.remaining_amount) + parseFloat(exp.amount);
                    
                    // Cập nhật notes để bao gồm transaction_code mới
                    const updatedNotes = debt.notes 
                        ? `${debt.notes}; ${exp.transaction_code}` 
                        : `Công nợ từ phiếu chi ${exp.transaction_code}`;
                    
                    await db.query(`
                        UPDATE debts 
                        SET total_amount = ?, remaining_amount = ?, status = 'pending', notes = ?
                        WHERE id = ?
                    `, [newTotalAmount, newRemainingAmount, updatedNotes, debt.id]);
                    updatedCount++;
                } else {
                    // Tạo công nợ mới
                    await db.query(`
                        INSERT INTO debts
                        (debt_type, supplier, project_id, total_amount, paid_amount, remaining_amount, status, notes)
                        VALUES ('payable', ?, ?, ?, 0, ?, 'pending', ?)
                    `, [
                        supplierName,
                        exp.project_id || null,
                        exp.amount,
                        exp.amount,
                        exp.description || `Công nợ từ phiếu chi ${exp.transaction_code}`
                    ]);
                    createdCount++;
                }
            }
        }

        res.json({
            success: true,
            message: `Đồng bộ thành công: ${createdCount} công nợ mới, ${updatedCount} công nợ đã cập nhật`,
            data: {
                created: createdCount,
                updated: updatedCount,
                total: expenseTransactions.length
            }
        });
    } catch (err) {
        console.error('Error syncing payable debts:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};
