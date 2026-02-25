// Direct API test - gọi /auth/me với token
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n=== DIRECT API TEST: /auth/me ===\n');
console.log('Copy token từ browser console: sessionStorage.getItem(\'token\')\n');

rl.question('Token: ', async (token) => {
    if (!token || token.trim() === '') {
        console.log('❌ Token rỗng!');
        rl.close();
        return;
    }

    try {
        const fetch = (await import('node-fetch')).default;

        console.log('\n📡 Calling API...');
        const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token.trim()}`
            }
        });

        const result = await response.json();

        console.log('\n📊 Response Status:', response.status);
        console.log('📊 Response Body:\n');
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.data) {
            const user = result.data;
            console.log('\n=== SUMMARY ===');
            console.log('User:', user.full_name);
            console.log('role_id:', user.role_id !== undefined ? user.role_id : '❌ MISSING');
            console.log('role_name:', user.role_name !== undefined ? user.role_name : '❌ MISSING');

            if (user.role_name) {
                console.log('\n✅ SUCCESS! API trả về role_name:', user.role_name);
                console.log('\nKiểm tra backend terminal - phải thấy log:');
                console.log('  🔍 [GET /auth/me] User ID: ...');
                console.log('  📊 [GET /auth/me] Query result: ...');
            } else {
                console.log('\n❌ FAILED! API KHÔNG trả về role_name');
                console.log('\nCó thể:');
                console.log('  1. Database không có role_id cho user này');
                console.log('  2. Query JOIN có vấn đề');
                console.log('  3. Backend code cũ chưa được load');
            }
        } else {
            console.log('\n❌ API call failed:', result.message);
        }
    } catch (err) {
        console.error('\n❌ Error:', err.message);
    }

    rl.close();
});
