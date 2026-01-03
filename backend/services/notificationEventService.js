/**
 * Notification Event Service - Kiến trúc 3 lớp: Event → Rule → Notification
 * 
 * Cách sử dụng:
 * 1. Khi có sự kiện, gọi: NotificationEventService.emit('project.created', payload)
 * 2. Service sẽ tự động:
 *    - Tìm rule tương ứng
 *    - Tạo notification
 *    - Gửi cho các user theo rule
 */

const db = require('../config/db');

class NotificationEventService {
    /**
     * Emit event và tạo notification theo rule
     * @param {string} eventType - Loại event: 'project.created', 'quotation.approved', etc.
     * @param {object} payload - Dữ liệu event
     * @param {object} options - Tùy chọn: { createdBy, entityType, entityId, customRecipients }
     */
    static async emit(eventType, payload, options = {}) {
        try {
            // 1. Tìm rule cho event này
            const rule = await this.getRule(eventType);

            if (!rule || !rule.is_active) {
                console.log(`⚠️ No active rule for event: ${eventType}`);
                return null;
            }

            // 2. Tạo notification
            const notification = await this.createNotification(eventType, payload, rule, options);
            if (!notification) {
                console.error(`❌ Failed to create notification for: ${eventType}`);
                return null;
            }

            // 3. Tìm recipients theo rule
            const recipients = await this.getRecipients(rule, options);

            // 4. Gửi notification cho recipients
            if (recipients.length > 0) {
                await this.addRecipients(notification.id, recipients);
                console.log(`✅ Notification ${notification.id} sent to ${recipients.length} recipients`);
            } else {
                console.log(`⚠️ No recipients found for event: ${eventType}`);
            }

            return notification;
        } catch (error) {
            console.error(`Error emitting notification event ${eventType}:`, error);
            return null;
        }
    }

