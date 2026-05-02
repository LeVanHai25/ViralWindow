# 2.6 Thiết kế cơ sở dữ liệu

## 2.6.1 Mô hình dữ liệu quan hệ

Hệ thống ViralWindow sử dụng hệ quản trị cơ sở dữ liệu **MySQL 8.0** với engine **InnoDB** hỗ trợ giao dịch (ACID compliance), ràng buộc khóa ngoại, và Full-text indexing. Charset mặc định là `utf8mb4_unicode_ci` để hỗ trợ đầy đủ ký tự tiếng Việt và biểu tượng Unicode.

Cơ sở dữ liệu được thiết kế theo **mô hình quan hệ (Relational Model)** tuân thủ chuẩn hóa đến **dạng chuẩn 3 (3NF)**, đảm bảo:
- Loại bỏ dữ liệu dư thừa (Redundancy Elimination)
- Đảm bảo tính toàn vẹn tham chiếu (Referential Integrity)
- Hỗ trợ truy vấn hiệu quả thông qua hệ thống chỉ mục (Indexing Strategy)

## 2.6.2 Sơ đồ quan hệ thực thể (ERD)

> *Xem file: `erd_diagram.html` – Hình 2.6.1. Sơ đồ quan hệ thực thể hệ thống ViralWindow*

Hệ thống gồm **11 bảng chính** được tổ chức thành 4 nhóm chức năng:

| Nhóm | Bảng | Mô tả |
|------|------|-------|
| **Quản lý người dùng** | `users`, `roles` | Tài khoản, phân quyền |
| **Quản lý kinh doanh** | `customers`, `projects`, `project_items`, `quotations` | Khách hàng, dự án, báo giá |
| **Quản lý kho & kỹ thuật** | `inventory`, `project_materials`, `aluminum_systems` | Tồn kho, vật tư BOM |
| **Quản lý tài chính & hệ thống** | `financial_transactions`, `notifications`, `activity_logs` | Thu/chi, thông báo, nhật ký |

---

## 2.6.3 Mô tả chi tiết các bảng dữ liệu

### Bảng 2.6.1. users – Bảng người dùng

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã người dùng |
| 2 | full_name | VARCHAR(255) | NO | | Họ và tên |
| 3 | email | VARCHAR(100) | NO | UQ | Email (duy nhất) |
| 4 | phone | VARCHAR(20) | YES | UQ | Số điện thoại |
| 5 | password | VARCHAR(255) | NO | | Mật khẩu đã mã hóa (bcrypt) |
| 6 | address | TEXT | YES | | Địa chỉ |
| 7 | user_type | ENUM('admin','user','manager') | YES | DEFAULT 'user' | Loại người dùng |
| 8 | role_id | INT | YES | FK → roles(id) | Mã vai trò |
| 9 | is_active | TINYINT(1) | YES | DEFAULT 1 | Trạng thái hoạt động |
| 10 | avatar_url | LONGTEXT | YES | | Ảnh đại diện |
| 11 | last_login | TIMESTAMP | YES | | Lần đăng nhập cuối |
| 12 | remember_me | TINYINT(1) | YES | DEFAULT 0 | Ghi nhớ đăng nhập |
| 13 | timezone | VARCHAR(50) | YES | DEFAULT 'Asia/Ho_Chi_Minh' | Múi giờ |
| 14 | language | VARCHAR(10) | YES | DEFAULT 'vi' | Ngôn ngữ |
| 15 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| 16 | updated_at | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |

---

### Bảng 2.6.2. roles – Bảng vai trò

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK, AI | Mã vai trò |
| 2 | name | VARCHAR(50) | NO | UQ | Tên vai trò |
| 3 | description | VARCHAR(255) | YES | | Mô tả vai trò |
| 4 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

---

### Bảng 2.6.3. customers – Bảng khách hàng

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã khách hàng |
| 2 | full_name | VARCHAR(255) | NO | | Tên khách hàng |
| 3 | phone | VARCHAR(20) | YES | UQ | Số điện thoại (duy nhất) |
| 4 | email | VARCHAR(100) | YES | | Email |
| 5 | address | TEXT | YES | | Địa chỉ |
| 6 | company_name | VARCHAR(255) | YES | | Tên công ty |
| 7 | tax_code | VARCHAR(50) | YES | | Mã số thuế |
| 8 | debt | DECIMAL(15,2) | YES | DEFAULT 0.00 | Công nợ hiện tại |
| 9 | notes | TEXT | YES | | Ghi chú |
| 10 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| 11 | updated_at | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |

