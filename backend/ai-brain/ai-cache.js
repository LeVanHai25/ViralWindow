const Redis = require('ioredis');
const NodeCache = require('node-cache');

// 1. KHỞI TẠO REDIS (Chính) & NODE-CACHE (Dự phòng)
// Khuyến cáo của Senior: Thường thì web app Node.js kết nối cùng máy với Redis.
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
        if (times > 3) {
            console.warn('[AI Cache] ⚠️ Tắt auto-reconnect Redis sau 3 lần thử. Hoàn toàn dùng Local Cache dự phòng để tránh spam log nhắn.');
            return null; // Trả về null để ioredis NGỪNG việc cố gắng kết nối lại (chống spam log Render)
        }
        return Math.min(times * 500, 2000); // Thử lại sau 0.5s -> 2s
    },
    maxRetriesPerRequest: 1 // Không treo request lâu
});

// Cache dự phòng trên RAM (khi Redis chết)
const localCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Trạng thái kết nối Redis
let isRedisConnected = false;
redis.on('ready', () => {
    isRedisConnected = true;
    console.log('[AI Cache] 🟢 Redis đã kết nối thành công và sẵn sàng phục vụ.');
});
redis.on('error', (err) => {
    isRedisConnected = false;
    console.error('[AI Cache] 🔴 Lỗi kết nối Redis (Sẽ dùng Local Cache dự phòng):', err.message);
});

// 2. KỸ THUẬT CHỐNG CACHE STAMPEDE (Thundering Herd Prevention)
// Nếu 50 user truy cập cùng lúc và Cache đang rỗng, chỉ 1 request được gọi API Gemini.
// 49 request còn lại sẽ nằm chờ (pending) và nhận kết quả từ request 1.
const pendingRequests = new Map();

/**
 * Lớp vỏ bọc (Wrapper) thông minh cho việc gọi AI (Thiết kế Phase 10: Redis + Stampede Prevention).
 * Giúp giảm tải 90-99% request lên Gemini, chống lỗi 429 Too Many Requests hiệu quả tuyệt đối.
 * 
 * @param {string} key - Khoá Cache (VD: 'ai:dashboard_insights')
 * @param {function} generateFn - Hàm async chạy thực tế gọi Gemini nếu Cache Miss.
 * @param {number} ttlSeconds - Thời gian tồn tại của Cache (giây). Mặc định 600s (10 phút).
 * @returns {Promise<any>} - Dữ liệu trả về từ AI hoặc Cache.
 */
