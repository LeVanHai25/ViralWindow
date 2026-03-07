/**
 * Notification System for Header (Top Right Corner)
 * Replaces sidebar notification with header notification
 */

(function () {
    'use strict';

    const API_BASE = window.API_BASE || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : window.location.origin + '/api');
    let pollingInterval = null;
    let isDropdownOpen = false;
    let lastUnreadCount = -1; // Track for toast

    /**
     * Load unread count and update badge
     */
    async function loadUnreadCount() {
        try {
            const token = (window.AuthHelper && window.AuthHelper.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return;

            const result = await response.json();
            if (result.success) {
                const count = result.data.count || 0;

                // Trigger toast if count increased
                if (lastUnreadCount !== -1 && count > lastUnreadCount) {
                    triggerNewNotificationToast();
                }

                lastUnreadCount = count;
                updateNotificationBadge(count);
            }
        } catch (error) {
            // Silent fail
        }
    }

    /**
     * Trigger a toast notification for new items
     */
    async function triggerNewNotificationToast() {
        try {
            // Fetch the latest notification to show in toast
            const notifications = await loadNotifications(1);
            if (notifications.length > 0) {
                const latest = notifications[0];
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification(
                        'Thông báo mới',
                        latest.title || latest.message,
                        5000
                    );
                }
            }
        } catch (e) {
            console.error('Error triggering toast:', e);
        }
    }

    /**
     * Update notification badge
     */
    function updateNotificationBadge(count) {
        // Update header badge
        const headerBadge = document.getElementById('headerNotificationBadge');
        if (headerBadge) {
            if (count > 0) {
                headerBadge.textContent = count > 99 ? '99+' : count;
                headerBadge.classList.remove('hidden');
            } else {
                headerBadge.classList.add('hidden');
            }
        }

        // Also update sidebar badge if exists (for backward compatibility)
        const sidebarBadges = document.querySelectorAll('#notificationBadge, .notification-badge');
        sidebarBadges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
                badge.style.display = 'flex';
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
        });
    }

    /**
     * Load notifications list
     */
    async function loadNotifications(limit = 20) {
        try {
            const token = (window.AuthHelper && window.AuthHelper.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) return [];

            const response = await fetch(`${API_BASE}/notifications?limit=${limit}&only_unread=0`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return [];

            const result = await response.json();
            if (result.success) {
                return result.data || [];
            }
            return [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            return [];
        }
    }

    /**
     * Render notification dropdown
     */
    async function renderNotificationDropdown() {
        const list = document.getElementById('headerNotificationsList');
        if (!list) return;

        // Show loading
        list.innerHTML = '<div class="header-notifications-empty"><p>Đang tải...</p></div>';

        const notifications = await loadNotifications(20);

        if (notifications.length === 0) {
            list.innerHTML = `
                <div class="header-notifications-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p>Không có thông báo nào</p>
                </div>
                <div class="header-notifications-footer">
                    <a href="notifications.html" class="text-blue-600 hover:text-blue-800 font-medium" style="margin-left: auto;">
                        📋 Xem lịch sử thông báo →
                    </a>
                </div>
            `;
            return;
        }

        let html = '';
        notifications.forEach(notif => {
            // Use icon from database, fallback to color-based icon, then default
            let notifIcon = notif.icon || '📢';
            if (!notif.icon && notif.color) {
                const colorIcons = {
                    'red': '🚨', 'orange': '⚠️', 'yellow': '⚠️',
                    'green': '✅', 'blue': 'ℹ️', 'purple': '🔔'
                };
                notifIcon = colorIcons[notif.color] || '📢';
            }

            const isRead = notif.is_read;
            const unreadClass = !isRead ? 'unread' : '';
            const link = notif.link || null;

            const timeAgo = getTimeAgo(notif.created_at);

            html += `
                <div class="header-notification-item ${unreadClass}" 
                     onclick="handleHeaderNotificationClick(${notif.id}, '${link || ''}')">
                    <div class="header-notification-item-content">
                        <div class="header-notification-icon">${notifIcon}</div>
                        <div class="header-notification-text">
                            <div class="header-notification-title">${escapeHtml(notif.title)}</div>
                            <div class="header-notification-message">${escapeHtml(notif.message)}</div>
                            <div class="header-notification-time">${timeAgo}</div>
                        </div>
                        ${!isRead ? '<div class="header-notification-dot"></div>' : ''}
                    </div>
                </div>
            `;
        });

        html += `
            <div class="header-notifications-footer">
                <button onclick="markAllHeaderNotificationsRead()" class="text-blue-600 hover:text-blue-800">
                    ✓ Đánh dấu đã đọc
                </button>
                <a href="notifications.html" class="text-blue-600 hover:text-blue-800 font-medium">
                    📋 Xem lịch sử thông báo →
                </a>
            </div>
        `;

        list.innerHTML = html;
    }

    /**
     * Handle notification click
     */
    window.handleHeaderNotificationClick = async function (notificationId, link) {
        try {
            const token = (window.AuthHelper && window.AuthHelper.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) return;

            // Mark as read
            await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Reload notifications and count
            await loadUnreadCount();
            if (isDropdownOpen) {
                await renderNotificationDropdown();
            }

            // Navigate to link if provided
            if (link) {
                window.location.href = link;
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    /**
     * Mark all notifications as read
     */
    window.markAllHeaderNotificationsRead = async function () {
        try {
            const token = (window.AuthHelper && window.AuthHelper.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE}/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await loadUnreadCount();
                await renderNotificationDropdown();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    /**
     * Toggle notification dropdown
     */
    window.toggleHeaderNotifications = function () {
        const dropdown = document.getElementById('headerNotificationsDropdown');
        if (!dropdown) {
            console.error('Notification dropdown not found');
            return;
        }

        // Check current state
        const isCurrentlyOpen = dropdown.classList.contains('show');

        if (isCurrentlyOpen) {
            // Currently open, so close it
            dropdown.classList.remove('show');
            isDropdownOpen = false;
        } else {
            // Currently closed, so open it
            dropdown.classList.add('show');
            isDropdownOpen = true;
            renderNotificationDropdown();
        }
    };

    /**
     * Helper: Get time ago
     */
    function getTimeAgo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    }

    /**
     * Helper: Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Start polling
     */
    function startPolling() {
        // Load immediately
        loadUnreadCount();

        // Poll every 15 seconds
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        pollingInterval = setInterval(() => {
            loadUnreadCount();
            // Reload dropdown if open
            if (isDropdownOpen) {
                renderNotificationDropdown();
            }
        }, 8000);
    }

    /**
     * Stop polling
     */
    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    /**
     * Initialize notification system
     */
    window.initHeaderNotificationSystem = function () {
        // Check if user is logged in
        const token = (window.AuthHelper && window.AuthHelper.getToken()) || sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
            return;
        }

        // Start polling
        startPolling();

        // Close dropdown when clicking outside
        document.addEventListener('click', function (event) {
            const dropdown = document.getElementById('headerNotificationsDropdown');
            const button = event.target.closest('#headerNotificationButton, .header-notification-button');

            if (dropdown && !dropdown.contains(event.target) && !button) {
                dropdown.classList.remove('show');
                isDropdownOpen = false;
            }
        });
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initHeaderNotificationSystem);
    } else {
        window.initHeaderNotificationSystem();
    }

    // Export for manual initialization
    window.HeaderNotificationSystem = {
        loadUnreadCount,
        loadNotifications,
        renderNotificationDropdown,
        startPolling,
        stopPolling
    };

})();

