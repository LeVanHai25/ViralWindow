/**
 * =====================================================
 * AI DATA COLLECTOR
 * =====================================================
 * Truy vấn database để xây dựng context cho AI
 * ĐÃ FIX: Tất cả SQL queries khớp với schema thực tế
 * 
 * Schema thực tế:
 * - projects: project_code (ko phải order_code), total_value, customer_id (JOIN customers)
 * - customers: full_name (ko phải name)
 * - quotations: customer_id (JOIN customers), total_amount OK
 * - financial_transactions: transaction_type (ko phải type)
 * - accessories: category (string, ko JOIN)
 * - aluminum_systems: có unit_price, ko có warehouse_id
 * - material_requests: order_code OK
 */

const db = require('../config/db');

// Helper: safe query with error catching per-query
async function safeQuery(sql, params = []) {
    try {
        const [rows] = await db.query(sql, params);
        return rows;
    } catch (error) {
        console.warn('⚠️ SQL warning:', error.message, '| Query:', sql.substring(0, 80));
        return [];
    }
}

// =====================================================
// 1. DASHBOARD CONTEXT
// =====================================================
async function getDashboardContext() {
    const context = {};

    try {
        // === DỰ ÁN ===
        const projectStats = await safeQuery(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('active','in_progress','processing','pending') THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status IN ('completed','done') THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN deadline IS NOT NULL AND deadline < CURDATE() AND status NOT IN ('completed','done','cancelled') THEN 1 ELSE 0 END) as overdue
            FROM projects
        `);
        context.projects = projectStats[0] || {};

        // Dự án gần đây (JOIN customers để lấy tên KH)
        context.recent_projects = await safeQuery(`
            SELECT p.project_name, p.project_code, p.status, p.deadline, 
                   p.total_value, c.full_name as customer_name
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC LIMIT 5
        `);

        // === KHO VẬT TƯ ===
        // Phụ kiện
        const accessoryStats = await safeQuery(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock
            FROM accessories
        `);
        context.accessories = accessoryStats[0] || {};

        // Nhôm
        const aluminumStats = await safeQuery(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_quantity,
                SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END) as low_stock
            FROM aluminum_systems
        `);
        context.aluminum = aluminumStats[0] || {};

        // Kính / Inventory
        const inventoryStats = await safeQuery(`
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END) as low_stock
            FROM inventory
        `);
        context.inventory = inventoryStats[0] || {};

        // === PHIẾU KHO (7 ngày gần đây) ===
        context.stock_docs_7days = await safeQuery(`
            SELECT 
                doc_type,
                COUNT(*) as count,
                COALESCE(SUM(total_value), 0) as total_value
            FROM stock_documents 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY doc_type
        `);

        // === TÀI CHÍNH (30 ngày) ===
        context.financial_30days = await safeQuery(`
            SELECT 
                transaction_type,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total
            FROM financial_transactions
            WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY transaction_type
        `);

        // === BÁO GIÁ ===
        const quotationStats = await safeQuery(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                COALESCE(SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END), 0) as approved_value
            FROM quotations
        `);
        context.quotations = quotationStats[0] || {};

        // === YÊU CẦU VẬT TƯ ===
        const materialRequests = await safeQuery(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM material_requests
        `);
        context.material_requests = materialRequests[0] || {};

        context.generated_at = new Date().toISOString();

    } catch (error) {
        console.error('❌ aiDataCollector.getDashboardContext error:', error.message);
        context.error = error.message;
    }

    return context;
}

// =====================================================
// 2. SEARCH
// =====================================================
async function executeSearch(parsedQuery) {
    const results = [];

    try {
        for (const table of (parsedQuery.tables || [])) {
            let query = '';
            let params = [];
            const keywords = (parsedQuery.keywords || []).join('%');
            const kw = `%${keywords}%`;

            switch (table) {
                case 'projects':
                    query = `SELECT p.id, p.project_name, p.project_code, p.status, p.deadline,
                             p.total_value, c.full_name as customer_name
                             FROM projects p
                             LEFT JOIN customers c ON p.customer_id = c.id
                             WHERE p.project_name LIKE ? OR p.project_code LIKE ? OR c.full_name LIKE ?
                             ORDER BY p.created_at DESC LIMIT 20`;
                    params = [kw, kw, kw];
                    break;

                case 'stock_documents':
                    query = `SELECT id, doc_no, doc_type, status, note, 
                             total_value, created_at
                             FROM stock_documents
                             WHERE doc_no LIKE ? OR note LIKE ?
                             ORDER BY created_at DESC LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'financial_transactions':
                    query = `SELECT id, transaction_type, amount, category, description, transaction_date
                             FROM financial_transactions
                             WHERE description LIKE ? OR category LIKE ?
                             ORDER BY transaction_date DESC LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'inventory':
                    query = `SELECT id, item_code, item_name, quantity, unit_price
                             FROM inventory
                             WHERE item_code LIKE ? OR item_name LIKE ?
                             ORDER BY item_name LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'accessories':
                    query = `SELECT id, code, name, stock_quantity, sale_price, category
                             FROM accessories
                             WHERE code LIKE ? OR name LIKE ?
                             ORDER BY name LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'aluminum_systems':
                    query = `SELECT id, code, name, quantity, unit_price, color
                             FROM aluminum_systems
                             WHERE code LIKE ? OR name LIKE ?
                             ORDER BY name LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'customers':
                    query = `SELECT id, full_name, phone, email, address
                             FROM customers
                             WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?
                             ORDER BY full_name LIMIT 20`;
                    params = [kw, kw, kw];
                    break;

                case 'quotations':
                    query = `SELECT q.id, c.full_name as customer_name, q.status, 
                             q.total_amount, q.created_at
                             FROM quotations q
                             LEFT JOIN customers c ON q.customer_id = c.id
                             WHERE c.full_name LIKE ? OR q.quotation_code LIKE ?
                             ORDER BY q.created_at DESC LIMIT 20`;
                    params = [kw, kw];
                    break;

                case 'material_requests':
                    query = `SELECT id, order_code, category, status, project_name, created_at
                             FROM material_requests
                             WHERE order_code LIKE ? OR project_name LIKE ?
                             ORDER BY created_at DESC LIMIT 20`;
                    params = [kw, kw];
                    break;

                default:
                    continue;
            }

            const rows = await safeQuery(query, params);
            results.push({
                table,
                count: rows.length,
                data: rows
            });
        }
    } catch (error) {
        console.error('❌ aiDataCollector.executeSearch error:', error.message);
        results.push({ error: error.message });
    }

    return results;
}

