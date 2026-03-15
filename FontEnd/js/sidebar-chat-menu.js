/**
 * =====================================================
 * SIDEBAR CHAT MENU — Auto-inject TIN NHẮN + TRỢ LÝ AI
 * =====================================================
 * Include this script on ALL pages to add chat menu + unread badge.
 * Script auto-detects and injects missing menu items before QUẢN TRỊ.
 */
(function() {
    'use strict';

    const API_BASE = window.API_BASE || 'http://127.0.0.1:3001/api';

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', function() {
        injectMenuItems();
        startUnreadPolling();
    });

    function injectMenuItems() {
        const nav = document.querySelector('.sidebar-nav, .sidebar nav, nav');
        if (!nav) return;

        // Check if TIN NHẮN already exists
        const hasTinNhan = nav.innerHTML.includes('TIN NHẮN');
        if (hasTinNhan) {
            // Just ensure badge element exists
            if (!document.getElementById('sidebarMsgBadge')) {
                const msgLink = nav.querySelector('a[href="messages.html"]');
                if (msgLink) {
                    const badge = document.createElement('span');
                    badge.id = 'sidebarMsgBadge';
                    badge.className = 'hidden';
                    badge.style.cssText = 'background:#ef4444;color:white;font-size:9px;padding:2px 6px;border-radius:10px;font-weight:700;margin-left:auto;';
                    msgLink.appendChild(badge);
                }
            }
            return;
        }

        // Find QUẢN TRỊ nav-item to insert before it
        const navItems = nav.querySelectorAll('.nav-item');
        let quanTriItem = null;
        navItems.forEach(item => {
            if (item.textContent.includes('QUẢN TRỊ') && !quanTriItem) {
                quanTriItem = item;
            }
        });

        if (!quanTriItem) return;

        // Check if TRỢ LÝ AI exists
        const hasAI = nav.innerHTML.includes('TRỢ LÝ AI');

        // Build HTML to inject
        let html = '';

        if (!hasAI) {
            html += `
            <!-- TRỢ LÝ AI (auto-injected) -->
            <div class="nav-item has-submenu"><div class="flex items-center gap-3 flex-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg><span>TRỢ LÝ AI</span><span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;font-size:9px;padding:2px 6px;border-radius:10px;font-weight:700;">AI</span></div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4 transition-transform duration-200 arrow-icon"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></div>
            <div class="submenu">
                <a href="reports-ai.html" class="submenu-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><span>Báo cáo AI</span></a>
                <a href="javascript:void(0)" class="submenu-item" onclick="if(window.openAISearch)window.openAISearch();else alert('Nhấn Ctrl+K');"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><span>Tìm kiếm AI</span><span style="font-size:10px;color:#94a3b8;margin-left:auto;">Ctrl+K</span></a>
            </div>`;
        }

        // TIN NHẮN link
        const isMessagesPage = window.location.pathname.includes('messages.html');
        html += `
            <!-- TIN NHẮN (auto-injected) -->
            <a href="messages.html" class="nav-item" ${isMessagesPage ? 'style="background:rgba(255,255,255,0.1);"' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span>TIN NHẮN</span>
                <span id="sidebarMsgBadge" class="hidden" style="background:#ef4444;color:white;font-size:9px;padding:2px 6px;border-radius:10px;font-weight:700;margin-left:auto;">0</span>
            </a>`;

        // Insert before QUẢN TRỊ
        quanTriItem.insertAdjacentHTML('beforebegin', html);

        // Re-init submenu toggles for injected items
        if (window.initSidebarSubmenus) {
            window.initSidebarSubmenus();
        } else {
            // Manual submenu toggle for injected items
            const injectedSubmenus = quanTriItem.parentNode.querySelectorAll('.has-submenu');
            injectedSubmenus.forEach(item => {
                if (item._listenerAdded) return;
                item._listenerAdded = true;
                item.addEventListener('click', function() {
                    const submenu = this.nextElementSibling;
                    if (submenu && submenu.classList.contains('submenu')) {
                        submenu.classList.toggle('active');
                        const arrow = this.querySelector('.arrow-icon');
                        if (arrow) arrow.style.transform = submenu.classList.contains('active') ? 'rotate(180deg)' : '';
                    }
                });
            });
        }
    }

    // Poll for unread messages every 30 seconds
    function startUnreadPolling() {
        updateUnreadBadge();
        setInterval(updateUnreadBadge, 30000);
    }

    async function updateUnreadBadge() {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE}/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const totalUnread = (data.data || []).reduce((s, c) => s + (c.unread_count || 0), 0);
            const badge = document.getElementById('sidebarMsgBadge');
            if (badge) {
                if (totalUnread > 0) {
                    badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }

            // Also update page title if there are unreads
            if (totalUnread > 0 && !window.location.pathname.includes('messages.html')) {
                // Don't override title on messages page
            }
        } catch (e) { /* silent fail */ }
    }

    // Expose for external use
    window.updateChatBadge = updateUnreadBadge;
})();
