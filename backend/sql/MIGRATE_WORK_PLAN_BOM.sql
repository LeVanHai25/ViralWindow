
-- 1. Cập nhật bảng work_plans
ALTER TABLE work_plans ADD COLUMN IF NOT EXISTS priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' AFTER status;

-- 2. Cập nhật bảng bom_items
ALTER TABLE bom_items ADD COLUMN IF NOT EXISTS profile_code VARCHAR(50) AFTER item_code;

-- 3. Tạo bảng work_plan_checklists
CREATE TABLE IF NOT EXISTS work_plan_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_plan_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed TINYINT(1) DEFAULT 0,
    completed_by INT NULL,
    completed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
);

-- 4. Tạo bảng work_plan_logs
CREATE TABLE IF NOT EXISTS work_plan_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_plan_id INT NOT NULL,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
);