---

### Bảng 2.6.4. projects – Bảng dự án

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã dự án |
| 2 | project_code | VARCHAR(50) | NO | UQ | Mã dự án (tự sinh) |
| 3 | project_name | VARCHAR(255) | NO | | Tên dự án |
| 4 | customer_id | INT | NO | FK → customers(id) | Mã khách hàng |
| 5 | address | TEXT | YES | | Địa chỉ thi công |
| 6 | status | VARCHAR(50) | YES | DEFAULT 'new' | Trạng thái dự án |
| 7 | start_date | DATE | YES | | Ngày bắt đầu |
| 8 | end_date | DATE | YES | | Ngày kết thúc dự kiến |
| 9 | total_value | DECIMAL(15,2) | YES | DEFAULT 0.00 | Tổng giá trị |
| 10 | deposit_amount | DECIMAL(15,2) | YES | DEFAULT 0.00 | Tiền đặt cọc |
| 11 | agency_id | INT | YES | FK → agencies(id) | Mã đại lý |
| 12 | notes | TEXT | YES | | Ghi chú |
| 13 | created_by | INT | YES | FK → users(id) | Người tạo |
| 14 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| 15 | updated_at | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |

---

### Bảng 2.6.5. quotations – Bảng báo giá

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã báo giá |
| 2 | quotation_code | VARCHAR(50) | NO | UQ | Mã báo giá (tự sinh) |
| 3 | project_id | INT | YES | FK → projects(id) | Mã dự án liên kết |
| 4 | customer_id | INT | NO | FK → customers(id) | Mã khách hàng |
| 5 | quotation_date | DATE | NO | | Ngày lập báo giá |
| 6 | validity_days | INT | YES | DEFAULT 30 | Số ngày hiệu lực |
| 7 | status | VARCHAR(50) | YES | DEFAULT 'draft' | Trạng thái |
| 8 | subtotal | DECIMAL(15,2) | YES | DEFAULT 0.00 | Tạm tính |
| 9 | profit_margin_percent | DECIMAL(5,2) | YES | DEFAULT 20.00 | % lợi nhuận |
| 10 | total_amount | DECIMAL(15,2) | YES | DEFAULT 0.00 | Tổng tiền |
| 11 | vat_percent | DECIMAL(5,2) | YES | DEFAULT 10.00 | % VAT |
| 12 | discount_percent | DECIMAL(5,2) | YES | DEFAULT 0.00 | % chiết khấu |
| 13 | advance_amount | DECIMAL(15,2) | YES | DEFAULT 0.00 | Tiền đặt cọc |
| 14 | deposit_paid | TINYINT(1) | YES | DEFAULT 0 | Đã thanh toán cọc |
| 15 | notes | TEXT | YES | | Ghi chú |
| 16 | created_by | INT | YES | FK → users(id) | Người tạo |
| 17 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| 18 | updated_at | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |

---

### Bảng 2.6.6. inventory – Bảng tồn kho vật tư

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã vật tư |
| 2 | material_code | VARCHAR(50) | YES | UQ | Mã vật tư (duy nhất) |
| 3 | name | VARCHAR(255) | NO | | Tên vật tư |
| 4 | category | VARCHAR(100) | YES | | Danh mục (nhôm/kính/phụ kiện) |
| 5 | material_type | VARCHAR(50) | YES | | Loại vật tư chi tiết |
| 6 | unit | VARCHAR(20) | YES | | Đơn vị (m, kg, tấm, cái) |
| 7 | quantity | INT | YES | DEFAULT 0 | Số lượng tồn kho |
| 8 | min_quantity | INT | YES | DEFAULT 0 | Mức tối thiểu (cảnh báo) |
| 9 | max_quantity | INT | YES | DEFAULT 0 | Mức tối đa |
| 10 | unit_price | DECIMAL(15,2) | YES | DEFAULT 0.00 | Đơn giá nhập |
| 11 | supplier | VARCHAR(255) | YES | | Nhà cung cấp |
| 12 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

---

