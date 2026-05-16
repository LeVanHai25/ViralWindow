/**
 * AUTO MIGRATE SERVICE - Senior Architect Standard
 * Tự động đồng bộ cấu trúc Database Production
 */
const db = require('./config/db');

async function migrate() {
    console.log('\n🚀 [AutoMigrate] Đang kiểm tra cấu trúc Database...');
    
    try {
        // 1. Đồng bộ bảng audit_logs
        const auditLogsColumns = [
            { name: 'actor_role', type: 'VARCHAR(50) AFTER actor_name' },
            { name: 'metadata', type: 'LONGTEXT AFTER changed_fields' },
            { name: 'ip_address', type: 'VARCHAR(45) AFTER reason' },
            { name: 'user_agent', type: 'TEXT AFTER ip_address' }
        ];

        for (const col of auditLogsColumns) {
            try {
                await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`✅ Bảng audit_logs: Đã đồng bộ cột ${col.name}`);
            } catch (e) {
                // Ignore if column exists or other minor errors
            }
        }

        // 2. Tạo / sửa bảng user_sessions
        try {
            // Tạo nếu chưa có (thay vì ALTER thẳng gây lỗi khi bảng không tồn tại)
            await db.query(`
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    user_id     INT NOT NULL,
                    token       VARCHAR(512) NOT NULL,
                    expires_at  DATETIME NOT NULL,
                    ip_address  VARCHAR(45) NULL,
                    user_agent  TEXT NULL,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_expires (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            // Đảm bảo AUTO_INCREMENT nếu bảng đã cũ
            await db.query(`ALTER TABLE user_sessions MODIFY COLUMN id INT AUTO_INCREMENT`).catch(() => {});
            console.log('✅ Bảng user_sessions: Đã sẵn sàng');
        } catch (e) {
            console.warn('⚠️ user_sessions:', e.message);
        }

        // 3. Sửa bảng login_logs - Bật AUTO_INCREMENT
        try {
            await db.query(`ALTER TABLE login_logs MODIFY COLUMN id INT AUTO_INCREMENT`);
            console.log('✅ Bảng login_logs: Đã kích hoạt AUTO_INCREMENT');
        } catch (e) {
            // Ignore if not exists
        }

        // 4. ==========================================
        //    MODULE CHẤM CÔNG — 4 BẢNG CỐT LÕI
        // ==========================================

        // Bảng 4a: work_shifts (Ca Làm Việc)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS work_shifts (
                    id              INT AUTO_INCREMENT PRIMARY KEY,
                    name            VARCHAR(100) NOT NULL COMMENT 'Tên ca: Ca Sáng, Ca Chiều, Ca HC...',
                    start_time      TIME NOT NULL COMMENT 'Giờ bắt đầu',
                    end_time        TIME NOT NULL COMMENT 'Giờ kết thúc',
                    break_minutes   INT DEFAULT 60 COMMENT 'Phút nghỉ trưa (trừ khi tính giờ)',
                    late_threshold_minutes  INT DEFAULT 15 COMMENT 'Cho phép đến muộn tối đa (phút)',
                    early_leave_minutes     INT DEFAULT 15 COMMENT 'Cho phép về sớm tối đa (phút)',
                    is_default      TINYINT(1) DEFAULT 0 COMMENT '1 = Ca mặc định toàn công ty',
                    is_active       TINYINT(1) DEFAULT 1,
                    agency_id       INT NULL COMMENT 'NULL = áp dụng mọi chi nhánh',
                    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_is_default (is_default),
                    INDEX idx_is_active  (is_active)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng work_shifts: Đã sẵn sàng');

            // Seed Ca Hành Chính mặc định nếu bảng còn rỗng
            const [shiftCount] = await db.query('SELECT COUNT(*) as cnt FROM work_shifts');
            if (shiftCount[0].cnt === 0) {
                // Dùng parameterized INSERT riêng từng dòng để tránh AutoID middleware
                const seedRows = [
                    ['Ca Hành Chính', '08:00:00', '17:30:00', 90, 15, 15, 1, 1],
                    ['Ca Sáng',       '06:00:00', '14:00:00', 30, 15, 15, 0, 1],
                    ['Ca Chiều',      '14:00:00', '22:00:00', 30, 15, 15, 0, 1],
                ];
                for (const row of seedRows) {
                    await db.query(
                        'INSERT INTO work_shifts (name, start_time, end_time, break_minutes, late_threshold_minutes, early_leave_minutes, is_default, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        row
                    );
                }
                console.log('✅ Seed 3 ca mặc định (Ca Hành Chính / Ca Sáng / Ca Chiều) thành công');
            }
        } catch (e) {
            console.error('❌ Bảng work_shifts:', e.message);
        }

        // Bảng 4b: user_shifts (Phân Ca Cá Nhân)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS user_shifts (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    user_id     INT NOT NULL COMMENT 'FK → users.id',
                    shift_id    INT NOT NULL COMMENT 'FK → work_shifts.id',
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY  uq_user_shift (user_id),
                    INDEX idx_user_id  (user_id),
                    INDEX idx_shift_id (shift_id),
                    CONSTRAINT fk_us_shift FOREIGN KEY (shift_id)
                        REFERENCES work_shifts(id) ON DELETE CASCADE ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng user_shifts: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng user_shifts:', e.message);
        }

        // Bảng 4c: attendance_records (Bảng Chấm Công Chính)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS attendance_records (
                    id              INT AUTO_INCREMENT PRIMARY KEY,
                    user_id         INT NOT NULL COMMENT 'FK → users.id',
                    shift_id        INT NULL COMMENT 'Ca áp dụng lúc check-in',
                    date            DATE NOT NULL,
                    -- Check-in info
                    check_in        DATETIME NULL,
                    check_in_lat    DECIMAL(10,8) NULL,
                    check_in_lng    DECIMAL(11,8) NULL,
                    check_in_note   TEXT NULL,
                    -- Check-out info
                    check_out       DATETIME NULL,
                    check_out_lat   DECIMAL(10,8) NULL,
                    check_out_lng   DECIMAL(11,8) NULL,
                    check_out_note  TEXT NULL,
                    -- Tổng kết
                    work_hours      DECIMAL(5,2) DEFAULT 0 COMMENT 'Giờ làm thực tế',
                    overtime_hours  DECIMAL(5,2) DEFAULT 0 COMMENT 'Giờ tăng ca',
                    status          ENUM('present','late','early_leave','absent','on_leave','holiday')
                                    DEFAULT 'absent',
                    location_method ENUM('gps','ip','default','unknown') DEFAULT 'unknown',
                    agency_id       INT NULL,
                    approved_by     INT NULL COMMENT 'Admin sửa bản ghi này',
                    approved_at     DATETIME NULL,
                    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY  uq_user_date (user_id, date),
                    INDEX idx_user_id (user_id),
                    INDEX idx_date    (date),
                    INDEX idx_status  (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng attendance_records: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng attendance_records:', e.message);
        }

        // Bảng 4d: leave_requests (Đơn Xin Nghỉ Phép)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS leave_requests (
                    id              INT AUTO_INCREMENT PRIMARY KEY,
                    user_id         INT NOT NULL COMMENT 'FK → users.id',
                    type            ENUM('annual','sick','personal','maternity','other') NOT NULL,
                    start_date      DATE NOT NULL,
                    end_date        DATE NOT NULL,
                    days_count      DECIMAL(4,1) NOT NULL COMMENT '0.5 = nửa ngày',
                    reason          TEXT NOT NULL,
                    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
                    approved_by     INT NULL COMMENT 'Admin duyệt đơn',
                    approved_at     DATETIME NULL,
                    reject_reason   TEXT NULL,
                    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_id    (user_id),
                    INDEX idx_status     (status),
                    INDEX idx_start_date (start_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng leave_requests: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng leave_requests:', e.message);
        }

        // Bảng 4e: holidays (Ngày Nghỉ Lễ)
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS holidays (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    name        VARCHAR(200) NOT NULL COMMENT 'Tên ngày lễ',
                    date        DATE NOT NULL COMMENT 'Ngày nghỉ',
                    is_recurring TINYINT(1) DEFAULT 1 COMMENT '1 = hàng năm',
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_date (date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng holidays: Đã sẵn sàng');

            // Seed ngày lễ Việt Nam nếu bảng rỗng
            const [holCount] = await db.query('SELECT COUNT(*) as cnt FROM holidays');
            if (holCount[0].cnt === 0) {
                const year = new Date().getFullYear();
                const holidays2026 = [
                    [`Tết Dương Lịch`,         `${year}-01-01`],
                    [`Tết Nguyên Đán (29 Tết)`,  `${year}-01-28`],
                    [`Tết Nguyên Đán (Mồng 1)`,  `${year}-01-29`],
                    [`Tết Nguyên Đán (Mồng 2)`,  `${year}-01-30`],
                    [`Tết Nguyên Đán (Mồng 3)`,  `${year}-01-31`],
                    [`Tết Nguyên Đán (Mồng 4)`,  `${year}-02-01`],
                    [`Giỗ Tổ Hùng Vương`,        `${year}-04-07`],
                    [`Ngày Giải Phóng miền Nam`, `${year}-04-30`],
                    [`Ngày Quốc tế Lao động`,   `${year}-05-01`],
                    [`Quốc Khánh`,                `${year}-09-02`],
                ];
                for (const [name, date] of holidays2026) {
                    await db.query(
                        'INSERT IGNORE INTO holidays (name, date, is_recurring) VALUES (?, ?, 1)',
                        [name, date]
                    );
                }
                console.log(`✅ Seed ${holidays2026.length} ngày lễ Việt Nam ${year} thành công`);
            }
        } catch (e) {
            console.error('❌ Bảng holidays:', e.message);
        }

        // 5. Tạo bảng AI Brain nếu chưa có

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS ai_chat_sessions (
                    id VARCHAR(36) NOT NULL PRIMARY KEY,
                    user_id INT NULL,
                    title VARCHAR(255) DEFAULT 'Hội thoại mới',
                    status ENUM('active','archived') DEFAULT 'active',
                    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_last_active (last_active_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng ai_chat_sessions: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng ai_chat_sessions:', e.message);
        }

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS ai_chat_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    session_id VARCHAR(36) NOT NULL,
                    role ENUM('user','assistant','system') NOT NULL,
                    content LONGTEXT NOT NULL,
                    tools_used JSON NULL,
                    data_context JSON NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_session_id (session_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng ai_chat_messages: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng ai_chat_messages:', e.message);
        }

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS ai_analytics_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    session_id VARCHAR(36) NULL,
                    intent VARCHAR(100) DEFAULT 'general',
                    category VARCHAR(100) DEFAULT 'overview',
                    query_text TEXT NULL,
                    response_preview VARCHAR(500) NULL,
                    tools_executed INT DEFAULT 0,
                    processing_ms INT DEFAULT 0,
                    token_metrics JSON NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('✅ Bảng ai_analytics_logs: Đã sẵn sàng');
        } catch (e) {
            console.error('❌ Bảng ai_analytics_logs:', e.message);
        }

        console.log('🎊 [AutoMigrate] Hoàn tất quá trình đồng bộ!\n');
    } catch (err) {
        console.error('🛑 [AutoMigrate] Lỗi nghiêm trọng:', err.message);
    }
}

module.exports = migrate;
