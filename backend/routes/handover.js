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

        // Lấy sản phẩm cho mỗi dự án (từ quotation_items với tách quantity)
        for (let project of projects) {
            try {
                // Lấy quotation_id
                const [quotationRows] = await db.query(`
                    SELECT id FROM quotations WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
                `, [project.id]);

                let products = [];

                if (quotationRows.length > 0) {
                    const [items] = await db.query(`
                        SELECT 
                            qi.id,
                            qi.item_name,
                            qi.spec,
                            qi.code,
                            qi.width,
                            qi.height,
                            qi.quantity
                        FROM quotation_items qi
                        WHERE qi.quotation_id = ?
                        ORDER BY qi.id
                    `, [quotationRows[0].id]);

                    // Tách sản phẩm có quantity > 1
                    for (const item of items) {
                        const qty = parseInt(item.quantity) || 1;
                        const baseCode = item.code || `SP-${item.id}`;
                        const baseName = item.item_name || item.spec || 'Sản phẩm';

                        for (let i = 1; i <= qty; i++) {
                            const productCode = qty > 1 ? `${baseCode}_C${String(i).padStart(3, '0')}` : baseCode;

                            products.push({
                                id: `${item.id}_${i}`,
                                item_name: baseName,
                                spec: item.spec,
                                design_code: productCode,
                                width_mm: parseFloat(item.width) || 0,
                                height_mm: parseFloat(item.height) || 0,
                                quantity: 1
                            });
                        }
                    }
                }

                project.products = products;
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

// PUT /api/handover/projects/:id/info - Lưu thông tin bàn giao (ngày, người, ghi chú, ảnh)
router.put('/projects/:id/info', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            handover_date,
            handover_person,
            receiver_name,
            receiver_phone,
            handover_notes,
            photos
        } = req.body;

        // Thêm cột photos nếu chưa có
        try {
            await db.query(`
                ALTER TABLE projects 
                ADD COLUMN handover_person VARCHAR(255) NULL,
                ADD COLUMN receiver_name VARCHAR(255) NULL,
                ADD COLUMN receiver_phone VARCHAR(50) NULL,
                ADD COLUMN handover_photos JSON NULL
            `);
        } catch (alterErr) {
            // Columns might already exist
        }

        const photosJson = photos && Array.isArray(photos) ? JSON.stringify(photos) : null;

        const query = `
            UPDATE projects 
            SET 
                handover_date = ?,
                handover_person = ?,
                receiver_name = ?,
                receiver_phone = ?,
                handover_notes = ?,
                handover_photos = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        await db.query(query, [
            handover_date || null,
            handover_person || null,
            receiver_name || null,
            receiver_phone || null,
            handover_notes || null,
            photosJson,
            id
        ]);

        res.json({
            success: true,
            message: 'Đã lưu thông tin bàn giao'
        });
    } catch (error) {
        console.error('Lỗi lưu thông tin bàn giao:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;

