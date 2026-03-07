/**
 * SystemNotifier - Centralized notification helper
 * 
 * Cung cấp một API đơn giản cho tất cả controllers:
 *   SystemNotifier.notify(eventCode, entityName, entityId, actor, extraData)
 * 
 * Tự động:
 * - Ghi audit_logs
 * - Tạo notification (với template từ event_types)
 * - Log console
 * 
 * THIẾT KẾ: Fire-and-forget, không throw error, không block response
 */

const AuditLogService = require('./AuditLogService');
const NotificationEventService = require('./notificationEventService');

class SystemNotifier {
    /**
     * Gửi thông báo + ghi audit log cho một sự kiện
     * 
     * @param {string} eventCode - VD: 'project.created', 'customer.updated'
     * @param {Object} options
     * @param {string} options.entityName - Tên entity (hiển thị trong thông báo)
     * @param {number} options.entityId - ID entity
     * @param {Object} options.actor - {id, name, ip, userAgent} từ req.user + req
     * @param {Object} [options.beforeData] - Trạng thái trước thay đổi
     * @param {Object} [options.afterData] - Trạng thái sau thay đổi
     * @param {Array}  [options.changedFields] - Danh sách fields thay đổi
     * @param {string} [options.reason] - Lý do thay đổi
     * @param {string} [options.link] - Link frontend liên quan
     */
    static async notify(eventCode, options = {}) {
        const {
            entityName = '',
            entityId = null,
            actor = {},
            beforeData = null,
            afterData = null,
            changedFields = null,
            reason = null,
            link = null,
        } = options;

        const [module, action] = eventCode.split('.');
        const entityType = module;

        // 1. Ghi audit log + tự tạo notification
        try {
            await AuditLogService.log({
                eventCode,
                entityType,
                entityId,
                entityName,
                action: action || 'unknown',
                beforeData,
                afterData,
                changedFields,
                reason,
                actor: {
                    userId: actor.id || null,
                    name: actor.name || 'System',
                    ip: actor.ip || null,
                    userAgent: actor.userAgent || null,
                },
                createNotification: true,
            });
        } catch (auditErr) {
            // Fallback: nếu AuditLogService fail (vd: bảng chưa tạo), dùng NotificationEventService
            console.error(`[SystemNotifier] AuditLog failed for ${eventCode}:`, auditErr.message);
            try {
                await NotificationEventService.emit(eventCode, {
                    name: entityName,
                    project_name: entityName,
                    customer_name: entityName,
                    ...options.afterData,
                }, {
                    createdBy: actor.id,
                    entityType,
                    entityId,
                    link,
                });
            } catch (notifErr) {
                console.error(`[SystemNotifier] Notification also failed for ${eventCode}:`, notifErr.message);
            }
        }
    }

    /**
     * Helper: Trích xuất actor info từ Express request
     */
    static getActor(req) {
        return {
            id: req.user?.id || null,
            name: req.user?.name || req.user?.fullname || req.user?.username || 'System',
            ip: req.ip || req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || null,
            userAgent: req.headers?.['user-agent'] || null,
        };
    }

    /**
     * Tính danh sách fields thay đổi giữa 2 objects
     */
    static getChangedFields(before, after) {
        if (!before || !after) return null;
        const changed = [];
        const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
        for (const key of allKeys) {
            if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
                changed.push(key);
            }
        }
        return changed.length > 0 ? changed : null;
    }
}

module.exports = SystemNotifier;
