/**
 * =====================================================
 * CHAT CLIENT — Socket.io Frontend
 * =====================================================
 */
const API_BASE = window.API_BASE || 'http://127.0.0.1:3001/api';
const WS_URL = API_BASE.replace('/api', '').replace('http', 'ws').replace('ws://', 'http://').replace('wss://', 'https://');
const SOCKET_URL = API_BASE.replace('/api', '');

let socket = null;
let currentConversationId = null;
let currentUserId = null;
let conversations = [];
let allUsers = [];
let oldestMessageId = null;
let isLoadingMore = false;

// =====================================================
// INITIALIZATION
// =====================================================
function initChat() {
    const token = sessionStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    // Decode user ID from token
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id;
    } catch (e) { console.error('Token decode error'); }

    // Connect Socket.io
    socket = io(SOCKET_URL, {
        auth: { token },
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10
    });

    socket.on('connect', () => {
        console.log('💬 Connected to chat server');
        document.getElementById('connectionStatus').textContent = '🟢 Đã kết nối';
        document.getElementById('connectionStatus').style.color = '#22c55e';
    });

    socket.on('disconnect', () => {
        document.getElementById('connectionStatus').textContent = '🔴 Mất kết nối';
        document.getElementById('connectionStatus').style.color = '#ef4444';
    });

    socket.on('connect_error', (err) => {
        console.error('Socket error:', err.message);
        document.getElementById('connectionStatus').textContent = '⚠️ Lỗi kết nối';
    });

    // Realtime events
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('read_receipt', handleReadReceipt);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('error', (data) => { console.error('Socket error:', data.message); });

    // Load data
    loadConversations();
    loadUsers();
}

// =====================================================
// CONVERSATIONS
// =====================================================
async function loadConversations() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            conversations = data.data;
            renderConversations();
        }
    } catch (err) {
        console.error('Load conversations error:', err);
    }
}

