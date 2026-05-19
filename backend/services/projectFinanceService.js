const db = require('../config/db');

/**
 * Tự động tạo phiếu thu (nháp) cho số tiền còn lại của dự án khi hoàn thành/bàn giao.
 * @param {number} projectId 
 * @param {object} [connection] Optional transaction connection
 */
async function createRemainingReceiptSlip(projectId, connection = null) {
    const conn = connection || db;
    
    try {
        console.log(`[FinanceService] Khởi chạy tính toán công nợ cuối cho dự án ID ${projectId}`);
        
        // 1. Lấy thông tin dự án và khách hàng
        const [projectRows] = await conn.query(`
            SELECT p.id, p.project_code, p.project_name, p.total_value, p.customer_id, c.full_name as customer_name
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?
        `, [projectId]);
        
        if (projectRows.length === 0) {
            console.log(`[FinanceService] Không tìm thấy dự án ID ${projectId}`);
            return null;
        }
        
        const project = projectRows[0];
        const totalValue = parseFloat(project.total_value) || 0;
        const customerId = project.customer_id;
        
        if (totalValue <= 0) {
            console.log(`[FinanceService] Dự án ID ${projectId} có giá trị bằng 0. Không cần tạo phiếu thu.`);
            return null;
        }
        
        // 2. Tính tổng số tiền đã thu (chỉ tính các phiếu thu 'revenue' có trạng thái 'posted' - Đã ghi sổ)
        const [paymentRows] = await conn.query(`
            SELECT COALESCE(SUM(amount), 0) as total_paid
            FROM financial_transactions
            WHERE project_id = ? AND transaction_type = 'revenue' AND status = 'posted'
        `, [projectId]);
        
        const totalPaid = parseFloat(paymentRows[0].total_paid) || 0;
        const remainingAmount = totalValue - totalPaid;
        
        console.log(`[FinanceService] Dự án ID ${projectId}: Tổng giá trị = ${totalValue}, Đã thu = ${totalPaid}, Còn lại = ${remainingAmount}`);
        
        if (remainingAmount <= 0) {
            console.log(`[FinanceService] Dự án ID ${projectId} đã thanh toán đủ hoặc thừa. Không cần tạo phiếu thu.`);
            
            // Đồng bộ trạng thái công nợ nếu đã thanh toán đủ
            try {
                if (customerId) {
                    await conn.query(`
                        UPDATE debts 
                        SET total_amount = ?, paid_amount = ?, remaining_amount = 0, status = 'paid'
                        WHERE debt_type = 'receivable' AND customer_id = ? AND project_id = ?
                    `, [totalValue, totalPaid, customerId, projectId]);
                }
            } catch (debtSyncErr) {
                console.error('[FinanceService] Lỗi đồng bộ công nợ đã trả đủ:', debtSyncErr);
            }
            return null;
        }
        
        // 3. Kiểm tra xem đã có phiếu thu thu nốt còn lại chưa (tránh tạo trùng lặp)
        const [existingSlip] = await conn.query(`
            SELECT id, transaction_code, status 
            FROM financial_transactions
            WHERE project_id = ? 
            AND transaction_type = 'revenue'
            AND description LIKE ?
            LIMIT 1
        `, [projectId, `%Thu nốt tiền còn lại%`]);
        
        if (existingSlip.length > 0) {
            console.log(`[FinanceService] Dự án ID ${projectId} đã có phiếu thu liên quan: ${existingSlip[0].transaction_code} (${existingSlip[0].status})`);
            return existingSlip[0];
        }
        
        // 4. Sinh mã phiếu thu (THU-YYYY-XXXX)
        const year = new Date().getFullYear();
        const prefix = 'THU';
        
        let transactionCode;
        let maxAttempts = 10;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            const [maxCodeRows] = await conn.query(`
                SELECT transaction_code 
                FROM financial_transactions 
                WHERE transaction_code LIKE ? AND transaction_type = 'revenue'
                ORDER BY CAST(SUBSTRING(transaction_code, 9) AS UNSIGNED) DESC
                LIMIT 1
            `, [`${prefix}-${year}-%`]);

            let nextNumber = 1;
            if (maxCodeRows.length > 0 && maxCodeRows[0].transaction_code) {
                const match = maxCodeRows[0].transaction_code.match(new RegExp(`${prefix}-\\d+-(\\d+)`));
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }

            transactionCode = `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;

            // Kiểm tra xem code đã tồn tại chưa
            const [checkExisting] = await conn.query(
                "SELECT id FROM financial_transactions WHERE transaction_code = ?",
                [transactionCode]
            );

            if (checkExisting.length === 0) {
                break;
            }

            nextNumber++;
            attempt++;
        }

        if (attempt >= maxAttempts) {
            const timestamp = Date.now().toString().slice(-6);
            transactionCode = `${prefix}-${year}-${timestamp}`;
        }
        
        // 5. Tạo phiếu thu nháp (draft)
        const transactionDate = new Date().toISOString().split('T')[0];
        const description = `Thu nốt tiền còn lại bàn giao dự án ${project.project_name} (${project.project_code || project.id})`;
        
        const [insertResult] = await conn.query(`
            INSERT INTO financial_transactions
            (transaction_code, transaction_date, transaction_type, category, amount, description, 
             project_id, customer_id, status)
            VALUES (?, ?, 'revenue', 'Thu tiền dự án', ?, ?, ?, ?, 'draft')
        `, [
            transactionCode,
            transactionDate,
            remainingAmount,
            description,
            projectId,
            customerId || null,
        ]);
        
        console.log(`[FinanceService] Đã tạo thành công phiếu thu nháp ${transactionCode} số tiền ${remainingAmount} cho dự án ID ${projectId}`);
        
        // 6. Cập nhật/Đồng bộ công nợ nếu có
        try {
            if (customerId) {
                const [existingDebt] = await conn.query(`
                    SELECT id, total_amount, paid_amount, remaining_amount 
                    FROM debts 
                    WHERE debt_type = 'receivable' 
                    AND customer_id = ? 
                    AND project_id = ?
                    AND status != 'paid'
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [customerId, projectId]);

                if (existingDebt.length > 0) {
                    await conn.query(`
                        UPDATE debts 
                        SET total_amount = ?, paid_amount = ?, remaining_amount = ?, status = 'pending'
                        WHERE id = ?
                    `, [totalValue, totalPaid, remainingAmount, existingDebt[0].id]);
                } else {
                    await conn.query(`
                        INSERT INTO debts
                        (debt_type, customer_id, project_id, total_amount, paid_amount, remaining_amount, status, notes)
                        VALUES ('receivable', ?, ?, ?, ?, ?, 'pending', ?)
                    `, [
                        customerId,
                        projectId,
                        totalValue,
                        totalPaid,
                        remainingAmount,
                        `Công nợ đồng bộ khi hoàn thành bàn giao dự án ${project.project_code || project.id}`
                    ]);
                }
            }
        } catch (debtError) {
            console.error('[FinanceService] Lỗi cập nhật công nợ:', debtError);
        }
        
        return {
            id: insertResult.insertId,
            transaction_code: transactionCode,
            amount: remainingAmount
        };
    } catch (err) {
        console.error('[FinanceService] Lỗi nghiêm trọng khi tạo phiếu thu nháp:', err);
        return null;
    }
}

module.exports = {
    createRemainingReceiptSlip
};
