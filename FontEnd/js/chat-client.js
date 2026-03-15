/**
 * =====================================================
 * CHAT CLIENT — Socket.io Frontend (v3 — Fixed)
 * Fixes: page reload, file URLs, link colors
 * =====================================================
 */
const API_BASE = window.API_BASE || 'http://127.0.0.1:3001/api';
const SERVER_BASE = window.SERVER_BASE || API_BASE.replace('/api', '');
const SOCKET_URL = SERVER_BASE;

let socket = null;
let currentConversationId = null;
let currentConversation = null;
let currentUserId = null;
let currentUserName = '';
let currentUserAvatar = '';
let conversations = [];
let allUsers = [];
let oldestMessageId = null;
let isLoadingMore = false;

/**
 * Resolve file URL — prefix with SERVER_BASE if relative
 */
function resolveFileUrl(url) {
    if (!url) return '';
    // Pass through absolute URLs and data URIs (base64 avatars) unchanged
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return SERVER_BASE + (url.startsWith('/') ? '' : '/') + url;
}

// =====================================================
// INITIALIZATION
// =====================================================
function initChat() {
    const token = sessionStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.id;
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        currentUserName = user.full_name || payload.full_name || 'Tôi';
        currentUserAvatar = user.avatar_url || '';
    } catch (e) { console.error('Token decode error'); }

    socket = io(SOCKET_URL, {
        auth: { token },
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10
    });

    socket.on('connect', () => {
        console.log('💬 Connected to chat server');
        const el = document.getElementById('connectionStatus');
        if (el) { el.textContent = '🟢 Đã kết nối'; el.style.color = '#22c55e'; }
    });
    socket.on('disconnect', () => {
        const el = document.getElementById('connectionStatus');
        if (el) { el.textContent = '🔴 Mất kết nối'; el.style.color = '#ef4444'; }
    });
    socket.on('connect_error', (err) => {
        console.error('Socket error:', err.message);
        const el = document.getElementById('connectionStatus');
        if (el) { el.textContent = '⚠️ Lỗi kết nối'; }
    });

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('read_receipt', handleReadReceipt);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('error', (data) => { console.error('Socket error:', data.message); });

    loadConversations();
    loadUsers();

    // Prevent ANY form submission on this page
    document.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);
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
    } catch (err) { console.error('Load conversations error:', err); }
}