// =====================================================
// 3. CHAT CONTEXT
// =====================================================
async function getChatContext(message) {
    const context = {};
    const msgLower = message.toLowerCase();

    try {
        if (msgLower.includes('tồn kho') || msgLower.includes('kho') || msgLower.includes('vật tư') || msgLower.includes('nhôm') || msgLower.includes('kính') || msgLower.includes('phụ kiện')) {
            context.accessories_low = await safeQuery(`
                SELECT code, name, stock_quantity, sale_price FROM accessories 
                WHERE stock_quantity > 0 ORDER BY stock_quantity ASC LIMIT 10
            `);
            context.aluminum_low = await safeQuery(`
                SELECT code, name, quantity, color FROM aluminum_systems
                ORDER BY quantity ASC LIMIT 10
            `);
            context.inventory_low = await safeQuery(`
                SELECT item_code, item_name, quantity FROM inventory
                ORDER BY quantity ASC LIMIT 10
            `);
        }

        if (msgLower.includes('dự án') || msgLower.includes('project') || msgLower.includes('tiến độ') || msgLower.includes('deadline')) {
            context.active_projects = await safeQuery(`
                SELECT p.project_name, p.project_code, p.status, p.deadline, 
                       p.total_value, c.full_name as customer_name
                FROM projects p
                LEFT JOIN customers c ON p.customer_id = c.id
                WHERE p.status NOT IN ('completed','done','cancelled')
                ORDER BY p.deadline ASC LIMIT 10
            `);
        }

        if (msgLower.includes('tài chính') || msgLower.includes('doanh thu') || msgLower.includes('chi phí') || msgLower.includes('thu') || msgLower.includes('chi') || msgLower.includes('tiền')) {
            context.financial_summary = await safeQuery(`
                SELECT transaction_type, SUM(amount) as total, COUNT(*) as count
                FROM financial_transactions
                WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY transaction_type
            `);
        }

        if (msgLower.includes('báo giá') || msgLower.includes('quotation')) {
            context.recent_quotations = await safeQuery(`
                SELECT q.id, c.full_name as customer_name, q.status, 
                       q.total_amount, q.created_at
                FROM quotations q
                LEFT JOIN customers c ON q.customer_id = c.id
                ORDER BY q.created_at DESC LIMIT 10
            `);
        }

        if (msgLower.includes('khách') || msgLower.includes('customer')) {
            context.recent_customers = await safeQuery(`
                SELECT full_name, phone, email, address FROM customers
                ORDER BY created_at DESC LIMIT 10
            `);
        }

        // Tìm mã code cụ thể (VR001, VRA-55...)
        const codeMatch = message.match(/[A-Z]{2,}[-\s]?\d+/gi);
        if (codeMatch) {
            for (const code of codeMatch.slice(0, 3)) {
                const cleanCode = code.trim();
                const accRows = await safeQuery('SELECT code, name, stock_quantity, sale_price FROM accessories WHERE code = ? LIMIT 1', [cleanCode]);
                if (accRows.length > 0) context[`item_${cleanCode}`] = { type: 'accessory', ...accRows[0] };

                const aluRows = await safeQuery('SELECT code, name, quantity, color FROM aluminum_systems WHERE code = ? LIMIT 1', [cleanCode]);
                if (aluRows.length > 0) context[`item_${cleanCode}`] = { type: 'aluminum', ...aluRows[0] };

                const invRows = await safeQuery('SELECT item_code, item_name, quantity FROM inventory WHERE item_code = ? LIMIT 1', [cleanCode]);
                if (invRows.length > 0) context[`item_${cleanCode}`] = { type: 'inventory', ...invRows[0] };
            }
        }

    } catch (error) {
        console.error('❌ aiDataCollector.getChatContext error:', error.message);
        context.error = error.message;
    }

    return context;
}

