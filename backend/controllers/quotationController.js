const db = require("../config/db");
const NotificationService = require("../services/notificationService");
const NotificationEventService = require("../services/notificationEventService");

// GET all quotations
exports.getAllQuotations = async (req, res) => {
    try {
        const { status, customer_id, search } = req.query;

        let query = `
            SELECT 
                q.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                p.project_name,
                COUNT(qi.id) as item_count
            FROM quotations q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN projects p ON q.project_id = p.id
            LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
        `;
        let conditions = [];
        let params = [];

        if (status && status !== 'all') {
            conditions.push("q.status = ?");
            params.push(status);
        }

        if (customer_id) {
            conditions.push("q.customer_id = ?");
            params.push(customer_id);
        }

        if (search) {
            conditions.push("(q.quotation_code LIKE ? OR c.full_name LIKE ? OR p.project_name LIKE ?)");
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " GROUP BY q.id ORDER BY q.created_at DESC";

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

// GET by ID (with items)
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get quotation
        const [quotationRows] = await db.query(
            `SELECT 
                q.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                c.address AS customer_address,
                c.tax_code AS customer_tax_code,
                p.project_name,
                p.project_code
            FROM quotations q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN projects p ON q.project_id = p.id
            WHERE q.id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        // Get items
        const [itemRows] = await db.query(
            "SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY id",
            [id]
        );

        const quotation = quotationRows[0];
        quotation.items = itemRows;

        res.json({
            success: true,
            data: quotation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

exports.create = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const {
            customer_id, project_id, quotation_date, validity_days, status,
            profit_margin_percent, items, notes, advance_amount,
            version, parent_quotation_id, creator_name,
            discount_percent, vat_percent, shipping_fee, total_amount: clientTotalAmount
        } = req.body;

        console.log('Creating quotation with data:', { customer_id, project_id, items_count: items?.length, version, parent_quotation_id });

        // Validation - chỉ yêu cầu customer_id
        if (!customer_id) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn khách hàng"
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Vui lòng thêm ít nhất một mục vào báo giá"
            });
        }

        // Tự động tạo mã báo giá VRBG*** hoặc sử dụng mã từ request
        let quotation_code = req.body.quotation_code;

        if (!quotation_code) {
            // Generate VRBG code
            const [maxRows] = await connection.query(
                `SELECT MAX(CAST(SUBSTRING(quotation_code, 5) AS UNSIGNED)) as max_num 
                 FROM quotations 
                 WHERE quotation_code LIKE 'VRBG%'`,
                []
            );
            const maxNum = (maxRows[0]?.max_num || 0) + 1;
            quotation_code = `VRBG${String(maxNum).padStart(3, '0')}`;
        }

        // If project_id exists, update project code to VRBG***
        if (project_id && quotation_code.startsWith('VRBG')) {
            try {
                await connection.query(
                    `UPDATE projects SET project_code = ? WHERE id = ?`,
                    [quotation_code, project_id]
                );
                console.log(`Updated project ${project_id} code to ${quotation_code}`);
            } catch (updateErr) {
                console.error("Error updating project code:", updateErr);
                // Continue even if update fails
            }
        }

        // Tính tổng tiền từ items
        let subtotal = 0;
        for (const item of items) {
            const itemTotal = parseFloat(item.total_price || item.total || 0);
            if (!isNaN(itemTotal)) {
                subtotal += itemTotal;
            }
        }

        const profit_margin = parseFloat(profit_margin_percent) || 0;
        const profit_amount = (subtotal * profit_margin) / 100;

        // Sử dụng total_amount từ client nếu có, nếu không thì tính
        const total_amount = clientTotalAmount || (subtotal + profit_amount);
        const advance = parseFloat(advance_amount) || Math.round(subtotal * 0.3);

        // Xử lý ngày báo giá
        let quotDate = quotation_date;
        if (!quotDate) {
            quotDate = new Date().toISOString().split('T')[0];
        }

        console.log('Calculated values:', { subtotal, profit_amount, total_amount, advance, quotation_code, version });

        // INSERT vào bảng quotations - bao gồm version và parent_quotation_id
        const insertQuery = `INSERT INTO quotations 
             (quotation_code, project_id, customer_id, quotation_date, validity_days, 
              status, subtotal, profit_margin_percent, profit_amount, total_amount, notes, advance_amount,
              version, parent_quotation_id, creator_name, discount_percent, vat_percent, shipping_fee) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const insertValues = [
            quotation_code,
            project_id || null,
            parseInt(customer_id),
            quotDate,
            parseInt(validity_days) || 30,
            status || 'draft',
            subtotal,
            profit_margin,
            profit_amount,
            total_amount,
            notes || null,
            advance,
            parseInt(version) || 1,
            parent_quotation_id || null,
            creator_name || null,
            parseFloat(discount_percent) || 0,
            parseFloat(vat_percent) || 10,
            parseFloat(shipping_fee) || 0
        ];

        // Update project code to VRBG*** BEFORE inserting quotation
        if (project_id && quotation_code.startsWith('VRBG')) {
            try {
                await connection.query(
                    `UPDATE projects SET project_code = ? WHERE id = ?`,
                    [quotation_code, project_id]
                );
                console.log(`Updated project ${project_id} code to ${quotation_code}`);
            } catch (updateErr) {
                console.error("Error updating project code:", updateErr);
                // Continue even if update fails
            }
        }

        console.log('Insert query values:', insertValues);

        const [result] = await connection.query(insertQuery, insertValues);
        const quotation_id = result.insertId;

        console.log('Quotation created with ID:', quotation_id);

        // Thêm chi tiết báo giá
        for (const item of items) {
            const itemName = (item.item_name || item.description || '').toString().trim();
            const quantity = parseFloat(item.quantity) || 0;
            const unit = (item.unit || 'bộ').toString().trim();
            const unitPrice = parseFloat(item.unit_price) || 0;
            const totalPrice = parseFloat(item.total_price || item.total || 0);
            const itemType = item.item_type || 'material';

            // Debug log - xem dữ liệu item nhận được
            console.log('Processing item:', {
                itemName, quantity, unit, unitPrice, totalPrice,
                code: item.code,
                spec: item.spec,
                glass: item.glass,
                accessories: item.accessories,
                width: item.width,
                height: item.height,
                area: item.area,
                accessory_price: item.accessory_price
            });

            if (!itemName || quantity <= 0) {
                console.warn('Skipping invalid item:', item);
                continue;
            }

            await connection.query(
                `INSERT INTO quotation_items 
                 (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type, code, spec, glass, accessories, width, height, area, accessory_price) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    quotation_id,
                    itemName,
                    quantity,
                    unit,
                    unitPrice,
                    totalPrice,
                    itemType,
                    item.code || null,
                    item.spec || null,
                    item.glass || null,
                    item.accessories || null,
                    parseFloat(item.width) || 0,
                    parseFloat(item.height) || 0,
                    parseFloat(item.area) || 0,
                    parseFloat(item.accessory_price) || 0
                ]
            );
        }

        console.log('Quotation items inserted');

        // Cập nhật trạng thái dự án nếu có (TRƯỚC khi commit vì cùng transaction)
        if (project_id) {
            try {
                // Khi có báo giá: waiting_quotation
                // Khi báo giá approved: chuyển sang designing (Thiết kế) - KHÔNG PHẢI in_production
                let projectStatus = 'waiting_quotation';
                if (status === 'approved') {
                    projectStatus = 'designing'; // Chuyển sang Thiết kế sau khi báo giá được duyệt
                }

                await connection.query(
                    `UPDATE projects SET status = ? WHERE id = ?`,
                    [projectStatus, project_id]
                );
            } catch (updateErr) {
                console.error("Error updating project status:", updateErr);
                // Không throw - không làm gián đoạn việc tạo báo giá
            }
        }

        await connection.commit();
        connection.release();

        console.log('Quotation created successfully:', quotation_id);

        // Cập nhật total_value SAU KHI COMMIT để đảm bảo quotation_items đã được lưu
        if (project_id) {
            try {
                const projectCtrl = require("./projectController");
                if (projectCtrl.updateProjectTotalValue) {
                    await projectCtrl.updateProjectTotalValue(project_id);
                    console.log('Project total value updated for project_id:', project_id);
                }
            } catch (e) {
                console.warn('Could not update project total value:', e.message);
            }
        }

        // Tạo thông báo báo giá mới (Event-based)
        try {
            const [customerInfo] = await db.query(
                "SELECT full_name FROM customers WHERE id = ?",
                [customer_id]
            );
            await NotificationEventService.emit('quotation.created', {
                quotation_id: quotation_id,
                quotation_code: quotation_code,
                customer_name: customerInfo[0]?.full_name || 'N/A',
                customer_id: customer_id,
                project_id: project_id || null,
                total_amount: total_amount
            }, {
                createdBy: req.user?.id,
                entityType: 'quotation',
                entityId: quotation_id
            });
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: "Tạo báo giá thành công",
            data: {
                id: quotation_id,
                quotation_code,
                version: parseInt(version) || 1,
                parent_quotation_id: parent_quotation_id || null
            }
        });
    } catch (err) {
        console.error('Error creating quotation:', err);
        console.error('Error stack:', err.stack);

        if (connection) {
            try {
                await connection.rollback();
                connection.release();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }
        }

        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo báo giá: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// POST create quotation from project
exports.createFromProject = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { project_id } = req.body;

        if (!project_id) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp project_id"
            });
        }

        // Get project information
        const [projectRows] = await connection.query(
            `SELECT p.*, c.id AS customer_id, c.full_name AS customer_name
             FROM projects p
             LEFT JOIN customers c ON p.customer_id = c.id
             WHERE p.id = ?`,
            [project_id]
        );

        if (projectRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const project = projectRows[0];

        if (!project.customer_id) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Dự án chưa có khách hàng. Vui lòng cập nhật thông tin khách hàng cho dự án trước."
            });
        }

        // Check if project already has a quotation
        const [existingQuotations] = await connection.query(
            `SELECT id, quotation_code FROM quotations WHERE project_id = ?`,
            [project_id]
        );

        if (existingQuotations.length > 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: `Dự án đã có báo giá: ${existingQuotations[0].quotation_code}`,
                data: { quotation_id: existingQuotations[0].id, quotation_code: existingQuotations[0].quotation_code }
            });
        }

        // Generate quotation code
        const year = new Date().getFullYear();
        const prefix = `BG-${year}-`;
        const [maxRows] = await connection.query(
            `SELECT MAX(CAST(SUBSTRING_INDEX(quotation_code, '-', -1) AS UNSIGNED)) as max_num 
             FROM quotations 
             WHERE quotation_code LIKE ?`,
            [`${prefix}%`]
        );
        const maxNum = (maxRows[0]?.max_num || 0) + 1;
        const quotation_code = `${prefix}${String(maxNum).padStart(4, '0')}`;

        // Create quotation with default values
        const quotation_date = new Date().toISOString().split('T')[0];
        const validity_days = 30;
        const status = 'draft';
        const subtotal = 0;
        const profit_margin_percent = 0;
        const profit_amount = 0;
        const total_amount = 0;
        const advance_amount = 0;

        const [result] = await connection.query(
            `INSERT INTO quotations 
             (quotation_code, project_id, customer_id, quotation_date, validity_days, 
              status, subtotal, profit_margin_percent, profit_amount, total_amount, notes, advance_amount) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quotation_code,
                project_id,
                project.customer_id,
                quotation_date,
                validity_days,
                status,
                subtotal,
                profit_margin_percent,
                profit_amount,
                total_amount,
                `Báo giá cho dự án: ${project.project_name || project.project_code}`,
                advance_amount
            ]
        );

        const quotation_id = result.insertId;

        // Update project status
        try {
            await connection.query(
                `UPDATE projects SET status = 'waiting_quotation' WHERE id = ?`,
                [project_id]
            );
        } catch (updateErr) {
            console.error("Error updating project status:", updateErr);
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            success: true,
            message: "Tạo báo giá thành công",
            data: {
                id: quotation_id,
                quotation_code,
                project_id: parseInt(project_id),
                customer_id: project.customer_id
            }
        });
    } catch (err) {
        console.error('Error creating quotation from project:', err);

        if (connection) {
            try {
                await connection.rollback();
                connection.release();
            } catch (rollbackErr) {
                console.error('Rollback error:', rollbackErr);
            }
        }

        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo báo giá: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// PUT update
exports.update = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { customer_id, project_id, quotation_date, validity_days, status, profit_margin_percent, items, notes, quotation_code } = req.body;

        // Tính lại tổng tiền
        let subtotal = 0;
        if (items && Array.isArray(items)) {
            items.forEach(item => {
                subtotal += parseFloat(item.total_price) || 0;
            });
        }

        const profit_margin = profit_margin_percent || 20;
        const profit_amount = (subtotal * profit_margin) / 100;
        const total_amount = subtotal + profit_amount;

        // Cập nhật báo giá
        const updateFields = [];
        const updateValues = [];

        if (quotation_code) {
            updateFields.push('quotation_code = ?');
            updateValues.push(quotation_code);

            // Update project code if quotation_code starts with VRBG
            if (project_id && quotation_code.startsWith('VRBG')) {
                try {
                    await connection.query(
                        `UPDATE projects SET project_code = ? WHERE id = ?`,
                        [quotation_code, project_id]
                    );
                } catch (updateErr) {
                    console.error("Error updating project code:", updateErr);
                }
            }
        }

        updateFields.push('customer_id = ?');
        updateValues.push(customer_id);
        updateFields.push('project_id = ?');
        updateValues.push(project_id || null);
        updateFields.push('quotation_date = ?');
        updateValues.push(quotation_date);
        updateFields.push('validity_days = ?');
        updateValues.push(validity_days);
        updateFields.push('status = ?');
        updateValues.push(status);
        updateFields.push('subtotal = ?');
        updateValues.push(subtotal);
        updateFields.push('profit_margin_percent = ?');
        updateValues.push(profit_margin);
        updateFields.push('profit_amount = ?');
        updateValues.push(profit_amount);
        updateFields.push('total_amount = ?');
        updateValues.push(total_amount);
        updateFields.push('notes = ?');
        updateValues.push(notes || null);
        updateValues.push(id);

        const [result] = await connection.query(
            `UPDATE quotations 
             SET ${updateFields.join(', ')} 
             WHERE id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        // Xóa chi tiết cũ
        await connection.query("DELETE FROM quotation_items WHERE quotation_id = ?", [id]);

        // Thêm chi tiết mới
        if (items && Array.isArray(items)) {
            for (const item of items) {
                await connection.query(
                    `INSERT INTO quotation_items 
                     (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type, code, spec, glass, accessories, width, height, area, accessory_price) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        item.item_name,
                        item.quantity,
                        item.unit,
                        item.unit_price,
                        item.total_price,
                        item.item_type || 'material',
                        item.code || null,
                        item.spec || null,
                        item.glass || null,
                        item.accessories || null,
                        parseFloat(item.width) || 0,
                        parseFloat(item.height) || 0,
                        parseFloat(item.area) || 0,
                        parseFloat(item.accessory_price) || 0
                    ]
                );
            }
        }

        await connection.commit();
        connection.release();

        // Cập nhật giá trị công trình sau khi cập nhật báo giá
        if (project_id) {
            try {
                const projectCtrl = require("./projectController");
                // Gọi hàm helper để cập nhật total_value
                await projectCtrl.updateProjectTotalValue(project_id);
            } catch (updateErr) {
                console.error("Error updating project total value:", updateErr);
                // Không throw để không làm gián đoạn việc cập nhật báo giá
            }
        }

        res.json({
            success: true,
            message: "Cập nhật báo giá thành công"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật báo giá"
        });
    }
};

