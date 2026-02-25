-- ============================================
-- KIỂM TRA DATABASE VÀ CÁC CỘT
-- Chạy các câu này trong phpMyAdmin
-- ============================================

-- 1. Kiểm tra database hiện tại
SELECT DATABASE();

-- 2. Kiểm tra tất cả các cột trong bảng aluminum_systems
DESCRIBE `aluminum_systems`;

-- 3. Kiểm tra cụ thể 2 cột density và cross_section_image
SHOW COLUMNS FROM `aluminum_systems` WHERE Field IN ('density', 'cross_section_image');

-- 4. Nếu không thấy 2 cột trên, chạy lại migration:
-- (Xem file CHAY_NGAY.sql)








