const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Standardize timezone for whole app
process.env.TZ = "Asia/Ho_Chi_Minh";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng limit để hỗ trợ base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth Middlewares
const { optionalAuth } = require('./middleware/auth');

// Activity Log Middleware - Tự động ghi log mọi API request thay đổi data
const activityLogMiddleware = require('./middleware/activityLog');

// Register middlewares in corect order
app.use(optionalAuth); // Populate req.user
app.use(activityLogMiddleware); // Log activity using populated req.user

// Serve static files (uploads)
const path = require("path");
// From FontEnd/uploads (legacy)
app.use('/uploads', express.static(path.join(__dirname, '..', 'FontEnd', 'uploads')));
// From backend/uploads (project photos, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'FontEnd')));

// Import routes
const aluminumRoutes = require("./routes/aluminum");
const catalogMaterialsRoutes = require('./routes/catalog-materials');
const projectRoutes = require("./routes/projects");
const accessoriesRoutes = require("./routes/accessories");
const customerRoutes = require("./routes/customers");
const quotationRoutes = require("./routes/quotations");
const reportRoutes = require("./routes/reports");
const productionOrderRoutes = require("./routes/production-orders");
const inventoryRoutes = require("./routes/inventory");
const inventoryTransactionRoutes = require("./routes/inventory-transactions");
const inventoryInRoutes = require("./routes/inventory-in");
const inventoryOutRoutes = require("./routes/inventory-out");
const inventoryWarningRoutes = require("./routes/inventory-warnings");
const formulaRoutes = require("./routes/formulas");
const companySettingsRoutes = require("./routes/company-settings");
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const doorTemplateRoutes = require("./routes/door-templates");
// MERGED into door-templates.js - no longer needed separately
// const doorTemplateFullRoutes = require("./routes/door-templates-full");
const userDoorLibraryRoutes = require("./routes/user-door-library");
const doorDrawingRoutes = require("./routes/door-drawings");
const projectSummaryRoutes = require("./routes/project-summaries");
const productionDrawingRoutes = require("./routes/production-drawings");
const bomRoutes = require("./routes/bom");
const cuttingOptimizationRoutes = require("./routes/cutting-optimization");
const productionProgressRoutes = require("./routes/production-progress");
const labelRoutes = require("./routes/labels");
const financialRoutes = require("./routes/financial");
const debtRoutes = require("./routes/debts");
const profitReportRoutes = require("./routes/profit-reports");
const workflowRoutes = require("./routes/workflow");
const aluminumProfileRoutes = require("./routes/aluminum-profiles");
const cuttingFormulaRoutes = require("./routes/cutting-formulas");
const accessoryUsageRoutes = require("./routes/accessory-usage");
const aluminumBarSummaryRoutes = require("./routes/aluminum-bar-summary");
const projectDoorRoutes = require("./routes/project-doors");
const projectMaterialRoutes = require("./routes/projectMaterialRoutes");
const productionManagementRoutes = require("./routes/production-management");
const installationRoutes = require("./routes/installation");
// NEW: Product Templates System (thay thế door-templates)
const productTemplateRoutes = require("./routes/product-templates");
const projectItemRoutes = require("./routes/project-items");
// NEW: API V2 - ACT Style Architecture
const apiV2Routes = require("./routes/apiV2");
// NEW: Warehouse Export
const warehouseExportRoutes = require("./routes/warehouseExportRoutes");
// NEW: File Upload for quotation items
const uploadRoutes = require("./routes/uploadRoutes");
// NEW: BOM Export Excel
const bomExportRoutes = require("./routes/bom-export");
// NEW: Purchase Requests
const purchaseRequestRoutes = require("./routes/purchase-requests");
// NEW: Manufacturing - Smart Status Tracking
const manufacturingRoutes = require("./routes/manufacturing");
// NEW: Glass Items API - Sync với Bảng kính
const glassItemRoutes = require("./routes/glass-items");
// NEW: Order Tracking Dashboard
const orderTrackingRoutes = require("./routes/order-tracking");
// NEW: Production Excel View (Phase 1.5 - API Contract)
const productionExcelRoutes = require("./routes/production-excel");
const warehouseRoutes = require("./routes/warehouses");

// Use routes
app.use("/api/auth", authRoutes);
// ALIAS: /api/users để frontend có thể gọi /api/users/me
app.use("/api/users", authRoutes);
console.log('✅ Route /api/users đã được đăng ký (alias của auth - hỗ trợ /api/users/me)');