function renderConversations(filter = '') {
    const list = document.getElementById('conversationsList');
    if (!list) return;
    const filtered = filter
        ? conversations.filter(c => (c.display_name || '').toLowerCase().includes(filter.toLowerCase()))
        : conversations;

    if (filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8;">
            <div style="font-size:32px;margin-bottom:8px;">💬</div>
            <p style="font-size:13px;">${filter ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}</p>
        </div>`;
        return;
    }

    list.innerHTML = filtered.map(c => {
        const initial = (c.display_name || '?')[0].toUpperCase();
        const isActive = c.id === currentConversationId;
        const time = c.last_message_at ? formatTime(c.last_message_at) : '';
        const unread = c.unread_count > 0 ? `<div class="chat-conv-badge">${c.unread_count}</div>` : '';
        const avatarContent = c.display_avatar
            ? `<img src="${resolveFileUrl(c.display_avatar)}" alt="">`
            : initial;
        const typeIcon = c.type === 'group' ? '👥 ' : '';

        return `
        <div class="chat-conversation-item ${isActive ? 'active' : ''}" onclick="openConversation(${c.id})">
            <div class="chat-conv-avatar">${avatarContent}</div>
            <div class="chat-conv-info">
                <div class="chat-conv-name">${typeIcon}${escHtml(c.display_name || 'Không tên')}</div>
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
    currentConversation = conv;

    socket.emit('join_conversation', { conversationId: convId });

    // Update header
    const headerAvatar = document.getElementById('chatWindowHeaderAvatar');
    const headerName = document.getElementById('chatWindowHeaderName');
    const headerSub = document.getElementById('chatWindowHeaderSub');

    if (headerName) headerName.textContent = conv.display_name || 'Chat';
    if (headerSub) headerSub.textContent = conv.type === 'group'
        ? `${conv.member_count || 0} thành viên`
        : 'Tin nhắn riêng';
    if (headerAvatar) {
        if (conv.display_avatar) {
            headerAvatar.innerHTML = `<img src="${resolveFileUrl(conv.display_avatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4'];
            headerAvatar.style.background = colors[convId % colors.length];
            headerAvatar.innerHTML = (conv.display_name || '?')[0].toUpperCase();
        }
    }

    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatActiveWindow').style.display = 'flex';
    document.querySelector('.chat-container').classList.add('show-chat');
    renderConversations();
    await loadMessages(convId);
    conv.unread_count = 0;
    renderConversations();
    const input = document.getElementById('chatInput');
    if (input) input.focus();
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
            if (!area) return;
            if (!loadMore) area.innerHTML = '';
            if (data.data.length > 0) {
                oldestMessageId = data.data[0].id;
                const html = data.data.map(renderMessage).join('');
                if (loadMore) {
                    area.insertAdjacentHTML('afterbegin', html);
                } else {
                    area.innerHTML = html;
                    area.scrollTop = area.scrollHeight;
                }
            } else if (!loadMore) {
                area.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;"><p>Bắt đầu cuộc trò chuyện!</p></div>';
            }
            if (data.data.length > 0) {
                const lastMsg = data.data[data.data.length - 1];
                socket.emit('message_read', { messageId: lastMsg.id, conversationId: convId });
            }
        }
    } catch (err) { console.error('Load messages error:', err); }
}

function renderMessage(msg) {
    if (msg.type === 'system') {
        return `<div class="chat-msg-system">📌 ${escHtml(msg.content)}</div>`;
    }
    const isMe = msg.sender_id === currentUserId;
    const initial = (msg.sender_name || '?')[0].toUpperCase();
    const colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f97316','#06b6d4'];
    const avatarColor = colors[(msg.sender_id || 0) % colors.length];
    const avatarUrl = msg.sender_avatar ? resolveFileUrl(msg.sender_avatar) : '';
    const avatar = avatarUrl
        ? `<img src="${avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : `<span>${initial}</span>`;
    const time = formatTime(msg.created_at);

    let content = '';
    if (msg.type === 'image') {
        const imgUrl = resolveFileUrl(msg.file_url);
        content = `<div class="chat-msg-image"><img src="${imgUrl}" alt="${escHtml(msg.file_name)}" onclick="window.open('${imgUrl}','_blank')" style="max-width:280px;max-height:200px;border-radius:8px;cursor:pointer;"></div>`;
    } else if (msg.type === 'file') {
        const fileUrl = resolveFileUrl(msg.file_url);
        const size = msg.file_size ? `(${(msg.file_size / 1024).toFixed(0)} KB)` : '';
        content = `<a class="chat-msg-file" href="${fileUrl}" target="_blank" style="color:${isMe ? '#e0e7ff' : '#6366f1'};text-decoration:underline;">📎 ${escHtml(msg.file_name)} ${size}</a>`;
    } else {
        // Text message — use contrasting link colors
        const linkColor = isMe ? '#d4d4ff' : '#6366f1';
        content = linkify(escHtml(msg.content || ''), linkColor);
    }

    const senderLine = !isMe ? `<div class="chat-msg-sender">${escHtml(msg.sender_name)}</div>` : '';
    const pinBadge = msg.is_pinned ? '<span style="font-size:10px;">📌</span> ' : '';

    return `
    <div class="chat-message ${isMe ? 'me' : ''}" data-msg-id="${msg.id}">
        <div class="chat-msg-avatar" style="background:${isMe ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : avatarColor}">${avatar}</div>
        <div class="chat-msg-bubble">
            ${senderLine}${pinBadge}${content}
            <div class="chat-msg-time">${time}</div>
        </div>
    </div>`;
}

// =====================================================
// SEND MESSAGE — Bulletproof: no page reload possible
// =====================================================
function sendMessage() {
    try {
        const input = document.getElementById('chatInput');
        if (!input) return false;
        const content = input.value.trim();
        if (!content || !currentConversationId) return false;
        if (!socket || !socket.connected) {
            alert('Mất kết nối server. Vui lòng tải lại trang.');
            return false;
        }

        socket.emit('send_message', {
            conversationId: currentConversationId,
            content,
            type: 'text'
        });

        input.value = '';
        input.style.height = 'auto';

        try { socket.emit('stop_typing', { conversationId: currentConversationId }); } catch(e){}
    } catch (err) {
        console.error('sendMessage error:', err);
    }
    return false; // Always return false to prevent any form submission
}

// =====================================================
// FILE UPLOAD
// =====================================================
async function uploadChatFile() {
    if (!currentConversationId) { alert('Vui lòng chọn cuộc trò chuyện trước'); return; }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.docx,.xlsx,.txt,.zip';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { alert('File quá lớn. Tối đa 10MB.'); return; }

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
            } else { alert(data.message || 'Lỗi upload'); }
        } catch (err) { alert('Lỗi upload file'); }
    };
    fileInput.click();
}