    /**
     * Lấy rule cho event type
     */
    static async getRule(eventType) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM notification_rules WHERE event_type = ? AND is_active = 1 LIMIT 1',
                [eventType]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting rule:', error);
            return null;
        }
    }

    /**
     * Tạo notification từ event và rule
     */
    static async createNotification(eventType, payload, rule, options) {
        try {
            const { title, message, level } = this.generateNotificationContent(eventType, payload);

            // Map level to color and priority
            const colorMap = { 'info': 'blue', 'important': 'green', 'urgent': 'red' };
            const priorityMap = { 'info': 'normal', 'important': 'high', 'urgent': 'urgent' };

            // Kiểm tra xem bảng có cột icon không
            let hasIconColumn = false;
            try {
                const [columns] = await db.query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_SCHEMA = DATABASE() 
                     AND TABLE_NAME = 'notifications' 
                     AND COLUMN_NAME = 'icon'`
                );
                hasIconColumn = columns.length > 0;
            } catch (checkError) {
                // Nếu không kiểm tra được, giả sử không có cột icon
                hasIconColumn = false;
            }

            // Tạo query INSERT tùy theo có cột icon hay không
            let query, params;
            if (hasIconColumn) {
                query = `INSERT INTO notifications 
                         (user_id, type, title, message, link, icon, color, priority, is_read, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`;
                params = [
                    null, // broadcast to all
                    eventType,
                    title,
                    message,
                    options.link || null,
                    '📢',
                    colorMap[level] || 'blue',
                    priorityMap[level] || 'normal'
                ];
            } else {
                query = `INSERT INTO notifications 
                         (user_id, type, title, message, link, color, priority, is_read, created_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`;
                params = [
                    null, // broadcast to all
                    eventType,
                    title,
                    message,
                    options.link || null,
                    colorMap[level] || 'blue',
                    priorityMap[level] || 'normal'
                ];
            }

            const [result] = await db.query(query, params);

            return {
                id: result.insertId,
                type: eventType,
                title,
                message
            };
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    /**
     * Generate title và message từ event type và payload
     */
    static generateNotificationContent(eventType, payload) {
        const eventMap = {
            // PROJECT EVENTS
            'project.created': {
                title: '🏗️ Dự án mới được tạo',
                message: `Dự án "${payload.project_name || payload.name || 'N/A'}" (${payload.project_code || ''}) vừa được tạo cho khách hàng "${payload.customer_name || 'N/A'}"`,
                level: 'info'
            },
            'project.updated': {
                title: '📝 Dự án được cập nhật',
                message: `Dự án "${payload.project_name || payload.name || 'N/A'}" đã được cập nhật`,
                level: 'info'
            },
            'project.status_changed': {
                title: '🔄 Trạng thái dự án thay đổi',
                message: `Dự án "${payload.project_name || payload.name || 'N/A'}" chuyển từ "${this.getStatusLabel(payload.old_status)}" sang "${this.getStatusLabel(payload.new_status)}"`,
                level: 'important'
            },
            'project.completed': {
                title: '✅ Dự án hoàn thành',
                message: `Dự án "${payload.project_name || payload.name || 'N/A'}" đã hoàn thành 100%`,
                level: 'important'
            },
            'project.deleted': {
                title: '🗑️ Dự án bị xóa',
                message: `Dự án "${payload.project_name || payload.name || 'N/A'}" đã bị xóa`,
                level: 'important'
            },

            // QUOTATION EVENTS
            'quotation.created': {
                title: '📄 Báo giá mới được tạo',
                message: `Báo giá "${payload.quotation_code || payload.code || 'N/A'}" cho khách hàng "${payload.customer_name || 'N/A'}" vừa được tạo`,
                level: 'info'
            },
            'quotation.submitted': {
                title: '📤 Báo giá đã gửi',
                message: `Báo giá "${payload.quotation_code || payload.code || 'N/A'}" đã được gửi cho khách hàng "${payload.customer_name || 'N/A'}"`,
                level: 'important'
            },
            'quotation.approved': {
                title: '✅ Báo giá được chốt',
                message: `Báo giá "${payload.quotation_code || payload.code || 'N/A'}" đã được khách hàng "${payload.customer_name || 'N/A'}" chấp nhận`,
                level: 'important'
            },
            'quotation.rejected': {
                title: '❌ Báo giá bị từ chối',
                message: `Báo giá "${payload.quotation_code || payload.code || 'N/A'}" đã bị khách hàng từ chối`,
                level: 'important'
            },

            // CUSTOMER EVENTS
            'customer.created': {
                title: '👤 Khách hàng mới',
                message: `Khách hàng "${payload.customer_name || payload.full_name || 'N/A'}" (${payload.customer_code || ''}) vừa được thêm vào hệ thống`,
                level: 'info'
            },
            'customer.updated': {
                title: '📝 Khách hàng được cập nhật',
                message: `Thông tin khách hàng "${payload.customer_name || payload.full_name || 'N/A'}" đã được cập nhật`,
                level: 'info'
            },

            // INVENTORY EVENTS
            'inventory.imported': {
                title: '📥 Nhập kho',
                message: `Đã nhập ${payload.quantity || 0} ${payload.unit || 'cái'} ${payload.item_name || payload.name || 'N/A'}`,
                level: 'info'
            },
            'inventory.exported': {
                title: '📤 Xuất kho',
                message: `Đã xuất ${payload.quantity || 0} ${payload.unit || 'cái'} ${payload.item_name || payload.name || 'N/A'}`,
                level: 'info'
            },
            'inventory.low_stock': {
                title: '⚠️ Vật tư sắp hết',
                message: `${payload.item_name || payload.name || 'N/A'} (${payload.item_code || payload.code || ''}) còn ${payload.current_stock || 0} ${payload.unit || 'cái'}, dưới mức tối thiểu (${payload.min_stock || 0})`,
                level: 'urgent'
            },
            'inventory.out_of_stock': {
                title: '🚨 Vật tư hết hàng',
                message: `${payload.item_name || payload.name || 'N/A'} (${payload.item_code || payload.code || ''}) đã hết hàng, cần nhập kho ngay`,
                level: 'urgent'
            },

            // PRODUCTION EVENTS
            'production.order_created': {
                title: '🏭 Lệnh sản xuất mới',
                message: `Lệnh sản xuất "${payload.order_code || payload.code || 'N/A'}" cho dự án "${payload.project_name || 'N/A'}" vừa được tạo`,
                level: 'info'
            },
            'production.completed': {
                title: '✅ Sản xuất hoàn thành',
                message: `Lệnh sản xuất "${payload.order_code || payload.code || 'N/A'}" đã hoàn thành 100%, sẵn sàng lắp đặt`,
                level: 'important'
            },
            'production.progress_updated': {
                title: '📊 Tiến độ sản xuất cập nhật',
                message: `Lệnh sản xuất "${payload.order_code || payload.code || 'N/A'}" đã đạt ${payload.progress || 0}%`,
                level: 'info'
            },

            // FINANCE EVENTS
            'finance.payment_received': {
                title: '💵 Phiếu thu mới',
                message: `Đã thu ${this.formatCurrency(payload.amount || 0)} từ "${payload.customer_name || 'N/A'}"`,
                level: 'info'
            },
            'finance.payment_made': {
                title: '💸 Phiếu chi mới',
                message: `Đã chi ${this.formatCurrency(payload.amount || 0)} cho "${payload.supplier_name || payload.description || 'N/A'}"`,
                level: 'info'
            },
            'finance.debt_overdue': {
                title: '⚠️ Công nợ quá hạn',
                message: `Khách hàng "${payload.customer_name || 'N/A'}" có khoản nợ ${this.formatCurrency(payload.amount || 0)} quá hạn ${payload.days_overdue || 0} ngày`,
                level: 'urgent'
            },

            // SYSTEM EVENTS
            'system.user_login': {
                title: '🔐 Đăng nhập hệ thống',
                message: `Người dùng "${payload.username || payload.full_name || 'N/A'}" vừa đăng nhập`,
                level: 'info'
            },
            'system.backup_done': {
                title: '💾 Sao lưu hoàn thành',
                message: 'Hệ thống đã hoàn thành sao lưu dữ liệu',
                level: 'info'
            }
        };

        const content = eventMap[eventType] || {
            title: '📢 Thông báo mới',
            message: payload.message || 'Có thay đổi trong hệ thống',
            level: 'info'
        };

        return content;
    }

    /**
     * Lấy danh sách recipients theo rule
     */
    static async getRecipients(rule, options) {
        const recipients = [];

        // Nếu có custom recipients trong options, ưu tiên dùng
        if (options.customRecipients && Array.isArray(options.customRecipients)) {
            return options.customRecipients;
        }

        // Lấy recipients theo role
        if (rule.recipient_roles) {
            const roles = JSON.parse(rule.recipient_roles);
            if (Array.isArray(roles) && roles.length > 0) {
                const roleUsers = await this.getUsersByRoles(roles);
                recipients.push(...roleUsers);
            }
        }

        // Lấy recipients theo user IDs
        if (rule.recipient_user_ids) {
            const userIds = JSON.parse(rule.recipient_user_ids);
            if (Array.isArray(userIds) && userIds.length > 0) {
                recipients.push(...userIds);
            }
        }

        // Loại bỏ duplicate
        return [...new Set(recipients)];
    }

    /**
     * Lấy danh sách user IDs theo roles
     */
    static async getUsersByRoles(roles) {
        try {
            // Giả sử có bảng users với cột role
            // Nếu không có, có thể map role sang user IDs thủ công
            const [rows] = await db.query(
                'SELECT id FROM users WHERE role IN (?)',
                [roles]
            );
            return rows.map(r => r.id);
        } catch (error) {
            console.error('Error getting users by roles:', error);
            // Fallback: trả về empty array hoặc default users
            return [];
        }
    }

    /**
     * Thêm recipients vào notification
     */
    static async addRecipients(notificationId, userIds) {
        if (!userIds || userIds.length === 0) return;

        try {
            const values = userIds.map(userId => [notificationId, userId]);
            await db.query(
                'INSERT IGNORE INTO notification_recipients (notification_id, user_id, is_read, created_at) VALUES ?',
                [values]
            );
        } catch (error) {
            console.error('Error adding recipients:', error);
        }
    }

    /**
     * Helper: Format currency
     */
    static formatCurrency(amount) {
        if (!amount) return '0₫';
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    /**
     * Helper: Get status label
     */
    static getStatusLabel(status) {
        const labels = {
            'new': 'Mới tạo',
            'planning': 'Đang lập kế hoạch',
            'waiting_quotation': 'Chờ báo giá',
            'quotation_pending': 'Chờ duyệt báo giá',
            'quotation_approved': 'Đã duyệt báo giá',
            'in_production': 'Đang sản xuất',
            'installation': 'Đang lắp đặt',
            'handover': 'Đã bàn giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy',
            'paused': 'Tạm dừng'
        };
        return labels[status] || status;
    }
}

module.exports = NotificationEventService;