// PUT update status only
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Get current quotation info
        const [quotationRows] = await db.query(
            `SELECT q.*, c.full_name AS customer_name 
             FROM quotations q
             LEFT JOIN customers c ON q.customer_id = c.id
             WHERE q.id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        const quotation = quotationRows[0];

        const oldStatus = quotation.status;

        const [result] = await db.query(
            "UPDATE quotations SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        // Tạo thông báo khi status thay đổi
        try {
            if (status === 'approved' && oldStatus !== 'approved') {
                await NotificationEventService.emit('quotation.approved', {
                    quotation_id: id,
                    quotation_code: quotation.quotation_code,
                    customer_name: quotation.customer_name || 'N/A',
                    customer_id: quotation.customer_id,
                    project_id: quotation.project_id,
                    total_amount: quotation.total_amount
                }, {
                    createdBy: req.user?.id,
                    entityType: 'quotation',
                    entityId: id
                });
            } else if (status === 'sent' && oldStatus !== 'sent') {
                await NotificationEventService.emit('quotation.submitted', {
                    quotation_id: id,
                    quotation_code: quotation.quotation_code,
                    customer_name: quotation.customer_name || 'N/A',
                    customer_id: quotation.customer_id
                }, {
                    createdBy: req.user?.id,
                    entityType: 'quotation',
                    entityId: id
                });
            }
        } catch (notifErr) {
            console.error('Error creating notification:', notifErr);
        }

        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái"
        });
    }
};

// DELETE
exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Xóa chi tiết
        await connection.query("DELETE FROM quotation_items WHERE quotation_id = ?", [id]);

        // Xóa báo giá
        const [result] = await connection.query("DELETE FROM quotations WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Xóa báo giá thành công"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa báo giá"
        });
    }
};

// GET statistics
exports.getStatistics = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draft,
                COALESCE(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END), 0) as sent,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
                COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END), 0) as total_revenue
            FROM quotations
        `);

        // Đảm bảo tất cả giá trị là số, không phải NULL
        const stats = rows[0] || {};
        const data = {
            total: parseInt(stats.total) || 0,
            draft: parseInt(stats.draft) || 0,
            sent: parseInt(stats.sent) || 0,
            pending: parseInt(stats.pending) || 0,
            approved: parseInt(stats.approved) || 0,
            rejected: parseInt(stats.rejected) || 0,
            total_revenue: parseFloat(stats.total_revenue) || 0
        };

        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        console.error('Error getting quotation statistics:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// GET pending quotations with stats
exports.getPendingQuotations = async (req, res) => {
    try {
        // Get all draft, pending, sent, and revision_requested quotations
        // Exclude approved and contract_signed (already finalized)
        const [quotations] = await db.query(`
            SELECT 
                q.*,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                p.project_name,
                DATEDIFF(NOW(), q.quotation_date) as days_pending
            FROM quotations q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN projects p ON q.project_id = p.id
            WHERE q.status IN ('draft', 'pending', 'sent', 'revision_requested')
            ORDER BY q.quotation_date DESC
        `);

        // Calculate statistics
        const totalPending = quotations.length;
        const totalValue = quotations.reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0);
        const overdue7Days = quotations.filter(q => (q.days_pending || 0) > 7).length;
        const correctionRequests = quotations.filter(q => q.status === 'revision_requested' || (q.notes && q.notes.toLowerCase().includes('sửa'))).length;

        res.json({
            success: true,
            data: quotations,
            stats: {
                totalPending,
                totalValue,
                overdue7Days,
                correctionRequests
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// POST send reminder
exports.sendReminder = async (req, res) => {
    try {
        const { id } = req.params;

        // Get quotation
        const [rows] = await db.query(
            "SELECT * FROM quotations WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        // TODO: Implement actual email sending logic here
        // For now, just return success

        res.json({
            success: true,
            message: "Đã gửi email nhắc nhở thành công"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi gửi email nhắc nhở"
        });
    }
};

// POST create new version (V1 → V2, V2 → V3, etc.)
exports.createNewVersion = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { id } = req.params; // Original quotation ID

        // Get original quotation
        const [quotationRows] = await connection.query(
            `SELECT * FROM quotations WHERE id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        const originalQuotation = quotationRows[0];

        // Get original items
        const [itemRows] = await connection.query(
            `SELECT * FROM quotation_items WHERE quotation_id = ? ORDER BY id`,
            [id]
        );

        // Generate new quotation code with version
        const year = new Date().getFullYear();
        const prefix = `BG-${year}-`;

        // Extract version from original code or default to V1
        let version = 1;
        const versionMatch = originalQuotation.quotation_code.match(/V(\d+)$/);
        if (versionMatch) {
            version = parseInt(versionMatch[1]) + 1;
        } else {
            // Check if there are other versions
            const [versionRows] = await connection.query(
                `SELECT quotation_code FROM quotations 
                 WHERE project_id = ? AND id != ? 
                 ORDER BY created_at DESC LIMIT 1`,
                [originalQuotation.project_id, id]
            );
            if (versionRows.length > 0) {
                const versionMatch2 = versionRows[0].quotation_code.match(/V(\d+)$/);
                if (versionMatch2) {
                    version = parseInt(versionMatch2[1]) + 1;
                }
            }
        }

        // Generate new quotation code
        const [maxRows] = await connection.query(
            `SELECT MAX(CAST(SUBSTRING_INDEX(quotation_code, '-', -1) AS UNSIGNED)) as max_num 
             FROM quotations 
             WHERE quotation_code LIKE ?`,
            [`${prefix}%`]
        );
        const maxNum = (maxRows[0]?.max_num || 0) + 1;
        const newQuotationCode = `${prefix}${String(maxNum).padStart(4, '0')}V${version}`;

        // Create new quotation (copy from original)
        const [result] = await connection.query(
            `INSERT INTO quotations 
             (quotation_code, project_id, customer_id, quotation_date, validity_days, 
              status, subtotal, profit_margin_percent, profit_amount, total_amount, notes, advance_amount, parent_quotation_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newQuotationCode,
                originalQuotation.project_id,
                originalQuotation.customer_id,
                new Date().toISOString().split('T')[0],
                originalQuotation.validity_days,
                'draft', // New version starts as draft
                originalQuotation.subtotal,
                originalQuotation.profit_margin_percent,
                originalQuotation.profit_amount,
                originalQuotation.total_amount,
                originalQuotation.notes ? `${originalQuotation.notes} (Bản sao từ ${originalQuotation.quotation_code})` : `Bản sao từ ${originalQuotation.quotation_code}`,
                originalQuotation.advance_amount,
                id // Link to parent quotation
            ]
        );

        const newQuotationId = result.insertId;

        // Copy items
        for (const item of itemRows) {
            await connection.query(
                `INSERT INTO quotation_items 
                 (quotation_id, item_name, quantity, unit, unit_price, total_price, item_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    newQuotationId,
                    item.item_name,
                    item.quantity,
                    item.unit,
                    item.unit_price,
                    item.total_price,
                    item.item_type
                ]
            );
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: `Đã tạo báo giá version ${version} thành công`,
            data: {
                id: newQuotationId,
                quotation_code: newQuotationCode,
                version: version
            }
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error creating new version:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo version mới: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// POST sign contract (Convert VRBG → VR)
exports.signContract = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { id } = req.params; // Quotation ID

        // Get quotation
        const [quotationRows] = await connection.query(
            `SELECT q.*, p.project_code, p.id as project_id FROM quotations q
             LEFT JOIN projects p ON q.project_id = p.id
             WHERE q.id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy báo giá"
            });
        }

        const quotation = quotationRows[0];

        if (!quotation.project_id) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Báo giá chưa gắn với dự án. Vui lòng gắn dự án trước khi chốt hợp đồng."
            });
        }

        // Check if quotation is approved
        if (quotation.status !== 'approved') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể chốt hợp đồng khi báo giá đã được chốt (Approved)"
            });
        }

        // Convert project code from VRBG*** to VR***
        const projectCode = quotation.project_code;
        let newProjectCode = projectCode;

        if (projectCode && projectCode.startsWith('VRBG')) {
            // Extract number from VRBG001 -> 001, then create VR001
            const number = projectCode.replace('VRBG', '');
            newProjectCode = `VR${number}`;
        } else if (projectCode && !projectCode.startsWith('VR')) {
            // If project code doesn't start with VR, extract number and add VR prefix
            const numberMatch = projectCode.match(/(\d+)$/);
            if (numberMatch) {
                newProjectCode = `VR${numberMatch[1]}`;
            } else {
                newProjectCode = `VR${projectCode}`;
            }
        }

        // Update project code
        await connection.query(
            `UPDATE projects SET project_code = ? WHERE id = ?`,
            [newProjectCode, quotation.project_id]
        );

        // Mark quotation as contract signed
        await connection.query(
            `UPDATE quotations SET status = 'contract_signed' WHERE id = ?`,
            [id]
        );

        // Update project status to 'designing' and set contract_locked = 1
        await connection.query(
            `UPDATE projects SET status = 'designing', contract_locked = 1 WHERE id = ?`,
            [quotation.project_id]
        );

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Đã chốt hợp đồng thành công",
            data: {
                quotation_id: id,
                old_project_code: projectCode,
                new_project_code: newProjectCode,
                project_id: quotation.project_id
            }
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Error signing contract:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi khi chốt hợp đồng: " + (err.message || 'Lỗi không xác định')
        });
    }
};

