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
                // Lấy danh sách sản phẩm (door_designs) từ dự án
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

                // Nếu không có door_designs, lấy từ quotation_items
                let products = doors;
                if (products.length === 0) {
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
                                qi.quantity
                            FROM quotation_items qi
                            WHERE qi.quotation_id = ?
                            ORDER BY qi.id
                        `, [quotationId]);

                        products = quotationItems.map((item, index) => ({
                            id: item.id,
                            code: item.code,
                            design_code: item.code || `SP-${item.id}`,
                            door_type: item.item_type || 'material',
                            template_name: item.item_name || item.spec || `Sản phẩm ${index + 1}`,
                            item_name: item.item_name || null,
                            spec: item.spec || null,
                            template_code: item.code || null,
                            width_mm: parseFloat(item.width) || 0,
                            height_mm: parseFloat(item.height) || 0,
                            number_of_panels: 1,
                            quantity: parseFloat(item.quantity) || 1
                        }));
                    }
                }

                // Lấy tiến độ lắp đặt cho từng sản phẩm
                const productsWithInstallation = await Promise.all(
                    products.map(async (product) => {
                        // Tìm door_design_id
                        let designId = product.id;
                        
                        const [doorDesignRows] = await db.query(`
                            SELECT id FROM door_designs WHERE id = ? AND project_id = ?
                        `, [product.id, project.id]);
                        
                        if (doorDesignRows.length === 0) {
                            // Tìm theo design_code
                            const [designRows] = await db.query(`
                                SELECT id FROM door_designs 
                                WHERE project_id = ? AND design_code = ?
                                LIMIT 1
                            `, [project.id, product.design_code]);
                            
                            if (designRows.length > 0) {
                                designId = designRows[0].id;
                            }
                        }

                        // Lấy tiến độ lắp đặt
                        let installationProgress = {
                            status: 'pending', // pending, in_progress, completed
                            installation_date: null,
                            installer_name: null,
                            notes: null,
                            photos: [],
                            completion_percent: 0
                        };

                        if (designId) {
                            // Kiểm tra trong bảng installation_progress (nếu có)
                            const [installRows] = await db.query(`
                                SELECT * FROM installation_progress
                                WHERE design_id = ?
                                ORDER BY created_at DESC
                                LIMIT 1
                            `, [designId]);

                            if (installRows.length > 0) {
                                installationProgress = {
                                    status: installRows[0].status || 'pending',
                                    installation_date: installRows[0].installation_date,
                                    installer_name: installRows[0].installer_name,
                                    notes: installRows[0].notes,
                                    photos: installRows[0].photos ? JSON.parse(installRows[0].photos) : [],
                                    completion_percent: installRows[0].status === 'completed' ? 100 : 
                                                       installRows[0].status === 'in_progress' ? 50 : 0
                                };
                            }
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
 */
exports.updateInstallationProgress = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { projectId, productId } = req.params;
        const { status, installation_date, installer_name, notes, photos } = req.body;

        // Tìm hoặc tạo door_design_id
        let designId = productId;

        // Thử tìm door_design trực tiếp
        const [doorDesignRows] = await connection.query(`
            SELECT id FROM door_designs WHERE id = ? AND project_id = ?
        `, [productId, projectId]);

        if (doorDesignRows.length > 0) {
            designId = doorDesignRows[0].id;
        } else {
            // Nếu không tìm thấy, thử tìm theo quotation_item
            const [quotationRows] = await connection.query(`
                SELECT q.id as quotation_id 
                FROM quotations q 
                WHERE q.project_id = ?
                ORDER BY q.created_at DESC 
                LIMIT 1
            `, [projectId]);

            if (quotationRows.length > 0) {
                const quotationId = quotationRows[0].quotation_id;
                
                const [itemRows] = await connection.query(`
                    SELECT * FROM quotation_items WHERE id = ? AND quotation_id = ?
                `, [productId, quotationId]);

                if (itemRows.length > 0) {
                    const item = itemRows[0];
                    
                    // Tìm door_design theo design_code
                    const [existingDesignRows] = await connection.query(`
                        SELECT id FROM door_designs 
                        WHERE project_id = ? AND design_code = ?
                        LIMIT 1
                    `, [projectId, item.code || `SP-${item.id}`]);

                    if (existingDesignRows.length > 0) {
                        designId = existingDesignRows[0].id;
                    } else {
                        // Tạo door_design mới từ quotation_item
                        const [result] = await connection.query(`
                            INSERT INTO door_designs
                            (project_id, design_code, door_type, width_mm, height_mm, number_of_panels, aluminum_system_id)
                            VALUES (?, ?, ?, ?, ?, 1, NULL)
                        `, [
                            projectId,
                            item.code || `SP-${item.id}`,
                            item.item_type || 'material',
                            parseFloat(item.width) || 0,
                            parseFloat(item.height) || 0
                        ]);

                        designId = result.insertId;
                    }
                }
            }
        }

        if (!designId) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Tạo bảng installation_progress nếu chưa có
        await connection.query(`
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

        // Kiểm tra xem đã có record chưa
        const [existingRows] = await connection.query(`
            SELECT * FROM installation_progress
            WHERE design_id = ?
        `, [designId]);

        const photosJson = photos && Array.isArray(photos) ? JSON.stringify(photos) : null;

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
                WHERE design_id = ?
            `, [status, installation_date || null, installer_name || null, notes || null, photosJson, designId]);
        } else {
            // Tạo mới
            await connection.query(`
                INSERT INTO installation_progress
                (design_id, project_id, status, installation_date, installer_name, notes, photos)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [designId, projectId, status, installation_date || null, installer_name || null, notes || null, photosJson]);
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

        // Lấy tất cả sản phẩm của dự án
        const [doors] = await connection.query(`
            SELECT id FROM door_designs WHERE project_id = ?
        `, [projectId]);

        // Nếu không có door_designs, lấy từ quotation_items
        let productIds = doors.map(d => d.id);
        if (productIds.length === 0) {
            const [quotationRows] = await connection.query(`
                SELECT id FROM quotations 
                WHERE project_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [projectId]);

            if (quotationRows.length > 0) {
                const [items] = await connection.query(`
                    SELECT id FROM quotation_items WHERE quotation_id = ?
                `, [quotationRows[0].id]);
                productIds = items.map(i => i.id);
            }
        }

        if (productIds.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Dự án chưa có sản phẩm nào"
            });
        }

        // Kiểm tra xem tất cả sản phẩm đã lắp đặt xong chưa
        let allInstalled = true;
        
        // Tạo bảng nếu chưa có
        await connection.query(`
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

        for (const productId of productIds) {
            // Tìm door_design_id
            let designId = productId;
            
            const [doorDesignRows] = await connection.query(`
                SELECT id FROM door_designs WHERE id = ? AND project_id = ?
            `, [productId, projectId]);
            
            if (doorDesignRows.length === 0) {
                // Tìm theo quotation_item
                const [quotationRows] = await connection.query(`
                    SELECT q.id as quotation_id 
                    FROM quotations q 
                    WHERE q.project_id = ?
                    ORDER BY q.created_at DESC 
                    LIMIT 1
                `, [projectId]);

                if (quotationRows.length > 0) {
                    const [designRows] = await connection.query(`
                        SELECT id FROM door_designs 
                        WHERE project_id = ? 
                        AND design_code IN (
                            SELECT code FROM quotation_items WHERE id = ?
                        )
                        LIMIT 1
                    `, [projectId, productId]);
                    
                    if (designRows.length > 0) {
                        designId = designRows[0].id;
                    }
                }
            }

            const [installRows] = await connection.query(`
                SELECT * FROM installation_progress
                WHERE design_id = ? AND status = 'completed'
            `, [designId]);

            if (installRows.length === 0) {
                allInstalled = false;
                break;
            }
        }

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

