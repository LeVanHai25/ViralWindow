-- ============================================
-- INSERT DỮ LIỆU MẪU VÀO BẢNG PROJECTS
-- ============================================
-- Chạy script này trong phpMyAdmin để thêm dữ liệu mẫu

USE viral_window_db;

-- Đảm bảo có khách hàng trước
INSERT IGNORE INTO customers (id, customer_code, full_name, phone, email, address) VALUES
(1, 'KH001', 'Anh Tuấn', '0988 123 456', 'tuan@example.com', 'Hà Nội'),
(2, 'KH002', 'Chị Lan', '0912 345 678', 'lan@example.com', 'Hà Nội'),
(3, 'KH003', 'Anh Minh', '0909 876 543', 'minh@example.com', 'Hà Nội'),
(4, 'KH004', 'Anh Hùng', '0987 654 321', 'hung@example.com', 'Hà Nội'),
(5, 'KH005', 'Chị Hương', '0913 456 789', 'huong@example.com', 'Hà Nội'),
(6, 'KH006', 'Anh Đức', '0923 456 789', 'duc@example.com', 'Hà Nội');

-- Insert projects với project_code khớp với HTML
INSERT INTO projects (project_code, project_name, customer_id, start_date, deadline, status, progress_percent, total_value, notes) VALUES
('CT2025-001', 'Biệt thự Hòa Lạc', 1, '2025-01-12', '2025-01-25', 'quotation_approved', 75, 156300000, 'Đang lắp phụ kiện'),
('CT2025-002', 'Nhà phố Thanh Xuân', 2, '2025-01-25', '2025-02-10', 'quotation_approved', 20, 89500000, 'Chờ duyệt bản vẽ'),
('CT2025-003', 'Chung cư Vinhomes', 3, '2025-01-28', '2025-02-15', 'designing', 0, 0, 'Đang thiết kế'),
('CT2025-004', 'Biệt thự Ecopark', 4, '2025-01-15', '2025-02-05', 'quotation_approved', 95, 245000000, 'Gần hoàn thành'),
('CT2025-005', 'Nhà phố Cầu Giấy', 5, '2025-01-15', '2025-01-28', 'in_production', 45, 125000000, 'Đang cắt nhôm'),
('CT2025-006', 'Căn hộ The Manor', 6, '2025-01-20', '2025-02-12', 'quotation_approved', 60, 189000000, 'Đang sản xuất')
ON DUPLICATE KEY UPDATE 
    project_name = VALUES(project_name),
    customer_id = VALUES(customer_id),
    start_date = VALUES(start_date),
    deadline = VALUES(deadline),
    status = VALUES(status),
    progress_percent = VALUES(progress_percent),
    total_value = VALUES(total_value);

-- Kiểm tra kết quả
SELECT id, project_code, project_name, customer_id, status, progress_percent FROM projects ORDER BY id;