// =====================================================
// REALTIME EVENT HANDLERS
// =====================================================
function handleNewMessage(msg) {
    try {
        if (msg.conversation_id === currentConversationId) {
            const area = document.getElementById('messagesArea');
            if (area) {
                area.insertAdjacentHTML('beforeend', renderMessage(msg));
                area.scrollTop = area.scrollHeight;
            }
            socket.emit('message_read', { messageId: msg.id, conversationId: msg.conversation_id });
        }

        const conv = conversations.find(c => c.id === msg.conversation_id);
        if (conv) {
            conv.last_message_at = msg.created_at;
            conv.last_message_preview = msg.type === 'text'
                ? `${msg.sender_name}: ${(msg.content || '').substring(0, 50)}`
                : `${msg.sender_name}: 📎 ${msg.file_name || 'File'}`;
            if (msg.conversation_id !== currentConversationId) {
                conv.unread_count = (conv.unread_count || 0) + 1;
            }
            conversations.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
            renderConversations();
        } else {
            loadConversations();
        }

        if (msg.sender_id !== currentUserId) playNotificationSound();
        if (window.updateChatBadge) window.updateChatBadge();
    } catch (err) {
        console.error('handleNewMessage error:', err);
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
    if (!el) return;
    if (typingUsers.size === 0) { el.textContent = ''; return; }
    const names = Array.from(typingUsers.values()).join(', ');
    el.textContent = `✏️ ${names} đang gõ...`;
}
function handleReadReceipt() {}
function handleUserOnline() {}
function handleUserOffline() {}

// =====================================================
// SEARCH MESSAGES
// =====================================================
function showSearchPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'chat-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
    <div class="chat-modal" style="width:500px;">
        <h3>🔍 Tìm kiếm tin nhắn</h3>
        <input type="text" id="searchMsgInput" placeholder="Nhập từ khóa..." autofocus
               onkeydown="if(event.key==='Enter'){event.preventDefault();searchMessages();}">
        <div style="display:flex;gap:8px;margin-bottom:16px;">
            <button type="button" class="btn-primary" style="flex:1;" onclick="searchMessages()">Tìm</button>
        </div>
        <div id="searchMsgResults" style="max-height:400px;overflow-y:auto;">
            <p style="text-align:center;color:#94a3b8;font-size:13px;">Nhập từ khóa để tìm kiếm</p>
        </div>
        <div class="chat-modal-btns" style="margin-top:16px;">
            <button type="button" class="btn-cancel" onclick="this.closest('.chat-modal-overlay').remove()">Đóng</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('searchMsgInput')?.focus(), 100);
}

