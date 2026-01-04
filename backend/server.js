const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Tăng limit để hỗ trợ base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploads)
const path = require("path");
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'FontEnd')));

// Import routes
const aluminumRoutes = require("./routes/aluminum");
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
const doorTemplateFullRoutes = require("./routes/door-templates-full");
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

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/door-templates", doorTemplateRoutes);
app.use("/api/door-templates", doorTemplateFullRoutes);
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
// Đăng ký routes handover
const handoverRoutes = require("./routes/handover");
app.use("/api/handover", handoverRoutes); // Quản lý bàn giao
console.log('✅ Route /api/handover đã được đăng ký');
app.use("/api/accessories", accessoriesRoutes);
app.use("/api/customers", customerRoutes);
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

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ViralWindow API Server",
        version: "1.0.0"
    });
});

// 404 handler - phải đặt trước error handler
app.use((req, res, next) => {
    // Chỉ xử lý các route API, không xử lý static files
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: `API endpoint không tồn tại: ${req.method} ${req.path}`
        });
    } else {
        next();
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Đảm bảo luôn trả về JSON cho API routes
    if (req.path.startsWith('/api/')) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } else {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

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

