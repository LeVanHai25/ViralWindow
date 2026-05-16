const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: "Không có token xác thực" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // ARCHITECT OPTIMIZATION: Fetch user, role, and permissions in ONE query
        const [userData] = await db.query(`
            SELECT u.id, u.username, u.full_name, u.role_id, u.user_type,
                   GROUP_CONCAT(p.code) as permissions
            FROM users u
            LEFT JOIN role_permissions rp ON u.role_id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = ?
            GROUP BY u.id
        `, [decoded.id]);

        if (userData.length === 0) {
            return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
        }

        const user = userData[0];
        req.user = {
            ...user,
            permissions: user.permissions ? user.permissions.split(',') : []
        };

        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Chưa xác thực" });
    
    if (req.user.user_type === 'admin' || parseInt(req.user.role_id) === 1 || parseInt(req.user.role_id) === 2) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Chỉ quản trị viên mới có quyền truy cập" });
};

/**
 * Middleware kiểm tra quyền động (Optimized)
 * Kiểm tra trực tiếp trong req.user.permissions (No DB hits!)
 */
exports.requirePermission = (permissionCode) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Chưa xác thực" });
        }

        // Admin & Super Admin bypass
        if (req.user.user_type === 'admin' || parseInt(req.user.role_id) === 1) {
            return next();
        }

        if (req.user.permissions && req.user.permissions.includes(permissionCode)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Bạn không có quyền thực hiện hành động này (${permissionCode})`
        });
    };
};