async function searchMessages() {
    const input = document.getElementById('searchMsgInput');
    const results = document.getElementById('searchMsgResults');
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q) return;

    results.innerHTML = '<p style="text-align:center;color:#94a3b8;">⏳ Đang tìm...</p>';
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/search?q=${encodeURIComponent(q)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success || !data.data.length) {
            results.innerHTML = '<p style="text-align:center;color:#94a3b8;">Không tìm thấy kết quả</p>';
            return;
        }
        results.innerHTML = data.data.map(m => `
            <div style="padding:10px;border-bottom:1px solid #e2e8f0;cursor:pointer;border-radius:8px;"
                 onclick="document.querySelector('.chat-modal-overlay').remove();openConversation(${m.conversation_id})"
                 onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <strong style="font-size:13px;color:#6366f1;">${escHtml(m.sender_name)}</strong>
                    <span style="font-size:11px;color:#94a3b8;">${formatTime(m.created_at)}</span>
                </div>
                <p style="font-size:13px;color:#1e293b;margin:0;">${highlightText(escHtml(m.content), q)}</p>
            </div>
        `).join('');
    } catch (err) {
        results.innerHTML = '<p style="text-align:center;color:#ef4444;">Lỗi tìm kiếm</p>';
    }
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background:#fef08a;padding:0 2px;border-radius:2px;">$1</mark>');
}

// =====================================================
// INFO PANEL — Enhanced with tabs
// =====================================================
async function showInfoPanel() {
    if (!currentConversationId || !currentConversation) {
        alert('Vui lòng chọn cuộc trò chuyện');
        return;
    }

    let members = [];
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) members = data.data;
    } catch (e) {}

    const conv = currentConversation;
    const isGroup = conv.type === 'group';
    const isAdmin = conv.my_role === 'owner' || conv.my_role === 'admin';
    const isOwner = conv.my_role === 'owner';

    const avatarSrc = conv.display_avatar ? resolveFileUrl(conv.display_avatar) : '';
    const avatarHtml = avatarSrc
        ? `<img src="${avatarSrc}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;">${(conv.display_name || '?')[0].toUpperCase()}</div>`;

    const overlay = document.createElement('div');
    overlay.className = 'chat-modal-overlay';
    overlay.id = 'infoPanelOverlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
    <div class="chat-modal" style="width:460px;max-height:90vh;overflow-y:auto;">
        <div style="text-align:center;margin-bottom:20px;">
            ${avatarHtml}
            <h3 style="margin:12px 0 4px;font-size:18px;">${escHtml(conv.display_name || 'Chat')}</h3>
            <p style="color:#94a3b8;font-size:13px;margin:0;">${isGroup ? `Nhóm · ${members.length} thành viên` : 'Tin nhắn riêng'}</p>
        </div>

        <div style="display:flex;border-bottom:2px solid #e2e8f0;margin-bottom:16px;" id="infoTabs">
            <button type="button" class="info-tab active" onclick="switchInfoTab('members',this)">👥 Thành viên</button>
            <button type="button" class="info-tab" onclick="switchInfoTab('images',this)">🖼️ Ảnh</button>
            <button type="button" class="info-tab" onclick="switchInfoTab('files',this)">📎 File</button>
            <button type="button" class="info-tab" onclick="switchInfoTab('links',this)">🔗 Link</button>
        </div>

        <div id="infoTabContent" style="min-height:200px;">
            ${renderMembersTab(members, isAdmin, isOwner)}
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:2px solid #e2e8f0;">
            <button type="button" onclick="confirmClearHistory()" style="width:100%;padding:10px;border:1px solid #fca5a5;border-radius:10px;background:#fff5f5;color:#dc2626;font-weight:600;cursor:pointer;font-size:13px;margin-bottom:8px;">🗑️ Xóa lịch sử trò chuyện</button>
            ${isOwner || !isGroup ? `<button type="button" onclick="confirmDeleteConversation()" style="width:100%;padding:10px;border:1px solid #fca5a5;border-radius:10px;background:#dc2626;color:white;font-weight:600;cursor:pointer;font-size:13px;">❌ Xóa cuộc trò chuyện</button>` : ''}
        </div>

        <div class="chat-modal-btns" style="margin-top:16px;">
            <button type="button" class="btn-cancel" onclick="this.closest('.chat-modal-overlay').remove()">Đóng</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);

    if (!document.getElementById('infoTabStyles')) {
        const style = document.createElement('style');
        style.id = 'infoTabStyles';
        style.textContent = `
            .info-tab{flex:1;padding:8px 4px;border:none;background:none;font-size:12px;font-weight:600;color:#94a3b8;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s;}
            .info-tab.active{color:#6366f1;border-bottom-color:#6366f1;}
            .info-tab:hover{color:#6366f1;}
            .info-media-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
            .info-media-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer;transition:transform 0.15s;}
            .info-media-grid img:hover{transform:scale(1.05);}
        `;
        document.head.appendChild(style);
    }
}

