-- Xóa các danh mục KHÔNG CÓ phụ kiện nào (an toàn 100%)
-- Chạy từng lệnh, kiểm tra trước bằng SELECT

-- 1. Kiểm tra trước
SELECT id, name, 
    (SELECT COUNT(*) FROM accessories WHERE category = ac.name) as phu_kien_count
FROM accessory_categories ac
ORDER BY name;

-- 2. Xóa các danh mục trống (không có phụ kiện)
DELETE FROM accessory_categories 
WHERE name IN ('Phụ kiện cửa cuốn', 'Phụ kiện cửa kính', 'Phụ kiện màn hình', 'Ron & gioăng', 'Keo & dán')
AND (SELECT COUNT(*) FROM accessories WHERE category = accessory_categories.name) = 0;

-- 3. Xác nhận kết quả
SELECT id, name FROM accessory_categories ORDER BY name;
