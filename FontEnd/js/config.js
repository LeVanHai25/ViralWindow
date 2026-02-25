// ViralWindow - Auto-detect API URL for production/development
(function () {
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    if (isLocal) {
        window.API_BASE = 'http://localhost:3001/api';
        window.SERVER_BASE = 'http://localhost:3001';
    } else {
        // Production: API cùng domain, reverse proxy /api/ → backend
        window.API_BASE = window.location.origin + '/api';
        window.SERVER_BASE = window.location.origin;
    }

    console.log('🔧 API_BASE:', window.API_BASE);
})();
