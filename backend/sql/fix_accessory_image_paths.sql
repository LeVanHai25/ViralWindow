-- ============================================================
-- FIX: Chuyển image_path full URL → relative path (MariaDB)
-- Chạy từng lệnh SELECT trước để kiểm tra, rồi mới chạy UPDATE
-- ============================================================

-- BƯỚC 1: Kiểm tra có record nào bị lưu full URL không
SELECT id, code, name, image_path 
FROM accessories 
WHERE image_path LIKE 'http://%' OR image_path LIKE 'https://%';

-- BƯỚC 2: Fix — dùng SUBSTRING + LOCATE (tương thích MariaDB)
-- Logic: tìm dấu '/' đầu tiên từ vị trí 9 trở đi (bỏ qua 'http://' hoặc 'https://')
-- VD: 'http://localhost:3001/uploads/accessories/xxx.jpg'
--                            ^ LOCATE từ vị trí 9 tìm thấy '/' ở đây
--     → SUBSTRING trả về: '/uploads/accessories/xxx.jpg'
UPDATE accessories
SET image_path = SUBSTRING(image_path, LOCATE('/', image_path, 9))
WHERE image_path LIKE 'http://%' OR image_path LIKE 'https://%';

-- BƯỚC 3: Xác nhận sau khi fix
SELECT id, code, name, image_path 
FROM accessories 
WHERE image_path IS NOT NULL AND image_path != '';
