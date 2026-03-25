/**
 * Migration: Tạo các bảng cho hệ thống Chấm Công
 * Run: node create_attendance_tables.js
 */
const db = require('./config/db');

async function createAttendanceTables() {
    console.log('🚀 Bắt đầu tạo bảng hệ thống Chấm Công...\n');

    try {
        // 1. Ca làm việc
        console.log('1️⃣  Tạo bảng work_shifts...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS work_shifts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL COMMENT 'Tên ca: Ca sáng, Ca chiều, Cả ngày',
                start_time TIME NOT NULL COMMENT 'Giờ bắt đầu',
                end_time TIME NOT NULL COMMENT 'Giờ kết thúc',
                break_minutes INT DEFAULT 60 COMMENT 'Thời gian nghỉ trưa (phút)',
                late_threshold_minutes INT DEFAULT 15 COMMENT 'Cho phép trễ tối đa (phút)',
                early_leave_minutes INT DEFAULT 15 COMMENT 'Cho phép về sớm tối đa (phút)',
                is_default TINYINT(1) DEFAULT 0 COMMENT '1 = ca mặc định',
                is_active TINYINT(1) DEFAULT 1,
                agency_id INT DEFAULT NULL COMMENT 'NULL = áp dụng tất cả chi nhánh',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('   ✅ work_shifts OK');

        // 2. Bản ghi chấm công
        console.log('2️⃣  Tạo bảng attendance_records...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance_records (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                shift_id INT DEFAULT NULL,
                date DATE NOT NULL COMMENT 'Ngày chấm công',
                check_in DATETIME DEFAULT NULL COMMENT 'Giờ vào',
                check_out DATETIME DEFAULT NULL COMMENT 'Giờ ra',
                check_in_lat DECIMAL(10,7) DEFAULT NULL,
                check_in_lng DECIMAL(10,7) DEFAULT NULL,
                check_out_lat DECIMAL(10,7) DEFAULT NULL,
                check_out_lng DECIMAL(10,7) DEFAULT NULL,
                check_in_note TEXT DEFAULT NULL,
                check_out_note TEXT DEFAULT NULL,
                status ENUM('present','late','early_leave','absent','on_leave','holiday') DEFAULT 'present',
                work_hours DECIMAL(4,2) DEFAULT NULL COMMENT 'Số giờ làm thực tế',
                overtime_hours DECIMAL(4,2) DEFAULT 0 COMMENT 'Giờ tăng ca',
                agency_id INT DEFAULT NULL,
                approved_by INT DEFAULT NULL,
                approved_at DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_user_date (user_id, date),
                KEY idx_date (date),
                KEY idx_user_month (user_id, date),
                KEY idx_status (status)
            )
        `);
        console.log('   ✅ attendance_records OK');

        // 3. Đơn xin phép
        console.log('3️⃣  Tạo bảng leave_requests...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                type ENUM('annual','sick','personal','maternity','other') NOT NULL COMMENT 'Loại nghỉ',
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                days_count DECIMAL(3,1) NOT NULL COMMENT '0.5 = nửa ngày',
                reason TEXT NOT NULL,
                status ENUM('pending','approved','rejected') DEFAULT 'pending',
                approved_by INT DEFAULT NULL,
                approved_at DATETIME DEFAULT NULL,
                reject_reason TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                KEY idx_user (user_id),
                KEY idx_status (status),
                KEY idx_dates (start_date, end_date)
            )
        `);
        console.log('   ✅ leave_requests OK');

        // 4. Ngày lễ
        console.log('4️⃣  Tạo bảng holidays...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS holidays (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(200) NOT NULL,
                date DATE NOT NULL,
                is_recurring TINYINT(1) DEFAULT 0 COMMENT '1 = lặp hàng năm',
                year INT DEFAULT NULL COMMENT 'NULL = mọi năm',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uk_date_year (date, year)
            )
        `);
        console.log('   ✅ holidays OK');

        // 5. Tổng hợp công tháng
        console.log('5️⃣  Tạo bảng attendance_monthly_summary...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance_monthly_summary (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                month INT NOT NULL,
                year INT NOT NULL,
                total_days INT DEFAULT 0,
                late_days INT DEFAULT 0,
                early_leave_days INT DEFAULT 0,
                absent_days INT DEFAULT 0,
                leave_days DECIMAL(4,1) DEFAULT 0,
                holiday_days INT DEFAULT 0,
                total_work_hours DECIMAL(6,2) DEFAULT 0,
                total_overtime_hours DECIMAL(6,2) DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_user_month (user_id, month, year)
            )
        `);
        console.log('   ✅ attendance_monthly_summary OK');

        // Seed default shifts
        console.log('\n📋 Seed ca làm việc mặc định...');
        const [existingShifts] = await db.query('SELECT COUNT(*) as cnt FROM work_shifts');
        if (existingShifts[0].cnt === 0) {
            await db.query(`INSERT INTO work_shifts (name, start_time, end_time, break_minutes, late_threshold_minutes, early_leave_minutes, is_default) VALUES ('Ca sáng', '07:30:00', '12:00:00', 0, 15, 10, 0)`);
            await db.query(`INSERT INTO work_shifts (name, start_time, end_time, break_minutes, late_threshold_minutes, early_leave_minutes, is_default) VALUES ('Ca chiều', '13:00:00', '17:30:00', 0, 15, 10, 0)`);
            await db.query(`INSERT INTO work_shifts (name, start_time, end_time, break_minutes, late_threshold_minutes, early_leave_minutes, is_default) VALUES ('Cả ngày', '07:30:00', '17:30:00', 60, 15, 15, 1)`);
            console.log('   ✅ Đã seed 3 ca: Ca sáng, Ca chiều, Cả ngày');
        } else {
            console.log('   ⏭️  Đã có ca làm, bỏ qua seed');
        }

        // Seed Vietnamese holidays
        console.log('\n📋 Seed ngày lễ Việt Nam...');
        const [existingHolidays] = await db.query('SELECT COUNT(*) as cnt FROM holidays');
        if (existingHolidays[0].cnt === 0) {
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Tết Dương lịch', '2026-01-01', 1, NULL)`);
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Giỗ Tổ Hùng Vương', '2026-04-06', 0, 2026)`);
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Ngày Giải phóng miền Nam', '2026-04-30', 1, NULL)`);
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Ngày Quốc tế Lao động', '2026-05-01', 1, NULL)`);
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Quốc khánh', '2026-09-02', 1, NULL)`);
            await db.query(`INSERT INTO holidays (name, date, is_recurring, year) VALUES ('Nghỉ Quốc khánh', '2026-09-03', 1, NULL)`);
            console.log('   ✅ Đã seed 6 ngày lễ');
        } else {
            console.log('   ⏭️  Đã có ngày lễ, bỏ qua seed');
        }

        console.log('\n🎉 Hoàn thành tạo tất cả bảng hệ thống Chấm Công!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Lỗi:', error.message);
        process.exit(1);
    }
}

createAttendanceTables();