// NEW: Aluminum Catalog Systems (Moved up for priority)
const aluminumCatalogSystemRoutes = require("./routes/aluminumSystemRoutes");
app.use("/api/catalog/aluminum-systems", aluminumCatalogSystemRoutes);
console.log('✅ Route /api/catalog/aluminum-systems đã được đăng ký');
app.use("/api/notifications", notificationRoutes);
app.use("/api/door-templates", doorTemplateRoutes);
// MERGED - /full routes are now in door-templates.js
// app.use("/api/door-templates", doorTemplateFullRoutes);
app.use("/api/user-door-library", userDoorLibraryRoutes);
app.use("/api/door-drawings", doorDrawingRoutes);
app.use("/api/project-summaries", projectSummaryRoutes);
app.use("/api/production-drawings", productionDrawingRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/cutting-optimization", cuttingOptimizationRoutes);
app.use("/api/production-progress", productionProgressRoutes);
app.use("/api/labels", labelRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/profit-reports", profitReportRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/aluminum-systems", aluminumRoutes);
app.use("/api/catalog-materials", catalogMaterialsRoutes);
app.use("/api/aluminum-profiles", aluminumProfileRoutes);
app.use("/api/cutting-formulas", cuttingFormulaRoutes);
app.use("/api/accessory-usage", accessoryUsageRoutes);
app.use("/api", aluminumBarSummaryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", projectDoorRoutes); // Project doors (Door Catalog integration) - DEPRECATED
// NEW: Product Templates System
app.use("/api/product-templates", productTemplateRoutes);
console.log('✅ Route /api/product-templates đã được đăng ký');
app.use("/api/projects", projectItemRoutes); // Project items (thay thế project-doors)
console.log('✅ Route /api/projects/:id/items đã được đăng ký');
// Đăng ký routes project-materials
app.use("/api/project-materials", projectMaterialRoutes); // Xuất vật tư cho dự án
console.log('✅ Route /api/project-materials đã được đăng ký');
// Đăng ký routes production-management
app.use("/api/production-management", productionManagementRoutes); // Quản lý sản xuất
console.log('✅ Route /api/production-management đã được đăng ký');
// Đăng ký routes installation
app.use("/api/installation", installationRoutes); // Quản lý lắp đặt
console.log('✅ Route /api/installation đã được đăng ký');
// Đăng ký routes manufacturing (NEW - Smart Status)
app.use("/api/manufacturing", manufacturingRoutes); // Sản xuất sản phẩm
console.log('✅ Route /api/manufacturing đã được đăng ký');
// NEW: Glass Items API
app.use("/api/glass-items", glassItemRoutes); // Bảng kính
console.log('✅ Route /api/glass-items đã được đăng ký');
// NEW: Order Tracking Dashboard
app.use("/api/order-tracking", orderTrackingRoutes); // Theo dõi đơn hàng
console.log('✅ Route /api/order-tracking đã được đăng ký');
// NEW: Production Excel View (Phase 1.5 - API Contract)
app.use("/api/production", productionExcelRoutes);
console.log('✅ Route /api/production/excel-orders đã được đăng ký');
// DEPRECATED: Aluminum Catalog Systems was here
// Đăng ký routes handover
const handoverRoutes = require("./routes/handover");
app.use("/api/handover", handoverRoutes); // Quản lý bàn giao
console.log('✅ Route /api/handover đã được đăng ký');
app.use("/api/accessories", accessoriesRoutes);
app.use("/api/customers", customerRoutes);
// NEW: Units (Đơn vị/Chi nhánh) - DEPRECATED: use agencies instead
const unitRoutes = require("./routes/units");
app.use("/api/units", unitRoutes);
console.log('✅ Route /api/units đã được đăng ký');
// NEW: Agencies (Đại lý/Chi nhánh)
const agencyRoutes = require("./routes/agencies");
app.use("/api/agencies", agencyRoutes);
console.log('✅ Route /api/agencies đã được đăng ký');
console.log('✅ Route /api/customers đã được đăng ký (bao gồm /api/customers/next-code)');
app.use("/api/quotations", quotationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/production-orders", productionOrderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory/transactions", inventoryTransactionRoutes);
app.use("/api/inventory/in", inventoryInRoutes);
app.use("/api/inventory/out", inventoryOutRoutes);
app.use("/api/inventory/warnings", inventoryWarningRoutes);
app.use("/api/formulas", formulaRoutes);
app.use("/api/company-settings", companySettingsRoutes);
// ALIAS: /api/settings (backwards compatibility for frontend)
app.use("/api/settings", companySettingsRoutes);
console.log('✅ Route /api/settings đã được đăng ký (alias của company-settings)');
// NEW: API V2 - ACT Style Architecture
app.use("/api/v2", apiV2Routes);
console.log('✅ Route /api/v2 (ACT Style) đã được đăng ký');
// NEW: Warehouse Export
app.use("/api/warehouse-export", warehouseExportRoutes);
console.log('✅ Route /api/warehouse-export đã được đăng ký');
// NEW: File Upload for quotation items
app.use("/api/upload", uploadRoutes);
console.log('✅ Route /api/upload đã được đăng ký');
// NEW: BOM Export Excel
app.use("/api/bom-export", bomExportRoutes);
console.log('✅ Route /api/bom-export đã được đăng ký');
// NEW: Purchase Requests
app.use("/api/purchase-requests", purchaseRequestRoutes);
console.log('✅ Route /api/purchase-requests đã được đăng ký');
// ALIAS: Material Requests (cùng routes, tên khác cho frontend material-requests.html)
app.use("/api/material-requests", purchaseRequestRoutes);
console.log('✅ Route /api/material-requests đã được đăng ký (alias của purchase-requests)');

// NEW: Material Search (Autocomplete cho trang Yêu cầu vật tư)
const materialSearchRoutes = require("./routes/material-search");
app.use("/api/materials", materialSearchRoutes);
console.log('✅ Route /api/materials/search đã được đăng ký (Autocomplete vật tư)');

// NEW: Export Slips (Phiếu xuất kho)
const exportSlipRoutes = require("./routes/exportSlipRoutes");
app.use("/api/export-slips", exportSlipRoutes);
console.log('✅ Route /api/export-slips đã được đăng ký');

// NEW: Design Workflow (State Machine based)
const designWorkflowRoutes = require("./routes/designWorkflow");
app.use("/api/design", designWorkflowRoutes);
console.log('✅ Route /api/design đã được đăng ký (Design Workflow với State Machine)');

// NEW: Stock Documents (KiotViet style - Phiếu nhập/xuất/kiểm kho)
const stockDocumentRoutes = require("./routes/stockDocument");
app.use("/api/stock-documents", stockDocumentRoutes);
console.log('✅ Route /api/stock-documents đã được đăng ký (Phiếu kho KiotViet style)');

// NEW: Suppliers (Nhà cung cấp)
const supplierRoutes = require("./routes/suppliers");
app.use("/api/suppliers", supplierRoutes);
console.log('✅ Route /api/suppliers đã được đăng ký (Quản lý NCC)');

// NEW: Items (Unified Item Master API)
const itemRoutes = require("./routes/items");
app.use("/api/items", itemRoutes);
console.log('✅ Route /api/items đã được đăng ký (Tạo vật tư mới)');

// NEW: Product Catalog (Nhóm SP + Sản phẩm cửa)
const productCatalogRoutes = require("./routes/product-catalog");
app.use("/api/product-catalog", productCatalogRoutes);
console.log('✅ Route /api/product-catalog đã được đăng ký (Nhóm SP + Sản phẩm cửa)');

app.use("/api/inventory-warehouses", warehouseRoutes);
console.log('✅ Route /api/inventory-warehouses đã được đăng ký');



// ============================================
// RBAC - Role-Based Access Control
// ============================================
const roleRoutes = require("./routes/roles");
const permissionRoutes = require("./routes/permissions");
const userManagementRoutes = require("./routes/user-management");

app.use("/api/roles", roleRoutes);
console.log('✅ Route /api/roles đã được đăng ký (Quản lý Chức vụ)');

app.use("/api/permissions", permissionRoutes);
console.log('✅ Route /api/permissions đã được đăng ký (Quản lý Quyền)');

app.use("/api/user-management", userManagementRoutes);
console.log('✅ Route /api/user-management đã được đăng ký (Quản lý Người dùng)');

// ============================================
// SECURITY - Login History, Sessions, Password Change
// ============================================
const securityRoutes = require("./routes/security");
app.use("/api/security", securityRoutes);
console.log('🔐 Route /api/security đã được đăng ký (Login History, Sessions, Password)');

// DEBUG Routes (Development only)
const debugRoutes = require("./routes/debug");
app.use("/api/debug", debugRoutes);
console.log('🔧 Route /api/debug đã được đăng ký (Debug APIs)');


// Health check - API endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "ViralWindow API Server",
        version: "1.0.0"
    });
});

