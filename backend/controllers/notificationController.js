const db = require("../config/db");

/**
 * GET /notifications - Lấy danh sách thông báo của user hiện tại
 * Schema: notifications table has user_id (NULL = all users), is_read directly in table
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

        // Get notifications for this user OR broadcast (user_id = NULL)
        let query = `
            SELECT 
                id,
                type,
                title,
                message,
                icon,
                color,
                priority,
                link,
                is_read,
                created_at,
                updated_at
            FROM notifications
            WHERE user_id = ? OR user_id IS NULL
        `;

        const params = [userId];

        if (only_unread == 1) {
            query += ' AND is_read = 0';
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);

        // Get total unread count
        const [unreadRows] = await db.query(
            `SELECT COUNT(*) as count 
             FROM notifications
             WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`,
            [userId]
        );

        res.json({
            success: true,
            data: rows,
            count: rows.length,
            unread_count: unreadRows[0].count
        });
    } catch (err) {
        console.error('Error getting notifications:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
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

        const [rows] = await db.query(
            `SELECT COUNT(*) as count 
             FROM notifications
             WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`,
            [userId]
        );

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
            message: "Lỗi server"
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

        const [result] = await db.query(
            `UPDATE notifications 
             SET is_read = 1, updated_at = NOW()
             WHERE id = ? AND (user_id = ? OR user_id IS NULL) AND is_read = 0`,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông báo hoặc đã đọc"
            });
        }

        res.json({
            success: true,
            message: "Đã đánh dấu đã đọc"
        });
    } catch (err) {
        console.error('Error marking as read:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
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

        const [result] = await db.query(
            `UPDATE notifications 
             SET is_read = 1, updated_at = NOW()
             WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0`,
            [userId]
        );

        res.json({
            success: true,
            message: `Đã đánh dấu ${result.affectedRows} thông báo đã đọc`,
            count: result.affectedRows
        });
    } catch (err) {
        console.error('Error marking all as read:', err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
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
