/**
 * Test script để kiểm tra endpoint /api/projects/:id/detail
 * Chạy: node test-project-detail-endpoint.js
 */

const http = require('http');

const testEndpoint = (projectId = 5) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/projects/${projectId}/detail`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: json
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
};

// Test endpoint
console.log('🧪 Testing endpoint: GET /api/projects/5/detail\n');

testEndpoint(5)
    .then(result => {
        console.log(`✅ Status Code: ${result.status}`);
        console.log(`📦 Response:`, JSON.stringify(result.data, null, 2));
        
        if (result.status === 404) {
            console.log('\n❌ Endpoint không tồn tại! Cần restart server.');
        } else if (result.status === 200) {
            console.log('\n✅ Endpoint hoạt động tốt!');
        }
    })
    .catch(error => {
        console.error('❌ Lỗi kết nối:', error.message);
        console.log('\n💡 Đảm bảo server đang chạy tại http://localhost:3001');
    });










