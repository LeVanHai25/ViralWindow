const db = require("../config/db");

// Cache column info to avoid repeated INFORMATION_SCHEMA queries
let notificationColumns = null;

async function getNotificationColumns() {
    if (notificationColumns) return notificationColumns;

    try {
        const [cols] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notifications'
        `);
        notificationColumns = cols.map(c => c.COLUMN_NAME.toLowerCase());
        console.log('Notification columns:', notificationColumns);
    } catch (e) {
        // Fallback to minimal columns
        notificationColumns = ['id', 'type', 'title', 'message', 'created_at'];
    }
    return notificationColumns;
}

/**
 * GET /notifications - Lấy danh sách thông báo của user hiện tại
 * Supports both old schema (with icon, color, priority) and new schema (with level, entity_type)
 */
exports.getAllNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập"
            });
        }

        const { limit = 50, offset = 0, only_unread = 0 } = req.query;

        // Get available columns
        const cols = await getNotificationColumns();

        // Build SELECT clause based on available columns
        const selectCols = ['id', 'type', 'title', 'message', 'created_at'];
        if (cols.includes('icon')) selectCols.push('icon');
        if (cols.includes('color')) selectCols.push('color');
        if (cols.includes('priority')) selectCols.push('priority');
        if (cols.includes('link')) selectCols.push('link');
        if (cols.includes('is_read')) selectCols.push('is_read');
        if (cols.includes('updated_at')) selectCols.push('updated_at');
        if (cols.includes('level')) selectCols.push('level');
        if (cols.includes('entity_type')) selectCols.push('entity_type');
        if (cols.includes('entity_id')) selectCols.push('entity_id');

        const hasUserIdCol = cols.includes('user_id');
        const hasIsReadCol = cols.includes('is_read');

        // Build WHERE clause
        let whereClause = '';
        const params = [];

        if (hasUserIdCol) {
            whereClause = 'WHERE user_id = ? OR user_id IS NULL';
            params.push(userId);
        } else {
            whereClause = 'WHERE 1=1'; // Get all notifications
        }

        if (only_unread == 1 && hasIsReadCol) {
            whereClause += ' AND is_read = 0';
        }

        const query = `
            SELECT ${selectCols.join(', ')}
            FROM notifications
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);

        // Add default values for missing columns
        const data = rows.map(row => ({
            id: row.id,
            type: row.type || 'system',
            title: row.title || '',
            message: row.message || '',
            icon: row.icon || '📢',
            color: row.color || (row.level === 'urgent' ? 'red' : row.level === 'important' ? 'yellow' : 'blue'),
            priority: row.priority || row.level || 'normal',
            link: row.link || '',
            is_read: row.is_read || 0,
            created_at: row.created_at,
            updated_at: row.updated_at || row.created_at
        }));

        // Get total unread count
        let unreadCount = 0;
        if (hasIsReadCol) {
            const unreadQuery = hasUserIdCol
                ? `SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`
                : `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0`;
            const unreadParams = hasUserIdCol ? [userId] : [];
            const [unreadRows] = await db.query(unreadQuery, unreadParams);
            unreadCount = unreadRows[0].count;
        }

        res.json({
            success: true,
            data: data,
            count: data.length,
            unread_count: unreadCount
        });
    } catch (err) {
        console.error('Error getting notifications:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * GET /notifications/unread-count - Đếm số thông báo chưa đọc
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.json({
                success: true,
                data: { count: 0 }
            });
        }

        const cols = await getNotificationColumns();
        const hasUserIdCol = cols.includes('user_id');
        const hasIsReadCol = cols.includes('is_read');

        if (!hasIsReadCol) {
            // No is_read column, return 0
            return res.json({
                success: true,
                data: { count: 0 }
            });
        }

        const query = hasUserIdCol
            ? `SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`
            : `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0`;
        const params = hasUserIdCol ? [userId] : [];

        const [rows] = await db.query(query, params);

        res.json({
            success: true,
            data: {
                count: rows[0].count
            }
        });
    } catch (err) {
        console.error('Error getting unread count:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * POST /notifications/:id/read - Đánh dấu đã đọc
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập"
            });
        }

        const cols = await getNotificationColumns();
        const hasUserIdCol = cols.includes('user_id');
        const hasIsReadCol = cols.includes('is_read');
        const hasUpdatedAtCol = cols.includes('updated_at');

        if (!hasIsReadCol) {
            return res.json({
                success: true,
                message: "Đã đánh dấu đã đọc (simulated)"
            });
        }

        const setCols = hasUpdatedAtCol ? 'is_read = 1, updated_at = NOW()' : 'is_read = 1';
        const query = hasUserIdCol
            ? `UPDATE notifications SET ${setCols} WHERE id = ? AND (user_id = ? OR user_id IS NULL) AND is_read = 0`
            : `UPDATE notifications SET ${setCols} WHERE id = ? AND is_read = 0`;
        const params = hasUserIdCol ? [id, userId] : [id];

        const [result] = await db.query(query, params);

        res.json({
            success: true,
            message: "Đã đánh dấu đã đọc"
        });
    } catch (err) {
        console.error('Error marking as read:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * POST /notifications/read-all - Đánh dấu tất cả đã đọc
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập"
            });
        }

        // Check available columns
        const cols = await getNotificationColumns();
        const hasUpdatedAtCol = cols.includes('updated_at');
        const hasUserIdCol = cols.includes('user_id');

        // Build SET clause based on available columns
        const setCols = hasUpdatedAtCol ? 'is_read = 1, updated_at = NOW()' : 'is_read = 1';

        // Build WHERE clause based on available columns
        let query, params;
        if (hasUserIdCol) {
            query = `UPDATE notifications SET ${setCols} WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`;
            params = [userId];
        } else {
            query = `UPDATE notifications SET ${setCols} WHERE is_read = 0`;
            params = [];
        }

        const [result] = await db.query(query, params);

        res.json({
            success: true,
            message: `Đã đánh dấu ${result.affectedRows} thông báo đã đọc`,
            count: result.affectedRows
        });
    } catch (err) {
        console.error('Error marking all as read:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
};

/**
 * DELETE /notifications/:id - Xóa thông báo
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập"
            });
        }

        const [result] = await db.query(
            `DELETE FROM notifications 
             WHERE id = ? AND (user_id = ? OR user_id IS NULL)`,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông báo"
            });
        }

        res.json({
            success: true,
            message: "Đã xóa thông báo"
        });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

/**
 * DELETE /notifications/delete-read - Xóa tất cả thông báo đã đọc
 */
exports.deleteAllRead = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Chưa đăng nhập"
            });
        }

        const [result] = await db.query(
            `DELETE FROM notifications 
             WHERE (user_id = ? OR user_id IS NULL) AND is_read = 1`,
            [userId]
        );

        res.json({
            success: true,
            message: `Đã xóa ${result.affectedRows} thông báo đã đọc`,
            count: result.affectedRows
        });
    } catch (err) {
        console.error('Error deleting read notifications:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

/**
 * POST /notifications - Tạo thông báo thủ công
 */
exports.create = async (req, res) => {
    try {
        const { type, title, message, link, icon, color, priority, user_id } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu title hoặc message'
            });
        }

        const [result] = await db.query(
            `INSERT INTO notifications 
             (user_id, type, title, message, link, icon, color, priority, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
            [
                user_id || null,
                type || 'system',
                title,
                message,
                link || null,
                icon || '📢',
                color || 'blue',
                priority || 'normal'
            ]
        );

        res.json({
            success: true,
            message: 'Tạo thông báo thành công',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating notification:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

/**
 * GET /notifications/:id/detail - Chi tiết thông báo với audit log
 */
exports.getDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Get notification
        const [notifications] = await db.query(
            `SELECT n.*, 
                    al.before_data, al.after_data, al.changed_fields, 
                    al.actor_name, al.action as audit_action
             FROM notifications n
             LEFT JOIN audit_logs al ON n.audit_log_id = al.id
             WHERE n.id = ?`,
            [id]
        );

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        const notification = notifications[0];

        // Parse JSON fields
        if (notification.before_data) {
            try {
                notification.before_data = JSON.parse(notification.before_data);
            } catch (e) { }
        }
        if (notification.after_data) {
            try {
                notification.after_data = JSON.parse(notification.after_data);
            } catch (e) { }
        }
        if (notification.changed_fields) {
            try {
                notification.changed_fields = JSON.parse(notification.changed_fields);
            } catch (e) { }
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (err) {
        console.error('Error getting notification detail:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

/**
 * GET /audit-logs - Lấy danh sách audit logs
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { entity_type, entity_id, actor_user_id, from_date, to_date, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                al.*,
                et.icon,
                et.color,
                et.severity,
                et.title_template
            FROM audit_logs al
            LEFT JOIN event_types et ON al.event_code = et.event_code
            WHERE 1=1
        `;
        const params = [];

        if (entity_type) {
            query += ' AND al.entity_type = ?';
            params.push(entity_type);
        }
        if (entity_id) {
            query += ' AND al.entity_id = ?';
            params.push(entity_id);
        }
        if (actor_user_id) {
            query += ' AND al.actor_user_id = ?';
            params.push(actor_user_id);
        }
        if (from_date) {
            query += ' AND al.created_at >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND al.created_at <= ?';
            params.push(to_date);
        }

        query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);

        // Parse JSON fields
        rows.forEach(row => {
            ['before_data', 'after_data', 'changed_fields'].forEach(field => {
                if (row[field]) {
                    try {
                        row[field] = JSON.parse(row[field]);
                    } catch (e) { }
                }
            });
        });

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('Error getting audit logs:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

/**
 * GET /audit-logs/entity/:type/:id - Lịch sử thay đổi của một entity
 */
exports.getEntityHistory = async (req, res) => {
    try {
        const { type, id } = req.params;

        const [rows] = await db.query(
            `SELECT 
                al.*,
                et.icon,
                et.color,
                et.severity,
                et.title_template
             FROM audit_logs al
             LEFT JOIN event_types et ON al.event_code = et.event_code
             WHERE al.entity_type = ? AND al.entity_id = ?
             ORDER BY al.created_at DESC`,
            [type, id]
        );

        // Parse JSON fields
        rows.forEach(row => {
            ['before_data', 'after_data', 'changed_fields'].forEach(field => {
                if (row[field]) {
                    try {
                        row[field] = JSON.parse(row[field]);
                    } catch (e) { }
                }
            });
        });

        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (err) {
        console.error('Error getting entity history:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

/**
 * GET /event-types - Lấy danh sách event types
 */
exports.getEventTypes = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM event_types WHERE is_active = 1 ORDER BY module, event_code`
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error('Error getting event types:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