// ========================================
// QUOTATION ITEMS CRUD
// ========================================

/**
 * POST /api/quotations/:id/items
 * Tạo quotation item mới
 */
exports.addQuotationItem = async (req, res) => {
    try {
        const quotationId = req.params.id;
        const {
            item_name,
            product_code,
            color,
            glass_type,
            accessories,
            aluminum_system,
            quantity,
            location,
            notes,
            unit_price,
            product_type
        } = req.body;

        // Insert item với tất cả các trường
        const [result] = await db.query(
            `INSERT INTO quotation_items (
                quotation_id, 
                item_name, 
                code,
                color,
                glass,
                accessories,
                aluminum_system,
                quantity, 
                location,
                unit,
                unit_price,
                total_price,
                item_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quotationId,
                item_name || '',
                product_code || '',
                color || '',
                glass_type || '',
                accessories || '',
                aluminum_system || '',
                quantity || 1,
                location || '',
                'bộ',
                unit_price || 0,
                (quantity || 1) * (unit_price || 0),
                product_type || 'door'
            ]
        );

        res.json({
            success: true,
            message: 'Đã thêm sản phẩm thành công',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error adding quotation item:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sản phẩm: ' + err.message
        });
    }
};

/**
 * PUT /api/quotations/items/:itemId
 * Cập nhật quotation item
 */
exports.updateQuotationItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const {
            item_name,
            product_code,
            color,
            glass_type,
            accessories,
            aluminum_system,
            quantity,
            location,
            notes,
            spec  // Thêm spec nếu frontend gửi
        } = req.body;

        console.log('📝 updateQuotationItem - Received data:', {
            itemId,
            item_name,
            product_code,
            color,
            glass_type,
            accessories,
            aluminum_system,
            quantity,
            location
        });

        // Kiểm tra và thêm các cột nếu chưa tồn tại (MySQL không hỗ trợ IF NOT EXISTS cho ADD COLUMN)
        const columnsToAdd = [
            { name: 'color', type: 'VARCHAR(50) DEFAULT NULL' },
            { name: 'aluminum_system', type: 'VARCHAR(100) DEFAULT NULL' },
            { name: 'location', type: 'VARCHAR(255) DEFAULT NULL' }
        ];

        // Kiểm tra cột có tồn tại không
        const [existingColumns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'quotation_items'
        `);
        const existingColumnNames = existingColumns.map(row => row.COLUMN_NAME);

        for (const col of columnsToAdd) {
            if (!existingColumnNames.includes(col.name)) {
                try {
                    await db.query(`ALTER TABLE quotation_items ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`✅ Added column ${col.name} to quotation_items`);
                } catch (e) {
                    console.error(`❌ Error adding column ${col.name}:`, e.message);
                    // Tiếp tục dù có lỗi, có thể cột đã tồn tại
                }
            } else {
                console.log(`✓ Column ${col.name} already exists`);
            }
        }

        // Bây giờ cập nhật tất cả các trường
        let updateQuery = `UPDATE quotation_items SET
            item_name = ?,
            code = ?,
            quantity = ?`;

        let updateParams = [
            item_name || '',
            product_code || '',
            quantity || 1
        ];

        // Thêm các cột mở rộng
        const additionalFields = [];

        additionalFields.push('glass = ?');
        updateParams.push(glass_type || '');

        additionalFields.push('accessories = ?');
        updateParams.push(accessories || '');

        additionalFields.push('color = ?');
        updateParams.push(color || '');

        additionalFields.push('aluminum_system = ?');
        updateParams.push(aluminum_system || '');

        additionalFields.push('location = ?');
        updateParams.push(location || '');

        if (spec) {
            additionalFields.push('spec = ?');
            updateParams.push(spec || '');
        }

        // Thêm các trường bổ sung vào query
        if (additionalFields.length > 0) {
            updateQuery += ', ' + additionalFields.join(', ');
        }

        updateQuery += ' WHERE id = ?';
        updateParams.push(itemId);

        console.log('📤 Executing query:', updateQuery);
        console.log('📤 With params:', updateParams);

        // Update tất cả các trường
        await db.query(updateQuery, updateParams);

        console.log('✅ Successfully updated quotation item:', itemId);

        res.json({
            success: true,
            message: 'Đã cập nhật sản phẩm thành công'
        });
    } catch (err) {
        console.error('❌ Error updating quotation item:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm: ' + err.message
        });
    }
};

/**
 * DELETE /api/quotations/items/:itemId
 * Xóa quotation item
 */
exports.deleteQuotationItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        await db.query('DELETE FROM quotation_items WHERE id = ?', [itemId]);

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm thành công'
        });
    } catch (err) {
        console.error('Error deleting quotation item:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm: ' + err.message
        });
    }
};



