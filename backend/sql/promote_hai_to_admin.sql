-- =====================================================
-- NÂNG CẤP QUYỀN CHO NGƯỜI DÙNG CHỦ SỞ HỮU (Owner)
-- Mục tiêu: Gán quyền Super Admin cho 2 tài khoản của anh Hải
-- =====================================================

-- Bước 1: Kiểm tra thông tin hiện tại (để log)
SELECT id, full_name, email, user_type, role_id FROM users 
WHERE email IN ('hai2504le@gmail.com', 'hai2504@gmail.com');

-- Bước 2: Cập nhật user_type thành 'admin' và role_id thành 1 (Super Admin)
UPDATE users 
SET 
    user_type = 'admin',
    role_id = 1,
    is_active = 1
WHERE email IN ('hai2504le@gmail.com', 'hai2504@gmail.com');

-- Bước 3: Xác nhận lại kết quả sau khi cập nhật
SELECT u.id, u.full_name, u.email, u.user_type, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email IN ('hai2504le@gmail.com', 'hai2504@gmail.com');
