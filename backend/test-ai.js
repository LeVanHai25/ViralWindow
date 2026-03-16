require('dotenv').config();
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

async function testAI() {
    console.log("🚀 Bắt đầu gửi câu hỏi giả lập tới AI Brain...");
    
    // Tạo 1 token giả mạo hợp lệ (User ID 1 = Admin)
    const token = jwt.sign(
        { id: 1, role: 'superadmin', agency_id: 1 },
        process.env.JWT_SECRET || 'viral_window_secret_key',
        { expiresIn: '1h' }
    );

    try {
        const response = await fetch('http://localhost:3001/api/ai/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: 'dự án nào có báo giá cao nhất' })
        });
        
        const data = await response.json();
        console.log("✅ KẾT QUẢ TỪ AI:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("❌ Lỗi gọi API:", err.message);
    }
}

testAI();