### Bảng 2.6.7. project_items – Bảng hạng mục dự án

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã hạng mục |
| 2 | project_id | INT | NO | FK → projects(id) | Mã dự án |
| 3 | item_code | VARCHAR(50) | YES | | Mã hạng mục |
| 4 | item_name | VARCHAR(255) | YES | | Tên hạng mục (cửa, cửa sổ) |
| 5 | item_type | VARCHAR(50) | YES | | Loại (door/window/fixed) |
| 6 | width_mm | INT | YES | | Chiều rộng (mm) |
| 7 | height_mm | INT | YES | | Chiều cao (mm) |
| 8 | quantity | INT | YES | DEFAULT 1 | Số lượng |
| 9 | aluminum_system | VARCHAR(50) | YES | | Hệ nhôm sử dụng |
| 10 | unit_price | DECIMAL(15,2) | YES | DEFAULT 0.00 | Đơn giá |
| 11 | status | VARCHAR(50) | YES | DEFAULT 'pending' | Trạng thái |
| 12 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

---

### Bảng 2.6.8. project_materials – Bảng vật tư BOM dự án

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã bản ghi |
| 2 | project_id | INT | NO | FK → projects(id) | Mã dự án |
| 3 | project_item_id | INT | YES | FK → project_items(id) | Mã hạng mục |
| 4 | material_name | VARCHAR(255) | YES | | Tên vật tư |
| 5 | material_code | VARCHAR(50) | YES | | Mã vật tư |
| 6 | quantity | DECIMAL(10,3) | YES | DEFAULT 0 | Số lượng cần |
| 7 | unit | VARCHAR(20) | YES | | Đơn vị |
| 8 | unit_cost | DECIMAL(15,2) | YES | DEFAULT 0.00 | Đơn giá |
| 9 | total_cost | DECIMAL(15,2) | YES | DEFAULT 0.00 | Thành tiền |
| 10 | cut_length_mm | INT | YES | | Chiều dài cắt (mm) |
| 11 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

---

### Bảng 2.6.9. financial_transactions – Bảng giao dịch tài chính

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK, AI | Mã giao dịch |
| 2 | transaction_code | VARCHAR(50) | NO | UQ | Mã phiếu thu/chi |
| 3 | transaction_date | DATE | NO | | Ngày giao dịch |
| 4 | transaction_type | ENUM('revenue','expense') | NO | | Loại: Thu / Chi |
| 5 | category | VARCHAR(100) | YES | | Danh mục |
| 6 | expense_type | VARCHAR(50) | YES | | Loại chi phí |
| 7 | supplier | VARCHAR(255) | YES | | Nhà cung cấp (nếu chi) |
| 8 | amount | DECIMAL(15,2) | NO | | Số tiền |
| 9 | description | TEXT | YES | | Mô tả chi tiết |
| 10 | project_id | INT | YES | FK → projects(id) | Dự án liên quan |
| 11 | customer_id | INT | YES | FK → customers(id) | Khách hàng liên quan |
| 12 | payment_method | VARCHAR(50) | YES | | Phương thức thanh toán |
| 13 | status | ENUM('draft','posted','cancelled') | NO | DEFAULT 'draft' | Trạng thái |
| 14 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| 15 | updated_at | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Ngày cập nhật |

---

### Bảng 2.6.10. notifications – Bảng thông báo

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | INT | NO | PK | Mã thông báo |
| 2 | user_id | INT | YES | FK → users(id) ON DELETE CASCADE | Người nhận |
| 3 | title | VARCHAR(255) | NO | | Tiêu đề |
| 4 | message | TEXT | NO | | Nội dung |
| 5 | type | ENUM('info','success','warning','error') | YES | DEFAULT 'info' | Loại |
| 6 | is_read | TINYINT(1) | YES | DEFAULT 0 | Đã đọc |
| 7 | entity_type | VARCHAR(50) | YES | | Loại đối tượng liên quan |
| 8 | entity_id | INT | YES | | Mã đối tượng liên quan |
| 9 | severity | ENUM('info','important','urgent') | YES | DEFAULT 'info' | Mức độ |
| 10 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

---

### Bảng 2.6.11. activity_logs – Bảng nhật ký hoạt động