function renderMembersTab(members, isAdmin, isOwner) {
    const roleLabel = { owner: '👑 Chủ nhóm', admin: '🛡️ Quản trị', member: '👤 Thành viên' };
    return `
        <div style="max-height:300px;overflow-y:auto;">
            ${members.map(m => {
                const mAvatar = m.avatar_url
                    ? `<img src="${resolveFileUrl(m.avatar_url)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`
                    : `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;">${(m.full_name || '?')[0].toUpperCase()}</div>`;
                const onlineDot = m.online_status === 'online' ? '<span style="color:#22c55e;font-size:10px;margin-left:4px;">●</span>' : '';
                const removeBtn = (isAdmin || isOwner) && m.user_id !== currentUserId && m.role !== 'owner'
                    ? `<button type="button" onclick="confirmRemoveMember(${m.user_id}, '${escHtml(m.full_name).replace(/'/g,"\\'")}' )" style="border:none;background:none;color:#ef4444;cursor:pointer;font-size:11px;padding:4px 8px;border-radius:6px;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">Xóa</button>` : '';
                const youTag = m.user_id === currentUserId ? '<span style="font-size:10px;color:#6366f1;margin-left:4px;">Bạn</span>' : '';
                return `
                <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;transition:background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
                    ${mAvatar}
                    <div style="flex:1;"><div style="font-size:14px;font-weight:600;">${escHtml(m.full_name)}${onlineDot}${youTag}</div><div style="font-size:11px;color:#94a3b8;">${roleLabel[m.role] || m.role}</div></div>
                    ${removeBtn}
                </div>`;
            }).join('')}
        </div>
        ${(isAdmin || isOwner) ? `<div style="margin-top:12px;"><button type="button" onclick="showAddMemberModal()" style="width:100%;padding:10px;border:1px dashed #c7d2fe;border-radius:10px;background:none;color:#6366f1;font-weight:600;cursor:pointer;font-size:13px;">+ Thêm thành viên</button></div>` : ''}
    `;
}

async function switchInfoTab(tab, btnEl) {
    document.querySelectorAll('#infoTabs .info-tab').forEach(t => t.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const content = document.getElementById('infoTabContent');
    if (!content) return;

    if (tab === 'members') {
        let members = [];
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/members`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) members = data.data;
        } catch (e) {}
        const conv = currentConversation;
        content.innerHTML = renderMembersTab(members, conv.my_role === 'owner' || conv.my_role === 'admin', conv.my_role === 'owner');
        return;
    }

    content.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px;">⏳ Đang tải...</p>';
    const typeMap = { images: 'image', files: 'file', links: 'link' };

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/media?type=${typeMap[tab]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success || !data.data.length) {
            const emptyLabels = { images: 'ảnh', files: 'file', links: 'link' };
            const emptyIcons = { images: '🖼️', files: '📎', links: '🔗' };
            content.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8;"><div style="font-size:32px;margin-bottom:8px;">${emptyIcons[tab]}</div><p style="font-size:13px;">Chưa có ${emptyLabels[tab]} nào</p></div>`;
            return;
        }

        if (tab === 'images') {
            content.innerHTML = `<div class="info-media-grid">${data.data.map(m => {
                const url = resolveFileUrl(m.file_url);
                return `<img src="${url}" alt="" onclick="window.open('${url}','_blank')" title="${escHtml(m.sender_name)} · ${formatTime(m.created_at)}">`;
            }).join('')}</div>`;
        } else if (tab === 'files') {
            content.innerHTML = data.data.map(m => {
                const url = resolveFileUrl(m.file_url);
                return `<a href="${url}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #f1f5f9;text-decoration:none;color:#1e293b;border-radius:8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
                    <div style="width:40px;height:40px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">📄</div>
                    <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(m.file_name || 'File')}</div><div style="font-size:11px;color:#94a3b8;">${m.file_size ? (m.file_size/1024).toFixed(0)+'KB' : ''} · ${escHtml(m.sender_name)}</div></div>
                    <span style="font-size:16px;">⬇️</span>
                </a>`;
            }).join('');
        } else if (tab === 'links') {
            const urlRegex = /(https?:\/\/[^\s<]+)/g;
            let html = '';
            data.data.forEach(m => {
                const urls = (m.content || '').match(urlRegex) || [];
                urls.forEach(url => {
                    html += `<a href="${url}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #f1f5f9;text-decoration:none;color:#1e293b;border-radius:8px;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background=''">
                        <div style="width:40px;height:40px;background:#f0f9ff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">🔗</div>
                        <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#6366f1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(url)}</div><div style="font-size:11px;color:#94a3b8;">${escHtml(m.sender_name)}</div></div>
                    </a>`;
                });
            });
            content.innerHTML = html || '<p style="text-align:center;color:#94a3b8;padding:20px;">Chưa có link nào</p>';
        }
    } catch (err) {
        content.innerHTML = '<p style="text-align:center;color:#ef4444;">Lỗi tải dữ liệu</p>';
    }
}

