/**
 * Audit Log Service
 * Logs all system changes for complete audit trail
 * Triggers notifications based on event types
 */

const db = require('../config/db');

class AuditLogService {
    /**
     * Log an action and optionally create notification
     * @param {Object} params
     * @param {string} params.eventCode - Event code (e.g., 'project.created')
     * @param {string} params.entityType - Entity type (project, customer, etc.)
     * @param {number} params.entityId - Entity ID
     * @param {string} params.entityName - Entity name for display
     * @param {string} params.action - Action performed
     * @param {Object} params.beforeData - State before change
     * @param {Object} params.afterData - State after change
     * @param {Array} params.changedFields - List of changed fields
     * @param {string} params.reason - Optional reason
     * @param {Object} params.actor - Actor info { userId, name, ip, userAgent }
     * @param {boolean} params.createNotification - Whether to create notification (default: true)
     */
    static async log(params) {
        const {
            eventCode,
            entityType,
            entityId,
            entityName = null,
            action,
            beforeData = null,
            afterData = null,
            changedFields = null,
            reason = null,
            actor = {},
            createNotification = true
        } = params;

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            // 1. Insert audit log
            const [logResult] = await connection.query(
                `INSERT INTO audit_logs 
                 (event_code, entity_type, entity_id, entity_name, action, 
                  actor_user_id, actor_name, before_data, after_data, changed_fields, 
                  reason, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    eventCode,
                    entityType,
                    entityId,
                    entityName,
                    action,
                    actor.userId || null,
                    actor.name || null,
                    beforeData ? JSON.stringify(beforeData) : null,
                    afterData ? JSON.stringify(afterData) : null,
                    changedFields ? JSON.stringify(changedFields) : null,
                    reason,
                    actor.ip || null,
                    actor.userAgent || null
                ]
            );

            const auditLogId = logResult.insertId;

            // 2. Create notification if requested
            if (createNotification) {
                await this.createNotificationFromLog(connection, {
                    auditLogId,
                    eventCode,
                    entityType,
                    entityId,
                    entityName,
                    afterData,
                    actor
                });
            }

            await connection.commit();
            console.log(`[AuditLog] ${eventCode} for ${entityType}:${entityId} by ${actor.name || 'System'}`);

            return { success: true, auditLogId };
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[AuditLog] Error:', error.message);
            return { success: false, error: error.message };
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Create notification from audit log
     */
    static async createNotificationFromLog(connection, params) {
        const { auditLogId, eventCode, entityType, entityId, entityName, afterData, actor } = params;

        try {
            // Get event type template
            const [eventTypes] = await connection.query(
                `SELECT * FROM event_types WHERE event_code = ? AND is_active = 1`,
                [eventCode]
            );

            if (eventTypes.length === 0) {
                // No template, create basic notification
                const title = this.generateBasicTitle(eventCode, entityName);
                const message = this.generateBasicMessage(eventCode, entityName, actor);

                await connection.query(
                    `INSERT INTO notifications 
                     (type, title, message, icon, color, priority, link, is_read, entity_type, entity_id, audit_log_id, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, NOW())`,
                    [
                        entityType,
                        title,
                        message,
                        '📢',
                        'blue',
                        'normal',
                        this.generateLink(entityType, entityId),
                        entityType,
                        entityId,
                        auditLogId
                    ]
                );
                return;
            }

            const eventType = eventTypes[0];

            // Build template data
            const templateData = {
                entity_name: entityName,
                actor_name: actor.name || 'Hệ thống',
                ...this.flattenObject(afterData || {})
            };

            // Replace placeholders
            const title = this.replacePlaceholders(eventType.title_template, templateData);
            const message = this.replacePlaceholders(eventType.message_template, templateData);

            // Insert notification
            await connection.query(
                `INSERT INTO notifications 
                 (type, title, message, icon, color, priority, link, is_read, entity_type, entity_id, audit_log_id, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, NOW())`,
                [
                    entityType,
                    title,
                    message,
                    eventType.icon,
                    eventType.color,
                    eventType.severity,
                    this.generateLink(entityType, entityId),
                    entityType,
                    entityId,
                    auditLogId
                ]
            );
        } catch (error) {
            console.error('[AuditLog] Error creating notification:', error.message);
        }
    }

    /**
     * Replace placeholders in template
     */
    static replacePlaceholders(template, data) {
        if (!template) return '';
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Generate basic title
     */
    static generateBasicTitle(eventCode, entityName) {
        const [module, action] = eventCode.split('.');
        const actionNames = {
            created: 'mới được tạo',
            updated: 'đã cập nhật',
            deleted: 'đã xóa',
            status_changed: 'đổi trạng thái',
            approved: 'đã duyệt',
            rejected: 'đã từ chối'
        };
        const moduleNames = {
            customer: 'Khách hàng',
            project: 'Dự án',
            quotation: 'Báo giá',
            inventory: 'Kho',
            production: 'Sản xuất',
            finance: 'Tài chính'
        };

        return `${moduleNames[module] || module} ${actionNames[action] || action}`;
    }

    /**
     * Generate basic message
     */
    static generateBasicMessage(eventCode, entityName, actor) {
        const [module, action] = eventCode.split('.');
        return `${entityName || 'Mục'} đã được ${action} bởi ${actor.name || 'hệ thống'}`;
    }

    /**
     * Generate link based on entity type
     */
    static generateLink(entityType, entityId) {
        const links = {
            customer: `customers.html?id=${entityId}`,
            project: `project-detail.html?id=${entityId}`,
            quotation: `quotation-new.html?quotation_id=${entityId}`,
            inventory: `inventory.html`,
            production: `production.html?id=${entityId}`,
            finance: `finance-dashboard.html`
        };
        return links[entityType] || '';
    }

    /**
     * Flatten nested object for template replacement
     */
    static flattenObject(obj, prefix = '') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}_${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, this.flattenObject(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }

    /**
     * Get audit logs with filters
     */
    static async getLogs(filters = {}) {
        const {
            entityType,
            entityId,
            actorUserId,
            eventCode,
            fromDate,
            toDate,
            limit = 50,
            offset = 0
        } = filters;

        let query = `
            SELECT 
                al.*,
                et.icon,
                et.color,
                et.severity
            FROM audit_logs al
            LEFT JOIN event_types et ON al.event_code = et.event_code
            WHERE 1=1
        `;
        const params = [];

        if (entityType) {
            query += ' AND al.entity_type = ?';
            params.push(entityType);
        }
        if (entityId) {
            query += ' AND al.entity_id = ?';
            params.push(entityId);
        }
        if (actorUserId) {
            query += ' AND al.actor_user_id = ?';
            params.push(actorUserId);
        }
        if (eventCode) {
            query += ' AND al.event_code = ?';
            params.push(eventCode);
        }
        if (fromDate) {
            query += ' AND al.created_at >= ?';
            params.push(fromDate);
        }
        if (toDate) {
            query += ' AND al.created_at <= ?';
            params.push(toDate);
        }

        query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.query(query, params);
        return rows;
    }

    /**
     * Get entity history (all changes for a specific entity)
     */
    static async getEntityHistory(entityType, entityId) {
        const [rows] = await db.query(
            `SELECT 
                al.*,
                et.title_template,
                et.icon,
                et.color,
                et.severity
             FROM audit_logs al
             LEFT JOIN event_types et ON al.event_code = et.event_code
             WHERE al.entity_type = ? AND al.entity_id = ?
             ORDER BY al.created_at DESC`,
            [entityType, entityId]
        );
        return rows;
    }
}

module.exports = AuditLogService;
