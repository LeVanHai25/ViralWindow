/**
 * =====================================================
 * CHAT SERVICE — Database Queries
 * =====================================================
 */
const db = require('../config/db');

// =====================================================
// CONVERSATIONS
// =====================================================

async function getConversationsByUser(userId) {
    const [rows] = await db.query(`
        SELECT c.*, cm.role AS my_role,
            (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) AS member_count,
            (SELECT COUNT(*) FROM messages m
                WHERE m.conversation_id = c.id
                AND m.id > COALESCE((SELECT MAX(mr.message_id) FROM message_reads mr
                    JOIN messages m2 ON mr.message_id = m2.id
                    WHERE m2.conversation_id = c.id AND mr.user_id = ?), 0)
            ) AS unread_count
        FROM conversations c
        JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = ?
        ORDER BY c.last_message_at DESC, c.created_at DESC
    `, [userId, userId]);

    // Enrich with member info for private chats
    for (const conv of rows) {
        if (conv.type === 'private') {
            const [members] = await db.query(`
                SELECT u.id, u.full_name, u.avatar_url
                FROM conversation_members cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.conversation_id = ? AND cm.user_id != ?
                LIMIT 1
            `, [conv.id, userId]);
            if (members.length > 0) {
                conv.display_name = members[0].full_name;
                conv.display_avatar = members[0].avatar_url;
                conv.other_user_id = members[0].id;
            }
        } else {
            conv.display_name = conv.name;
            conv.display_avatar = conv.avatar_url;
        }

        // Last message preview
        if (conv.last_message_id) {
            const [msgs] = await db.query(`
                SELECT m.content, m.type, m.file_name, u.full_name AS sender_name
                FROM messages m JOIN users u ON m.sender_id = u.id
                WHERE m.id = ?
            `, [conv.last_message_id]);
            if (msgs.length > 0) {
                const lm = msgs[0];
                conv.last_message_preview = lm.type === 'text'
                    ? `${lm.sender_name}: ${(lm.content || '').substring(0, 50)}`
                    : `${lm.sender_name}: 📎 ${lm.file_name || 'File'}`;
            }
        }
    }
    return rows;
}

async function createConversation(type, name, description, createdBy, memberIds, avatarUrl) {
    const [result] = await db.query(
        'INSERT INTO conversations (type, name, description, avatar_url, created_by) VALUES (?, ?, ?, ?, ?)',
        [type, name || null, description || null, avatarUrl || null, createdBy]
    );
    const convId = result.insertId;

    // Add creator as owner
    await db.query(
        'INSERT INTO conversation_members (conversation_id, user_id, role) VALUES (?, ?, ?)',
        [convId, createdBy, 'owner']
    );

    // Add other members (individual INSERTs — TiDB autoIdQuery incompatible with batch VALUES ?)
    if (memberIds && memberIds.length > 0) {
        const uniqueIds = memberIds.filter(id => id !== createdBy);
        for (const memberId of uniqueIds) {
            await db.query(
                'INSERT INTO conversation_members (conversation_id, user_id, role) VALUES (?, ?, ?)',
                [convId, memberId, 'member']
            );
        }
    }

    return convId;
}

async function findPrivateConversation(userId1, userId2) {
    const [rows] = await db.query(`
        SELECT c.id FROM conversations c
        JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
        JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?
        WHERE c.type = 'private'
        LIMIT 1
    `, [userId1, userId2]);
    return rows.length > 0 ? rows[0].id : null;
}

async function updateConversation(convId, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(data.avatar_url); }
    if (fields.length === 0) return;
    values.push(convId);
    await db.query(`UPDATE conversations SET ${fields.join(', ')} WHERE id = ?`, values);
}

async function deleteConversation(convId) {
    await db.query('DELETE FROM conversations WHERE id = ?', [convId]);
}

async function getConversationMembers(convId) {
    const [rows] = await db.query(`
        SELECT cm.*, u.full_name, u.email, u.avatar_url,
            COALESCE(up.status, 'offline') AS online_status, up.last_seen
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        LEFT JOIN user_presence up ON cm.user_id = up.user_id
        WHERE cm.conversation_id = ?
        ORDER BY cm.role DESC, u.full_name
    `, [convId]);
    return rows;
}