// =====================================================
// 4. REPORT DATA
// =====================================================
async function getReportData(type = 'daily', dateRange = {}) {
    const data = {};

    try {
        let dateFilter;
        if (type === 'daily') dateFilter = 'CURDATE()';
        else if (type === 'weekly') dateFilter = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        else dateFilter = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';

        // Dự án (JOIN customers)
        data.projects_updated = await safeQuery(`
            SELECT p.project_name, p.project_code, p.status, p.deadline, 
                   p.total_value, p.updated_at, c.full_name as customer_name
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.updated_at >= ${dateFilter}
            ORDER BY p.updated_at DESC LIMIT 20
        `);

        // Phiếu kho
        data.stock_documents = await safeQuery(`
            SELECT doc_no, doc_type, status, total_value, note, created_at
            FROM stock_documents
            WHERE created_at >= ${dateFilter}
            ORDER BY created_at DESC LIMIT 20
        `);

        // Tài chính tổng
        data.financial_summary = await safeQuery(`
            SELECT transaction_type, SUM(amount) as total, COUNT(*) as count
            FROM financial_transactions
            WHERE transaction_date >= ${dateFilter}
            GROUP BY transaction_type
        `);

        // Tài chính chi tiết
        data.financial_detail = await safeQuery(`
            SELECT transaction_type, category, SUM(amount) as total, COUNT(*) as count
            FROM financial_transactions
            WHERE transaction_date >= ${dateFilter}
            GROUP BY transaction_type, category
            ORDER BY total DESC
        `);

        // Kho tồn thấp
        data.low_stock_items = await safeQuery(`
            (SELECT 'accessory' as item_type, code, name, stock_quantity as qty FROM accessories WHERE stock_quantity <= 5 LIMIT 10)
            UNION ALL
            (SELECT 'aluminum' as item_type, code, name, quantity as qty FROM aluminum_systems WHERE quantity <= 5 LIMIT 10)
            UNION ALL
            (SELECT 'inventory' as item_type, item_code as code, item_name as name, quantity as qty FROM inventory WHERE quantity <= 5 LIMIT 10)
        `);

        data.report_type = type;
        data.generated_at = new Date().toISOString();

    } catch (error) {
        console.error('❌ aiDataCollector.getReportData error:', error.message);
        data.error = error.message;
    }

    return data;
}

module.exports = {
    getDashboardContext,
    executeSearch,
    getChatContext,
    getReportData
};