// ============================================
// ERROR HANDLING (Centralized)
// ============================================
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler cho API routes
app.use('/api', notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// ============================================
// STARTUP DB MIGRATIONS (fix TiDB compatibility)
// ============================================
async function runStartupMigrations() {
    const db = require('./config/db');

    // 1. Create aluminum_warehouse_catalog_systems if not exists
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS aluminum_warehouse_catalog_systems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                system_name VARCHAR(255) UNIQUE NOT NULL,
                display_order INT DEFAULT 0,
                is_active TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Migration: aluminum_warehouse_catalog_systems table created/verified');

        // Check if table is empty to seed defaults
        const [rows] = await db.query('SELECT COUNT(*) as count FROM aluminum_warehouse_catalog_systems');
        if (rows[0].count === 0) {
            console.log('🌱 Seeding default aluminum systems...');
            const defaults = [
                'VRA – Hệ 55 mở quay', 'VRA – Hệ 50', 'VRA – Hệ 64 (cửa sổ lùa)',
                'VRE – Hệ 65 mở quay (Mạnh Quy)', 'VRE – Hệ 65 mở quay (Yangly)',
                'VRE – Hệ xếp trượt 80', 'VRE – Hệ lùa 120 & 180',
                'Hệ lùa 94 mới', 'Thủy lực', 'Mặt dựng'
            ];
            for (const name of defaults) {
                await db.query('INSERT IGNORE INTO aluminum_warehouse_catalog_systems (system_name) VALUES (?)', [name]);
            }
            console.log('✅ Seeded default aluminum systems');
        }
    } catch (err) {
        console.error('❌ Migration Error (Aluminum Catalog):', err.message);
    }

    const migrations = [
        {
            name: 'user_sessions AUTO_INCREMENT',
            sql: "ALTER TABLE user_sessions MODIFY id int(11) NOT NULL AUTO_INCREMENT"
        },
        {
            name: 'login_history AUTO_INCREMENT',
            sql: "ALTER TABLE login_history MODIFY id int(11) NOT NULL AUTO_INCREMENT"
        }
    ];

    for (const m of migrations) {
        try {
            await db.query(m.sql);
            console.log(`✅ Migration: ${m.name}`);
        } catch (err) {
            // Ignore if already applied or table doesn't exist
            if (!err.message.includes('already exists') && !err.message.includes("doesn't exist")) {
                console.log(`⚠️ Migration ${m.name}: ${err.message}`);
            }
        }
    }
}