// =====================================================
// MEMBER MANAGEMENT
// =====================================================
async function showAddMemberModal() {
    document.getElementById('infoPanelOverlay')?.remove();
    const users = allUsers.filter(u => u.id !== currentUserId);
    const overlay = document.createElement('div');
    overlay.className = 'chat-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
    <div class="chat-modal">
        <h3>➕ Thêm thành viên</h3>
        <div class="chat-modal-user-list">${users.map(u => `
            <label class="chat-modal-user-item">
                <input type="checkbox" value="${u.id}" name="add_member">
                <div class="chat-conv-avatar" style="width:32px;height:32px;font-size:12px;">${u.avatar_url ? `<img src="${resolveFileUrl(u.avatar_url)}">` : (u.full_name || '?')[0].toUpperCase()}</div>
                <span style="font-size:14px;">${escHtml(u.full_name)}</span>
            </label>
        `).join('')}</div>
        <div class="chat-modal-btns">
            <button type="button" class="btn-cancel" onclick="this.closest('.chat-modal-overlay').remove()">Huỷ</button>
            <button type="button" class="btn-primary" onclick="addMembers()">Thêm</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
}

async function addMembers() {
    const checked = Array.from(document.querySelectorAll('input[name="add_member"]:checked')).map(i => parseInt(i.value));
    if (checked.length === 0) { alert('Chọn ít nhất 1 người'); return; }
    const token = sessionStorage.getItem('token');
    let added = 0;
    for (const userId of checked) {
        try {
            await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/members`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            added++;
        } catch (e) {}
    }
    document.querySelector('.chat-modal-overlay')?.remove();
    if (added > 0) { alert(`Đã thêm ${added} thành viên`); loadConversations(); }
}

function confirmRemoveMember(userId, fullName) {
    if (!confirm(`Bạn có chắc muốn xóa "${fullName}" khỏi nhóm?`)) return;
    removeMember(userId);
}

async function removeMember(userId) {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/members/${userId}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('Đã xóa thành viên');
            document.getElementById('infoPanelOverlay')?.remove();
            loadConversations();
            showInfoPanel();
        } else { alert(data.message || 'Lỗi xóa'); }
    } catch (err) { alert('Lỗi kết nối'); }
}

// =====================================================
// DELETE HISTORY & CONVERSATION
// =====================================================
function confirmClearHistory() {
    if (!confirm('⚠️ Bạn có chắc muốn XÓA TOÀN BỘ lịch sử trò chuyện?\n\nHành động này không thể hoàn tác!')) return;
    clearChatHistory();
}

async function clearChatHistory() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}/messages`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã xóa lịch sử');
            document.getElementById('infoPanelOverlay')?.remove();
            const area = document.getElementById('messagesArea');
            if (area) area.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;"><p>Lịch sử đã được xóa</p></div>';
            loadConversations();
        } else { alert(data.message || 'Lỗi'); }
    } catch (err) { alert('Lỗi kết nối'); }
}

