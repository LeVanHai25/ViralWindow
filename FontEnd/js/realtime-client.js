/**
 * =====================================================
 * REALTIME CLIENT — Socket.IO cho toàn hệ thống ViralWindow
 * =====================================================
 * Tự động kết nối Socket.IO, lắng nghe data_changed events,
 * và gọi callback để refresh UI realtime.
 *
 * ĐẶC BIỆT: Tối ưu cho Render Free Plan
 *   - Auto-reconnect khi server ngủ (15 phút không hoạt động)
 *   - Keepalive ping mỗi 8 phút để giữ server thức
 *   - Polling fallback khi WebSocket không khả dụng
 *   - Graceful degradation (trang vẫn hoạt động khi offline)
 *
 * CÁCH DÙNG:
 *   <script src="/socket.io/socket.io.js"></script>
 *   <script src="js/realtime-client.js"></script>
 *   <script>
 *     VWRealtime.init({
 *       modules: ['projects', 'inventory'],
 *       onDataChanged: function(payload) {
 *         // payload = { module, action, data, timestamp }
 *         if (payload.module === 'projects') refreshProjectList();
 *       }
 *     });
 *   </script>
 */

(function () {
    'use strict';

    // =====================================================
    // CONFIG
    // =====================================================
    const SOCKET_URL = window.SOCKET_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `http://${window.location.host}`
            : window.location.origin);

    const KEEPALIVE_INTERVAL = 8 * 60 * 1000; // 8 phút (< Render 15-min timeout)
    const RECONNECT_DELAY_BASE = 1000;         // 1 giây
    const RECONNECT_MAX_DELAY = 30000;          // 30 giây max
    const RECONNECT_MAX_ATTEMPTS = 50;          // Thử lại 50 lần

    // =====================================================
    // STATE
    // =====================================================
    let socket = null;
    let isConnected = false;
    let modules = [];
    let onDataChangedCallback = null;
    let keepaliveTimer = null;
    let reconnectAttempts = 0;
    let statusIndicator = null;

    // =====================================================
    // INIT
    // =====================================================
    function init(options = {}) {
        modules = options.modules || [];
        onDataChangedCallback = options.onDataChanged || null;

        const token = sessionStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ [Realtime] Chưa đăng nhập, không kết nối Socket.IO');
            return;
        }

        // Check if socket.io client lib is loaded
        if (typeof io === 'undefined') {
            console.warn('⚠️ [Realtime] socket.io client chưa được load. Thêm: <script src="/socket.io/socket.io.js"></script>');
            return;
        }

        connect(token);
        createStatusIndicator();
    }

    // =====================================================
    // CONNECT
    // =====================================================
    function connect(token) {
        if (socket && socket.connected) return;

        try {
            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'], // WebSocket ưu tiên, polling fallback
                reconnection: true,
                reconnectionAttempts: RECONNECT_MAX_ATTEMPTS,
                reconnectionDelay: RECONNECT_DELAY_BASE,
                reconnectionDelayMax: RECONNECT_MAX_DELAY,
                timeout: 10000
            });

            // --- Connection events ---
            socket.on('connect', () => {
                isConnected = true;
                reconnectAttempts = 0;
                console.log('🟢 [Realtime] Đã kết nối Socket.IO');
                updateStatusIndicator('online');

                // Join module rooms
                modules.forEach(mod => {
                    socket.emit('join_module', { module: mod });
                });

                // Start keepalive
                startKeepalive();
            });

            socket.on('disconnect', (reason) => {
                isConnected = false;
                console.warn('🔴 [Realtime] Mất kết nối:', reason);
                updateStatusIndicator('offline');
                stopKeepalive();
            });

            socket.on('connect_error', (err) => {
                reconnectAttempts++;
                console.warn(`⚠️ [Realtime] Lỗi kết nối (lần ${reconnectAttempts}):`, err.message);
                updateStatusIndicator('reconnecting');

                // Nếu server ngủ (Render Free Plan), chờ lâu hơn
                if (err.message.includes('xhr poll error') || err.message.includes('timeout')) {
                    console.log('💤 [Realtime] Server có thể đang ngủ (Render Free Plan). Đợi wake up...');
                }
            });

            socket.io.on('reconnect', (attempt) => {
                console.log(`🔄 [Realtime] Đã reconnect sau ${attempt} lần thử`);
                updateStatusIndicator('online');
            });

            // --- Data change events ---
            socket.on('data_changed', (payload) => {
                console.log('📡 [Realtime] Data changed:', payload.module, payload.action);

                if (onDataChangedCallback) {
                    try {
                        onDataChangedCallback(payload);
                    } catch (e) {
                        console.error('❌ [Realtime] Error in onDataChanged callback:', e);
                    }
                }
            });

            // Keepalive ack
            socket.on('keepalive_ack', () => {
                // Server is alive
            });

        } catch (e) {
            console.error('❌ [Realtime] Không thể kết nối:', e);
        }
    }

    // =====================================================
    // KEEPALIVE (Render Free Plan)
    // =====================================================
    function startKeepalive() {
        stopKeepalive();
        keepaliveTimer = setInterval(() => {
            if (socket && socket.connected) {
                socket.emit('keepalive');
            }
        }, KEEPALIVE_INTERVAL);
    }

    function stopKeepalive() {
        if (keepaliveTimer) {
            clearInterval(keepaliveTimer);
            keepaliveTimer = null;
        }
    }

    // =====================================================
    // STATUS INDICATOR (Góc dưới phải)
    // =====================================================
    function createStatusIndicator() {
        if (statusIndicator) return;
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'vw-realtime-status';
        statusIndicator.style.cssText = `
            position: fixed; bottom: 12px; right: 12px; z-index: 9999;
            width: 10px; height: 10px; border-radius: 50%;
            background: #9ca3af; transition: background 0.3s;
            cursor: pointer; opacity: 0.7;
        `;
        statusIndicator.title = 'Realtime: Đang kết nối...';
        statusIndicator.addEventListener('click', () => {
            const status = isConnected ? '🟢 Online' : '🔴 Offline';
            const mods = modules.join(', ') || 'none';
            console.log(`📡 Realtime Status: ${status} | Modules: ${mods} | Reconnects: ${reconnectAttempts}`);
        });
        document.body.appendChild(statusIndicator);
    }

    function updateStatusIndicator(status) {
        if (!statusIndicator) return;
        const colors = { online: '#22c55e', offline: '#ef4444', reconnecting: '#f59e0b' };
        const titles = { online: 'Realtime: Đang kết nối ✅', offline: 'Realtime: Mất kết nối ❌', reconnecting: 'Realtime: Đang kết nối lại...' };
        statusIndicator.style.background = colors[status] || '#9ca3af';
        statusIndicator.title = titles[status] || 'Realtime';
    }

    // =====================================================
    // PUBLIC API
    // =====================================================
    function joinModule(mod) {
        if (!modules.includes(mod)) modules.push(mod);
        if (socket && socket.connected) {
            socket.emit('join_module', { module: mod });
        }
    }

    function leaveModule(mod) {
        modules = modules.filter(m => m !== mod);
        if (socket && socket.connected) {
            socket.emit('leave_module', { module: mod });
        }
    }

    function isOnline() {
        return isConnected;
    }

    function disconnect() {
        stopKeepalive();
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        isConnected = false;
    }

    // =====================================================
    // EXPORT
    // =====================================================
    window.VWRealtime = {
        init,
        joinModule,
        leaveModule,
        isOnline,
        disconnect
    };

})();
