const db = require("../config/db");

/**
 * Lấy danh sách dự án ở giai đoạn lắp đặt
 */
exports.getInstallationProjects = async (req, res) => {
    try {
        // Tạo bảng installation_progress nếu chưa có
        await db.query(`
            CREATE TABLE IF NOT EXISTS installation_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                design_id INT NOT NULL,
                project_id INT NOT NULL,
                status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
                installation_date DATE NULL,
                installer_name VARCHAR(255) NULL,
                notes TEXT NULL,
                photos JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_design_id (design_id),
                INDEX idx_project_id (project_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Lấy các dự án ở giai đoạn lắp đặt
        const [projects] = await db.query(`
            SELECT 
                p.id,
                p.project_code,
                p.project_name,
                p.status,
                p.progress_percent,
                p.start_date,
                p.deadline,
                c.full_name AS customer_name,
                c.phone AS customer_phone,
                c.address AS customer_address
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.status = 'installation'
            ORDER BY p.created_at DESC
        `);

        // Lấy thông tin chi tiết cho từng dự án
        const projectsWithDetails = await Promise.all(
            projects.map(async (project) => {
                // Ưu tiên lấy từ quotation_items (nguồn chính xác)
                let products = [];
                const [quotationRows] = await db.query(`
                    SELECT id FROM quotations 
                    WHERE project_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 1
                `, [project.id]);

                if (quotationRows.length > 0) {
                    const quotationId = quotationRows[0].id;

                    const [quotationItems] = await db.query(`
                        SELECT 
                            qi.id,
                            qi.code,
                            qi.item_name,
                            qi.spec,
                            qi.width,
                            qi.height,
                            qi.quantity,
                            qi.item_type
                        FROM quotation_items qi
                        WHERE qi.quotation_id = ?
                        ORDER BY qi.id
                    `, [quotationId]);

                    // Tách sản phẩm có quantity > 1 thành nhiều item riêng
                    let itemIndex = 0;
                    for (const item of quotationItems) {
                        const qty = parseInt(item.quantity) || 1;
                        const baseCode = item.code || `SP-${item.id}`;
                        const baseName = item.item_name || item.spec || `Sản phẩm`;

                        for (let i = 1; i <= qty; i++) {
                            itemIndex++;
                            const productCode = qty > 1 ? `${baseCode}_C${String(i).padStart(3, '0')}` : baseCode;
                            const productName = qty > 1 ? `${baseName}` : baseName;

                            products.push({
                                id: `${item.id}_${i}`, // Unique ID cho mỗi item
                                original_id: item.id, // ID gốc từ quotation_items
                                code: productCode,
                                design_code: productCode,
                                door_type: item.item_type || 'material',
                                template_name: productName,
                                item_name: item.item_name || null,
                                spec: item.spec || null,
                                template_code: item.code || null,
                                width_mm: parseFloat(item.width) || 0,
                                height_mm: parseFloat(item.height) || 0,
                                number_of_panels: 1,
                                quantity: 1, // Mỗi item là 1 sản phẩm riêng
                                item_index: i, // Số thứ tự trong nhóm
                                total_in_group: qty // Tổng số trong nhóm
                            });
                        }
                    }
                }

                // Nếu không có quotation_items, fallback sang door_designs
                if (products.length === 0) {
                    const [doors] = await db.query(`
                        SELECT 
                            dd.id,
                            dd.design_code,
                            dd.door_type,
                            dd.width_mm,
                            dd.height_mm,
                            dd.number_of_panels,
                            dt.name AS template_name,
                            dt.code AS template_code,
                            a.name AS aluminum_system_name,
                            a.code AS aluminum_system_code
                        FROM door_designs dd
                        LEFT JOIN door_templates dt ON dd.template_id = dt.id
                        LEFT JOIN aluminum_systems a ON dd.aluminum_system_id = a.id
                        WHERE dd.project_id = ?
                        ORDER BY dd.design_code
                    `, [project.id]);

                    products = doors.map(d => ({
                        ...d,
                        original_id: d.id,
                        quantity: 1,
                        item_index: 1,
                        total_in_group: 1
                    }));
                }

                // Lấy tiến độ lắp đặt cho từng sản phẩm
                const productsWithInstallation = await Promise.all(
                    products.map(async (product) => {
                        // Sử dụng product_code (design_code) để lưu tiến độ, hỗ trợ sản phẩm đã tách số lượng
                        const productCode = product.design_code || product.code || `SP-${product.original_id}_${product.item_index}`;

                        // Lấy tiến độ lắp đặt
                        let installationProgress = {
                            status: 'pending', // pending, in_progress, completed
                            installation_date: null,
                            installer_name: null,
                            notes: null,
                            photos: [],
                            completion_percent: 0
                        };

                        // Kiểm tra trong bảng installation_progress theo product_code
                        try {
                            const [installRows] = await db.query(`
                                SELECT * FROM installation_progress
                                WHERE project_id = ? AND product_code = ?
                                ORDER BY created_at DESC
                                LIMIT 1
                            `, [project.id, productCode]);

                            if (installRows.length > 0) {
                                let photosData = [];
                                try {
                                    photosData = installRows[0].photos ? JSON.parse(installRows[0].photos) : [];
                                } catch (e) {
                                    photosData = [];
                                }

                                installationProgress = {
                                    status: installRows[0].status || 'pending',
                                    installation_date: installRows[0].installation_date,
                                    installer_name: installRows[0].installer_name,
                                    notes: installRows[0].notes,
                                    photos: photosData,
                                    completion_percent: installRows[0].status === 'completed' ? 100 :
                                        installRows[0].status === 'in_progress' ? 50 : 0
                                };
                            }
                        } catch (queryErr) {
                            // Table might not have product_code column yet, try fallback
                            console.log('Query by product_code failed, using fallback');
                        }

                        return {
                            ...product,
                            installation_progress: installationProgress,
                            is_installed: installationProgress.status === 'completed'
                        };
                    })
                );

                // Tính tổng tiến độ lắp đặt
                const totalInstallationProgress = productsWithInstallation.length > 0
                    ? Math.round(productsWithInstallation.reduce((sum, p) => sum + p.installation_progress.completion_percent, 0) / productsWithInstallation.length)
                    : 0;

                // Kiểm tra xem tất cả sản phẩm đã lắp đặt xong chưa
                const allProductsInstalled = productsWithInstallation.length > 0 &&
                    productsWithInstallation.every(p => p.is_installed);

                return {
                    ...project,
                    products: productsWithInstallation,
                    total_products: productsWithInstallation.length,
                    installed_products: productsWithInstallation.filter(p => p.is_installed).length,
                    installation_progress: totalInstallationProgress,
                    all_products_installed: allProductsInstalled
                };
            })
        );

        res.json({
            success: true,
            data: projectsWithDetails
        });
    } catch (err) {
        console.error('Error getting installation projects:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * Cập nhật tiến độ lắp đặt cho sản phẩm
 * productId ở đây chính là product_code (design_code) của sản phẩm
 */
exports.updateInstallationProgress = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { projectId, productId } = req.params;
        const { status, installation_date, installer_name, notes, photos } = req.body;

        // productId chính là product_code
        const productCode = productId;

        console.log(`Updating installation progress for project ${projectId}, product_code: ${productCode}`);

        // Tạo bảng installation_progress với product_code nếu chưa có
        await connection.query(`
            CREATE TABLE IF NOT EXISTS installation_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                design_id INT NULL,
                project_id INT NOT NULL,
                product_code VARCHAR(100) NULL,
                status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
                installation_date DATE NULL,
                installer_name VARCHAR(255) NULL,
                notes TEXT NULL,
                photos JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_design_id (design_id),
                INDEX idx_project_id (project_id),
                INDEX idx_product_code (product_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Thêm column product_code nếu chưa có (bỏ qua nếu đã tồn tại)
        try {
            await connection.query(`
                ALTER TABLE installation_progress 
                ADD COLUMN product_code VARCHAR(100) NULL
            `);
        } catch (alterErr) {
            // Column already exists - ignore
        }

        // Cho phép design_id NULL (bảng cũ có NOT NULL constraint)
        try {
            await connection.query(`
                ALTER TABLE installation_progress 
                MODIFY COLUMN design_id INT NULL DEFAULT 0
            `);
        } catch (alterErr) {
            // Ignore if already modified
        }

        // Kiểm tra xem đã có record chưa (theo project_id + product_code)
        const [existingRows] = await connection.query(`
            SELECT * FROM installation_progress
            WHERE project_id = ? AND product_code = ?
        `, [projectId, productCode]);

        const photosJson = photos && Array.isArray(photos) ? JSON.stringify(photos) : null;
        // Nếu có status được gửi lên thì dùng, không thì giữ nguyên
        const finalStatus = status || (existingRows.length > 0 ? existingRows[0].status : 'pending');

        if (existingRows.length > 0) {
            // Cập nhật
            await connection.query(`
                UPDATE installation_progress
                SET status = ?,
                    installation_date = ?,
                    installer_name = ?,
                    notes = ?,
                    photos = ?,
                    updated_at = NOW()
                WHERE project_id = ? AND product_code = ?
            `, [finalStatus, installation_date || null, installer_name || null, notes || null, photosJson, projectId, productCode]);
            console.log(`Updated installation progress for ${productCode}`);
        } else {
            // Tạo mới
            await connection.query(`
                INSERT INTO installation_progress
                (design_id, project_id, product_code, status, installation_date, installer_name, notes, photos)
                VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
            `, [projectId, productCode, finalStatus, installation_date || null, installer_name || null, notes || null, photosJson]);
            console.log(`Created new installation progress for ${productCode}`);
        }

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Cập nhật tiến độ lắp đặt thành công"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error updating installation progress:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * Chuyển dự án sang giai đoạn Bàn giao (chỉ khi tất cả sản phẩm đã lắp đặt xong)
 */
exports.moveToHandover = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { projectId } = req.params;

        // Lấy thông tin dự án
        const [projectRows] = await connection.query(`
            SELECT * FROM projects WHERE id = ?
        `, [projectId]);

        if (projectRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        const project = projectRows[0];

        if (project.status !== 'installation') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Dự án không ở giai đoạn lắp đặt"
            });
        }

        // Lấy danh sách product_codes từ quotation_items (có tách quantity)
        const [quotationRows] = await connection.query(`
            SELECT id FROM quotations 
            WHERE project_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [projectId]);

        let expectedProductCodes = [];

        if (quotationRows.length > 0) {
            const [items] = await connection.query(`
                SELECT id, code, quantity FROM quotation_items WHERE quotation_id = ?
            `, [quotationRows[0].id]);

            // Tạo danh sách product_codes (tách theo quantity)
            for (const item of items) {
                const qty = parseInt(item.quantity) || 1;
                const baseCode = item.code || `SP-${item.id}`;

                for (let i = 1; i <= qty; i++) {
                    const productCode = qty > 1 ? `${baseCode}_C${String(i).padStart(3, '0')}` : baseCode;
                    expectedProductCodes.push(productCode);
                }
            }
        } else {
            // Fallback to door_designs
            const [doors] = await connection.query(`
                SELECT design_code FROM door_designs WHERE project_id = ?
            `, [projectId]);
            expectedProductCodes = doors.map(d => d.design_code);
        }

        if (expectedProductCodes.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Dự án chưa có sản phẩm nào"
            });
        }

        console.log(`Expected product codes for handover check:`, expectedProductCodes);

        // Kiểm tra xem tất cả sản phẩm đã lắp đặt xong chưa
        let allInstalled = true;
        let notInstalledProducts = [];

        for (const productCode of expectedProductCodes) {
            const [installRows] = await connection.query(`
                SELECT * FROM installation_progress
                WHERE project_id = ? AND product_code = ? AND status = 'completed'
            `, [projectId, productCode]);

            if (installRows.length === 0) {
                allInstalled = false;
                notInstalledProducts.push(productCode);
            }
        }

        console.log(`Not installed products:`, notInstalledProducts);

        if (!allInstalled) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Không thể chuyển sang Bàn giao. Vui lòng hoàn thành lắp đặt tất cả sản phẩm trước."
            });
        }

        // Chuyển sang giai đoạn Bàn giao
        await connection.query(`
            UPDATE projects
            SET status = 'handover',
                progress_percent = 95
            WHERE id = ?
        `, [projectId]);

        await connection.commit();
        connection.release();

        res.json({
            success: true,
            message: "Đã chuyển dự án sang giai đoạn Bàn giao"
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error('Error moving to handover:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

