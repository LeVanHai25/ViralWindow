// ============================================
// PROCESS ERROR HANDLING (Architect Safety Net)
// ============================================
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const express = require("express");
const cors = require("cors");
const http = require('http');
const fs = require('fs');
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const autoMigrate = require("./auto_migrate");

// Khởi chạy Auto-Migration (Async)
autoMigrate().catch(err => console.error("Migration failed:", err));

// Standardize timezone for whole app
process.env.TZ = "Asia/Ho_Chi_Minh";

const app = express();

// ============================================
// GLOBAL MIDDLEWARES (CORS MUST BE FIRST)
// ============================================
app.use(cors());

// ============================================
// SECURITY & LIMITERS
// ============================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Tăng lên 1000 để thoải mái phát triển
    message: { success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", apiLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Tăng lên 50
    message: { success: false, message: "Thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút." }
});
app.use("/api/auth/login", loginLimiter);

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth & Logging Middlewares
const { optionalAuth } = require('./middleware/auth');
const activityLogMiddleware = require('./middleware/activityLog');
app.use(optionalAuth);
app.use(activityLogMiddleware);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'FontEnd', 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'FontEnd')));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "ViralWindow API Server", version: "1.2.0", uptime: process.uptime() });
});

// ============================================
// ROUTES AUTO-LOADER
// ============================================
const routesPath = path.join(__dirname, "routes");
const routeAliases = {
    'auth': ['/api/auth', '/api/users'],
    'company-settings': ['/api/company-settings', '/api/settings'],
    'purchase-requests': ['/api/purchase-requests', '/api/material-requests'],
    'aluminumSystemRoutes': ['/api/catalog/aluminum-systems', '/api/aluminum-systems'],
    'stockDocument': ['/api/stock-documents'],
    'production-excel': ['/api/production'],
    'designWorkflow': ['/api/design'],
    'projectMaterialRoutes': ['/api/project-materials'],
    'warehouseExportRoutes': ['/api/warehouse-export'],
    'exportSlipRoutes': ['/api/export-slips'],
    'apiV2': ['/api/v2'],
};

fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".js")) {
        const routeName = file.replace(".js", "");
        const route = require(path.join(routesPath, file));
        
        if (routeAliases[routeName]) {
            routeAliases[routeName].forEach(alias => app.use(alias, route));
        } 
        
        const defaultPath = `/api/${routeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
        const isAliased = Object.values(routeAliases).flat().includes(defaultPath);
        if (!isAliased) app.use(defaultPath, route);
    }
});

// ============================================
// SOCKET.IO & MIGRATIONS
// ============================================
const { initSocketIO } = require('./services/socketService');
const ioInstance = initSocketIO(httpServer);
app.set('io', ioInstance);

// ============================================
// ERROR HANDLING (MUST BE LAST)
// ============================================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Server Start
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] 🔥 Server running at port ${PORT}`);
});
