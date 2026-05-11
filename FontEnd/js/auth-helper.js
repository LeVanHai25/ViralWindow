/**
 * Auth Helper - Centralized Authentication Handler
 * ViralWindow System
 * 
 * MUST be loaded FIRST before any other scripts in <head>
 * This ensures Remember Login works across all pages
 * 
 * FIX: Added JWT expiry check to prevent redirect loop when
 * Chrome auto-fills credentials with an expired token in localStorage.
 */

(function () {
    'use strict';

    // ============================================
    // JWT EXPIRY CHECK (Client-side)
    // Decode JWT payload and check exp field
    // ============================================
    function isTokenExpired(token) {
        if (!token) return true;
        try {
            // JWT format: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) return true;
            
            const payload = JSON.parse(atob(parts[1]));
            if (!payload.exp) return false; // No expiry = never expires
            
            // FIX: exp is in seconds, Date.now() is in milliseconds
            // Token expired when exp*1000 < now (NOT now-60000 which caused false-positive!)
            return (payload.exp * 1000) < Date.now();
        } catch (e) {
            console.warn('[AuthHelper] Cannot parse token expiry:', e.message);
            return false; // FIX: If can't parse, do NOT treat as expired (safer for new tokens)
        }
    }

    // FIX: Helper to check if currently on login page (avoid redirect loop)
    function isOnLoginPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page === 'login.html' || page === '' || path === '/';
    }

    // ============================================
    // TOKEN SYNC: localStorage → sessionStorage
    // Only sync if token is still valid (not expired)
    // ============================================
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');

    if (localToken && !sessionToken) {
        // FIX: Check expiry BEFORE syncing
        if (isTokenExpired(localToken)) {
            // Token đã hết hạn → xóa sạch localStorage, không sync
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            console.log('[AuthHelper] Token expired in localStorage, cleared');
        } else {
            // Token còn hạn → sync vào sessionStorage
            sessionStorage.setItem('token', localToken);
            const localUser = localStorage.getItem('user');
            if (localUser) {
                sessionStorage.setItem('user', localUser);
            }
            console.log('[AuthHelper] Token synced from localStorage');
        }
    }

    // FIX: Only check/clear expired sessionStorage token when NOT on login page
    // Prevents clearing a freshly-saved token during redirect to index.html
    if (sessionToken && isTokenExpired(sessionToken) && !isOnLoginPage()) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        console.log('[AuthHelper] Token expired in sessionStorage, cleared both storages');
    }

    // ============================================
    // AUTH HELPER API
    // ============================================
    window.AuthHelper = {
        /**
         * Get token - prioritize sessionStorage, fallback to localStorage
         */
        getToken: function () {
            return sessionStorage.getItem('token') || localStorage.getItem('token');
        },

        /**
         * Get user object
         */
        getUser: function () {
            const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
            try {
                return userStr ? JSON.parse(userStr) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * Check if user is authenticated
         * FIX: Now also checks JWT expiry, not just token existence
         */
        isAuthenticated: function () {
            const token = this.getToken();
            if (!token) return false;
            
            // FIX: Verify token hasn't expired
            if (isTokenExpired(token)) {
                console.log('[AuthHelper] isAuthenticated: token expired, clearing auth');
                this.clearAuth();
                return false;
            }
            return true;
        },

        /**
         * Save auth data with Remember Me support
         * @param {string} token - JWT token
         * @param {object} user - User object
         * @param {boolean} rememberMe - Whether to persist across browser sessions
         */
        saveAuth: function (token, user, rememberMe) {
            // Always save to sessionStorage for current session
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            if (rememberMe) {
                // Also save to localStorage for persistence
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('rememberMe', 'true');
            } else {
                // Clear localStorage if not remembering
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.setItem('rememberMe', 'false');
            }
        },

        /**
         * Clear all auth data (logout)
         */
        clearAuth: function () {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userPermissions');
            sessionStorage.removeItem('isAdmin');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
        },

        /**
         * Get Remember Me preference
         */
        getRememberMe: function () {
            return localStorage.getItem('rememberMe') === 'true';
        },

        /**
         * Redirect to login page
         * FIX: Added reason parameter for anti-loop protection
         * @param {string} reason - 'expired' | 'unauthorized' | undefined
         */
        redirectToLogin: function (reason) {
            this.clearAuth();
            const suffix = reason ? '?reason=' + reason : '';
            window.location.href = 'login.html' + suffix;
        },

        /**
         * Check auth and redirect to login if not authenticated
         * @returns {boolean} - true if authenticated, false otherwise
         */
        checkAuth: function () {
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
                return false;
            }
            return true;
        },

        /**
         * Enable Remember Me for current session
         */
        enableRememberMe: function () {
            const token = sessionStorage.getItem('token');
            const user = sessionStorage.getItem('user');
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('rememberMe', 'true');
                if (user) {
                    localStorage.setItem('user', user);
                }
            }
        },

        /**
         * Disable Remember Me
         */
        disableRememberMe: function () {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.setItem('rememberMe', 'false');
        }
    };

    // Also expose as global checkAuth for backward compatibility
    window.checkAuth = function () {
        return window.AuthHelper.checkAuth();
    };

    // Expose getAuthToken for backward compatibility
    window.getAuthToken = function () {
        return window.AuthHelper.getToken();
    };

    // Global handleLogout - clears both storages and redirects to login
    // This overrides any local handleLogout functions defined later in HTML files
    window.handleLogout = async function () {
        // Check if VWModal is available for confirmation dialog
        if (window.VWModal && typeof window.VWModal.confirm === 'function') {
            const confirmed = await window.VWModal.confirm('Đăng xuất', 'Bạn có chắc muốn đăng xuất?');
            if (!confirmed) return;
        } else {
            // Fallback to native confirm
            if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
        }

        // Clear all auth data from both storages
        window.AuthHelper.clearAuth();

        // Redirect to login page
        window.location.href = 'login.html';
    };

    // ============================================
    // FETCH INTERCEPTOR (with anti-loop protection)
    // Handles SESSION_EXPIRED and invalid token responses
    // ============================================
    let _isRedirecting = false; // Anti-loop: prevent multiple redirects

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        // Only intercept API requests, ignore external/static requests
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        const isApiRequest = url.includes('/api/');
        if (!isApiRequest) return response;

        // Don't intercept if already redirecting (anti-loop)
        if (_isRedirecting) return response;

        const responseClone = response.clone();

        if (response.status === 401 || response.status === 403) {
            try {
                const data = await responseClone.json();
                
                // Session explicitly revoked OR token invalid/expired
                // FIX: Do NOT redirect if already on login page (anti-loop)
                if (!isOnLoginPage() && (
                    data.code === 'SESSION_EXPIRED' || 
                    data.message === 'Token không hợp lệ' ||
                    data.message === 'Không có token xác thực')) {
                    
                    _isRedirecting = true; // Prevent further redirects
                    
                    console.log('[AuthHelper] Session expired/invalid, redirecting to login');
                    window.AuthHelper.clearAuth();
                    window.location.href = 'login.html?reason=expired';
                    return response;
                }
            } catch (e) {
                // Ignore JSON parse errors (e.g., non-JSON 401 responses)
            }
        }

        return response;
    };

    // Load AI Brain Chat Widget for authenticated users
    document.addEventListener('DOMContentLoaded', () => {
        if (window.AuthHelper.isAuthenticated()) {
            const aiScript = document.createElement('script');
            aiScript.src = 'js/ai-chat.js';
            document.head.appendChild(aiScript);
        }
    });

})();