// Run migrations on startup
runStartupMigrations().catch(err => console.error('Migration error:', err));

const PORT = process.env.PORT || 3001;

// Handle port already in use error
const server = app.listen(PORT, () => {
    console.log("🔥 API Server đang chạy tại http://localhost:" + PORT);
    console.log("📡 Các endpoints:");
    console.log("   GET  /api/aluminum-systems");
    console.log("   GET  /api/projects");
    console.log("   GET  /api/accessories");
    console.log("   GET  /api/customers");
    console.log("   GET  /api/quotations");
    console.log("   GET  /api/reports");
    console.log("   GET  /api/production-orders");
    console.log("   GET  /api/inventory");
    console.log("   GET  /api/formulas");
    console.log("   GET  /api/company-settings");
    console.log("   GET  /api/door-templates");
    console.log("   GET  /api/user-door-library");
    console.log("   GET  /api/door-drawings");
    console.log("   GET  /api/project-summaries/:projectId/aluminum");
    console.log("   GET  /api/project-summaries/:projectId/glass");
    console.log("   GET  /api/project-summaries/:projectId/accessories");
    console.log("   GET  /api/project-summaries/:projectId/quotation");
    console.log("   GET  /api/project-summaries/:projectId/financial");
    console.log("   ✅ GET  /api/project-materials/check-export-requirement/:projectId");
    console.log("   ✅ GET  /api/project-materials/exported");
    console.log("   ✅ GET  /api/projects/:id/detail");
});

// Handle port already in use
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ LỖI: Port ${PORT} đang được sử dụng!`);
        console.error(`\n💡 Giải pháp:`);
        console.error(`   1. Chạy: backend\\start-server-auto.bat`);
        console.error(`   2. Hoặc kill process: Get-Process node | Stop-Process -Force`);
        console.error(`   3. Hoặc đổi port trong file .env\n`);
        process.exit(1);
    } else {
        throw err;
    }
});

