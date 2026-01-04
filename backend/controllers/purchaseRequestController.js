const db = require("../config/db");

/**
 * Controller quản lý phiếu yêu cầu vật tư
 */

// Auto-migrate: Tạo bảng purchase_requests nếu chưa tồn tại
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS purchase_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã phiếu yêu cầu',
                project_id INT NULL COMMENT 'ID dự án',
                project_name VARCHAR(255) NULL COMMENT 'Tên dự án',
                order_code VARCHAR(100) NULL COMMENT 'Mã đơn hàng',
                product_type VARCHAR(100) NULL COMMENT 'Chủng loại',
                color VARCHAR(100) NULL COMMENT 'Màu sắc',
                delivery_address TEXT NULL COMMENT 'Địa chỉ giao hàng',
                created_date DATE NULL COMMENT 'Ngày tạo',
                required_date DATE NULL COMMENT 'Ngày cần vật tư về',
                nhom_data JSON NULL COMMENT 'Dữ liệu nhôm',
                vattu_data JSON NULL COMMENT 'Dữ liệu vật tư phụ',
                phukien_data JSON NULL COMMENT 'Dữ liệu phụ kiện',
                kinh_data JSON NULL COMMENT 'Dữ liệu kính',
                status ENUM('draft', 'submitted', 'approved', 'rejected', 'completed') DEFAULT 'draft',
                notes TEXT NULL,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_request_code (request_code),
                INDEX idx_project_id (project_id),
                INDEX idx_status (status),
                INDEX idx_created_date (created_date),
                INDEX idx_required_date (required_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Bảng purchase_requests đã sẵn sàng');
    } catch (err) {
        console.error('❌ Lỗi tạo bảng purchase_requests:', err.message);
    }
})();

// Tạo mã phiếu tự động
async function generateRequestCode() {
    const date = new Date();
    const dateStr = date.getFullYear().toString().substring(2) +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');

    // Tìm số thứ tự cuối cùng trong ngày
    const [rows] = await db.query(
        `SELECT COUNT(*) as count FROM purchase_requests 
         WHERE request_code LIKE ?`,
        [`YC-${dateStr}-%`]
    );

    const sequence = (rows[0].count || 0) + 1;
    return `YC-${dateStr}-${sequence.toString().padStart(3, '0')}`;
}

