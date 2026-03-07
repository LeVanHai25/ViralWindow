/**
 * Activity Log Middleware
 * Tự động ghi log cho mọi API request có thay đổi dữ liệu
 * (POST, PUT, PATCH, DELETE)
 * 
 * Fire-and-forget: Không block response, không dùng transaction
 */

const db = require('../config/db');

// Danh sách URL patterns không cần log
const SKIP_PATTERNS = [
    '/api/notifications',    // Không log chính thông báo
    '/api/audit-logs',       // Không log chính audit log
    '/health',               // Health check
    '/favicon',
];

// Danh sách field nhạy cảm cần lọc
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'jwt', 'authorization', 'cookie'];

/**
 * Lọc bỏ fields nhạy cảm khỏi body
 */
function sanitizeBody(body) {
    if (!body || typeof body !== 'object') return null;
    const sanitized = {};
    for (const [key, value] of Object.entries(body)) {
        if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
            sanitized[key] = '***HIDDEN***';
        } else if (typeof value === 'string' && value.length > 500) {
            sanitized[key] = value.substring(0, 500) + '...[truncated]';
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Middleware function
 */
function activityLogMiddleware(req, res, next) {
    // Chỉ log các request thay đổi dữ liệu
    const method = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return next();
    }

    // Skip các URL không cần log
    if (SKIP_PATTERNS.some(p => req.originalUrl.startsWith(p))) {
        return next();
    }

    const startTime = Date.now();

    // Override res.json / res.send to capture status after response
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const logAfterResponse = () => {
        const duration = Date.now() - startTime;

        // Fire-and-forget: log async, don't await
        const logData = {
            user_id: req.user?.id || null,
            user_name: req.user?.name || req.user?.fullname || null,
            method: method,
            url: req.originalUrl.substring(0, 500),
            status_code: res.statusCode,
            duration_ms: duration,
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null,
            user_agent: req.headers['user-agent']?.substring(0, 500) || null,
            request_body: method !== 'GET' ? JSON.stringify(sanitizeBody(req.body))?.substring(0, 2000) : null,
        };

        db.query(
            `INSERT INTO activity_logs 
             (user_id, user_name, method, url, status_code, duration_ms, ip_address, user_agent, request_body)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                logData.user_id,
                logData.user_name,
                logData.method,
                logData.url,
                logData.status_code,
                logData.duration_ms,
                logData.ip_address,
                logData.user_agent,
                logData.request_body
            ]
        ).catch(err => {
            // Không cho middleware crash server
            if (!err.message?.includes("doesn't exist")) {
                console.error('[ActivityLog] Error:', err.message);
            }
        });
    };

    res.json = function (data) {
        logAfterResponse();
        return originalJson(data);
    };

    res.send = function (data) {
        logAfterResponse();
        return originalSend(data);
    };

    next();
}

module.exports = activityLogMiddleware;
