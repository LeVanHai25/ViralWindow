const db = require("../config/db");
const NotificationService = require("../services/notificationService");
const NotificationEventService = require("../services/notificationEventService");

// GET all projects
exports.getAllProjects = async (req, res) => {
    try {
        const { status, progress, search, customer_id, without_quotation } = req.query;

        let query = `
            SELECT 
                p.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.address AS customer_address,
                (SELECT COUNT(*) FROM quotations WHERE project_id = p.id) AS quotation_count,
                (SELECT status FROM quotations WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1) AS quotation_status,
                (SELECT COUNT(DISTINCT design_id) FROM bom_items 
                 WHERE design_id IN (SELECT id FROM door_designs WHERE project_id = p.id)) AS bom_count
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE 1=1
        `;
        let params = [];


        if (customer_id) {
            query += " AND p.customer_id = ?";
            params.push(customer_id);
        }

        // Lọc các dự án chưa có báo giá (chưa đến giai đoạn báo giá)
        if (without_quotation === 'true') {
            query += ` AND p.id NOT IN (
                SELECT DISTINCT project_id 
                FROM quotations 
                WHERE project_id IS NOT NULL
            )`;
            // Chỉ lấy các dự án có trạng thái chưa đến giai đoạn báo giá
            query += ` AND p.status NOT IN ('waiting_quotation', 'quotation_approved', 'in_production', 'completed', 'cancelled', 'closed')`;
        }

        if (status && status !== 'all') {
            query += " AND p.status = ?";
            params.push(status);
        }

        if (progress && progress !== 'all') {
            if (progress === '0-25') {
                query += " AND p.progress_percent >= 0 AND p.progress_percent <= 25";
            } else if (progress === '25-50') {
                query += " AND p.progress_percent > 25 AND p.progress_percent <= 50";
            } else if (progress === '50-75') {
                query += " AND p.progress_percent > 50 AND p.progress_percent <= 75";
            } else if (progress === '75-100') {
                query += " AND p.progress_percent > 75 AND p.progress_percent <= 100";
            }
        }

        if (search) {
            query += " AND (p.project_name LIKE ? OR p.project_code LIKE ? OR c.full_name LIKE ? OR c.phone LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += " ORDER BY p.created_at DESC";

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
            `SELECT 
                p.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.address AS customer_address
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
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
        const { project_code, project_name, customer_id, start_date, deadline, status, notes } = req.body;

        // Validation
        if (!project_code || !project_code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Mã dự án không được để trống"
            });
        }

        if (!project_name || !project_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tên dự án không được để trống"
            });
        }

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn khách hàng"
            });
        }

        if (!start_date) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu không được để trống"
            });
        }

        if (!deadline) {
            return res.status(400).json({
                success: false,
                message: "Ngày giao dự kiến không được để trống"
            });
        }

        // Check if customer exists
        const [customerRows] = await db.query(
            "SELECT id FROM customers WHERE id = ?",
            [customer_id]
        );

        if (customerRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Khách hàng không tồn tại"
            });
        }

        // Check if project_code already exists
        const [existingRows] = await db.query(
            "SELECT id FROM projects WHERE project_code = ?",
            [project_code.trim()]
        );

        if (existingRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Mã dự án "${project_code}" đã tồn tại. Vui lòng chọn mã khác.`
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const deadlineDate = new Date(deadline);

        if (deadlineDate < startDate) {
            return res.status(400).json({
                success: false,
                message: "Ngày giao dự kiến phải sau ngày bắt đầu"
            });
        }

        const [result] = await db.query(
            `INSERT INTO projects 
             (project_code, project_name, customer_id, start_date, deadline, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                project_code.trim(),
                project_name.trim(),
                customer_id,
                start_date,
                deadline,
                status || 'new',
                notes ? notes.trim() : null
            ]
        );

        // Lấy thông tin khách hàng để thông báo
        const [customerInfo] = await db.query(
            "SELECT full_name FROM customers WHERE id = ?",
            [customer_id]
        );

        // Tạo thông báo dự án mới (Event-based)
        await NotificationEventService.emit('project.created', {
            project_id: result.insertId,
            project_code: project_code.trim(),
            project_name: project_name.trim(),
            customer_name: customerInfo[0]?.full_name || 'N/A',
            customer_id: customer_id
        }, {
            createdBy: req.user?.id,
            entityType: 'project',
            entityId: result.insertId
        });

        res.status(201).json({
            success: true,
            message: "Thêm dự án thành công",
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating project:', err);

        // Handle specific database errors
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "Mã dự án đã tồn tại. Vui lòng chọn mã khác."
            });
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: "Khách hàng không tồn tại"
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || "Lỗi khi thêm dự án",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// PUT update
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { project_name, customer_id, start_date, deadline, status, progress_percent, total_value, notes } = req.body;

        // Lấy thông tin dự án hiện tại
        const [currentRows] = await db.query(
            "SELECT * FROM projects WHERE id = ?",
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const current = currentRows[0];

        // Chỉ cập nhật các trường được cung cấp (partial update)
        const updateFields = [];
        const updateValues = [];

        if (project_name !== undefined) {
            updateFields.push("project_name = ?");
            updateValues.push(project_name);
        }
        if (customer_id !== undefined) {
            updateFields.push("customer_id = ?");
            updateValues.push(customer_id);
        }
        if (start_date !== undefined) {
            updateFields.push("start_date = ?");
            updateValues.push(start_date);
        }
        if (deadline !== undefined) {
            updateFields.push("deadline = ?");
            updateValues.push(deadline);
        }
        if (status !== undefined) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }
        if (progress_percent !== undefined) {
            updateFields.push("progress_percent = ?");
            updateValues.push(progress_percent);
        }
        if (total_value !== undefined) {
            updateFields.push("total_value = ?");
            updateValues.push(total_value);
        }
        if (notes !== undefined) {
            updateFields.push("notes = ?");
            updateValues.push(notes || null);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có trường nào để cập nhật"
            });
        }

        updateValues.push(id);

        const [result] = await db.query(
            `UPDATE projects 
             SET ${updateFields.join(", ")} 
             WHERE id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        // Lấy lại thông tin dự án đã cập nhật
        const [updatedRows] = await db.query(
            `SELECT 
                p.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?`,
            [id]
        );

        // Thông báo nếu trạng thái thay đổi (Event-based)
        if (status !== undefined && status !== current.status) {
            await NotificationEventService.emit('project.status_changed', {
                project_id: id,
                project_code: updatedRows[0]?.project_code || current.project_code,
                project_name: updatedRows[0]?.project_name || current.project_name,
                old_status: current.status,
                new_status: status
            }, {
                createdBy: req.user?.id,
                entityType: 'project',
                entityId: id
            });

            // Nếu hoàn thành 100%
            if (status === 'completed' || (progress_percent !== undefined && progress_percent >= 100)) {
                await NotificationEventService.emit('project.completed', {
                    project_id: id,
                    project_code: updatedRows[0]?.project_code || current.project_code,
                    project_name: updatedRows[0]?.project_name || current.project_name
                }, {
                    createdBy: req.user?.id,
                    entityType: 'project',
                    entityId: id
                });
            }
        }

        res.json({
            success: true,
            message: "Cập nhật dự án thành công",
            data: updatedRows[0] || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật dự án",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// DELETE project - CASCADE DELETE all related data
exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Tắt foreign key checks tạm thời để tránh lỗi constraint
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Check if project exists
        const [projectRows] = await connection.query(
            "SELECT id, project_code, project_name FROM projects WHERE id = ?",
            [id]
        );

        if (projectRows.length === 0) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const project = projectRows[0];
        console.log(`🗑️ Cascade deleting project: ${project.project_code} - ${project.project_name}`);

        // 1. Xóa door_bom_lines và door_bom_summary (BOM cửa)
        try {
            await connection.query(`
                DELETE FROM door_bom_lines 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM door_bom_summary 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted door BOM lines and summary');
        } catch (e) {
            console.log('  - No door_bom_lines/summary table');
        }

        // 2. Xóa door structure items và calculations
        try {
            await connection.query(`
                DELETE FROM door_structure_items 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM door_aluminum_calculations 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM door_glass_calculations 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted door structure and calculations');
        } catch (e) {
            console.log('  - No door structure/calculations tables');
        }

        // 3. Xóa cutting details và optimizations
        try {
            await connection.query(`
                DELETE FROM cutting_details 
                WHERE project_id = ?
            `, [id]);
            await connection.query(`
                DELETE FROM cutting_optimizations 
                WHERE project_id = ?
            `, [id]);
            await connection.query(`
                DELETE FROM door_cutting_plan 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted cutting details and optimizations');
        } catch (e) {
            console.log('  - No cutting tables');
        }

        // 4. Xóa BOM items của tất cả door_designs trong project
        await connection.query(`
            DELETE FROM bom_items 
            WHERE design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
        `, [id]);
        console.log('  ✓ Deleted BOM items');

        // 5. Xóa item_bom_lines và item_bom_versions
        try {
            await connection.query(`
                DELETE FROM item_bom_lines 
                WHERE project_id = ?
            `, [id]);
            await connection.query(`
                DELETE FROM item_bom_versions 
                WHERE project_id = ?
            `, [id]);
            console.log('  ✓ Deleted item BOM lines and versions');
        } catch (e) {
            console.log('  - No item_bom tables');
        }

        // 6. Xóa door_drawings của tất cả door_designs trong project
        await connection.query(`
            DELETE FROM door_drawings 
            WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
        `, [id]);
        console.log('  ✓ Deleted door drawings');

        // 7. Xóa door_designs
        await connection.query(
            "DELETE FROM door_designs WHERE project_id = ?",
            [id]
        );
        console.log('  ✓ Deleted door designs');

        // 8. Xóa quotation_items của tất cả quotations trong project
        await connection.query(`
            DELETE FROM quotation_items 
            WHERE quotation_id IN (SELECT id FROM quotations WHERE project_id = ?)
        `, [id]);
        console.log('  ✓ Deleted quotation items');

        // 9. Xóa quotations
        await connection.query(
            "DELETE FROM quotations WHERE project_id = ?",
            [id]
        );
        console.log('  ✓ Deleted quotations');

        // 10. Xóa production_order_bom và production_order_doors
        try {
            await connection.query(`
                DELETE FROM production_order_bom 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM production_order_doors 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted production order BOM and doors');
        } catch (e) {
            console.log('  - No production_order_bom/doors tables');
        }

        // 11. Xóa production_order_items của tất cả production_orders trong project
        try {
            await connection.query(`
                DELETE FROM production_order_items 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted production order items');
        } catch (e) {
            console.log('  - No production_order_items table or no items');
        }

        // 12. Xóa production_progress
        try {
            await connection.query(`
                DELETE FROM production_progress 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  ✓ Deleted production progress');
        } catch (e) {
            console.log('  - No production_progress table');
        }

        // 13. Xóa production_orders
        await connection.query(
            "DELETE FROM production_orders WHERE project_id = ?",
            [id]
        );
        console.log('  ✓ Deleted production orders');

        // 14. Xóa project_items (hạng mục dự án)
        try {
            await connection.query(
                "DELETE FROM project_items WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_items_v2 WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project items');
        } catch (e) {
            console.log('  - No project_items tables');
        }

        // 15. Xóa project_materials (vật tư dự án)
        try {
            await connection.query(
                "DELETE FROM project_materials WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project materials');
        } catch (e) {
            console.log('  - No project_materials table');
        }

        // 16. Xóa warehouse exports và items
        try {
            await connection.query(`
                DELETE FROM warehouse_export_items 
                WHERE export_id IN (SELECT id FROM warehouse_exports WHERE project_id = ?)
            `, [id]);
            await connection.query(
                "DELETE FROM warehouse_exports WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted warehouse exports');
        } catch (e) {
            console.log('  - No warehouse_exports tables');
        }

        // 17. Xóa project cutting và bóc tách
        try {
            await connection.query(
                "DELETE FROM project_cutting_details WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_cutting_optimization WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project cutting details');
        } catch (e) {
            console.log('  - No project_cutting tables');
        }

        // 18. Xóa project summaries (aluminum, glass, gaskets, accessories)
        try {
            await connection.query(
                "DELETE FROM project_aluminum_summary WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_glass_summary WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_gaskets_summary WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_accessories_summary WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project material summaries');
        } catch (e) {
            console.log('  - No project summary tables');
        }

        // 19. Xóa project finances và pricing
        try {
            await connection.query(
                "DELETE FROM project_finances WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_pricing WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project finances and pricing');
        } catch (e) {
            console.log('  - No project finances/pricing tables');
        }

        // 20. Xóa debts liên quan đến project
        try {
            await connection.query(
                "DELETE FROM debts WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted debts');
        } catch (e) {
            console.log('  - No debts table or error:', e.message);
        }

        // 21. Xóa commissions liên quan đến project
        try {
            await connection.query(
                "DELETE FROM commissions WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted commissions');
        } catch (e) {
            console.log('  - No commissions table or error:', e.message);
        }

        // 22. Xóa financial_transactions
        try {
            await connection.query(
                "DELETE FROM financial_transactions WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted financial transactions');
        } catch (e) {
            console.log('  - No financial_transactions table');
        }

        // 23. Xóa inventory_out và inventory_transactions liên quan đến project
        try {
            await connection.query(
                "DELETE FROM inventory_out WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM inventory_transactions WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted inventory records');
        } catch (e) {
            console.log('  - No inventory tables or error:', e.message);
        }

        // 24. Xóa project logs
        try {
            await connection.query(
                "DELETE FROM project_logs WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted project logs');
        } catch (e) {
            console.log('  - No project_logs table or error:', e.message);
        }

        // 25. Xóa projects_material_summary
        try {
            await connection.query(
                "DELETE FROM projects_material_summary WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted material summary');
        } catch (e) {
            console.log('  - No projects_material_summary table or error:', e.message);
        }

        // 26. Xóa design files
        try {
            await connection.query(
                "DELETE FROM design_files WHERE project_id = ?",
                [id]
            );
            console.log('  ✓ Deleted design files');
        } catch (e) {
            console.log('  - No design_files table or error:', e.message);
        }

        // 27. Cuối cùng, xóa project
        const [result] = await connection.query(
            "DELETE FROM projects WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        // Bật lại foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log(`✅ Project ${project.project_code} and all related data deleted successfully`);

        res.json({
            success: true,
            message: `Đã xóa dự án "${project.project_name}" và tất cả dữ liệu liên quan (báo giá, thiết kế, lệnh sản xuất, v.v.)`
        });
    } catch (err) {
        // Đảm bảo bật lại foreign key checks trước khi rollback
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            console.error('Error re-enabling foreign key checks:', e);
        }
        await connection.rollback();
        console.error('Error cascade deleting project:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa dự án: " + err.message,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        connection.release();
    }
};

// GET statistics
exports.getStatistics = async (req, res) => {
    try {
        // Tự động cập nhật progress_percent dựa trên status nếu progress_percent = 0 hoặc NULL
        await db.query(`
            UPDATE projects 
            SET progress_percent = CASE
                WHEN status = 'quotation_pending' OR status = 'waiting_quotation' THEN 10
                WHEN status = 'designing' THEN 25
                WHEN status = 'bom_extraction' OR status LIKE '%bom%' THEN 40
                WHEN status = 'in_production' OR status IN ('cutting', 'welding', 'gluing', 'accessories', 'finishing', 'packaging') THEN 60
                WHEN status = 'installation' THEN 85
                WHEN status = 'handover' THEN 95
                WHEN status = 'completed' THEN 100
                ELSE COALESCE(progress_percent, 0)
            END
            WHERE (progress_percent IS NULL OR progress_percent = 0)
              AND status IS NOT NULL
              AND status != ''
        `);

        // Get project statistics
        const [projectRows] = await db.query(`
            SELECT 
                COUNT(*) as total_projects,
                SUM(CASE WHEN status = 'quotation_pending' THEN 1 ELSE 0 END) as pending_quotations,
                SUM(CASE WHEN status IN ('in_production', 'cutting', 'welding', 'gluing', 'accessories', 'finishing', 'packaging', 'installation') THEN 1 ELSE 0 END) as in_production,
                SUM(CASE WHEN status = 'completed' OR progress_percent >= 100 THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status NOT IN ('completed') AND (progress_percent IS NULL OR progress_percent < 100) THEN 1 ELSE 0 END) as running_projects
            FROM projects
        `);

        // Get production orders count - bao gồm cả các dự án đã đến giai đoạn sản xuất
        const [orderRows] = await db.query(`
            SELECT COUNT(*) as total_orders
            FROM production_orders
            WHERE status IS NULL OR status = '' OR status NOT IN ('completed', 'cancelled', 'closed')
        `);

        // Đếm các dự án đã đến giai đoạn sản xuất (có thể chưa có production order)
        const [projectsInProduction] = await db.query(`
            SELECT COUNT(*) as count
            FROM projects
            WHERE status IN ('in_production', 'cutting', 'welding', 'gluing', 'accessories', 'finishing', 'packaging')
               OR (status = 'designing' AND progress_percent >= 40)
        `);

        const productionOrdersCount = Math.max(orderRows[0]?.total_orders || 0, projectsInProduction[0]?.count || 0);

        // Get pending quotations count (from quotations table)
        const [quotationRows] = await db.query(`
            SELECT COUNT(*) as pending_quotations_count
            FROM quotations
            WHERE status IN ('pending', 'sent')
        `);

        const stats = {
            ...projectRows[0],
            production_orders: productionOrdersCount,
            pending_quotations: quotationRows[0].pending_quotations_count || projectRows[0].pending_quotations || 0
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// GET door by ID
exports.getDoorById = async (req, res) => {
    try {
        const { id, doorId } = req.params;

        console.log('getDoorById called with projectId:', id, 'doorId:', doorId);

        const [rows] = await db.query(`
            SELECT 
                dd.*,
                dt.code AS template_code,
                dt.name AS template_name,
                dt.family AS template_family,
                dt.structure_json,
                a.brand,
                a.name AS aluminum_system_name,
                a.code AS aluminum_system_code
            FROM door_designs dd
            LEFT JOIN door_templates dt ON dd.template_id = dt.id
            LEFT JOIN aluminum_systems a ON dd.aluminum_system_id = a.id
            WHERE dd.id = ? AND dd.project_id = ?
        `, [doorId, id]);

        console.log('Query result:', rows.length, 'rows found');

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Không tìm thấy cửa với ID ${doorId} trong dự án ${id}`
            });
        }

        // Get door drawing if exists
        const [drawingRows] = await db.query(`
            SELECT * FROM door_drawings 
            WHERE door_design_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [doorId]);

        const door = rows[0];

        // Parse params_json
        if (door.params_json) {
            try {
                door.params_json = typeof door.params_json === 'string' ? JSON.parse(door.params_json) : door.params_json;
            } catch (e) {
                console.error('Error parsing params_json:', e);
                door.params_json = {};
            }
        } else {
            door.params_json = {};
        }

        // Parse structure_json from template
        if (door.structure_json) {
            try {
                door.structure_json = typeof door.structure_json === 'string' ? JSON.parse(door.structure_json) : door.structure_json;
            } catch (e) {
                console.error('Error parsing structure_json:', e);
            }
        }

        if (drawingRows.length > 0) {
            try {
                door.drawing_data = drawingRows[0].drawing_data ?
                    (typeof drawingRows[0].drawing_data === 'string' ? JSON.parse(drawingRows[0].drawing_data) : drawingRows[0].drawing_data) : null;
                door.calculated_dimensions = drawingRows[0].calculated_dimensions ?
                    (typeof drawingRows[0].calculated_dimensions === 'string' ? JSON.parse(drawingRows[0].calculated_dimensions) : drawingRows[0].calculated_dimensions) : null;
                door.image_data = drawingRows[0].image_data;
            } catch (e) {
                console.error('Error parsing drawing data:', e);
                door.drawing_data = null;
                door.calculated_dimensions = null;
            }
        }

        res.json({
            success: true,
            data: door
        });
    } catch (err) {
        console.error('Error getting door by ID:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET project doors
exports.getProjectDoors = async (req, res) => {
    try {
        const { id } = req.params;
        const { family } = req.query;

        let query = `
            SELECT 
                dd.*,
                dt.code AS template_code,
                dt.name AS template_name,
                dt.family AS template_family,
                a.brand,
                a.name AS aluminum_system_name,
                a.code AS aluminum_system_code
            FROM door_designs dd
            LEFT JOIN door_templates dt ON dd.template_id = dt.id
            LEFT JOIN aluminum_systems a ON dd.aluminum_system_id = a.id
            WHERE dd.project_id = ?
        `;
        const params = [id];

        if (family) {
            query += ` AND dt.family = ?`;
            params.push(family);
        }

        query += ` ORDER BY dd.created_at DESC`;

        const [rows] = await db.query(query, params);

        // Parse JSON fields
        const doors = rows.map(row => ({
            ...row,
            params_json: typeof row.params_json === 'string'
                ? JSON.parse(row.params_json)
                : row.params_json
        }));

        res.json({
            success: true,
            data: doors,
            count: doors.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// POST create door
exports.createDoor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            template_id,
            template_code,
            aluminum_system_id,
            door_type,
            color,
            width_mm,
            height_mm,
            params_json,
            number_of_panels,
            has_horizontal_mullion,
            formula_id
        } = req.body;

        // Validate required fields
        if (!aluminum_system_id || aluminum_system_id === '' || aluminum_system_id === '0') {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn hệ nhôm"
            });
        }
        if (!width_mm || width_mm < 300 || width_mm > 5000) {
            return res.status(400).json({
                success: false,
                message: "Chiều rộng phải từ 300 đến 5000mm"
            });
        }
        if (!height_mm || height_mm < 300 || height_mm > 5000) {
            return res.status(400).json({
                success: false,
                message: "Chiều cao phải từ 300 đến 5000mm"
            });
        }

        // Generate design code
        const [projectRows] = await db.query(
            "SELECT project_code FROM projects WHERE id = ?",
            [id]
        );
        const projectCode = projectRows[0]?.project_code || 'CT';
        const [doorCount] = await db.query(
            "SELECT COUNT(*) as count FROM door_designs WHERE project_id = ?",
            [id]
        );
        const designCode = `${projectCode}-C${String(doorCount[0].count + 1).padStart(3, '0')}`;

        const [result] = await db.query(
            `INSERT INTO door_designs 
            (project_id, template_id, template_code, design_code, door_type, aluminum_system_id, 
             color, width_mm, height_mm, params_json, number_of_panels, has_horizontal_mullion, formula_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                template_id || null,
                template_code || null,
                designCode,
                door_type || 'swing',
                aluminum_system_id,
                color || null,
                width_mm,
                height_mm,
                params_json ? JSON.stringify(params_json) : null,
                number_of_panels || 1,
                has_horizontal_mullion || false,
                formula_id || null
            ]
        );

        // Create log entry
        try {
            await db.query(
                `INSERT INTO project_logs (project_id, action_type, action_description, related_door_id)
                VALUES (?, 'door_added', ?, ?)`,
                [id, `Đã thêm cửa ${designCode} vào công trình`, result.insertId]
            );
        } catch (logErr) {
            console.error("Error creating log:", logErr);
        }

        // Tự động tính và lưu BOM (nếu có bản vẽ)
        try {
            const bomAutoSave = require("../services/bomAutoSave");
            // Tìm door_drawing_id nếu có
            const [drawingRows] = await db.query(
                "SELECT id FROM door_drawings WHERE door_design_id = ? ORDER BY created_at DESC LIMIT 1",
                [result.insertId]
            );
            if (drawingRows.length > 0) {
                await bomAutoSave.autoCalculateAndSaveBOM(result.insertId, id, drawingRows[0].id);
            }
        } catch (bomErr) {
            console.error("Error auto-calculating BOM:", bomErr);
            // Không throw để không làm gián đoạn việc tạo cửa
        }

        // Cập nhật giá trị công trình và bảng báo giá
        try {
            await updateProjectTotalValue(id);
        } catch (updateErr) {
            console.error("Error updating project total value:", updateErr);
            // Không throw để không làm gián đoạn việc tạo cửa
        }

        res.status(201).json({
            success: true,
            message: "Thêm cửa thành công",
            data: { id: result.insertId, design_code: designCode }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thêm cửa"
        });
    }
};

// PUT update door
exports.updateDoor = async (req, res) => {
    try {
        const { id, doorId } = req.params;
        const {
            aluminum_system_id,
            door_type,
            color,
            width_mm,
            height_mm,
            params_json,
            number_of_panels,
            has_horizontal_mullion,
            selling_price,
            unit_price_per_m2
        } = req.body;

        const updateFields = [];
        const params = [];

        if (aluminum_system_id !== undefined) {
            updateFields.push("aluminum_system_id = ?");
            params.push(aluminum_system_id);
        }
        if (door_type !== undefined) {
            updateFields.push("door_type = ?");
            params.push(door_type);
        }
        if (color !== undefined) {
            updateFields.push("color = ?");
            params.push(color);
        }
        if (width_mm !== undefined) {
            updateFields.push("width_mm = ?");
            params.push(width_mm);
        }
        if (height_mm !== undefined) {
            updateFields.push("height_mm = ?");
            params.push(height_mm);
        }
        if (params_json !== undefined) {
            updateFields.push("params_json = ?");
            params.push(JSON.stringify(params_json));
        }
        if (number_of_panels !== undefined) {
            updateFields.push("number_of_panels = ?");
            params.push(number_of_panels);
        }
        if (has_horizontal_mullion !== undefined) {
            updateFields.push("has_horizontal_mullion = ?");
            params.push(has_horizontal_mullion);
        }
        if (selling_price !== undefined) {
            updateFields.push("selling_price = ?");
            params.push(selling_price);
        }
        if (unit_price_per_m2 !== undefined) {
            updateFields.push("unit_price_per_m2 = ?");
            params.push(unit_price_per_m2);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        params.push(doorId, id);

        const [result] = await db.query(
            `UPDATE door_designs SET ${updateFields.join(", ")} 
            WHERE id = ? AND project_id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cửa"
            });
        }

        // Tự động tính lại BOM khi cửa được cập nhật
        try {
            const bomAutoSave = require("../services/bomAutoSave");
            // Tìm door_drawing_id nếu có
            const [drawingRows] = await db.query(
                "SELECT id FROM door_drawings WHERE door_design_id = ? ORDER BY created_at DESC LIMIT 1",
                [doorId]
            );
            if (drawingRows.length > 0) {
                await bomAutoSave.autoCalculateAndSaveBOM(doorId, id, drawingRows[0].id);
            }
        } catch (bomErr) {
            console.error("Error auto-calculating BOM:", bomErr);
            // Không throw để không làm gián đoạn việc cập nhật cửa
        }

        // Cập nhật giá trị công trình sau khi cập nhật cửa
        try {
            await updateProjectTotalValue(id);
        } catch (updateErr) {
            console.error("Error updating project total value:", updateErr);
            // Không throw để không làm gián đoạn việc cập nhật cửa
        }

        res.json({
            success: true,
            message: "Cập nhật cửa thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật cửa"
        });
    }
};

// DELETE door
exports.deleteDoor = async (req, res) => {
    try {
        const { id, doorId } = req.params;

        const [result] = await db.query(
            "DELETE FROM door_designs WHERE id = ? AND project_id = ?",
            [doorId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy cửa"
            });
        }

        // Cập nhật giá trị công trình sau khi xóa cửa
        try {
            await updateProjectTotalValue(id);
        } catch (updateErr) {
            console.error("Error updating project total value:", updateErr);
            // Không throw để không làm gián đoạn việc xóa cửa
        }

        res.json({
            success: true,
            message: "Xóa cửa thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa cửa"
        });
    }
};

// GET project logs
exports.getProjectLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT 
                pl.*,
                u.full_name AS created_by_name
            FROM project_logs pl
            LEFT JOIN users u ON pl.created_by = u.id
            WHERE pl.project_id = ?
            ORDER BY pl.created_at DESC
            LIMIT 100`,
            [id]
        );

        // If no logs found, return empty array (not an error)
        res.json({
            success: true,
            data: rows || [],
            count: rows ? rows.length : 0
        });
    } catch (err) {
        // If table doesn't exist, return empty array
        if (err.code === 'ER_NO_SUCH_TABLE') {
            return res.json({
                success: true,
                data: [],
                count: 0
            });
        }
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

/**
 * Helper function: Cập nhật giá trị công trình (total_value) 
 * Giá trị = Tổng giá trị từ báo giá (quotation)
 */
exports.updateProjectTotalValue = async function (projectId) {
    try {
        let totalValue = 0;

        // Lấy quotation của project (nếu có) - ưu tiên báo giá mới nhất
        const [quotationRows] = await db.query(
            `SELECT id, total_amount, subtotal
             FROM quotations 
             WHERE project_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [projectId]
        );

        // Tính tổng giá trị từ quotation_items (bảng giá) nếu có
        if (quotationRows.length > 0) {
            const quotation = quotationRows[0];

            // Lấy tổng từ quotation_items
            const [quotationItems] = await db.query(
                `SELECT SUM(total_price) as total 
                 FROM quotation_items 
                 WHERE quotation_id = ?`,
                [quotation.id]
            );

            if (quotationItems[0] && quotationItems[0].total !== null && quotationItems[0].total > 0) {
                // Dùng tổng từ quotation_items
                totalValue = parseFloat(quotationItems[0].total) || 0;
                console.log(`Project ${projectId} total value from quotation_items: ${totalValue}`);
            } else if (quotation.total_amount && quotation.total_amount > 0) {
                // Fallback: dùng total_amount
                totalValue = parseFloat(quotation.total_amount) || 0;
                console.log(`Project ${projectId} total value from quotation total_amount: ${totalValue}`);
            } else if (quotation.subtotal && quotation.subtotal > 0) {
                // Fallback: dùng subtotal
                totalValue = parseFloat(quotation.subtotal) || 0;
                console.log(`Project ${projectId} total value from quotation subtotal: ${totalValue}`);
            }
        }

        // Cập nhật total_value của project
        await db.query(
            `UPDATE projects 
             SET total_value = ? 
             WHERE id = ?`,
            [totalValue, projectId]
        );

        console.log(`Project ${projectId} total_value updated to: ${totalValue}`);

        return totalValue;
    } catch (err) {
        console.error('Error updating project total value:', err);
        throw err;
    }
}

/**
 * Tự động import door_designs từ báo giá của dự án
 * POST /api/projects/:id/auto-import-from-quotation
 * Khi chọn dự án, nếu chưa có door_designs, tự động tạo từ quotation_items
 */
exports.autoImportFromQuotation = async (req, res) => {
    try {
        const projectId = req.params.id;

        // 1. Kiểm tra xem project đã có door_designs chưa
        const [existingDesigns] = await db.query(
            `SELECT COUNT(*) as count FROM door_designs WHERE project_id = ?`,
            [projectId]
        );

        if (existingDesigns[0].count > 0) {
            // Đã có door_designs, không cần import
            return res.json({
                success: true,
                message: `Dự án đã có ${existingDesigns[0].count} hạng mục thiết kế`,
                data: {
                    already_imported: true,
                    count: existingDesigns[0].count
                }
            });
        }

        // 2. Lấy báo giá của dự án (ưu tiên báo giá approved, sau đó mới nhất)
        const [quotations] = await db.query(
            `SELECT id, quotation_code, status, total_amount, created_at
             FROM quotations 
             WHERE project_id = ? 
             ORDER BY 
                CASE WHEN status = 'approved' THEN 0 ELSE 1 END,
                created_at DESC 
             LIMIT 1`,
            [projectId]
        );

        if (quotations.length === 0) {
            return res.json({
                success: true,
                message: "Dự án chưa có báo giá. Vui lòng tạo báo giá trước.",
                data: { no_quotation: true }
            });
        }

        const quotation = quotations[0];

        // 3. Lấy quotation_items
        const [quotationItems] = await db.query(
            `SELECT * FROM quotation_items WHERE quotation_id = ?`,
            [quotation.id]
        );

        if (quotationItems.length === 0) {
            return res.json({
                success: true,
                message: "Báo giá không có sản phẩm nào",
                data: { no_items: true }
            });
        }

        // 4. Lấy project_code
        const [projectRows] = await db.query(
            `SELECT project_code FROM projects WHERE id = ?`,
            [projectId]
        );
        const projectCode = projectRows[0]?.project_code || `CT2025-${projectId}`;

        // 5. Tạo door_designs từ quotation_items
        let createdCount = 0;

        for (const item of quotationItems) {
            // Parse kích thước từ item_name (ví dụ: "Cửa đi 1 cánh mở ngoài (1200×2200mm)")
            const sizeMatch = item.item_name.match(/\((\d+)[×x](\d+)mm?\)/i);
            let width = 1200, height = 2200;
            if (sizeMatch) {
                width = parseInt(sizeMatch[1]) || 1200;
                height = parseInt(sizeMatch[2]) || 2200;
            }

            // Xác định loại cửa từ tên
            let doorType = 'swing';
            const itemNameLower = item.item_name.toLowerCase();
            if (itemNameLower.includes('trượt') || itemNameLower.includes('lùa')) {
                doorType = 'sliding';
            } else if (itemNameLower.includes('fix') || itemNameLower.includes('cố định')) {
                doorType = 'fixed';
            } else if (itemNameLower.includes('xếp')) {
                doorType = 'folding';
            }

            // Xác định template_code từ tên
            let templateCode = 'door_swing';
            if (itemNameLower.includes('sổ') || itemNameLower.includes('cửa sổ')) {
                templateCode = itemNameLower.includes('lùa') ? 'window_sliding' : 'window_swing';
            } else if (itemNameLower.includes('lùa') || itemNameLower.includes('trượt')) {
                templateCode = 'door_sliding';
            } else if (itemNameLower.includes('vách') || itemNameLower.includes('kính')) {
                templateCode = 'glass_wall';
            } else if (itemNameLower.includes('cầu thang') || itemNameLower.includes('tay vịn') || itemNameLower.includes('lan can')) {
                templateCode = 'railing';
            }

            // Tạo số lượng door_designs theo quantity trong báo giá
            const quantity = parseInt(item.quantity) || 1;
            for (let q = 0; q < quantity; q++) {
                const designIndex = createdCount + 1;
                const designCode = `${projectCode}-C${String(designIndex).padStart(3, '0')}`;

                await db.query(`
                    INSERT INTO door_designs 
                    (project_id, design_code, door_type, aluminum_system_id, 
                     width_mm, height_mm, number_of_panels, template_code)
                    VALUES (?, ?, ?, 1, ?, ?, 1, ?)
                `, [
                    projectId,
                    designCode,
                    doorType,
                    width,
                    height,
                    templateCode
                ]);

                createdCount++;
            }
        }

        console.log(`✅ Auto-imported ${createdCount} door_designs từ báo giá ${quotation.quotation_code} cho project ${projectId}`);

        res.json({
            success: true,
            message: `Đã tự động import ${createdCount} hạng mục từ báo giá ${quotation.quotation_code || 'BG-' + quotation.id}`,
            data: {
                quotation_id: quotation.id,
                quotation_code: quotation.quotation_code,
                items_created: createdCount
            }
        });

    } catch (err) {
        console.error('Error auto-importing from quotation:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi import từ báo giá: " + err.message
        });
    }
};

/**
 * Import door_designs từ một báo giá cụ thể (do user chọn)
 * POST /api/projects/:id/doors/from-quotation
 * Body: { quotation_id: number }
 */
exports.importDoorsFromQuotation = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { quotation_id } = req.body;

        if (!quotation_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp quotation_id"
            });
        }

        // 1. Kiểm tra báo giá tồn tại
        const [quotations] = await db.query(
            `SELECT id, quotation_code, project_id, status FROM quotations WHERE id = ?`,
            [quotation_id]
        );

        if (quotations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        const quotation = quotations[0];

        // Kiểm tra quotation thuộc project này (nếu có project_id)
        if (quotation.project_id && quotation.project_id != projectId) {
            return res.status(400).json({
                success: false,
                message: "Báo giá này không thuộc dự án này"
            });
        }

        // 2. Lấy quotation_items
        const [quotationItems] = await db.query(
            `SELECT * FROM quotation_items WHERE quotation_id = ?`,
            [quotation_id]
        );

        if (quotationItems.length === 0) {
            return res.json({
                success: true,
                message: "Báo giá không có sản phẩm nào",
                data: { items_created: 0 }
            });
        }

        // 3. Đếm door_designs hiện có để tạo design_code
        const [existingDesigns] = await db.query(
            `SELECT COUNT(*) as count FROM door_designs WHERE project_id = ?`,
            [projectId]
        );
        let existingCount = existingDesigns[0].count || 0;

        // 4. Lấy project_code
        const [projectRows] = await db.query(
            `SELECT project_code FROM projects WHERE id = ?`,
            [projectId]
        );
        const projectCode = projectRows[0]?.project_code || `CT2025-${projectId}`;

        // 5. Tạo door_designs từ quotation_items
        let createdCount = 0;

        for (const item of quotationItems) {
            // Parse kích thước từ item_name (ví dụ: "Cửa đi 1 cánh mở ngoài (1200×2200mm)")
            const sizeMatch = item.item_name.match(/\((\d+)[×x](\d+)mm?\)/i);
            let width = 1200, height = 2200;
            if (sizeMatch) {
                width = parseInt(sizeMatch[1]) || 1200;
                height = parseInt(sizeMatch[2]) || 2200;
            }

            // Xác định loại cửa từ tên
            let doorType = 'swing';
            const itemNameLower = item.item_name.toLowerCase();
            if (itemNameLower.includes('trượt') || itemNameLower.includes('lùa')) {
                doorType = 'sliding';
            } else if (itemNameLower.includes('fix') || itemNameLower.includes('cố định')) {
                doorType = 'fixed';
            } else if (itemNameLower.includes('xếp')) {
                doorType = 'folding';
            }

            // Xác định template_code từ tên
            let templateCode = 'door_swing';
            if (itemNameLower.includes('sổ') || itemNameLower.includes('cửa sổ')) {
                templateCode = itemNameLower.includes('lùa') ? 'window_sliding' : 'window_swing';
            } else if (itemNameLower.includes('lùa') || itemNameLower.includes('trượt')) {
                templateCode = 'door_sliding';
            } else if (itemNameLower.includes('vách') || itemNameLower.includes('kính')) {
                templateCode = 'glass_wall';
            } else if (itemNameLower.includes('cầu thang') || itemNameLower.includes('tay vịn') || itemNameLower.includes('lan can')) {
                templateCode = 'railing';
            }

            // Tạo số lượng door_designs theo quantity trong báo giá
            const quantity = parseInt(item.quantity) || 1;
            for (let q = 0; q < quantity; q++) {
                existingCount++;
                const designCode = `${projectCode}-C${String(existingCount).padStart(3, '0')}`;

                await db.query(`
                    INSERT INTO door_designs 
                    (project_id, design_code, door_type, aluminum_system_id, 
                     width_mm, height_mm, number_of_panels, template_code)
                    VALUES (?, ?, ?, 1, ?, ?, 1, ?)
                `, [
                    projectId,
                    designCode,
                    doorType,
                    width,
                    height,
                    templateCode
                ]);

                createdCount++;
            }
        }

        console.log(`✅ Imported ${createdCount} door_designs từ báo giá ${quotation.quotation_code} cho project ${projectId}`);

        res.json({
            success: true,
            message: `Đã import ${createdCount} hạng mục từ báo giá`,
            data: {
                quotation_id: quotation_id,
                quotation_code: quotation.quotation_code,
                items_created: createdCount
            }
        });

    } catch (err) {
        console.error('Error importing doors from quotation:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi import từ báo giá: " + err.message
        });
    }
};

/**
 * Lấy danh sách sản phẩm từ báo giá để hiển thị ở Bước 2
 * GET /api/projects/:id/quotation-items-for-design
 * Trả về: quotation_items + trạng thái thiết kế (chưa TK / đã TK / đã bóc tách)
 */
exports.getQuotationItemsForDesign = async (req, res) => {
    try {
        const projectId = req.params.id;

        // 1. Lấy báo giá đã approved của project (hoặc mới nhất)
        const [quotations] = await db.query(
            `SELECT id, quotation_code, status, total_amount, created_at
             FROM quotations 
             WHERE project_id = ? 
             ORDER BY 
                CASE WHEN status = 'approved' THEN 0 ELSE 1 END,
                created_at DESC 
             LIMIT 1`,
            [projectId]
        );

        if (quotations.length === 0) {
            return res.json({
                success: true,
                message: "Dự án chưa có báo giá",
                data: { items: [], quotation: null }
            });
        }

        const quotation = quotations[0];

        // 2. Lấy quotation_items - columns thực tế trong DB
        // LƯU Ý: Đọc đúng các cột color, aluminum_system, location từ DB
        const [quotationItems] = await db.query(
            `SELECT 
                qi.id,
                qi.id as quotation_item_id,
                qi.quotation_id,
                qi.item_name,
                qi.code as product_code,
                qi.quantity,
                qi.unit,
                qi.unit_price,
                qi.total_price,
                qi.item_type,
                qi.color,
                qi.glass as glass_type,
                qi.accessories,
                qi.aluminum_system,
                qi.width,
                qi.height,
                qi.area,
                qi.location,
                '' as notes
             FROM quotation_items qi
             WHERE qi.quotation_id = ?
             ORDER BY qi.id`,
            [quotation.id]
        );

        // 3. Lấy project_items đã tạo từ quotation_items này
        const [projectItems] = await db.query(
            `SELECT 
                id, 
                source_quotation_item_id, 
                status
             FROM project_items 
             WHERE project_id = ? AND source_quotation_id = ?`,
            [projectId, quotation.id]
        );

        // Map để tra cứu nhanh
        const projectItemMap = {};
        projectItems.forEach(pi => {
            projectItemMap[pi.source_quotation_item_id] = pi;
        });

        // 4. Gắn thêm thông tin thiết kế vào quotation_items
        const itemsWithDesignStatus = quotationItems.map(qi => {
            const pi = projectItemMap[qi.id];

            // Parse kích thước từ item_name nếu không có trong columns
            let width = qi.width;
            let height = qi.height;
            if (!width || !height) {
                const sizeMatch = (qi.item_name || '').match(/\((\d+)[×x](\d+)mm?\)/i);
                if (sizeMatch) {
                    width = parseInt(sizeMatch[1]);
                    height = parseInt(sizeMatch[2]);
                }
            }

            // Xác định loại sản phẩm
            let productType = 'door';
            const nameLower = (qi.item_name || '').toLowerCase();
            if (nameLower.includes('vách') || nameLower.includes('kính cố định')) {
                productType = 'glass_wall';
            } else if (nameLower.includes('lan can') || nameLower.includes('cầu thang') || nameLower.includes('tay vịn')) {
                productType = 'railing';
            } else if (nameLower.includes('cửa sổ') || nameLower.includes('sổ')) {
                productType = 'window';
            } else if (nameLower.includes('mái') || nameLower.includes('giếng trời')) {
                productType = 'roof';
            }

            return {
                ...qi,
                width: width,
                height: height,
                color: qi.spec || null,
                glass_type: qi.glass || null,
                aluminum_system: qi.accessories || null,
                product_type: productType,
                project_item_id: pi ? pi.id : null,
                design_status: pi ? pi.status : 'NOT_STARTED',
                design_status_label: pi
                    ? (pi.status === 'DESIGNING' ? 'Đang thiết kế'
                        : pi.status === 'DESIGN_CONFIRMED' ? 'Đã thiết kế'
                            : pi.status === 'BOM_EXTRACTED' ? 'Đã bóc tách'
                                : pi.status)
                    : 'Chưa thiết kế'
            };
        });

        res.json({
            success: true,
            data: {
                quotation: {
                    id: quotation.id,
                    code: quotation.quotation_code,
                    status: quotation.status,
                    total_amount: quotation.total_amount
                },
                items: itemsWithDesignStatus,
                summary: {
                    total_items: itemsWithDesignStatus.length,
                    total_quantity: itemsWithDesignStatus.reduce((sum, i) => sum + (parseInt(i.quantity) || 1), 0),
                    not_started: itemsWithDesignStatus.filter(i => i.design_status === 'NOT_STARTED').length,
                    designing: itemsWithDesignStatus.filter(i => i.design_status === 'DESIGNING').length,
                    confirmed: itemsWithDesignStatus.filter(i => i.design_status === 'DESIGN_CONFIRMED').length,
                    bom_extracted: itemsWithDesignStatus.filter(i => i.design_status === 'BOM_EXTRACTED').length
                }
            }
        });

    } catch (err) {
        console.error('Error getting quotation items for design:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi: " + err.message
        });
    }
};

/**
 * Tạo project_item + snapshot từ quotation_item khi user click vào card
 * POST /api/projects/:id/design-items
 * Body: { quotation_item_id: number }
 */
exports.createDesignItemFromQuotation = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { quotation_item_id } = req.body;

        if (!quotation_item_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp quotation_item_id"
            });
        }

        // 1. Kiểm tra đã có project_item chưa
        const [existing] = await db.query(
            `SELECT id, status FROM project_items 
             WHERE project_id = ? AND source_quotation_item_id = ?`,
            [projectId, quotation_item_id]
        );

        if (existing.length > 0) {
            // Đã có, trả về project_item_id hiện tại
            return res.json({
                success: true,
                message: "Hạng mục đã được khởi tạo trước đó",
                data: {
                    project_item_id: existing[0].id,
                    status: existing[0].status,
                    already_exists: true
                }
            });
        }

        // 2. Lấy thông tin quotation_item
        const [qItems] = await db.query(
            `SELECT qi.*, q.id as quotation_id, q.created_at as quotation_date
             FROM quotation_items qi
             JOIN quotations q ON qi.quotation_id = q.id
             WHERE qi.id = ?`,
            [quotation_item_id]
        );

        if (qItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm trong báo giá"
            });
        }

        const qItem = qItems[0];

        // 3. Parse kích thước từ item_name
        const sizeMatch = qItem.item_name.match(/\((\d+)[×x](\d+)mm?\)/i);
        let width = 1200, height = 2200;
        if (sizeMatch) {
            width = parseInt(sizeMatch[1]) || 1200;
            height = parseInt(sizeMatch[2]) || 2200;
        }

        // 4. Tạo snapshot_config (đóng băng dữ liệu từ báo giá)
        const snapshotConfig = {
            source: 'quotation',
            quotation_date: qItem.quotation_date,
            original_item_name: qItem.item_name,
            original_description: qItem.description,
            original_unit_price: qItem.unit_price,
            original_total_price: qItem.total_price,
            original_quantity: qItem.quantity,
            size: {
                w: width,
                h: height,
                unit: 'mm'
            },
            open_direction: 'left',
            open_style: 'swing',
            leaf_count: 1,
            aluminum_system: 'XINGFA_55',
            glass: {
                type: 'tempered',
                thickness_mm: 8
            },
            color: 'white',
            notes: qItem.description || ''
        };

        // 5. Tìm product_template phù hợp hoặc dùng mặc định
        let productTemplateId = 1; // Default template ID
        try {
            // Thử tìm template phù hợp dựa trên tên sản phẩm
            const itemNameLower = qItem.item_name.toLowerCase();
            let productType = 'door_swing'; // Default

            if (itemNameLower.includes('cửa sổ') || itemNameLower.includes('cua so')) {
                productType = 'window';
            } else if (itemNameLower.includes('lùa') || itemNameLower.includes('lua') || itemNameLower.includes('trượt')) {
                productType = 'door_sliding';
            }

            const [templates] = await db.query(
                `SELECT id FROM product_templates WHERE product_type = ? AND is_active = 1 LIMIT 1`,
                [productType]
            );

            if (templates.length > 0) {
                productTemplateId = templates[0].id;
            }
        } catch (err) {
            console.log('Using default product_template_id:', productTemplateId);
        }

        // 6. Tạo project_item
        const [result] = await db.query(`
            INSERT INTO project_items 
            (project_id, product_template_id, quantity, snapshot_config, 
             source_quotation_id, source_quotation_item_id, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, 'DESIGNING', ?)
        `, [
            projectId,
            productTemplateId,
            qItem.quantity || 1,
            JSON.stringify(snapshotConfig),
            qItem.quotation_id,
            quotation_item_id,
            qItem.description || qItem.item_name
        ]);

        console.log(`✅ Created project_item ${result.insertId} from quotation_item ${quotation_item_id}`);

        res.status(201).json({
            success: true,
            message: "Đã khởi tạo hạng mục thiết kế",
            data: {
                project_item_id: result.insertId,
                status: 'DESIGNING',
                snapshot_config: snapshotConfig
            }
        });

    } catch (err) {
        console.error('Error creating design item:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi: " + err.message
        });
    }
};

/**
 * =====================================================
 * GET /api/projects/:projectId/items/:itemId/bom-detail
 * Lấy chi tiết BOM cho Modal chi tiết sản phẩm (6 tabs)
 * =====================================================
 */
exports.getProjectItemBOMDetail = async (req, res) => {
    try {
        const { projectId, itemId } = req.params;

        // 1. Lấy thông tin project_item và snapshot_config
        const [itemRows] = await db.query(`
            SELECT 
                pi.*,
                pt.code AS template_code,
                pt.name AS template_name,
                pt.product_type,
                p.project_name,
                p.project_code,
                c.full_name AS customer_name
            FROM project_items pi
            LEFT JOIN product_templates pt ON pi.product_template_id = pt.id
            LEFT JOIN projects p ON pi.project_id = p.id
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE pi.id = ? AND pi.project_id = ?
        `, [itemId, projectId]);

        if (itemRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy hạng mục"
            });
        }

        const item = itemRows[0];
        let snapshotConfig = {};
        try {
            snapshotConfig = typeof item.snapshot_config === 'string'
                ? JSON.parse(item.snapshot_config)
                : (item.snapshot_config || {});
        } catch (e) {
            snapshotConfig = {};
        }

        // Lấy kích thước từ snapshot
        const width = snapshotConfig.size?.w || 1200;
        const height = snapshotConfig.size?.h || 2200;
        const leafCount = snapshotConfig.leaf_count || 1;
        const quantity = item.quantity || 1;


        // 2. Lấy BOM Profiles từ atc_product_bom_profiles
        const [bomProfiles] = await db.query(`
            SELECT 
                pbp.*,
                ap.code AS profile_code,
                ap.name AS profile_name,
                ap.price_per_m,
                ap.role AS profile_role
            FROM atc_product_bom_profiles pbp
            JOIN atc_aluminum_profiles ap ON pbp.profile_id = ap.id
            WHERE pbp.product_template_id = ?
            ORDER BY pbp.sort_order
        `, [item.product_template_id]);

        // 3. Tính KT Cắt (Nhôm) dựa trên formulas
        const aluminumCuts = [];
        let totalAluminumLength = 0;
        let totalAluminumWeight = 0;

        for (const bom of bomProfiles) {
            // Parse formula: H, W, W/2, H-50, etc.
            let cutLength = 0;
            const formula = bom.formula || 'H';

            if (formula === 'H') cutLength = height;
            else if (formula === 'W') cutLength = width;
            else if (formula === 'W/2') cutLength = Math.round(width / 2);
            else if (formula === 'H-50') cutLength = height - 50;
            else if (formula === 'W-50') cutLength = width - 50;
            else if (formula === 'H-100') cutLength = height - 100;
            else if (formula === 'W-100') cutLength = width - 100;
            else {
                // Thử parse formula phức tạp hơn
                try {
                    cutLength = eval(formula.replace(/H/g, height).replace(/W/g, width));
                } catch (e) {
                    cutLength = height;
                }
            }

            const qty = bom.quantity || 1;
            const wasteFactor = 1 + (bom.waste_percent || 2) / 100;
            const finalLength = Math.round(cutLength * wasteFactor);
            const lengthM = finalLength / 1000;
            const weightKg = lengthM * (bom.weight_per_m || 0.5) * qty;

            totalAluminumLength += lengthM * qty;
            totalAluminumWeight += weightKg;

            // Xác định vị trí và góc cắt
            let position = 'Ngang';
            let cutAngle = '90-90';
            if (bom.profile_role?.includes('dung') || formula === 'H' || formula.includes('H-')) {
                position = 'Đứng';
                cutAngle = '90-45-90';
            } else if (formula === 'W' || formula.includes('W')) {
                position = 'Ngang';
                cutAngle = '45-45';
            }

            aluminumCuts.push({
                name: bom.profile_name || 'Thanh nhôm',
                position: position,
                code: bom.profile_code || 'AL',
                cut_angle: cutAngle,
                qty: qty,
                length: finalLength,
                weight_kg: parseFloat(weightKg.toFixed(3)),
                price_per_m: bom.price_per_m || 0
            });
        }

        // Nếu không có BOM profiles, tạo mặc định
        if (aluminumCuts.length === 0) {
            aluminumCuts.push(
                { name: 'Khung bao đứng', position: 'Đứng', code: 'XF55_KB', cut_angle: '90-45-90', qty: 2, length: height, weight_kg: (height / 1000) * 0.5 * 2, price_per_m: 45000 },
                { name: 'Khung bao ngang', position: 'Ngang', code: 'XF55_KB', cut_angle: '45-45', qty: 2, length: width, weight_kg: (width / 1000) * 0.5 * 2, price_per_m: 45000 },
                { name: 'Cánh đứng', position: 'Đứng', code: 'XF55_CD', cut_angle: '45-45', qty: 2 * leafCount, length: height - 100, weight_kg: ((height - 100) / 1000) * 0.5 * 2 * leafCount, price_per_m: 50000 },
                { name: 'Cánh ngang', position: 'Ngang', code: 'XF55_CD', cut_angle: '45-45', qty: 2 * leafCount, length: Math.round((width - 50) / leafCount), weight_kg: (((width - 50) / leafCount) / 1000) * 0.5 * 2 * leafCount, price_per_m: 50000 }
            );
            totalAluminumWeight = aluminumCuts.reduce((sum, a) => sum + a.weight_kg, 0);
        }

        // 4. Tính KT Kính
        const glassWidth = Math.round((width - 100) / leafCount);
        const glassHeight1 = Math.round(height * 0.5);
        const glassHeight2 = Math.round(height * 0.35);
        const glassHeight3 = 328;

        const glassPanels = [
            { name: snapshotConfig.glass?.type || 'Kính cường lực 8mm', width: glassWidth, height: glassHeight1, qty: 2 * leafCount, position: 'Cánh trên' },
            { name: snapshotConfig.glass?.type || 'Kính cường lực 8mm', width: glassWidth, height: glassHeight2, qty: 2 * leafCount, position: 'Cánh dưới' }
        ];

        if (height > 2500) {
            glassPanels.push({ name: snapshotConfig.glass?.type || 'Kính cường lực 8mm', width: width - 100, height: glassHeight3, qty: 2, position: 'Vách' });
        }

        let totalGlassArea = 0;
        glassPanels.forEach(g => {
            g.area = parseFloat(((g.width * g.height * g.qty) / 1000000).toFixed(6));
            totalGlassArea += g.area;
        });

        // 5. Lấy Phụ kiện từ atc_product_accessory_rules
        const productType = item.product_type || 'door';
        const [accessoryRules] = await db.query(`
            SELECT 
                par.*,
                a.code AS accessory_code,
                a.name AS accessory_name,
                a.unit
            FROM atc_product_accessory_rules par
            JOIN accessories a ON par.accessory_id = a.id
            WHERE par.product_type = ? OR par.product_type = 'all'
        `, [productType]);

        const hardware = [];
        let totalHardwareCost = 0;

        for (const rule of accessoryRules) {
            let qty = rule.default_qty || 1;

            // Parse quantity_rule
            if (rule.quantity_rule === '3_per_leaf') qty = 3 * leafCount;
            else if (rule.quantity_rule === '2_per_leaf') qty = 2 * leafCount;
            else if (rule.quantity_rule === '1_per_leaf') qty = leafCount;
            else if (rule.quantity_rule === '1_per_door') qty = 1;
            else if (rule.quantity_rule?.includes('per_meter')) {
                const perimeter = 2 * (width + height) / 1000;
                qty = Math.ceil(perimeter);
            }

            const price = rule.unit_price || 0;
            const total = price * qty;
            totalHardwareCost += total;

            hardware.push({
                name: rule.accessory_name,
                code: rule.accessory_code,
                unit: rule.unit || 'Cái',
                qty: qty,
                price: price,
                total: total
            });
        }

        // Nếu không có rules, dùng mặc định
        if (hardware.length === 0) {
            hardware.push(
                { name: 'Bản lề 3D', code: 'BANLE3D', unit: 'Bộ', qty: 3 * leafCount, price: 150000, total: 150000 * 3 * leafCount },
                { name: 'Khóa đa điểm', code: 'KHOA_DD', unit: 'Bộ', qty: 1, price: 850000, total: 850000 },
                { name: 'Tay nắm cửa', code: 'TAY_NAM', unit: 'Cái', qty: leafCount, price: 250000, total: 250000 * leafCount }
            );
            totalHardwareCost = hardware.reduce((sum, h) => sum + h.total, 0);
        }

        // 6. Gioăng, Keo (consumables)
        const perimeter = 2 * (width + height) / 1000;
        const consumables = [
            { name: 'Gioăng kính mặt trong', code: 'GKMT', unit: 'm', qty: parseFloat((perimeter * 2).toFixed(2)), price: 5000 },
            { name: 'Keo kính mặt ngoài', code: 'KKMN', unit: 'm', qty: parseFloat((perimeter * 2).toFixed(2)), price: 8000 },
            { name: 'Keo tường - 2 mặt', code: 'KT2M', unit: 'm', qty: parseFloat(perimeter.toFixed(2)), price: 12000 },
            { name: 'Gioăng khung - cánh', code: 'GKK', unit: 'm', qty: parseFloat((perimeter * 1.5).toFixed(2)), price: 6000 },
            { name: 'Vít nở lắp đặt', code: 'VNLD', unit: 'Cái', qty: Math.ceil(perimeter * 2), price: 2000 }
        ];
        const totalConsumablesCost = consumables.reduce((sum, c) => sum + c.qty * c.price, 0);


        // 7. Lấy giá từ database (nếu có)
        let aluminumPricePerKg = 90000;
        let glassPricePerM2 = 245000;

        try {
            const [priceSettings] = await db.query(`
                SELECT * FROM price_settings WHERE is_active = 1 LIMIT 1
            `);
            if (priceSettings && priceSettings.length > 0) {
                aluminumPricePerKg = priceSettings[0].aluminum_price_per_kg || 90000;
                glassPricePerM2 = priceSettings[0].glass_price_per_m2 || 245000;
            }
        } catch (e) {
            // Bảng price_settings không tồn tại, dùng giá mặc định
            console.log('Using default prices (price_settings table not found)');
        }

        // 8. Tính giá thành
        const costAluminum = Math.round(totalAluminumWeight * aluminumPricePerKg);
        const costGlass = Math.round(totalGlassArea * glassPricePerM2);
        const totalCost = costAluminum + costGlass + totalHardwareCost + totalConsumablesCost;

        // 9. Trả về response
        res.json({
            success: true,
            data: {
                // Thông tin chung
                item_id: item.id,
                item_name: snapshotConfig.original_item_name || item.notes || item.template_name || 'Sản phẩm',
                project_name: item.project_name,
                customer_name: item.customer_name,
                door_code: `D${item.id}`,

                // Tab 1: Kích thước
                dimensions: {
                    width: width,
                    height: height,
                    h1: snapshotConfig.h1 || Math.round(height * 0.85),
                    gap_sash: snapshotConfig.gap_sash || 7,
                    glass_type: snapshotConfig.glass?.type || 'Kính cường lực 8mm',
                    glass_thickness: snapshotConfig.glass?.thickness_mm || 8,
                    quantity: quantity,
                    leaf_count: leafCount,
                    aluminum_system: snapshotConfig.aluminum_system || 'XINGFA_55',
                    aluminum_price_per_kg: aluminumPricePerKg,
                    glass_price_per_m2: glassPricePerM2
                },

                // Tab 2: KT Cắt (Nhôm)
                aluminum: aluminumCuts,

                // Tab 3: KT Kính
                glass: {
                    panels: glassPanels,
                    total_area_m2: parseFloat(totalGlassArea.toFixed(3))
                },

                // Tab 4: Phụ kiện
                hardware: hardware,

                // Tab 5: Gioăng, Keo
                consumables: consumables,

                // Tab 6: Giá thành
                cost: {
                    aluminum_kg: parseFloat(totalAluminumWeight.toFixed(2)),
                    aluminum_cost: costAluminum,
                    glass_m2: parseFloat(totalGlassArea.toFixed(2)),
                    glass_cost: costGlass,
                    hardware_count: hardware.reduce((sum, h) => sum + h.qty, 0),
                    hardware_cost: totalHardwareCost,
                    consumables_cost: totalConsumablesCost,
                    total_cost: totalCost,
                    cost_per_unit: Math.round(totalCost / quantity)
                }
            }
        });

    } catch (err) {
        console.error('Error getting BOM detail:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi: " + err.message
        });
    }
};
