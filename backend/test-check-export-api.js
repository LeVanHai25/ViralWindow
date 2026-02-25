/**
 * Script test API check-export-requirement
 * Chạy: node test-check-export-api.js
 */

const http = require('http');

const testUrl = 'http://localhost:3001/api/project-materials/check-export-requirement/11';

console.log('🧪 Testing API endpoint...');
console.log('URL:', testUrl);
console.log('');

const req = http.get(testUrl, (res) => {
    let data = '';

    console.log('📡 Response Status:', res.statusCode, res.statusMessage);
    console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
    console.log('');

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('📦 Response Body:');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
            
            if (res.statusCode === 200 && json.success) {
                console.log('');
                console.log('✅ SUCCESS: API hoạt động đúng!');
            } else {
                console.log('');
                console.log('⚠️  WARNING: API trả về nhưng có vấn đề');
            }
        } catch (e) {
            console.log(data);
            console.log('');
            console.log('❌ ERROR: Response không phải JSON hợp lệ');
            console.log('Error:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ ERROR: Không thể kết nối đến server');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Hãy đảm bảo:');
    console.error('   1. Server đang chạy: node backend/server.js');
    console.error('   2. Port 3001 đang mở');
    console.error('   3. Không có firewall chặn');
});

req.setTimeout(5000, () => {
    req.destroy();
    console.error('❌ ERROR: Timeout - Server không phản hồi');
});