| STT | Tên cột | Kiểu dữ liệu | Null | Ràng buộc | Mô tả |
|-----|---------|---------------|------|-----------|-------|
| 1 | id | BIGINT | NO | PK, AI | Mã log |
| 2 | user_id | INT | YES | | Mã người dùng |
| 3 | user_name | VARCHAR(100) | YES | | Tên người dùng |
| 4 | method | VARCHAR(10) | NO | | HTTP Method (GET/POST/PUT/DELETE) |
| 5 | url | VARCHAR(500) | NO | | Đường dẫn API |
| 6 | action_description | TEXT | YES | | Mô tả hành động |
| 7 | status_code | INT | YES | | Mã phản hồi HTTP |
| 8 | duration_ms | INT | YES | | Thời gian xử lý (ms) |
| 9 | ip_address | VARCHAR(45) | YES | | Địa chỉ IP |
| 10 | created_at | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Thời điểm |

---

## 2.6.4 Ràng buộc toàn vẹn dữ liệu

### a) Ràng buộc khóa chính (Primary Key)
Mỗi bảng đều có trường `id` làm khóa chính, đảm bảo mỗi bản ghi là duy nhất.

### b) Ràng buộc khóa ngoại (Foreign Key)

| Bảng con | Cột FK | Bảng cha | Cột PK | ON DELETE |
|----------|--------|----------|--------|-----------|
| users | role_id | roles | id | SET NULL |
| projects | customer_id | customers | id | RESTRICT |
| projects | created_by | users | id | SET NULL |
| quotations | project_id | projects | id | SET NULL |
| quotations | customer_id | customers | id | RESTRICT |
| quotations | created_by | users | id | SET NULL |
| project_items | project_id | projects | id | CASCADE |
| project_materials | project_id | projects | id | CASCADE |
| project_materials | project_item_id | project_items | id | CASCADE |
| financial_transactions | project_id | projects | id | SET NULL |
| financial_transactions | customer_id | customers | id | SET NULL |
| notifications | user_id | users | id | CASCADE |

### c) Ràng buộc duy nhất (Unique Constraint)
- `users.email` – Không trùng email
- `users.phone` – Không trùng số điện thoại
- `customers.phone` – Không trùng SĐT khách hàng
- `projects.project_code` – Không trùng mã dự án
- `quotations.quotation_code` – Không trùng mã báo giá
- `financial_transactions.transaction_code` – Không trùng mã phiếu

### d) Ràng buộc giá trị mặc định (Default Value)
- `users.is_active = 1` (mặc định kích hoạt)
- `projects.status = 'new'` (trạng thái mới)
- `quotations.status = 'draft'` (bản nháp)
- `financial_transactions.status = 'draft'` (chưa ghi sổ)
- Tất cả `created_at = CURRENT_TIMESTAMP`

---

## 2.6.5 Chiến lược chỉ mục (Indexing Strategy)

Để tối ưu hiệu suất truy vấn, hệ thống áp dụng chiến lược chỉ mục như sau:

| Bảng | Chỉ mục | Loại | Mục đích |
|------|---------|------|----------|
| users | idx_email | UNIQUE | Tìm kiếm nhanh theo email (đăng nhập) |
| users | idx_role | INDEX | Lọc theo vai trò |
| projects | idx_customer | INDEX | Tìm dự án theo khách hàng |
| projects | idx_status | INDEX | Lọc theo trạng thái |
| quotations | idx_code | UNIQUE | Tìm theo mã báo giá |
| quotations | idx_project | INDEX | Tìm báo giá theo dự án |
| quotations | idx_status | INDEX | Lọc theo trạng thái |
| financial_transactions | idx_date | INDEX | Truy vấn theo khoảng ngày |
| financial_transactions | idx_type | INDEX | Lọc thu/chi |
| notifications | idx_user | INDEX | Lấy thông báo theo user |
| notifications | idx_read | INDEX | Lọc thông báo chưa đọc |
| notifications | idx_created | INDEX | Sắp xếp theo thời gian |

---

## 2.6.6 Quy ước đặt tên (Naming Convention)

Toàn bộ CSDL tuân thủ quy ước đặt tên nhất quán:

| Đối tượng | Quy ước | Ví dụ |
|-----------|---------|-------|
| Tên bảng | snake_case, số nhiều | `users`, `projects`, `quotations` |
| Tên cột | snake_case | `full_name`, `created_at`, `unit_price` |
| Khóa chính | `id` | `users.id`, `projects.id` |
| Khóa ngoại | `<bảng_cha>_id` | `customer_id`, `project_id` |
| Chỉ mục | `idx_<tên_cột>` | `idx_status`, `idx_email` |
| Timestamp | `created_at`, `updated_at` | Tự động cập nhật |