function confirmDeleteConversation() {
    if (!confirm('⚠️ XÓA VĨNH VIỄN cuộc trò chuyện này?\n\nTất cả tin nhắn sẽ bị xóa.\nKhông thể hoàn tác!')) return;
    deleteConversation();
}

async function deleteConversation() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations/${currentConversationId}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Đã xóa cuộc trò chuyện');
            document.getElementById('infoPanelOverlay')?.remove();
            currentConversationId = null;
            currentConversation = null;
            document.getElementById('chatActiveWindow').style.display = 'none';
            document.getElementById('chatEmptyState').style.display = 'flex';
            loadConversations();
        } else { alert(data.message || 'Lỗi'); }
    } catch (err) { alert('Lỗi kết nối'); }
}

// =====================================================
// NEW CONVERSATION MODALS
// =====================================================
async function loadUsers() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) allUsers = data.data;
    } catch (e) {}
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
                <input type="text" id="newGroupName" placeholder="Tên nhóm" />
                <input type="text" id="newGroupDesc" placeholder="Mô tả nhóm (tùy chọn)" />
            </div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Chọn thành viên</label>
            <div class="chat-modal-user-list">${users.map(u => `
                <label class="chat-modal-user-item">
                    <input type="checkbox" value="${u.id}" name="chat_member">
                    <div class="chat-conv-avatar" style="width:32px;height:32px;font-size:12px;">${u.avatar_url ? `<img src="${resolveFileUrl(u.avatar_url)}">` : (u.full_name || '?')[0].toUpperCase()}</div>
                    <span style="font-size:14px;">${escHtml(u.full_name)}</span>
                </label>
            `).join('')}</div>
            <div class="chat-modal-btns">
                <button type="button" class="btn-cancel" onclick="this.closest('.chat-modal-overlay').remove()">Huỷ</button>
                <button type="button" class="btn-primary" onclick="createNewChat()">Tạo</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function toggleGroupFields() {
    document.getElementById('groupFields').style.display = document.getElementById('newChatType').value === 'group' ? 'block' : 'none';
}

async function createNewChat() {
    const type = document.getElementById('newChatType').value;
    const checked = Array.from(document.querySelectorAll('input[name="chat_member"]:checked')).map(i => parseInt(i.value));
    if (checked.length === 0) { alert('Chọn ít nhất 1 người'); return; }
    if (type === 'private' && checked.length !== 1) { alert('Chat riêng chỉ chọn 1 người'); return; }

    const body = { type, member_ids: checked, name: type === 'group' ? document.getElementById('newGroupName').value : null, description: type === 'group' ? document.getElementById('newGroupDesc').value : null };
    if (type === 'group' && !body.name) { alert('Nhập tên nhóm'); return; }

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/chat/conversations`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            document.querySelector('.chat-modal-overlay')?.remove();
            await loadConversations();
            openConversation(data.data.id);
        } else { alert(data.message || 'Lỗi'); }
    } catch (err) { alert('Lỗi kết nối'); }
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

function linkify(text, linkColor) {
    const color = linkColor || '#6366f1';
    return text.replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" target="_blank" style="color:${color};text-decoration:underline;word-break:break-all;" onclick="event.stopPropagation();">$1</a>`);
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) { const days = ['CN','T2','T3','T4','T5','T6','T7']; return days[d.getDay()]; }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 800; gain.gain.value = 0.1;
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
}

// =====================================================
// INPUT HANDLERS — Bulletproof event prevention
// =====================================================
function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        sendMessage();
        return false;
    }
    if (currentConversationId && e.key !== 'Enter') {
        try { socket.emit('typing', { conversationId: currentConversationId }); } catch(err){}
    }
}

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleMessagesScroll(e) {
    if (e.target.scrollTop === 0 && !isLoadingMore && currentConversationId) {
        isLoadingMore = true;
        loadMessages(currentConversationId, true).then(() => { isLoadingMore = false; });
    }
}

function goBackToList() {
    document.querySelector('.chat-container').classList.remove('show-chat');
}

// Init on DOM load
document.addEventListener('DOMContentLoaded', initChat);
