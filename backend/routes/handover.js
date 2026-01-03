const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/handover - Lấy danh sách dự án cần bàn giao
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.full_name as customer_name,
                c.phone as customer_phone,
                c.address as customer_address
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.status = 'handover' OR p.status = 'bàn giao' OR p.status = 'installation'
            ORDER BY p.updated_at DESC
        `;

        const [rows] = await db.query(query);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET /api/handover/projects - Lấy danh sách dự án với sản phẩm (cho frontend)
router.get('/projects', async (req, res) => {
    try {
        // Lấy danh sách dự án ở giai đoạn installation hoặc handover
        const projectQuery = `
            SELECT 
                p.id,
                p.project_name,
                p.project_code,
                p.status,
                p.deadline,
                p.handover_date,
                p.handover_status,
                p.handover_notes,
                p.progress_percent,
                p.created_at,
                p.updated_at,
                c.full_name as customer_name,
                c.phone as customer_phone,
                c.address as customer_address,
                c.email as customer_email
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.status IN ('installation', 'handover', 'bàn giao', 'lắp đặt')
            ORDER BY p.updated_at DESC
        `;

        const [projects] = await db.query(projectQuery);

        // Lấy sản phẩm cho mỗi dự án
        for (let project of projects) {
            try {
                const productsQuery = `
                    SELECT 
                        qi.id,
                        qi.item_name,
                        qi.spec,
                        qi.design_code,
                        qi.width_mm,
                        qi.height_mm,
                        qi.quantity,
                        pt.name as template_name
                    FROM quotation_items qi
                    LEFT JOIN product_templates pt ON qi.template_id = pt.id
                    WHERE qi.project_id = ?
                `;
                const [products] = await db.query(productsQuery, [project.id]);
                project.products = products || [];
                project.total_products = products.length;
            } catch (err) {
                console.log('Lỗi lấy sản phẩm cho dự án', project.id, err.message);
                project.products = [];
                project.total_products = 0;
            }
        }

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET /api/handover/:id - Lấy chi tiết dự án bàn giao
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.*,
                c.full_name as customer_name,
                c.phone as customer_phone,
                c.address as customer_address,
                c.email as customer_email
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy dự án'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Lỗi lấy chi tiết bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// PUT /api/handover/:id/complete - Hoàn thành bàn giao
router.put('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { handover_notes, handover_date } = req.body;

        const query = `
            UPDATE projects 
            SET 
                status = 'completed',
                handover_notes = ?,
                handover_date = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        await db.query(query, [
            handover_notes || null,
            handover_date || new Date(),
            id
        ]);

        res.json({
            success: true,
            message: 'Đã hoàn thành bàn giao dự án'
        });
    } catch (error) {
        console.error('Lỗi hoàn thành bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// PUT /api/handover/:id/status - Cập nhật trạng thái bàn giao
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const query = `
            UPDATE projects 
            SET 
                status = ?,
                handover_notes = COALESCE(?, handover_notes),
                updated_at = NOW()
            WHERE id = ?
        `;

        await db.query(query, [status, notes, id]);

        res.json({
            success: true,
            message: 'Đã cập nhật trạng thái bàn giao'
        });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