// GET /api/purchase-requests - Lấy danh sách phiếu yêu cầu
exports.getAll = async (req, res) => {
    try {
        const { status, project_id, search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let params = [];

        if (status) {
            whereConditions.push('pr.status = ?');
            params.push(status);
        }

        if (project_id) {
            whereConditions.push('pr.project_id = ?');
            params.push(project_id);
        }

        if (search) {
            whereConditions.push('(pr.request_code LIKE ? OR pr.project_name LIKE ? OR pr.order_code LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Lấy tổng số
        const [countRows] = await db.query(
            `SELECT COUNT(*) as total FROM purchase_requests pr ${whereClause}`,
            params
        );
        const total = countRows[0].total;

        // Lấy dữ liệu
        const [rows] = await db.query(
            `SELECT pr.*, 
                    u.full_name as created_by_name,
                    p.project_code, p.project_name as project_name_full
             FROM purchase_requests pr
             LEFT JOIN users u ON pr.created_by = u.id
             LEFT JOIN projects p ON pr.project_id = p.id
             ${whereClause}
             ORDER BY pr.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        // Calculate item_count for each request
        const requestsWithCount = rows.map(request => {
            let itemCount = 0;
            try {
                if (request.nhom_data) {
                    const nhom = typeof request.nhom_data === 'string' ? JSON.parse(request.nhom_data) : request.nhom_data;
                    if (Array.isArray(nhom)) itemCount += nhom.length;
                }
                if (request.kinh_data) {
                    const kinh = typeof request.kinh_data === 'string' ? JSON.parse(request.kinh_data) : request.kinh_data;
                    if (Array.isArray(kinh)) itemCount += kinh.length;
                }
                if (request.phukien_data) {
                    const phukien = typeof request.phukien_data === 'string' ? JSON.parse(request.phukien_data) : request.phukien_data;
                    if (Array.isArray(phukien)) itemCount += phukien.length;
                }
                if (request.vattu_data) {
                    const vattu = typeof request.vattu_data === 'string' ? JSON.parse(request.vattu_data) : request.vattu_data;
                    if (Array.isArray(vattu)) itemCount += vattu.length;
                }
            } catch (e) {
                console.error('Error counting items:', e);
            }
            return { ...request, item_count: itemCount };
        });

        res.json({
            success: true,
            data: requestsWithCount,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error getting purchase requests:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// GET /api/purchase-requests/:id - Lấy chi tiết phiếu yêu cầu
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `SELECT pr.*, 
                    u.full_name as created_by_name,
                    p.project_code, p.project_name as project_name_full
             FROM purchase_requests pr
             LEFT JOIN users u ON pr.created_by = u.id
             LEFT JOIN projects p ON pr.project_id = p.id
             WHERE pr.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phiếu yêu cầu" });
        }

        // Parse JSON data
        const request = rows[0];
        try {
            if (request.nhom_data && typeof request.nhom_data === 'string') {
                request.nhom_data = JSON.parse(request.nhom_data);
            }
            if (request.vattu_data && typeof request.vattu_data === 'string') {
                request.vattu_data = JSON.parse(request.vattu_data);
            }
            if (request.phukien_data && typeof request.phukien_data === 'string') {
                request.phukien_data = JSON.parse(request.phukien_data);
            }
            if (request.kinh_data && typeof request.kinh_data === 'string') {
                request.kinh_data = JSON.parse(request.kinh_data);
            }
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            // Set to empty arrays if parse fails
            request.nhom_data = [];
            request.vattu_data = [];
            request.phukien_data = [];
            request.kinh_data = [];
        }

        // Convert JSON data to items array for frontend
        const items = [];

        // Add nhom items
        if (request.nhom_data && Array.isArray(request.nhom_data)) {
            request.nhom_data.forEach(item => {
                items.push({
                    material_type: 'nhom',
                    material_code: item.code || item.material_code || '',
                    material_name: item.name || item.material_name || '',
                    unit: item.unit || '',
                    quantity: item.quantity || 0,
                    density: item.density || item.tỷ_trọng || '',
                    length_m: item.length_m || item.met || item.length || '',
                    weight: item.weight || item.khối_lượng || '',
                    notes: item.notes || item.ghi_chú || ''
                });
            });
        }

        // Add kinh items
        if (request.kinh_data && Array.isArray(request.kinh_data)) {
            request.kinh_data.forEach(item => {
                items.push({
                    material_type: 'kinh',
                    material_code: item.code || item.material_code || '',
                    material_name: item.name || item.material_name || item.loại_kính || '',
                    unit: item.unit || '',
                    quantity: item.quantity || 0,
                    width: item.width || item.rộng || item.width_mm || '',
                    height: item.height || item.cao || item.height_mm || '',
                    panels: item.panels || item.số_tấm || item.quantity || '',
                    area: item.area || item.diện_tích || item.area_m2 || '',
                    notes: item.notes || item.ghi_chú || ''
                });
            });
        }

        // Add phukien items
        if (request.phukien_data && Array.isArray(request.phukien_data)) {
            request.phukien_data.forEach(item => {
                items.push({
                    material_type: 'phukien',
                    material_code: item.code || item.material_code || '',
                    material_name: item.name || item.material_name || '',
                    unit: item.unit || '',
                    quantity: item.quantity || 0,
                    notes: item.notes || item.ghi_chú || ''
                });
            });
        }

        // Add vattu items
        if (request.vattu_data && Array.isArray(request.vattu_data)) {
            request.vattu_data.forEach(item => {
                items.push({
                    material_type: 'vattu',
                    material_code: item.code || item.material_code || '',
                    material_name: item.name || item.material_name || '',
                    unit: item.unit || '',
                    quantity: item.quantity || 0,
                    notes: item.notes || item.ghi_chú || ''
                });
            });
        }

        // Add items array to request
        request.items = items;
        request.item_count = items.length;

        // Determine category
        if (!request.category) {
            if (items.length > 0) {
                const types = [...new Set(items.map(i => i.material_type))];
                if (types.length === 1) {
                    request.category = types[0];
                } else {
                    request.category = 'all';
                }
            } else {
                request.category = 'all';
            }
        }

        res.json({ success: true, data: request });
    } catch (err) {
        console.error('Error getting purchase request:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// POST /api/purchase-requests - Tạo phiếu yêu cầu mới
exports.create = async (req, res) => {
    try {
        const {
            project_id,
            project_name,
            order_code,
            product_type,
            color,
            delivery_address,
            created_date,
            required_date,
            nhom,
            vattu,
            phukien,
            kinh,
            notes,
            status = 'draft'
        } = req.body;

        const userId = req.user?.id || null;
        const request_code = await generateRequestCode();

        // Ensure created_date is set
        const finalCreatedDate = created_date || new Date().toISOString().split('T')[0];

        // DETAILED LOGGING for debugging
        console.log('📥 RECEIVED req.body:', JSON.stringify(req.body, null, 2));
        console.log('📋 nhom from body:', nhom);
        console.log('📋 nhom type:', typeof nhom);
        console.log('📋 nhom is array:', Array.isArray(nhom));
        console.log('📋 nhom stringified:', nhom ? JSON.stringify(nhom) : 'NULL');

        console.log('Creating purchase request with data:', {
            request_code,
            project_name,
            order_code,
            created_date: finalCreatedDate,
            nhom_count: nhom ? nhom.length : 0,
            vattu_count: vattu ? vattu.length : 0,
            phukien_count: phukien ? phukien.length : 0,
            kinh_count: kinh ? kinh.length : 0
        });

        // Values for insert
        const nhomDataValue = nhom ? JSON.stringify(nhom) : null;
        const vattuDataValue = vattu ? JSON.stringify(vattu) : null;
        const phukienDataValue = phukien ? JSON.stringify(phukien) : null;
        const kinhDataValue = kinh ? JSON.stringify(kinh) : null;

        console.log('📤 Storing values:');
        console.log('   nhom_data:', nhomDataValue);
        console.log('   vattu_data:', vattuDataValue);
        console.log('   phukien_data:', phukienDataValue);
        console.log('   kinh_data:', kinhDataValue);

        const [result] = await db.query(
            `INSERT INTO purchase_requests 
             (request_code, project_id, project_name, order_code, product_type, color, 
              delivery_address, created_date, required_date, 
              nhom_data, vattu_data, phukien_data, kinh_data, 
              status, notes, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                request_code,
                project_id || null,
                project_name || null,
                order_code || null,
                product_type || null,
                color || null,
                delivery_address || null,
                finalCreatedDate,
                required_date || null,
                nhomDataValue,
                vattuDataValue,
                phukienDataValue,
                kinhDataValue,
                status,
                notes || null,
                userId
            ]
        );

        console.log('✅ Insert successful, ID:', result.insertId);

        res.status(201).json({
            success: true,
            message: "Tạo phiếu yêu cầu thành công",
            data: { id: result.insertId, request_code }
        });
    } catch (err) {
        console.error('Error creating purchase request:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// PUT /api/purchase-requests/:id - Cập nhật phiếu yêu cầu
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_id,
            project_name,
            order_code,
            product_type,
            color,
            delivery_address,
            created_date,
            required_date,
            nhom,
            vattu,
            phukien,
            kinh,
            notes,
            status
        } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (project_id !== undefined) { updateFields.push('project_id = ?'); updateValues.push(project_id); }
        if (project_name !== undefined) { updateFields.push('project_name = ?'); updateValues.push(project_name); }
        if (order_code !== undefined) { updateFields.push('order_code = ?'); updateValues.push(order_code); }
        if (product_type !== undefined) { updateFields.push('product_type = ?'); updateValues.push(product_type); }
        if (color !== undefined) { updateFields.push('color = ?'); updateValues.push(color); }
        if (delivery_address !== undefined) { updateFields.push('delivery_address = ?'); updateValues.push(delivery_address); }
        if (created_date !== undefined) { updateFields.push('created_date = ?'); updateValues.push(created_date); }
        if (required_date !== undefined) { updateFields.push('required_date = ?'); updateValues.push(required_date); }
        if (nhom !== undefined) { updateFields.push('nhom_data = ?'); updateValues.push(JSON.stringify(nhom)); }
        if (vattu !== undefined) { updateFields.push('vattu_data = ?'); updateValues.push(JSON.stringify(vattu)); }
        if (phukien !== undefined) { updateFields.push('phukien_data = ?'); updateValues.push(JSON.stringify(phukien)); }
        if (kinh !== undefined) { updateFields.push('kinh_data = ?'); updateValues.push(JSON.stringify(kinh)); }
        if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
        if (notes !== undefined) { updateFields.push('notes = ?'); updateValues.push(notes); }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: "Không có dữ liệu để cập nhật" });
        }

        updateValues.push(id);

        await db.query(
            `UPDATE purchase_requests 
             SET ${updateFields.join(', ')}
             WHERE id = ?`,
            updateValues
        );

        res.json({ success: true, message: "Cập nhật phiếu yêu cầu thành công" });
    } catch (err) {
        console.error('Error updating purchase request:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// DELETE /api/purchase-requests/:id - Xóa phiếu yêu cầu
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM purchase_requests WHERE id = ?', [id]);

        res.json({ success: true, message: "Xóa phiếu yêu cầu thành công" });
    } catch (err) {
        console.error('Error deleting purchase request:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

// PUT /api/purchase-requests/:id/status - Cập nhật trạng thái
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['draft', 'submitted', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
        }

        await db.query(
            'UPDATE purchase_requests SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ success: false, message: "Lỗi server: " + err.message });
    }
};

