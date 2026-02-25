/**
 * API Configuration - ViralWindow
 * File này quản lý cấu hình API URL tập trung
 * 
 * Cách sử dụng:
 * 1. Include file này trong HTML: <script src="js/api-config.js"></script>
 * 2. Sử dụng: const response = await fetch(`${API_BASE}/endpoint`);
 * 
 * @version 1.0.0
 * @date 2026-01-22
 */

(function() {
    'use strict';

    // Detect environment based on hostname
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let API_BASE_URL;
    
    // Development environment (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Default development port
        const apiPort = 3001;
        API_BASE_URL = `http://${hostname}:${apiPort}/api`;
    } 
    // Production environment
    else {
        // In production, API is typically on same domain or configured separately
        API_BASE_URL = '/api';
    }

    // Export to global scope
    window.API_BASE = API_BASE_URL;
    
    // Also export as module if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { API_BASE: API_BASE_URL };
    }

    // Console log for debugging (only in development)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('🔧 API Configuration loaded:');
        console.log('   API_BASE:', API_BASE_URL);
    }
})();

/**
 * Helper function to make authenticated API calls
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function apiCall(endpoint, options = {}) {
    const url = `${window.API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    
    // Default content type for POST/PUT
    if ((options.method === 'POST' || options.method === 'PUT') && options.body && typeof options.body === 'object') {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        options.body = JSON.stringify(options.body);
    }
    
    return fetch(url, options);
}

/**
 * Helper function to handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<object>}
 */
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
}
