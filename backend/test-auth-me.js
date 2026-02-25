// Test script to check if /auth/me API returns role_name
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n=== Test API /auth/me ===\n');
console.log('Bước 1: Đăng nhập vào browser và mở Console (F12)');
console.log('Bước 2: Chạy lệnh sau trong Console:\n');
console.log('sessionStorage.getItem(\'token\')\n');
console.log('Bước 3: Copy token và paste vào đây:\n');

rl.question('Token: ', async (token) => {
    if (!token || token.trim() === '') {
        console.log('❌ Token rỗng!');
        rl.close();
        return;
    }

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token.trim()}`
            }
        });

        const result = await response.json();

        console.log('\n📊 API Response Status:', response.status);
        console.log('📊 API Response:\n');
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.data) {
            const user = result.data;
            console.log('\n✅ Thông tin user:');
            console.log('  - Tên:', user.full_name);
            console.log('  - Email:', user.email);
            console.log('  - user_type:', user.user_type);

            if (user.role_id !== undefined) {
                console.log('  - role_id:', user.role_id);
            } else {
                console.log('  ❌ KHÔNG CÓ role_id trong response!');
            }

            if (user.role_name !== undefined) {
                console.log('  - role_name:', user.role_name);
                console.log('\n✅ Backend ĐÃ ĐƯỢC RESTART! API trả về role_name!');
            } else {
                console.log('  ❌ KHÔNG CÓ role_name trong response!');
                console.log('\n🔴 Backend CHƯA ĐƯỢC RESTART!');
                console.log('   Vui lòng restart backend bằng:');
                console.log('   1. Ctrl+C ở terminal đang chạy server');
                console.log('   2. npm start hoặc node server.js');
            }
        }
    } catch (err) {
        console.error('❌ Lỗi kết nối:', err.message);
        console.log('\n🔴 Không thể kết nối backend!');
        console.log('   Kiểm tra backend có đang chạy không?');
    }

    rl.close();
});