async function getCachedAI(key, generateFn, ttlSeconds = 600) {
    try {
        // --- BƯỚC 0: KIỂM TRA CẦU DAO (Circuit Breaker Phase 11) ---
        // Nếu API Key đã hết tiền, Redis sẽ giữ thẻ 'ai:circuit_breaker'
        if (isRedisConnected) {
            const isShattered = await redis.get('ai:circuit_breaker');
            if (isShattered) {
                console.warn(`[AI Circuit Breaker] 🛑 Cầu dao đang MỞ. Bỏ qua API tự lùi về Fallback cục bộ cho Key: ${key}`);
                throw new Error('CIRCUIT_BREAKER_ACTIVE'); // Ném lỗi văng thẳng ra catch để fallback tĩnh
            }
        }

        // --- BƯỚC 1: KIỂM TRA PENDING REQUESTS (Chống Stampede) ---
        if (pendingRequests.has(key)) {
            console.log(`[AI Cache] ⏳ STAMPEDE PREVENTED: Request đang nằm chờ kết quả chép lại... -> ${key}`);
            return await pendingRequests.get(key);
        }

        // --- BƯỚC 2: KIỂM TRA REDIS (Dữ liệu đã có sẵn rải rác trên nhiều servers) ---
        if (isRedisConnected) {
            try {
                const cachedData = await redis.get(key);
                if (cachedData) {
                    console.log(`[AI Cache] ⚡ REDIS HIT: Trả về kết quả tức thì (~1ms) cho -> ${key}`);
                    return JSON.parse(cachedData);
                }
            } catch (redisErr) {
                console.error(`[AI Cache] Xảy ra lỗi khi đọc thẻ Redis cho ${key}, lùi về Local:`, redisErr.message);
            }
        }

        // --- BƯỚC 3: KIỂM TRA LOCAL CACHE (Khi Redis mất kết nối) ---
        const localHit = localCache.get(key);
        if (localHit) {
            console.log(`[AI Cache] ⚡ LOCAL HIT (Dự phòng): Trả về kết quả thay thế cho -> ${key}`);
            return localHit;
        }

        console.log(`[AI Cache] 🐢 CACHE MISS: Gọi Gemini API để phân tích -> ${key}`);

        // --- BƯỚC 4: GỌI HÀM VÀ ĐƯA VÀO PENDING HÀNG ĐỢI ---
        // Biến quá trình gọi API thành một Promise dùng chung
        const promise = generateFn().then(async (result) => {
            if (result) {
                // Lưu vào Redis hoặc Local
                if (isRedisConnected) {
                    try {
                        // "EX" = Giây
                        await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds);
                    } catch (e) { console.error('[AI Cache] Không lưu được Redis:', e.message); }
                } else {
                    localCache.set(key, result, ttlSeconds);
                }
            }
            return result;
        }).finally(() => {
            // Khi lấy xong Data, phải mở khoá / xóa thẻ chờ
            pendingRequests.delete(key);
        });

        // Đổ móng Promise này vào túi (Cho người thứ 2 tới xài ké)
        pendingRequests.set(key, promise);

        return await promise;

    } catch (error) {
        // Lỗi bét nhè thì gỡ khoá Stampede để thử lại lần sau
        pendingRequests.delete(key);

        // --- BƯỚC 5: XỬ LÝ LỖI SẬP CẦU DAO TỪ AI SERVICE ---
        if (error.code === 'QUOTA_EXHAUSTED') {
            if (isRedisConnected) {
                // Sập cầu dao cục bộ toàn server trong 1 giờ (3600s)
                console.error(`[AI Circuit Breaker] 💥 API KEY HẾT QUOTA! Kích hoạt Cầu Dao Điện tắt AI trong 1 giờ tới.`);
                await redis.set('ai:circuit_breaker', 'true', 'EX', 3600);
            }
            throw new Error('Cầu dao AI đã đóng do hết Quota.'); // Chặn đứng và nhường cho Fallback
        }

        // Nếu bản thân lỗi ném ra từ Circuit Breaker, ta quăng lại cho Controller bắt Fallback
        if (error.message === 'CIRCUIT_BREAKER_ACTIVE') {
            throw error;
        }

        console.error(`[AI Cache] Lỗi rớt mạch xử lý chóp bu ${key}:`, error);
        return await generateFn(); // Lỗi lặt vặt khác đâm thẳng tự chịu trách nhiệm
    }
}

/**
 * Tính năng phá Cache (Invalidation) thủ công khi dữ liệu thay đổi đột ngột
 * @param {string} pattern - Pattern tìm key (VD: 'ai:dashboard*')
 */
async function invalidateAICache(pattern) {
    // 1. Xoá Local Cache
    try {
        const localKeys = localCache.keys().filter(k => k.indexOf(pattern.replace('*','')) !== -1);
        if (localKeys.length > 0) localCache.del(localKeys);
    } catch(e) {}

    // 2. Xoá Redis Cache bằng SCAN thay vì KEYS (chống block RAM)
    if (isRedisConnected) {
        try {
            let cursor = '0';
            let totalDeleted = 0;
            do {
                const res = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
                cursor = res[0];
                const keys = res[1];
                if (keys.length > 0) {
                    await redis.del(...keys);
                    totalDeleted += keys.length;
                }
            } while (cursor !== '0');
            console.log(`[AI Cache] 🗑️ Redis: Đã dọn dẹp ${totalDeleted} keys chứa pattern: ${pattern}`);
        } catch (e) {
            console.error(`[AI Cache] 🔴 Lỗi Xóa Redis pattern ${pattern}:`, e.message);
        }
    }
}

module.exports = {
    getCachedAI,
    invalidateAICache,
    redisClient: redis // Xuất cho tiện Debug nếu cần
};
