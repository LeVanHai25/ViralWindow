const http = require('http');

console.log('🔍 Kiểm tra API Projects...\n');

// Test 1: Kiểm tra dự án ID=9
function testProject9() {
    return new Promise((resolve) => {
        http.get('http://localhost:3001/api/projects/9/detail', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const result = JSON.parse(data);
                console.log('📋 Test GET /api/projects/9/detail:');
                console.log('   Status:', res.statusCode);
                console.log('   Response:', result);
                console.log('');
                resolve();
            });
        });
    });
}

// Test 2: Lấy danh sách dự án
function testAllProjects() {
    return new Promise((resolve) => {
        http.get('http://localhost:3001/api/projects', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const result = JSON.parse(data);
                console.log('📋 Test GET /api/projects:');
                console.log('   Status:', res.statusCode);
                console.log('   Total projects:', result.data?.length || 0);
                if (result.data && result.data.length > 0) {
                    console.log('\n   First 5 projects:');
                    result.data.slice(0, 5).forEach(p => {
                        console.log(`   - ID: ${p.id}, Code: ${p.project_code}, Name: ${p.project_name}`);
                    });
                }
                console.log('');
                resolve();
            });
        });
    });
}

// Test 3: Lấy dự án đã hủy
function testCancelledProjects() {
    return new Promise((resolve) => {
        http.get('http://localhost:3001/api/projects/cancelled', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const result = JSON.parse(data);
                console.log('📋 Test GET /api/projects/cancelled:');
                console.log('   Status:', res.statusCode);
                console.log('   Total cancelled projects:', result.data?.length || 0);
                if (result.data && result.data.length > 0) {
                    console.log('\n   Cancelled projects:');
                    result.data.forEach(p => {
                        console.log(`   - ID: ${p.id}, Code: ${p.project_code}, Name: ${p.project_name}`);
                    });
                }
                console.log('');
                resolve();
            });
        });
    });
}

async function runTests() {
    await testProject9();
    await testAllProjects();
    await testCancelledProjects();

    console.log('✅ Tests completed!');
    process.exit(0);
}

runTests().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
