const NodeCache = require('node-cache');

// Khởi tạo In-Memory Cache (Mặc định TTL = 10 phút, tự xoá khi hết hạn)
// Khuyến cáo của Senior: Cache này sống trong RAM của Server Node, 
// không phụ thuộc DNS ngoài, tránh được 100% lỗi mạng phân giải (ENOTFOUND).
const aiCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Lớp vỏ bọc (Wrapper) cho việc gọi AI (Thiết kế Phase 6.1 theo kiến trúc In-Memory Cache).
 * Giúp giảm tải 90-99% request lên Gemini, chống lỗi 429 Too Many Requests.
 * 
 * @param {string} key - Khoá Cache (VD: 'ai_dashboard_summary:branch_1')
 * @param {function} generateFn - Hàm async chạy thực tế gọi Gemini nếu Cache Miss.
 * @param {number} ttlSeconds - Thời gian tồn tại của Cache (giây). Mặc định 600s (10 phút).
 * @returns {Promise<any>} - Dữ liệu trả về từ AI hoặc Cache.
 */
async function getCachedAI(key, generateFn, ttlSeconds = 600) {
    try {
        // 1. CHECK CACHE IN RAM (HIT or MISS)
        const cachedData = aiCache.get(key);

        if (cachedData) {
            console.log(`[AI Cache MEM] ⚡ HIT: Trả về kết quả tức thì (~0ms) cho -> ${key}`);
            return cachedData;
        }

        console.log(`[AI Cache MEM] 🐢 MISS: Gọi Gemini API để phân tích -> ${key}`);

        // 2. Gọi hàm phân tích thực tế (Gemini SDK)
        const result = await generateFn();

        // 3. Lưu Cache vào RAM cho những lần sau
        if (result) {
            aiCache.set(key, result, ttlSeconds);
        }

        return result;

    } catch (error) {
        console.error(`[AI Cache MEM] Lỗi xử lý cache key ${key}:`, error);
        // Fallback: Luôn cố gắng gọi AI nếu Cache Core gặp sự cố
        return await generateFn();
    }
}

/**
 * Tính năng phá Cache (Invalidation) thủ công khi dữ liệu thay đổi đột ngột
 * @param {string} pattern - Pattern tìm key (VD: 'ai_dashboard_')
 */
function invalidateAICache(pattern) {
    try {
        const keys = aiCache.keys();
        const keysToDelete = keys.filter(k => k.includes(pattern));
        
        if (keysToDelete.length > 0) {
            aiCache.del(keysToDelete);
            console.log(`[AI Cache MEM] 🗑️ Đã xoá ${keysToDelete.length} keys chứa pattern: ${pattern}`);
        }
    } catch (e) {
        console.error(`[AI Cache MEM] Lỗi khi xoá cache pattern ${pattern}:`, e);
    }
}

module.exports = {
    getCachedAI,
    invalidateAICache
};
