// Polyfill fetch for Node.js < 18
if (!globalThis.fetch) {
    const nodeFetch = require('node-fetch');
    globalThis.fetch = nodeFetch;
    globalThis.Headers = nodeFetch.Headers;
    globalThis.Request = nodeFetch.Request;
    globalThis.Response = nodeFetch.Response;
}

/**
 * =====================================================
 * AI SERVICE - Core Engine
 * =====================================================
 * Kết nối Google Gemini API cho ViralWindow
 * - generateInsights(): Tạo insights cho dashboard
 * - parseSearchQuery(): NLP → SQL params
 * - chat(): Chatbot conversation
 * - generateReport(): Tạo báo cáo AI
 * 
 * @author ViralWindow AI Team
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// =====================================================
// INIT GEMINI
// =====================================================
const API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

function getModel() {
    if (!model) {
        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
        }
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
    return model;
}

// =====================================================
// SYSTEM PROMPT - Context chung cho mọi request
// =====================================================
const SYSTEM_PROMPT = `Bạn là AI Assistant của phần mềm ViralWindow - hệ thống quản lý sản xuất nhôm kính chuyên nghiệp.

VỀ HỆ THỐNG:
- ViralWindow quản lý: Dự án, Kho vật tư (Nhôm, Kính, Phụ kiện), Tài chính, Sản xuất, Báo giá, Khách hàng
- Có 2 kho nhôm: Kho Nhôm VIRAL (id=1) và Kho Nhôm YANGLY (id=2)
- Phụ kiện có danh mục riêng (accessory_categories)
- Nhôm có các hệ (VRA-55, VRE-65, v.v.)
- Đơn vị tiền: VNĐ (Việt Nam Đồng)

QUY TẮC:
1. Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp
2. Dùng emoji phù hợp để dễ đọc
3. Khi nói về tiền, format: 1.000.000đ
4. Khi phân tích, đưa ra gợi ý hành động cụ thể
5. Không bịa dữ liệu - chỉ phân tích dữ liệu thực được cung cấp
6. Format output bằng HTML đẹp (bold, list, color) để hiển thị trên web`;

// =====================================================
// CACHE - Tránh gọi API quá nhiều
// =====================================================
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
    // Cleanup old entries
    if (cache.size > 50) {
        const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < 10; i++) cache.delete(oldest[i][0]);
    }
}

// =====================================================
// CORE: Call Gemini API (with retry for 429)
// =====================================================
async function callGemini(prompt, options = {}) {
    const m = getModel();
    
    const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
    };

    const MAX_RETRIES = 3;
    const BASE_DELAY = 3000; // 3 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await m.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig
            });
            
            const response = result.response;
            return response.text();
        } catch (error) {
            const is429 = error.message && (error.message.includes('429') || error.message.includes('Too Many Requests') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'));
            
            if (is429 && attempt < MAX_RETRIES) {
                const delay = BASE_DELAY * Math.pow(2, attempt - 1); // 3s, 6s, 12s
                console.warn(`⚠️ Gemini rate limit (attempt ${attempt}/${MAX_RETRIES}). Retry in ${delay/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            console.error(`❌ Gemini API Error (attempt ${attempt}):`, error.message);
            
            if (is429) {
                throw new Error('⏳ AI đang bận, vui lòng thử lại sau 1-2 phút. (Gemini API giới hạn request)');
            }
            throw new Error('AI tạm thời không khả dụng. Vui lòng thử lại.');
        }
    }
}

// =====================================================
// 1. DASHBOARD INSIGHTS
// =====================================================
async function generateInsights(dataContext) {
    const cacheKey = 'dashboard_insights_' + new Date().toISOString().slice(0, 13); // Cache per hour
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const prompt = `${SYSTEM_PROMPT}

DỮ LIỆU HỆ THỐNG HIỆN TẠI:
${JSON.stringify(dataContext, null, 2)}

HÃY PHÂN TÍCH và tạo 5-7 INSIGHTS ngắn gọn về tình hình kinh doanh.

FORMAT OUTPUT (HTML):
<div class="ai-insight-item">
<span class="ai-icon">emoji</span>
<span class="ai-text"><b>Tiêu đề ngắn:</b> Nội dung chi tiết 1-2 câu</span>
</div>

Mỗi insight là 1 div riêng. Bao gồm:
- Tình hình dự án (active, overdue, completed gần đây)
- Tình hình kho (vật tư sắp hết, nhập/xuất gần đây)
- Tài chính (doanh thu, chi phí, xu hướng)
- Cảnh báo quan trọng (nếu có)
- Gợi ý hành động cụ thể

KHÔNG bao giờ nói "dữ liệu không có" - hãy phân tích với những gì có.`;

    const result = await callGemini(prompt, { temperature: 0.6 });
    setCache(cacheKey, result);
    return result;
}

// =====================================================
// 2. SMART SEARCH - NLP → Structured Query
// =====================================================
async function parseSearchQuery(query) {
    const prompt = `${SYSTEM_PROMPT}

Người dùng tìm kiếm: "${query}"

Hãy phân tích câu hỏi và trả về JSON với format:
{
  "intent": "search|count|compare|list|detail",
  "tables": ["tên_bảng_liên_quan"],
  "filters": { "field": "value" },
  "keywords": ["từ khóa tìm kiếm"],
  "summary": "Mô tả ngắn gọn ý định người dùng",
  "suggested_sql_where": "Điều kiện WHERE gợi ý (KHÔNG có SELECT/FROM)"
}

CÁC BẢNG CHÍNH:
- projects: id, project_name, order_code, status, deadline, customer_name, total_amount
- stock_documents: id, doc_no, doc_type(import/export), warehouse_id, status, created_at
- stock_document_lines: item_type, item_id, item_code, item_name, qty, unit_price
- financial_transactions: type(income/expense), amount, category, description, transaction_date
- inventory: item_code, item_name, quantity, unit_price
- accessories: code, name, stock_quantity, category_id
- aluminum_systems: code, name, quantity, warehouse_id
- customers: name, phone, email, address
- quotations: id, customer_name, status, total_amount, created_at
- material_requests: order_code, category, status, created_at

CHỈ trả về JSON, KHÔNG giải thích thêm.`;

    const result = await callGemini(prompt, { temperature: 0.1 });
    
    // Parse JSON from response
    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.warn('⚠️ Failed to parse AI search response:', e.message);
    }
    
    return {
        intent: 'search',
        tables: ['projects'],
        filters: {},
        keywords: query.split(' '),
        summary: query,
        suggested_sql_where: `1=1`
    };
}

// =====================================================
// 3. CHATBOT
// =====================================================
async function chat(message, history = [], dataContext = null) {
    let contextBlock = '';
    if (dataContext) {
        contextBlock = `\n\nDỮ LIỆU LIÊN QUAN TỪ HỆ THỐNG:\n${JSON.stringify(dataContext, null, 2)}`;
    }

    // Build conversation history
    const historyText = history.map(h => 
        `${h.role === 'user' ? 'Người dùng' : 'AI'}: ${h.content}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}
${contextBlock}

${historyText ? `LỊCH SỬ HỘI THOẠI:\n${historyText}\n` : ''}
Người dùng: ${message}

Hãy trả lời bằng HTML đẹp. Dùng <b>, <ul><li>, <span style="color:...">, <br> để format.
Nếu người dùng hỏi về dữ liệu hệ thống, hãy phân tích dữ liệu được cung cấp.
Nếu hỏi hướng dẫn thao tác, hãy mô tả từng bước chi tiết.
Giữ câu trả lời ngắn gọn, dưới 300 từ.`;

    return await callGemini(prompt, { temperature: 0.7, maxTokens: 1500 });
}

// =====================================================
// 4. AUTO REPORTS (Category-aware)
// =====================================================
async function generateReport(reportType, dataContext, filters = {}) {
    const category = filters.category || 'overview';
    const CATEGORY_NAMES = {
        overview: 'Tổng Quan Hệ Thống', projects: 'Dự Án & Tiến Độ',
        finance: 'Tài Chính & Doanh Thu', inventory: 'Kho & Vật Tư',
        customers: 'Khách Hàng', hr: 'Nhân Sự & Năng Suất'
    };
    const TIME_NAMES = {
        today: 'hôm nay', week: '7 ngày qua', month: '30 ngày qua', quarter: 'quý này', custom: 'theo tuỳ chọn'
    };

    const categoryName = CATEGORY_NAMES[category] || 'Tổng Quan';
    const timeName = TIME_NAMES[filters.timeRange] || '7 ngày qua';

    // Build category-specific instructions
    const categoryInstructions = {
        overview: 'Phân tích TỔNG QUAN toàn bộ hệ thống: dự án, kho vật tư, tài chính, khách hàng. Đưa ra cái nhìn toàn diện.',
        projects: 'Tập trung phân tích DỰ ÁN: tiến độ, trạng thái, giá trị, quá hạn, rủi ro. Không phân tích kho hay tài chính.',
        finance: 'Tập trung phân tích TÀI CHÍNH: doanh thu, chi phí, lãi lỗ, xu hướng, cảnh báo. Không phân tích dự án hay kho.',
        inventory: 'Tập trung phân tích KHO VẬT TƯ: nhập xuất, tồn kho, vật tư sắp hết, cảnh báo bổ sung. Không phân tích tài chính hay dự án.',
        customers: 'Tập trung phân tích KHÁCH HÀNG: top khách hàng, giá trị dự án, tần suất, tiềm năng.',
        hr: 'Tập trung phân tích NHÂN SỰ & NĂNG SUẤT: phân bổ nhân lực, hiệu suất dự án, gợi ý tối ưu hoá.'
    };

    // Build filter description
    let filterDesc = '';
    if (filters.project_id) filterDesc += '\n- Đang LỌC theo 1 dự án cụ thể.';
    if (filters.customer_id) filterDesc += '\n- Đang LỌC theo 1 khách hàng cụ thể.';
    if (filters.branch_id) filterDesc += '\n- Đang LỌC theo 1 chi nhánh cụ thể.';
    if (filters.status) filterDesc += `\n- Đang LỌC trạng thái: ${filters.status}`;

    const prompt = `${SYSTEM_PROMPT}

NGƯỜI DÙNG YÊU CẦU BÁO CÁO:
- Danh mục: ${categoryName}
- Khoảng thời gian: ${timeName}
- Định dạng: ${filters.format === 'summary' ? 'Tóm tắt ngắn gọn' : filters.format === 'executive' ? 'Dành cho lãnh đạo (tổng hợp, gợi ý chiến lược)' : 'Chi tiết đầy đủ'}${filterDesc}

CHỈ DẪN:
${categoryInstructions[category] || categoryInstructions.overview}

DỮ LIỆU TỪ DATABASE (DỮ LIỆU THỰC TẾ - KHÔNG BỊA):
${JSON.stringify(dataContext, null, 2)}

FORMAT BÁO CÁO (HTML):
<div class="ai-report">
  <h2>📊 Báo Cáo ${categoryName}</h2>
  <p class="ai-report-date">Khoảng thời gian: ${timeName}</p>
  
  <div class="ai-report-section">
    <h3>📌 [Tên mục phù hợp với ${categoryName}]</h3>
    <ul>
      <li>[Phân tích cụ thể dựa trên dữ liệu thực tế]</li>
    </ul>
  </div>
  
  <div class="ai-report-summary">
    <h3>💡 Nhận xét & Gợi ý</h3>
    <ul>
      <li>[Gợi ý hành động cụ thể, khả thi]</li>
    </ul>
  </div>
</div>

QUY TẮC QUAN TRỌNG:
1. CHỈ phân tích dữ liệu được cung cấp, KHÔNG bịa số liệu
2. Chỉ tập trung vào danh mục "${categoryName}", KHÔNG lan man sang danh mục khác
3. Format tiền VNĐ đúng: 1.000.000đ
4. Nếu dữ liệu rỗng, nói rõ "Không có dữ liệu trong khoảng thời gian này" thay vì bịa
5. Dùng số liệu cụ thể từ data, đừng nói chung chung
6. Đưa ra ít nhất 3 gợi ý hành động cụ thể và khả thi`;

    return await callGemini(prompt, { temperature: 0.5, maxTokens: 3000 });
}

// =====================================================
// TEST CONNECTION
// =====================================================
async function testConnection() {
    try {
        const result = await callGemini('Xin chào, hãy trả lời ngắn gọn: "AI ViralWindow sẵn sàng!" bằng tiếng Việt.', { maxTokens: 50 });
        return { success: true, message: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

module.exports = {
    generateInsights,
    parseSearchQuery,
    chat,
    generateReport,
    testConnection,
    callGemini
};
