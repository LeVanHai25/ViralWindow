exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;

        // Táº¯t foreign key checks táº¡m thá»i Ä‘á»ƒ trÃ¡nh lá»—i constraint
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
                message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n"
            });
        }

        const project = projectRows[0];
        console.log(`ðŸ—‘ï¸ Cascade deleting project: ${project.project_code} - ${project.project_name}`);

        // 1. XÃ³a door_bom_lines vÃ  door_bom_summary (BOM cá»­a)
        try {
            await connection.query(`
                DELETE FROM door_bom_lines 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM door_bom_summary 
                WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
            `, [id]);
            console.log('  âœ“ Deleted door BOM lines and summary');
        } catch (e) {
            console.log('  - No door_bom_lines/summary table');
        }

        // 2. XÃ³a door structure items vÃ  calculations
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
            console.log('  âœ“ Deleted door structure and calculations');
        } catch (e) {
            console.log('  - No door structure/calculations tables');
        }

        // 3. XÃ³a cutting details vÃ  optimizations
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
            console.log('  âœ“ Deleted cutting details and optimizations');
        } catch (e) {
            console.log('  - No cutting tables');
        }

        // 4. XÃ³a BOM items cá»§a táº¥t cáº£ door_designs trong project
        await connection.query(`
            DELETE FROM bom_items 
            WHERE design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
        `, [id]);
        console.log('  âœ“ Deleted BOM items');

        // 5. XÃ³a item_bom_lines vÃ  item_bom_versions
        try {
            await connection.query(`
                DELETE FROM item_bom_lines 
                WHERE project_id = ?
            `, [id]);
            await connection.query(`
                DELETE FROM item_bom_versions 
                WHERE project_id = ?
            `, [id]);
            console.log('  âœ“ Deleted item BOM lines and versions');
        } catch (e) {
            console.log('  - No item_bom tables');
        }

        // 6. XÃ³a door_drawings cá»§a táº¥t cáº£ door_designs trong project
        await connection.query(`
            DELETE FROM door_drawings 
            WHERE door_design_id IN (SELECT id FROM door_designs WHERE project_id = ?)
        `, [id]);
        console.log('  âœ“ Deleted door drawings');

        // 7. XÃ³a door_designs
        await connection.query(
            "DELETE FROM door_designs WHERE project_id = ?",
            [id]
        );
        console.log('  âœ“ Deleted door designs');

        // 8. XÃ³a quotation_items cá»§a táº¥t cáº£ quotations trong project
        await connection.query(`
            DELETE FROM quotation_items 
            WHERE quotation_id IN (SELECT id FROM quotations WHERE project_id = ?)
        `, [id]);
        console.log('  âœ“ Deleted quotation items');

        // 9. XÃ³a quotations
        await connection.query(
            "DELETE FROM quotations WHERE project_id = ?",
            [id]
        );
        console.log('  âœ“ Deleted quotations');

        // 10. XÃ³a production_order_bom vÃ  production_order_doors
        try {
            await connection.query(`
                DELETE FROM production_order_bom 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            await connection.query(`
                DELETE FROM production_order_doors 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  âœ“ Deleted production order BOM and doors');
        } catch (e) {
            console.log('  - No production_order_bom/doors tables');
        }

        // 11. XÃ³a production_order_items cá»§a táº¥t cáº£ production_orders trong project
        try {
            await connection.query(`
                DELETE FROM production_order_items 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  âœ“ Deleted production order items');
        } catch (e) {
            console.log('  - No production_order_items table or no items');
        }

        // 12. XÃ³a production_progress
        try {
            await connection.query(`
                DELETE FROM production_progress 
                WHERE production_order_id IN (SELECT id FROM production_orders WHERE project_id = ?)
            `, [id]);
            console.log('  âœ“ Deleted production progress');
        } catch (e) {
            console.log('  - No production_progress table');
        }

        // 13. XÃ³a production_orders
        await connection.query(
            "DELETE FROM production_orders WHERE project_id = ?",
            [id]
        );
        console.log('  âœ“ Deleted production orders');

        // 14. XÃ³a project_items (háº¡ng má»¥c dá»± Ã¡n)
        try {
            await connection.query(
                "DELETE FROM project_items WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_items_v2 WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted project items');
        } catch (e) {
            console.log('  - No project_items tables');
        }

        // 15. XÃ³a project_materials (váº­t tÆ° dá»± Ã¡n)
        try {
            await connection.query(
                "DELETE FROM project_materials WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted project materials');
        } catch (e) {
            console.log('  - No project_materials table');
        }

        // 16. XÃ³a warehouse exports vÃ  items
        try {
            await connection.query(`
                DELETE FROM warehouse_export_items 
                WHERE export_id IN (SELECT id FROM warehouse_exports WHERE project_id = ?)
            `, [id]);
            await connection.query(
                "DELETE FROM warehouse_exports WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted warehouse exports');
        } catch (e) {
            console.log('  - No warehouse_exports tables');
        }

        // 17. XÃ³a project cutting vÃ  bÃ³c tÃ¡ch
        try {
            await connection.query(
                "DELETE FROM project_cutting_details WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_cutting_optimization WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted project cutting details');
        } catch (e) {
            console.log('  - No project_cutting tables');
        }

        // 18. XÃ³a project summaries (aluminum, glass, gaskets, accessories)
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
            console.log('  âœ“ Deleted project material summaries');
        } catch (e) {
            console.log('  - No project summary tables');
        }

        // 19. XÃ³a project finances vÃ  pricing
        try {
            await connection.query(
                "DELETE FROM project_finances WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM project_pricing WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted project finances and pricing');
        } catch (e) {
            console.log('  - No project finances/pricing tables');
        }

        // 20. XÃ³a debts liÃªn quan Ä‘áº¿n project
        try {
            await connection.query(
                "DELETE FROM debts WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted debts');
        } catch (e) {
            console.log('  - No debts table or error:', e.message);
        }

        // 21. XÃ³a commissions liÃªn quan Ä‘áº¿n project
        try {
            await connection.query(
                "DELETE FROM commissions WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted commissions');
        } catch (e) {
            console.log('  - No commissions table or error:', e.message);
        }

        // 22. XÃ³a financial_transactions
        try {
            await connection.query(
                "DELETE FROM financial_transactions WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted financial transactions');
        } catch (e) {
            console.log('  - No financial_transactions table');
        }

        // 23. XÃ³a inventory_out vÃ  inventory_transactions liÃªn quan Ä‘áº¿n project
        try {
            await connection.query(
                "DELETE FROM inventory_out WHERE project_id = ?",
                [id]
            );
            await connection.query(
                "DELETE FROM inventory_transactions WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted inventory records');
        } catch (e) {
            console.log('  - No inventory tables or error:', e.message);
        }

        // 24. XÃ³a project logs
        try {
            await connection.query(
                "DELETE FROM project_logs WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted project logs');
        } catch (e) {
            console.log('  - No project_logs table or error:', e.message);
        }

        // 25. XÃ³a projects_material_summary
        try {
            await connection.query(
                "DELETE FROM projects_material_summary WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted material summary');
        } catch (e) {
            console.log('  - No projects_material_summary table or error:', e.message);
        }

        // 26. XÃ³a design files
        try {
            await connection.query(
                "DELETE FROM design_files WHERE project_id = ?",
                [id]
            );
            console.log('  âœ“ Deleted design files');
        } catch (e) {
            console.log('  - No design_files table or error:', e.message);
        }

        // 27. Cuá»‘i cÃ¹ng, xÃ³a project
        const [result] = await connection.query(
            "DELETE FROM projects WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "KhÃ´ng tÃ¬m tháº¥y dá»± Ã¡n"
            });
        }

        // Báº­t láº¡i foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log(`âœ… Project ${project.project_code} and all related data deleted successfully`);

        // Gửi thông báo xóa dự án
        try {
            await SystemNotifier.notify('project.deleted', {
                entityName: project.project_name,
                entityId: parseInt(id),
                actor: SystemNotifier.getActor(req),
                afterData: { project_code: project.project_code }
            });
        } catch (e) { }

        res.json({
            success: true,
            message: `ÄÃ£ xÃ³a dá»± Ã¡n "${project.project_name}" vÃ  táº¥t cáº£ dá»¯ liá»‡u liÃªn quan (bÃ¡o giÃ¡, thiáº¿t káº¿, lá»‡nh sáº£n xuáº¥t, v.v.)`
        });
    } catch (err) {
        // Äáº£m báº£o báº­t láº¡i foreign key checks trÆ°á»›c khi rollback
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            console.error('Error re-enabling foreign key checks:', e);
        }
        await connection.rollback();
        console.error('Error cascade deleting project:', err);
        res.status(500).json({
            success: false,
            message: "Lá»—i khi xÃ³a dá»± Ã¡n: " + err.message,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        connection.release();
    }
};

// GET statistics