function renderConversations(filter = '') {
    const list = document.getElementById('conversationsList');
    const filtered = filter
        ? conversations.filter(c => (c.display_name || '').toLowerCase().includes(filter.toLowerCase()))
        : conversations;

    if (filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8;">
            <div style="font-size:32px;margin-bottom:8px;">💬</div>
            <p style="font-size:13px;">Chưa có cuộc trò chuyện</p>
        </div>`;
        return;
    }

    list.innerHTML = filtered.map(c => {
        const initial = (c.display_name || '?')[0].toUpperCase();
        const isActive = c.id === currentConversationId;
        const time = c.last_message_at ? formatTime(c.last_message_at) : '';
        const unread = c.unread_count > 0 ? `<div class="chat-conv-badge">${c.unread_count}</div>` : '';
        const avatarContent = c.display_avatar
            ? `<img src="${c.display_avatar}" alt="">`
            : initial;
        const typeIcon = c.type === 'group' ? '👥' : '';

        return `
        <div class="chat-conversation-item ${isActive ? 'active' : ''}" onclick="openConversation(${c.id})">
            <div class="chat-conv-avatar">${avatarContent}</div>
            <div class="chat-conv-info">
                <div class="chat-conv-name">${typeIcon} ${escHtml(c.display_name || 'Không tên')}</div>
                <div class="chat-conv-preview">${escHtml(c.last_message_preview || '')}</div>
            </div>
            <div class="chat-conv-meta">
                <div class="chat-conv-time">${time}</div>
                ${unread}
            </div>
        </div>`;
    }).join('');
}

async function openConversation(convId) {
    currentConversationId = convId;
    oldestMessageId = null;

    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    // Join socket room
    socket.emit('join_conversation', { conversationId: convId });

    // Update header
    const header = document.getElementById('chatWindowHeader');
    header.querySelector('h3').textContent = conv.display_name || 'Chat';
    header.querySelector('p').textContent = conv.type === 'group'
        ? `${conv.member_count || 0} thành viên`
        : 'Tin nhắn riêng';

    // Show chat window, hide empty state
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatActiveWindow').style.display = 'flex';

    // Mobile: show chat
    document.querySelector('.chat-container').classList.add('show-chat');

    // Re-render conversation list to mark active
    renderConversations();

    // Load messages
    await loadMessages(convId);

    // Focus input
    document.getElementById('chatInput').focus();
}

async function loadMessages(convId, loadMore = false) {
    try {
        const token = sessionStorage.getItem('token');
        let url = `${API_BASE}/chat/conversations/${convId}/messages?limit=30`;
        if (loadMore && oldestMessageId) url += `&before=${oldestMessageId}`;

        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();

        if (data.success) {
            const area = document.getElementById('messagesArea');

            if (!loadMore) {
                area.innerHTML = '';
            }

            if (data.data.length > 0) {
                oldestMessageId = data.data[0].id;
                const html = data.data.map(renderMessage).join('');

                if (loadMore) {
                    area.insertAdjacentHTML('afterbegin', html);
                } else {
                    area.innerHTML = html;
                    area.scrollTop = area.scrollHeight;
                }
            }

            // Mark as read
            if (data.data.length > 0) {
                const lastMsg = data.data[data.data.length - 1];
                socket.emit('message_read', { messageId: lastMsg.id, conversationId: convId });
            }
        }
    } catch (err) {
        console.error('Load messages error:', err);
    }
}

function renderMessage(msg) {
    if (msg.type === 'system') {
        return `<div class="chat-msg-system">📌 ${msg.sender_name} ${escHtml(msg.content)}</div>`;
    }

    const isMe = msg.sender_id === currentUserId;
    const initial = (msg.sender_name || '?')[0].toUpperCase();
    const avatar = msg.sender_avatar
        ? `<img src="${msg.sender_avatar}" alt="">`
        : initial;
    const time = formatTime(msg.created_at);

    let content = '';
    if (msg.type === 'image') {
        content = `<div class="chat-msg-image"><img src="${msg.file_url}" alt="${escHtml(msg.file_name)}" onclick="window.open('${msg.file_url}')"></div>`;
    } else if (msg.type === 'file') {
        const size = msg.file_size ? `(${(msg.file_size / 1024).toFixed(0)} KB)` : '';
        content = `<a class="chat-msg-file" href="${msg.file_url}" target="_blank">📎 ${escHtml(msg.file_name)} ${size}</a>`;
    } else {
        content = linkify(escHtml(msg.content || ''));
    }

    const senderLine = !isMe ? `<div class="chat-msg-sender">${escHtml(msg.sender_name)}</div>` : '';
    const pinBadge = msg.is_pinned ? '<span style="font-size:10px;">📌</span> ' : '';

    return `
    <div class="chat-message ${isMe ? 'me' : ''}" data-msg-id="${msg.id}">
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-msg-bubble">
            ${senderLine}${pinBadge}${content}
            <div class="chat-msg-time">${time}</div>
        </div>
    </div>`;
}

// =====================================================
// SEND MESSAGE
// =====================================================
function sendMessage() {
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    if (!content || !currentConversationId) return;

    socket.emit('send_message', {
        conversationId: currentConversationId,
        content,
        type: 'text'
    });

    input.value = '';
    input.style.height = 'auto';
    socket.emit('stop_typing', { conversationId: currentConversationId });
}

// =====================================================
// FILE UPLOAD
// =====================================================
async function uploadChatFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.docx,.xlsx,.txt,.zip';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn. Tối đa 10MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_BASE}/chat/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                socket.emit('send_message', {
                    conversationId: currentConversationId,
                    content: file.name,
                    type: data.data.type,
                    fileData: data.data
                });
            } else {
                alert(data.message || 'Lỗi upload');
            }
        } catch (err) {
            alert('Lỗi upload file');
        }
    };
    fileInput.click();
}

// =====================================================
// REALTIME EVENT HANDLERS
// =====================================================
function handleNewMessage(msg) {
    // Add to conversation messages if viewing this conversation
    if (msg.conversation_id === currentConversationId) {
        const area = document.getElementById('messagesArea');
        area.insertAdjacentHTML('beforeend', renderMessage(msg));
        area.scrollTop = area.scrollHeight;

        // Mark as read
        socket.emit('message_read', { messageId: msg.id, conversationId: msg.conversation_id });
    }

    // Update conversation list
    const conv = conversations.find(c => c.id === msg.conversation_id);
    if (conv) {
        conv.last_message_at = msg.created_at;
        conv.last_message_preview = msg.type === 'text'
            ? `${msg.sender_name}: ${(msg.content || '').substring(0, 50)}`
            : `${msg.sender_name}: 📎 ${msg.file_name || 'File'}`;
        if (msg.conversation_id !== currentConversationId) {
            conv.unread_count = (conv.unread_count || 0) + 1;
        }
        // Move to top
        conversations.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
        renderConversations();
    } else {
        // New conversation, reload list
        loadConversations();
    }

    // Play notification sound
    if (msg.sender_id !== currentUserId) {
        playNotificationSound();
    }
}

let typingUsers = new Map();
function handleTyping(data) {
    if (data.conversationId !== currentConversationId) return;
    typingUsers.set(data.userId, data.userName);
    updateTypingIndicator();
}

function handleStopTyping(data) {
    typingUsers.delete(data.userId);
    updateTypingIndicator();
}

function updateTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (typingUsers.size === 0) {
        el.textContent = '';
        return;
    }
    const names = Array.from(typingUsers.values()).join(', ');
    el.textContent = `✏️ ${names} đang gõ...`;
}

function handleReadReceipt(data) {
    // Could update check marks here
}

function handleUserOnline(data) {
    // Update online status in conversation list
}

function handleUserOffline(data) {
    // Update offline status
}

// =====================================================
// NEW CONVERSATION MODALS
// =====================================================
async function loadUsers() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) allUsers = data.data;
    } catch (e) { console.error('Load users error:', e); }
}

function showNewChatModal() {
    const users = allUsers.filter(u => u.id !== currentUserId);
    const html = `
    <div class="chat-modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="chat-modal">
            <h3>💬 Cuộc trò chuyện mới</h3>
            <div style="margin-bottom:16px;">
                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Loại</label>
                <select id="newChatType" onchange="toggleGroupFields()" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;">
                    <option value="private">Nhắn tin riêng (1-1)</option>
                    <option value="group">Tạo nhóm</option>
                </select>
            </div>
            <div id="groupFields" style="display:none;">
                <input type="text" id="newGroupName" placeholder="Tên nhóm (VD: Dự án Villa Q7)" />
                <input type="text" id="newGroupDesc" placeholder="Mô tả nhóm (tùy chọn)" />
            </div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Chọn thành viên</label>
            <div class="chat-modal-user-list" id="userSelectList">
                ${users.map(u => `
                    <label class="chat-modal-user-item">
                        <input type="checkbox" value="${u.id}" name="chat_member">
                        <div class="chat-conv-avatar" style="width:32px;height:32px;font-size:12px;">
                            ${u.avatar_url ? `<img src="${u.avatar_url}">` : (u.full_name || '?')[0].toUpperCase()}
                        </div>
                        <span style="font-size:14px;">${escHtml(u.full_name)}</span>
                        ${u.is_online ? '<span style="color:#22c55e;font-size:10px;margin-left:auto;">●</span>' : ''}
                    </label>
                `).join('')}
            </div>
            <div class="chat-modal-btns">
                <button class="btn-cancel" onclick="this.closest('.chat-modal-overlay').remove()">Huỷ</button>
                <button class="btn-primary" onclick="createNewChat()">Tạo</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function toggleGroupFields() {
    const type = document.getElementById('newChatType').value;
    document.getElementById('groupFields').style.display = type === 'group' ? 'block' : 'none';
}

async function createNewChat() {
    const type = document.getElementById('newChatType').value;
    const checked = Array.from(document.querySelectorAll('input[name="chat_member"]:checked')).map(i => parseInt(i.value));

    if (checked.length === 0) { alert('Vui lòng chọn ít nhất 1 người'); return; }
    if (type === 'private' && checked.length !== 1) { alert('Chat riêng chỉ chọn 1 người'); return; }

    const body = {
        type,
        member_ids: checked,
        name: type === 'group' ? document.getElementById('newGroupName').value : null,
        description: type === 'group' ? document.getElementById('newGroupDesc').value : null
    };

    if (type === 'group' && !body.name) { alert('Vui lòng nhập tên nhóm'); return; }

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            document.querySelector('.chat-modal-overlay').remove();
            await loadConversations();
            openConversation(data.data.id);
        } else {
            alert(data.message || 'Lỗi tạo');
        }
    } catch (err) {
        alert('Lỗi kết nối');
    }
}

// =====================================================
// UTILITIES
// =====================================================
function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function linkify(text) {
    return text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" style="color:#6366f1;text-decoration:underline;">$1</a>');
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[d.getDay()];
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) { /* ignore */ }
}

// =====================================================
// INPUT HANDLERS
// =====================================================
function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    // Typing indicator
    if (currentConversationId && e.key !== 'Enter') {
        socket.emit('typing', { conversationId: currentConversationId });
    }
}

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// Scroll to load more
function handleMessagesScroll(e) {
    if (e.target.scrollTop === 0 && !isLoadingMore && currentConversationId) {
        isLoadingMore = true;
        loadMessages(currentConversationId, true).then(() => { isLoadingMore = false; });
    }
}

// Mobile back button
function goBackToList() {
    document.querySelector('.chat-container').classList.remove('show-chat');
}

// Init on DOM load
document.addEventListener('DOMContentLoaded', initChat);