async function addMember(convId, userId, role = 'member') {
    await db.query(
        'INSERT IGNORE INTO conversation_members (conversation_id, user_id, role) VALUES (?, ?, ?)',
        [convId, userId, role]
    );
}

async function removeMember(convId, userId) {
    await db.query(
        'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
        [convId, userId]
    );
}

async function getMemberRole(convId, userId) {
    const [rows] = await db.query(
        'SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
        [convId, userId]
    );
    return rows.length > 0 ? rows[0].role : null;
}

// =====================================================
// MESSAGES
// =====================================================

async function getMessages(convId, limit = 20, beforeId = null) {
    let sql = `
        SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar,
            rm.content AS reply_content, ru.full_name AS reply_sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN messages rm ON m.reply_to_id = rm.id
        LEFT JOIN users ru ON rm.sender_id = ru.id
        WHERE m.conversation_id = ? AND m.is_deleted = 0
    `;
    const params = [convId];

    if (beforeId) {
        sql += ' AND m.id < ?';
        params.push(beforeId);
    }

    sql += ' ORDER BY m.id DESC LIMIT ?';
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows.reverse(); // oldest first for display
}

async function createMessage(convId, senderId, content, type = 'text', fileData = null, replyToId = null) {
    const [result] = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, content, type, file_url, file_name, file_size, reply_to_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [convId, senderId, content, type,
         fileData?.url || null, fileData?.name || null, fileData?.size || null,
         replyToId || null]
    );
    const msgId = result.insertId;

    // Update conversation last_message
    await db.query(
        'UPDATE conversations SET last_message_id = ?, last_message_at = NOW() WHERE id = ?',
        [msgId, convId]
    );

    // Auto-read own message
    await db.query(
        'INSERT IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)',
        [msgId, senderId]
    );

    // Return full message with sender info
    const [msgs] = await db.query(`
        SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
        FROM messages m JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
    `, [msgId]);
    return msgs[0];
}

async function deleteMessage(msgId, userId) {
    await db.query(
        'UPDATE messages SET is_deleted = 1, content = NULL WHERE id = ? AND sender_id = ?',
        [msgId, userId]
    );
}

async function togglePin(msgId) {
    await db.query('UPDATE messages SET is_pinned = NOT is_pinned WHERE id = ?', [msgId]);
}

async function markAsRead(msgId, userId) {
    await db.query(
        'INSERT IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)',
        [msgId, userId]
    );
}

async function searchMessages(userId, query, limit = 20) {
    const [rows] = await db.query(`
        SELECT m.*, u.full_name AS sender_name, c.name AS conversation_name, c.type
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        JOIN conversations c ON m.conversation_id = c.id
        JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = ?
        WHERE m.content LIKE ? AND m.is_deleted = 0
        ORDER BY m.created_at DESC LIMIT ?
    `, [userId, `%${query}%`, limit]);
    return rows;
}

// =====================================================
// PRESENCE
// =====================================================

async function setUserOnline(userId, socketId) {
    await db.query(`
        INSERT INTO user_presence (user_id, status, socket_id, last_seen)
        VALUES (?, 'online', ?, NOW())
        ON DUPLICATE KEY UPDATE status = 'online', socket_id = ?, last_seen = NOW()
    `, [userId, socketId, socketId]);
}

async function setUserOffline(userId) {
    await db.query(
        "UPDATE user_presence SET status = 'offline', socket_id = NULL, last_seen = NOW() WHERE user_id = ?",
        [userId]
    );
}

async function getOnlineUsers() {
    const [rows] = await db.query(
        "SELECT user_id FROM user_presence WHERE status = 'online'"
    );
    return rows.map(r => r.user_id);
}

async function getAllUsers() {
    const [rows] = await db.query(
        'SELECT id, full_name, email, avatar_url FROM users WHERE is_active = 1 ORDER BY full_name'
    );
    return rows;
}

module.exports = {
    getConversationsByUser, createConversation, findPrivateConversation,
    updateConversation, deleteConversation, getConversationMembers,
    addMember, removeMember, getMemberRole,
    getMessages, createMessage, deleteMessage, togglePin, markAsRead, searchMessages,
    setUserOnline, setUserOffline, getOnlineUsers, getAllUsers
};
