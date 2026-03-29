// ViralWindow - Centralized API Configuration
// Same-origin architecture: frontend and backend on same domain
// All API calls use relative paths — NO localhost, NO absolute URLs
(function () {
    'use strict';
    window.API_BASE = '/api';
    window.SERVER_BASE = '';
    console.log('[Config] API_BASE:', window.API_BASE);
})();
