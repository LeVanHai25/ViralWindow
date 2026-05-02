# CHƯƠNG 2: PHÂN TÍCH YÊU CẦU HỆ THỐNG

## 2.1 Giới thiệu chung

### 2.1.1 Khái niệm phân tích yêu cầu

Phân tích yêu cầu hệ thống (Requirements Analysis) là bước đầu tiên và quan trọng nhất trong quy trình phát triển phần mềm. Đây là quá trình xác định, ghi chép, và xác nhận những gì mà hệ thống phần mềm cần phải cung cấp, bao gồm:

- **Yêu cầu chức năng (Functional Requirements):** Những tính năng cụ thể mà hệ thống phải thực hiện
- **Yêu cầu phi chức năng (Non-Functional Requirements):** Những tiêu chí về hiệu suất, bảo mật, độ tin cậy, v.v.
- **Ràng buộc hệ thống (System Constraints):** Những hạn chế về tài nguyên, thời gian, và kỹ thuật

Phân tích yêu cầu giúp:
- ✅ Xác định rõ phạm vi dự án
- ✅ Ngăn chặn hiểu lầm giữa nhóm phát triển và khách hàng
- ✅ Tạo cơ sở cho thiết kế và phát triển
- ✅ Giảm chi phí sửa đổi trong giai đoạn muộn
- ✅ Xác định tiêu chuẩn kiểm thử

### 2.1.2 Đối tượng mục tiêu

Hệ thống ViralWindow được thiết kế cho:

**Người dùng nội bộ:**
- **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống, người dùng, cấu hình
- **Trưởng phòng kinh doanh (Manager):** Quản lý dự án, báo giá, khách hàng
- **Nhân viên bán hàng (Sales):** Tạo báo giá, theo dõi đơn hàng
- **Trưởng phòng sản xuất (Production):** Quản lý lịch sản xuất, vật liệu
- **Nhân viên tài chính (Finance):** Quản lý chi phí, thanh toán, báo cáo
- **Quản lý kho (Inventory):** Quản lý vật tư, nguyên liệu

**Người dùng bên ngoài:**
- **Khách hàng (Customer):** Xem thông tin báo giá, theo dõi tiến độ

### 2.1.3 Phương pháp phân tích

Để phân tích yêu cầu của hệ thống ViralWindow, chúng tôi sử dụng:

1. **Use Case Diagram:** Mô tả các tương tác giữa actors (người dùng) và hệ thống
2. **Actor Definition:** Xác định các roles cụ thể và trách nhiệm của họ
3. **Functional Requirements:** Liệt kê chi tiết các chức năng chính
4. **Non-Functional Requirements:** Xác định các tiêu chí chất lượng
5. **Use Case Descriptions:** Mô tả chi tiết từng case

---

## 2.2 Sơ đồ Use Case tổng quan

### 2.2.1 Khái niệm Use Case

**Use Case (Trường hợp sử dụng)** là một mô tả của một tương tác hoặc chuỗi tương tác giữa một **actor** (người dùng hoặc hệ thống bên ngoài) và hệ thống. Các Use Cases cho phép:
- Khách hàng hiểu rõ hệ thống sẽ làm gì
- Nhà phát triển biết chính xác phải xây dựng gì
- Tester biết phải kiểm thử cái gì

### 2.2.2 Use Case Diagram của ViralWindow

```
                           ┌─────────────────────────────────┐
                           │      VIRALWINDOW SYSTEM         │
                           │   Hệ thống Quản lý Cửa Nhôm Kính│
                           └─────────────────────────────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────────────────┐
        │                                  │                              │
        │                                  │                              │
   ┌─────────┐                         ┌──────────┐                  ┌───────────┐
   │  Admin  │                         │Customer  │                  │Sales User │
   │  ╞═════╡│                         │  ╞═════╡ │                  │ ╞═════╡   │
   └─────────┘                         └──────────┘                  └───────────┘
        │                                  │                              │
        │                                  │                              │
        │  ┌──────────────────────────────┼──────────────────────────────┤
        │  │                              │                              │
        │  │  ┌─────────────────────┐     │                              │
        │  ├─ │ Quản lý người dùng  │     │                              │
        │  │  └─────────────────────┘     │                              │
        │  │                              │                              │
        │  │  ┌─────────────────────┐     │                              │
        │  ├─ │ Quản lý roles       │     │                              │
        │  │  └─────────────────────┘     │                              │
        │  │                              │                              │
        │  │  ┌─────────────────────┐     │    ┌────────────────────┐   │
        │  │  │ Cấu hình hệ thống   │     ├───▶│ Xem báo giá        │   │
        │  │  └─────────────────────┘     │    └────────────────────┘   │
        │  │                              │                              │
        │  │                              │    ┌────────────────────┐   │
        │  │                              ├───▶│ Chốt báo giá       │   │
        │  │                              │    └────────────────────┘   │
        │  │                              │                              │
        ▼  ▼                              │    ┌────────────────────┐   │
                                          ├───▶│ Yêu cầu hỗ trợ     │   │
   ┌──────────────────────────────────────┤    └────────────────────┘   ├─▶
   │    CORE BUSINESS FEATURES            │                              │
   │                                      │                              │
   │  ┌─────────────────────────────┐    │                              │
   │  │ 1. Quản lý Dự án            │    ├──────────────────────────────┤
   │  │    - Tạo dự án mới          │    │                              │
   │  │    - Sửa thông tin dự án    │    │  ┌────────────────────┐      │
   │  │    - Theo dõi tiến độ        │    │  │ Tạo dự án          │◄─────┤
   │  │    - Hoàn thành dự án       │    │  └────────────────────┘      │
   │  └─────────────────────────────┘    │                              │
   │                                      │  ┌────────────────────┐      │
   │  ┌─────────────────────────────┐    │  │ Tạo báo giá        │◄─────┤
   │  │ 2. Quản lý Báo giá          │    │  └────────────────────┘      │
   │  │    - Tạo báo giá            │    │                              │
   │  │    - Gửi báo giá            │    │  ┌────────────────────┐      │
   │  │    - Theo dõi trạng thái    │    │  │ Xem chi tiết dự án │◄─────┤
   │  │    - Phân tích báo giá      │    │  └────────────────────┘      │
   │  └─────────────────────────────┘    │                              │
   │                                      │                              │
   │  ┌─────────────────────────────┐    │                              │
   │  │ 3. Quản lý Kho hàng         │    │                              │
   │  │    - Nhập kho               │    │                              │
   │  │    - Xuất kho               │    │                              │
   │  │    - Kiểm kho               │    │                              │
   │  │    - Cảnh báo hết hạn       │    │                              │
   │  └─────────────────────────────┘    │                              │
   │                                      │                              │
   │  ┌─────────────────────────────┐    │                              │
   │  │ 4. Quản lý Tài chính        │    │                              │
   │  │    - Ghi chi phí            │    │                              │
   │  │    - Theo dõi thanh toán    │    │                              │
   │  │    - Báo cáo doanh thu      │    │                              │
   │  │    - Quản lý nợ khách       │    │                              │
   │  └─────────────────────────────┘    │                              │
   │                                      └──────────────────────────────┘
   │  ┌─────────────────────────────┐         ┌──────────────┐
   │  │ 5. Real-time Notifications  │         │Hệ thống AI   │
   │  │    - Thông báo dự án        │────────▶│ (Chatbot)    │
   │  │    - Thông báo báo giá      │         │              │
   │  │    - Cảnh báo vật tư        │         └──────────────┘
   │  └─────────────────────────────┘
   │
   │  ┌─────────────────────────────┐
   │  │ 6. Dashboard & Analytics    │
   │  │    - KPI Summary            │
   │  │    - Chart visualization    │
   │  │    - Monthly reports        │
   │  └─────────────────────────────┘
   │
   │  ┌─────────────────────────────┐
   │  │ 7. Quản lý Nhân sự          │
   │  │    - Quản lý ca làm          │
   │  │    - Chấm công              │
   │  │    - Kế hoạch công việc     │
   │  └─────────────────────────────┘
   └──────────────────────────────────────────────────────────────
                        │
                        │ <<include>>
                        │
                   ┌────▼─────┐
                   │ Database  │
                   │ (MySQL)   │
                   └───────────┘
```

### 2.2.3 Các Use Cases chính

| Thứ tự | Use Case ID | Tên Use Case | Mô tả Ngắn | Priority |
|--------|-------------|-------------|-----------|----------|
| 1 | UC-001 | Tạo Dự án Mới | Sales tạo dự án khách hàng mới | High |
| 2 | UC-002 | Tạo Báo giá | Sales tạo báo giá cho dự án | High |
| 3 | UC-003 | Gửi Báo giá | Sales gửi báo giá đến khách hàng | High |
| 4 | UC-004 | Khách xem Báo giá | Khách hàng xem và chốt báo giá | High |
| 5 | UC-005 | Cập nhật Trạng thái Dự án | Manager cập nhật tiến độ dự án | High |
| 6 | UC-006 | Quản lý Kho Hàng | Inventory manager quản lý vật tư | High |
| 7 | UC-007 | Ghi Nhận Chi Phí | Finance ghi nhận chi phí | Medium |
| 8 | UC-008 | Quản lý Thanh Toán | Finance quản lý thanh toán khách | Medium |
| 9 | UC-009 | Xem Dashboard | Người dùng xem tổng quan hệ thống | High |
| 10 | UC-010 | Nhận Thông báo Real-time | Tất cả users nhận thông báo tức thời | High |
| 11 | UC-011 | Chat với AI | Tất cả users tương tác với chatbot AI | Low |
| 12 | UC-012 | Quản lý Nhân sự | HR staff quản lý chấm công & ca làm | Medium |
| 13 | UC-013 | Quản lý Người dùng | Admin quản lý tài khoản (admin only) | Medium |
| 14 | UC-014 | Xuất Báo cáo | Manager xuất báo cáo PDF/Excel | Medium |
| 15 | UC-015 | Tối ưu Cắt vải | Production tối ưu cắt vải để giảm lãng phí | Medium |

---

## 2.3 Mô tả các Actors và Phân tích hệ thống

### 2.3.1 Danh sách Actors

**Actor (Tác nhân)** là bất kỳ ai hoặc bất cái gì tương tác với hệ thống từ bên ngoài. Trong ViralWindow, chúng ta có các actors chính sau:

#### 1. **Admin (Quản trị viên hệ thống)**
- **Mô tả:** Người có quyền hạn cao nhất, quản lý toàn bộ hệ thống
- **Trách nhiệm:**
  - Quản lý tài khoản người dùng (thêm, sửa, xóa)
  - Gán roles và permissions
  - Cấu hình hệ thống (hằng số, quy tắc, templates)
  - Xem logs hệ thống
  - Khôi phục/Backup database
  - Quản lý maintenance
- **Permissions:** Full access to all modules

#### 2. **Manager (Trưởng phòng kinh doanh)**
- **Mô tả:** Quản lý phòng kinh doanh, dự án, khách hàng
- **Trách nhiệm:**
  - Tạo và quản lý dự án
  - Giao dự án cho nhân viên sales
  - Duyệt báo giá trước khi gửi
  - Theo dõi tiến độ dự án
  - Xem báo cáo tổng quan
  - Quản lý khách hàng
- **Permissions:** Projects, Quotations, Customers, Reports (Read/Write)

#### 3. **Sales (Nhân viên bán hàng)**
- **Mô tả:** Tiếp đón khách, tạo báo giá, theo dõi đơn hàng
- **Trách nhiệm:**
  - Tạo dự án mới từ khách hàng
  - Tạo báo giá chi tiết
  - Gửi báo giá cho khách
  - Theo dõi phản hồi khách
  - Cập nhật thông tin khách hàng
  - Xem tình trạng kho hàng (để biết có hàng không)
  - Trao đổi với khách về sản phẩm
- **Permissions:** Projects, Quotations, Customers, Inventory (Read-only)

#### 4. **Production Manager (Trưởng phòng sản xuất)**
- **Mô tả:** Quản lý quy trình sản xuất, lịch sản xuất, tối ưu vật liệu
- **Trách nhiệm:**
  - Xem danh sách dự án sắp vào sản xuất
  - Lập kế hoạch sản xuất
  - Tối ưu cắt vải/nhôm
  - Quản lý vật tư sản xuất
  - Tập hợp thông tin chi phí sản xuất
  - Báo cáo tiến độ sản xuất
- **Permissions:** Projects (Read), Quotations (Read), Inventory (Read/Write), Production (Read/Write)

#### 5. **Inventory Manager (Quản lý kho hàng)**
- **Mô tả:** Quản lý vật tư, nhập/xuất kho, kiểm kho
- **Trách nhiệm:**
  - Nhập kho vật tư mới
  - Xuất kho theo đơn hàng
  - Kiểm kho định kỳ
  - Cảnh báo vật tư hết hạn
  - Báo cáo tồn kho
  - Ghi nhận xấu thải
- **Permissions:** Inventory (Full), Projects (Read)

#### 6. **Finance (Nhân viên tài chính)**
- **Mô tả:** Quản lý chi phí, thanh toán, báo cáo tài chính
- **Trách nhiệm:**
  - Ghi nhận chi phí công ty
  - Theo dõi thanh toán từ khách
  - Ghi nợ khách hàng
  - Tạo hóa đơn
  - Báo cáo doanh thu tháng
  - Phân tích lợi nhuận theo dự án
- **Permissions:** Finance (Full), Projects (Read), Quotations (Read)

#### 7. **Customer (Khách hàng)**
- **Mô tả:** Khách hàng bên ngoài, xem báo giá và theo dõi dự án
- **Trách nhiệm:**
  - Xem danh sách báo giá gửi cho mình
  - Xem chi tiết báo giá
  - Chốt/Từ chối báo giá
  - Xem tiến độ dự án của mình
  - Gửi yêu cầu hỗ trợ
- **Permissions:** Quotations (Read), Projects (Read - own only), Support (Read/Write)

#### 8. **HR Staff (Nhân viên tài nguyên nhân sự)**
- **Mô tả:** Quản lý chấm công, lịch làm việc, công nhân
- **Trách nhiệm:**
  - Quản lý ca làm việc
  - Theo dõi chấm công nhân viên
  - Lập kế hoạch công việc
  - Báo cáo tính công
- **Permissions:** HR (Full), Users (Read)

### 2.3.2 Vai trò (Roles) và Phân quyền (Permissions)

Mỗi actor được gán một role, mỗi role có tập hợp permissions cụ thể:

| Role | Actors | Modules | Permissions |
|------|--------|---------|------------|
| **Admin** | Admin | All | Create, Read, Update, Delete |
| **Manager** | Manager | Projects, Quotations, Customers, Reports, Finance | Read, Update (limited) |
| **Sales** | Sales | Projects, Quotations, Customers, Inventory | Create (Projects/Quotations), Read (all), Update (own) |
| **Production** | Production Manager | Projects, Inventory, Production | Read, Update |
| **Inventory** | Inventory Manager | Inventory, Projects | Read (Projects), Full (Inventory) |
| **Finance** | Finance | Finance, Projects, Quotations | Read (Projects/Quotations), Full (Finance) |
| **Customer** | Customer | Quotations, Projects (own), Support | Read (own projects), Update (own responses) |
| **HR** | HR Staff | HR, Users | Read (Users), Full (HR) |

### 2.3.3 Các Use Cases theo Actor

**Admin:**
- UC-013: Quản lý Người dùng
- UC-014: Quản lý Roles & Permissions
- UC-015: Cấu hình Hệ thống

**Manager:**
- UC-001: Tạo Dự án Mới
- UC-005: Cập nhật Trạng thái Dự án
- UC-009: Xem Dashboard
- UC-014: Xuất Báo cáo

**Sales:**
- UC-001: Tạo Dự án Mới
- UC-002: Tạo Báo giá
- UC-003: Gửi Báo giá
- UC-009: Xem Dashboard
- UC-010: Nhận Thông báo Real-time

**Production Manager:**
- UC-005: Cập nhật Trạng thái Dự án
- UC-006: Quản lý Kho Hàng
- UC-015: Tối ưu Cắt vải
- UC-009: Xem Dashboard

**Inventory Manager:**
- UC-006: Quản lý Kho Hàng
- UC-010: Nhận Thông báo Real-time (cảnh báo hết hạn)

**Finance:**
- UC-007: Ghi Nhận Chi Phí
- UC-008: Quản lý Thanh Toán
- UC-014: Xuất Báo cáo
- UC-009: Xem Dashboard

**Customer:**
- UC-004: Khách xem Báo giá
- UC-004.2: Chốt Báo giá

**HR Staff:**
- UC-012: Quản lý Nhân sự
- UC-009: Xem Dashboard (HR view)

---

## 2.4 Yêu cầu chức năng (Functional Requirements)

### 2.4.1 Định nghĩa Yêu cầu Chức năng

**Yêu cầu chức năng** mô tả những gì hệ thống phải làm, các tính năng và chức năng cụ thể mà người dùng mong muốn.

### 2.4.2 Các Yêu cầu Chức năng Chính

#### **FR-1: Quản lý Dự án (Project Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-1.1 | Tạo dự án mới | Sales/Manager tạo dự án từ thông tin khách hàng | Sales, Manager | High |
| FR-1.2 | Cập nhật thông tin dự án | Sửa tên, khách hàng, người phụ trách, ngày dự kiến | Sales, Manager | High |
| FR-1.3 | Cập nhật trạng thái dự án | Thay đổi status: New → In-Progress → Completed → Closed | Manager, Production | High |
| FR-1.4 | Xem danh sách dự án | Liệt kê tất cả dự án theo status, khách, người phụ trách | All | High |
| FR-1.5 | Xem chi tiết dự án | Hiển thị toàn bộ thông tin dự án: timeline, items, cost | All | High |
| FR-1.6 | Tim kiếm dự án | Tìm dự án theo tên, khách hàng, hoặc người phụ trách | All | Medium |
| FR-1.7 | Xóa dự án | Xóa dự án (chỉ Admin hoặc dự án chưa có hoạt động) | Admin, Manager | Low |

#### **FR-2: Quản lý Báo giá (Quotation Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-2.1 | Tạo báo giá mới | Tạo báo giá từ dự án, chọn nhôm/kính/phụ kiện | Sales | High |
| FR-2.2 | Tính giá tự động | Hệ thống tự động tính giá dựa trên items + overhead | System | High |
| FR-2.3 | Áp dụng chiết khấu | Cho phép áp dụng chiết khấu % hoặc fix amount | Sales, Manager | Medium |
| FR-2.4 | Gửi báo giá đến khách | Email báo giá PDF cho khách hàng | Sales | High |
| FR-2.5 | Theo dõi trạng thái báo giá | Xem status: Draft → Sent → Accepted → Rejected → Ordered | All | High |
| FR-2.6 | Khách chốt/từ chối báo giá | Khách click link chốt hoặc từ chối báo giá | Customer | High |
| FR-2.7 | Tính lợi nhuận câu | Hiển thị doanh thu, chi phí, lợi nhuận từng báo giá | Finance, Manager | Medium |
| FR-2.8 | Xuất báo giá PDF | Xuất PDF báo giá có thể in hoặc email | Sales | High |

#### **FR-3: Quản lý Kho hàng (Inventory Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-3.1 | Nhập kho vật tư | Ghi nhận nhập kho: sản phẩm, số lượng, giá | Inventory | High |
| FR-3.2 | Xuất kho theo dự án | Tự động xuất kho khi dự án được production | Inventory | High |
| FR-3.3 | Kiểm kho (Stock-take) | Kiểm tra tồn kho thực tế vs hệ thống | Inventory | Medium |
| FR-3.4 | Cảnh báo hết hạn | Thông báo khi vật tư sắp hết | System | High |
| FR-3.5 | Cảnh báo tồn kho thấp | Alert nếu tồn kho < min level | System | Medium |
| FR-3.6 | Báo cáo tồn kho | Hiển thị chi tiết tồn kho, giá trị, năm sản xuất | Inventory, Finance | Medium |
| FR-3.7 | Xóa/Ghi nhận xấu thải | Ghi nhận vật tư lỗi, thất lạc, xấu thải | Inventory | Low |

#### **FR-4: Quản lý Tài chính (Finance Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-4.1 | Ghi nhận chi phí | Ghi nhận chi phí công ty: thuê nhà, điện, nhân công | Finance | High |
| FR-4.2 | Liên kết chi phí với dự án | Gán chi phí cho dự án cụ thể để tính lợi nhuận | Finance | High |
| FR-4.3 | Ghi nhận thanh toán | Ghi nhận tiền nhận từ khách (cash, bank transfer) | Finance | High |
| FR-4.4 | Tính nợ khách hàng | Tự động tính: nợ = Total Quoted - Amount Paid | System | High |
| FR-4.5 | Báo cáo doanh thu tháng | Xuất báo cáo doanh thu theo tháng/năm | Finance, Manager | High |
| FR-4.6 | Phân tích lợi nhuận | Tính lợi nhuận = Doanh thu - Chi phí (theo dự án) | Finance, Manager | Medium |
| FR-4.7 | Dashboard tài chính | Hiển thị KPIs: Revenue, Expense, Profit, Debt | Finance, Manager | Medium |

#### **FR-5: Real-time Notifications**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-5.1 | Thông báo dự án mới | Gửi notification khi dự án mới được tạo | Sales, Manager | High |
| FR-5.2 | Thông báo báo giá được chốt | Alert khi khách chốt báo giá | Sales, Manager | High |
| FR-5.3 | Thông báo vật tư hết hạn | Alert Inventory Manager khi vật tư sắp hết | Inventory | High |
| FR-5.4 | Thông báo thanh toán | Alert Finance khi nhận được thanh toán mới | Finance | Medium |
| FR-5.5 | Hiển thị notification center | Hiển thị tất cả notifications trong 1 area | All | High |
| FR-5.6 | Đánh dấu notification đã đọc | Click notification để đánh dấu đã đọc | All | Medium |

#### **FR-6: Hệ thống AI (AI Brain)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-6.1 | Chat box AI | Cho phép users chat với chatbot AI | All | Medium |
| FR-6.2 | Trả lời câu hỏi sản phẩm | AI trả lời về spec nhôm, kính, phụ kiện | All | Medium |
| FR-6.3 | Gợi ý giải pháp | AI gợi ý giải pháp kính, nhôm phù hợp | Sales, Customer | Medium |
| FR-6.4 | Lưu lịch chat | Lưu lịch chat để follow-up sau | All | Low |

#### **FR-7: Dashboard & Analytics**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-7.1 | Dashboard tổng quan | Hiển thị overview: Project count, Revenue, Expense | All | High |
| FR-7.2 | KPI Summary | Hiển thị KPIs: Active Projects, Success Rate, Avg Profit | Manager | Medium |
| FR-7.3 | Charts & Graphs | Hiển thị biểu đồ doanh thu, chi phí theo tháng | Finance, Manager | Medium |
| FR-7.4 | Monthly Reports | Xuất báo cáo tháng (PDF/Excel) | Finance, Manager | High |

#### **FR-8: Quản lý Nhân sự (HR Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-8.1 | Quản lý ca làm | Cấu hình ca sáng, chiều, tối, ca đêm | HR, Admin | Medium |
| FR-8.2 | Chấm công | Ghi nhận checkin, checkout nhân viên | HR, System | Medium |
| FR-8.3 | Tính công | Tính công, lương dựa trên chấm công | HR | Low |
| FR-8.4 | Lập kế hoạch công | Lập và quản lý kế hoạch công việc hàng tuần | HR, Manager | Low |

#### **FR-9: Quản lý Người dùng (User Management)**

| ID | Yêu cầu | Mô tả | Actor | Priority |
|----|---------|-------|-------|----------|
| FR-9.1 | Tạo tài khoản người dùng | Admin tạo tài khoản cho nhân viên mới | Admin | High |
| FR-9.2 | Gán Roles & Permissions | Xác định role và quyền cho người dùng | Admin | High |
| FR-9.3 | Sửa thông tin người dùng | Cập nhật tên, email, phone, role | Admin | Medium |
| FR-9.4 | Xóa/Disable tài khoản | Xóa hoặc vô hiệu hóa tài khoản cũ | Admin | Medium |
| FR-9.5 | Reset password | Admin reset password người dùng | Admin | Medium |
| FR-9.6 | Xem lịch sử hoạt động | Xem logs hoạt động của người dùng | Admin | Low |

### 2.4.3 Tóm tắt Yêu cầu Chức năng

**Total Functional Requirements: 55 items**

- Project Management: 7 requirements
- Quotation Management: 8 requirements
- Inventory Management: 7 requirements
- Finance Management: 7 requirements
- Real-time Notifications: 6 requirements
- AI System: 4 requirements
- Dashboard & Analytics: 4 requirements
- HR Management: 4 requirements
- User Management: 6 requirements

---

## 2.5 Yêu cầu phi chức năng (Non-Functional Requirements)

### 2.5.1 Định nghĩa Yêu cầu Phi Chức năng

**Yêu cầu phi chức năng** mô tả những tính chất của hệ thống chứ không phải những gì nó làm. Chúng bao gồm: hiệu suất, bảo mật, độ tin cậy, khả năng sử dụng, v.v.

### 2.5.2 Các Yêu cầu Phi Chức năng Chính

#### **NFR-1: Performance (Hiệu suất)**

| ID | Yêu cầu | Thông số | Mục tiêu |
|----|---------|----------|----------|
| NFR-1.1 | Response Time | Thời gian phản hồi API | < 500ms (95th percentile) |
| NFR-1.2 | Page Load Time | Thời gian tải trang | < 2 seconds |
| NFR-1.3 | Database Query | Thời gian truy vấn DB | < 100ms (average) |
| NFR-1.4 | Concurrent Users | Số users đồng thời | Min 100 users |
| NFR-1.5 | Throughput | Số requests/second | Min 50 requests/sec |
| NFR-1.6 | Real-time Latency | Thời gian notification | < 100ms |

#### **NFR-2: Security (Bảo mật)**

| ID | Yêu cầu | Mô tả | Tiêu chí |
|----|---------|-------|----------|
| NFR-2.1 | Authentication | Xác thực người dùng | JWT token (7-day expiry) |
| NFR-2.2 | Authorization | Phân quyền theo role | RBAC (Role-Based Access Control) |
| NFR-2.3 | Password Hashing | Mã hóa mật khẩu | bcrypt (cost factor 10) |
| NFR-2.4 | Data Encryption | Mã hóa dữ liệu | HTTPS/TLS 1.2+ |
| NFR-2.5 | Data Protection | Bảo vệ dữ liệu | GDPR / PII compliance |
| NFR-2.6 | SQL Injection | Chống SQL injection | Parameterized queries |
| NFR-2.7 | XSS Protection | Chống Cross-Site Scripting | Input validation, output encoding |
| NFR-2.8 | Rate Limiting | Giới hạn request rate | 5 attempts/15 min per IP |
| NFR-2.9 | Audit Logging | Ghi nhật ký hoạt động | Log all changes with timestamp |

#### **NFR-3: Availability (Tính khả dụng)**

| ID | Yêu cầu | Mô tả | Thông số |
|----|---------|-------|----------|
| NFR-3.1 | Uptime | Thời gian hệ thống hoạt động | 99.5% (máy chủ) |
| NFR-3.2 | Disaster Recovery | Khôi phục sau thảm họa | Backup hàng ngày, Recovery Time < 4 hours |
| NFR-3.3 | Data Backup | Sao lưu dữ liệu | Daily backups, 30-day retention |
| NFR-3.4 | Redundancy | Dự phòng hệ thống | Database replication, Load balancing |
| NFR-3.5 | Health Check | Kiểm tra sức khỏe | /api/health endpoint, email alert |

#### **NFR-4: Scalability (Khả năng mở rộng)**

| ID | Yêu cầu | Mô tả | Cách triển khai |
|----|---------|-------|-----------------|
| NFR-4.1 | Horizontal Scaling | Thêm servers khi cần | Load balancer, multiple Node instances |
| NFR-4.2 | Database Scaling | Tối ưu DB | Indexing, query optimization, eventual sharding |
| NFR-4.3 | Caching Layer | Cache dữ liệu | Redis, CDN for static files |
| NFR-4.4 | Async Processing | Xử lý bất đồng bộ | Job queues for heavy tasks |

#### **NFR-5: Usability (Khả năng sử dụng)**

| ID | Yêu cầu | Mô tả | Tiêu chí |
|----|---------|-------|----------|
| NFR-5.1 | Responsive Design | Giao diện responsive | Mobile/Tablet/Desktop support |
| NFR-5.2 | User Interface | UI dễ sử dụng | Modern, intuitive design |
| NFR-5.3 | Navigation | Điều hướng dễ | Clear menu, breadcrumbs |
| NFR-5.4 | Help & Support | Hỗ trợ users | Help documentation, FAQ, support portal |
| NFR-5.5 | Accessibility | Hỗ trợ accessibility | WCAG 2.1 AA compliance |
| NFR-5.6 | Language Support | Hỗ trợ ngôn ngữ | Vietnamese + English |

#### **NFR-6: Reliability (Độ tin cậy)**

| ID | Yêu cầu | Mô tả | Tiêu chí |
|----|---------|-------|----------|
| NFR-6.1 | Data Integrity | Tính toàn vẹn dữ liệu | ACID compliance, constraints |
| NFR-6.2 | Error Handling | Xử lý lỗi gracefully | Try-catch, error pages, logs |
| NFR-6.3 | Input Validation | Kiểm tra input | Server-side validation |
| NFR-6.4 | Error Messages | Thông báo lỗi rõ | User-friendly error messages |

#### **NFR-7: Maintainability (Khả năng bảo trì)**

| ID | Yêu cầu | Mô tả | Tiêu chí |
|----|---------|-------|----------|
| NFR-7.1 | Code Quality | Chất lượng code | ESLint, standard style |
| NFR-7.2 | Documentation | Tài liệu code | JSDoc, README files |
| NFR-7.3 | Testing | Kiểm thử | Unit tests, Integration tests |
| NFR-7.4 | Version Control | Quản lý phiên bản | Git, semantic versioning |

#### **NFR-8: Compatibility (Tính tương thích)**

| ID | Yêu cầu | Mô tả | Hỗ trợ |
|----|---------|-------|--------|
| NFR-8.1 | Browser Support | Hỗ trợ trình duyệt | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-8.2 | OS Support | Hỗ trợ HĐH | Windows, Linux, macOS |
| NFR-8.3 | Device Support | Hỗ trợ thiết bị | Desktop, Tablet, Mobile |
| NFR-8.4 | Integration | Tích hợp hệ thống | Excel import/export, API webhooks |

---

## 2.6 Mô tả chi tiết các Use Cases chính

### 2.6.1 UC-001: Tạo Dự án Mới

**Thông tin chung:**
```
Use Case ID: UC-001
Tên: Tạo Dự án Mới
Actors: Sales, Manager
Precondition: Người dùng đã đăng nhập
Postcondition: Dự án mới được tạo với status "New"
Priority: High
```

**Mô tả Main Flow (Happy Path):**

```
1. Sales/Manager truy cập trang "Projects"
2. Click nút "New Project"
3. Hệ thống hiển thị form với các trường:
   - Project Name (bắt buộc)
   - Customer (bắt buộc - chọn từ danh sách)
   - Sales Person (auto-fill tên người đăng nhập)
   - Start Date
   - Expected End Date
   - Notes
   - Attachments (optional)
4. Người dùng điền thông tin
5. Click "Save"
6. Hệ thống validate:
   - Project Name không trống
   - Customer được chọn
   - Dates hợp lệ
7. Nếu valid:
   - Lưu vào database
   - Tạo project với auto-increment ID
   - Set status = "New"
   - Set created_date = current timestamp
8. Hệ thống redirect về trang project detail
9. Hiển thị success message: "Project created successfully!"
10. Gửi notification cho Manager
```

**Alternative Flows:**

**A1: Customer không tồn tại**
```
6.5. Nếu Customer chưa tồn tại:
    a) Hiển thị option "Create New Customer"
    b) Mở dialog tạo customer mới
    c) Điền tên, phone, email customer
    d) Lưu customer
    e) Auto-select customer vừa tạo
    f) Tiếp tục main flow
```

**A2: Lỗi khi lưu**
```
7.1. Nếu lỗi database:
    a) Hiển thị error message
    b) Không lưu dữ liệu
    c) Yêu cầu user retry
```

---

### 2.6.2 UC-002: Tạo Báo giá

**Thông tin chung:**
```
Use Case ID: UC-002
Tên: Tạo Báo giá
Actors: Sales
Precondition: Dự án đã tồn tại
Postcondition: Báo giá được tạo với status "Draft"
Priority: High
```

**Mô tả Main Flow:**

```
1. Sales truy cập trang Projects
2. Chọn dự án cần tạo báo giá
3. Click nút "Create Quotation"
4. Hệ thống hiển thị form:
   - Quotation Number: auto-generate (QT-202601-001)
   - Project: auto-fill từ project được chọn
   - Quotation Date: current date
   - Items section (thêm nhiều items)
5. Để thêm item:
   a) Click "Add Item"
   b) Chọn loại: Cửa (Door), Cửa sổ (Window), Kính (Glass)
   c) Nếu chọn Door:
      - Chọn Aluminum System (60mm, 70mm, etc.)
      - Chọn Glass type (Single, Double, Laminated)
      - Nhập Width, Height, Quantity
      - Auto-calculate: Price = Price per meter × Length × Qty
   d) Nếu chọn Accessories:
      - Chọn từ danh sách phụ kiện
      - Nhập số lượng
      - Auto-fill giá
   e) Hệ thống tính: Item Total = Unit Price × Quantity
6. Sau khi thêm all items:
   - Total Amount = SUM(all item totals)
   - Discount: Sales nhập % hoặc fix amount
   - Final Amount = Total Amount - Discount
   - Profit Margin = (Final Amount - Cost) / Final Amount
7. Review final quotation
8. Click "Save as Draft" or "Send to Customer"
9. Nếu "Save as Draft":
   - Lưu với status = "Draft"
   - Có thể chỉnh sửa sau
10. Nếu "Send to Customer":
    - Validate quotation
    - Tạo link share duy nhất
    - Gửi email cho customer
    - Set status = "Sent"
    - Ghi nhận thời gian gửi
```

---

### 2.6.3 UC-004: Khách xem và Chốt Báo giá

**Thông tin chung:**
```
Use Case ID: UC-004
Tên: Khách Xem & Chốt Báo giá
Actors: Customer
Precondition: Báo giá được gửi đến customer
Postcondition: Trạng thái báo giá được cập nhật (Accepted/Rejected)
Priority: High
```

**Mô tả Main Flow:**

```
1. Customer nhận email với link báo giá
2. Click link (hoặc truy cập portal)
3. Hệ thống xác thực customer từ token email
4. Hiển thị trang xem báo giá:
   - Thông tin project
   - Danh sách items chi tiết
   - Mô tả sản phẩm (kính, nhôm, phụ kiện)
   - Giá tiêu chuẩn
   - Chiết khấu (nếu có)
   - Giá final
   - Ngày hết hạn báo giá
5. Customer có 2 nút lựa chọn:
   a) "CHỐT ĐƠN" (Accept) - xác nhận chốt
   b) "TỪ CHỐI" (Reject) - từ chối
   c) "LIÊN HỆ" (Contact) - gửi tin nhắn
6. Nếu click "CHỐT ĐƠN":
   a) Hệ thống hiển thị required fields:
      - Payment method (cash, bank transfer)
      - Delivery address (nếu khác)
   b) Customer điền và confirm
   c) Hệ thống update:
      - Quotation status = "Accepted"
      - Accepted date = current timestamp
      - Tạo Order từ Quotation
   d) Gửi confirmation email cho customer
   e) Gửi notification cho Sales & Manager
7. Nếu click "TỪ CHỐI":
   a) Hỏi lý do (optional)
   b) Update status = "Rejected"
   c) Gửi notification cho Sales
8. Nếu click "LIÊN HỆ":
   a) Mở chat box
   b) Cho phép customer gửi message
   c) Notification tới Sales staff
```

---

### 2.6.4 UC-006: Quản lý Kho Hàng - Nhập Kho

**Thông tin chung:**
```
Use Case ID: UC-006
Tên: Quản lý Kho Hàng (Nhập Kho)
Actors: Inventory Manager
Precondition: User đã đăng nhập với role Inventory
Postcondition: Vật tư được lưu vào kho, cập nhật số lượng tồn
Priority: High
```

**Mô tả Main Flow:**

```
1. Inventory Manager truy cập "Inventory" menu
2. Chọn "Stock In" (Nhập Kho)
3. Hệ thống hiển thị form:
   - Document Number: auto-generate (IN-202604-001)
   - Type: Aluminum / Glass / Accessories / Hardware / Other
4. Chọn Type (ví dụ: Aluminum)
5. Hệ thống hiển thị:
   - Danh sách Aluminum Systems
   - Current Stock
   - Min Level
   - Max Level
6. Chọn sản phẩm cần nhập:
   - Aluminum System: 60mm Black Aluminum
   - Unit: meter
   - Quantity: 100 (meters)
   - Unit Price: 50,000 VND
   - Invoice Date: xx/xx/xxxx
   - Supplier: Công ty XXX
   - Notes: Hàng nhập mới
7. Hệ thống tính:
   - Total Price = Quantity × Unit Price = 5,000,000
   - Current Stock += Quantity
8. Click "Save"
9. Hệ thống:
   - Lưu Stock In transaction
   - Cập nhật tồn kho
   - Cập nhật value của kho
   - Ghi log ai nhập, khi nào
10. Hiển thị confirmation
11. Có thể tiếp tục nhập sản phẩm khác
```

---

### 2.6.5 UC-010: Nhận Thông báo Real-time

**Thông tin chung:**
```
Use Case ID: UC-010
Tên: Nhận Thông báo Real-time
Actors: All Users
Precondition: User đã đăng nhập
Postcondition: User thấy notification trong notification center
Priority: High
```

**Mô tả Main Flow:**

```
1. Hệ thống (Server-side event):
   - Project mới được tạo
   - Hoặc: Báo giá được customer chốt
   - Hoặc: Vật tư sắp hết hạn
   - Hoặc: Thanh toán mới nhận

2. Server phát sự kiện qua Socket.io:
   io.emit('project_created', {
     projectId: 123,
     projectName: 'Dự án X',
     message: 'Dự án "X" được tạo bởi Sales A',
     timestamp: new Date()
   })

3. Client nhận notification:
   socket.on('project_created', (data) => {
     // Hiển thị notification toast
     showToast(data.message, 'success')
     // OR Hiển thị bell notification
     addNotificationCenter(data)
   })

4. User thấy:
   a) Toast notification ở góc màn hình (tự biến mất sau 5 giây)
   b) Bell icon ở header blink/có badge số
   c) Notification appearing in Notification Center

5. Click notification:
   a) Redirect tới trang liên quan (e.g., project detail)
   b) Mark as read
   c) Có thể delete notification

6. Các loại notification:
   - project_created: Dự án mới
   - quotation_accepted: Báo giá được chốt
   - material_low_stock: Vật tư sắp hết
   - payment_received: Thanh toán mới
   - production_started: Sản xuất bắt đầu
   - project_completed: Dự án hoàn thành
```

---

## 2.7 Kết luận

### 2.7.1 Tóm tắt Phân tích Yêu cầu

Chương 2 đã trình bày chi tiết:

1. **Use Case Diagram:** 15 use cases chính, 8 actors (Admin, Manager, Sales, Production, Inventory, Finance, Customer, HR)

2. **Yêu cầu Chức năng:** 55 functional requirements được phân loại thành 9 categories chính:
   - Project Management (7)
   - Quotation Management (8)
   - Inventory Management (7)
   - Finance Management (7)
   - Real-time Notifications (6)
   - AI System (4)
   - Dashboard & Analytics (4)
   - HR Management (4)
   - User Management (6)

3. **Yêu cầu Phi Chức năng:** 8 categories:
   - Performance: Response time < 500ms, Page load < 2s
   - Security: JWT, bcrypt, HTTPS, RBAC, SQL injection prevention
   - Availability: 99.5% uptime, Daily backups, < 4h recovery time
   - Scalability: Horizontal scaling, Redis caching, async processing
   - Usability: Responsive design, Vietnamese + English support
   - Reliability: ACID compliance, Input validation, Error handling
   - Maintainability: Code quality, Documentation, Testing
   - Compatibility: Modern browsers, Desktop/Mobile support

### 2.7.2 Ảnh hưởng đến Thiết kế

Các yêu cầu này sẽ dẫn đến:

- **Architecture Decision:** 3-tier architecture (Frontend/Backend/Database)
- **Technology Choices:** Node.js + Express, MySQL, Socket.io, Redis, JWT
- **Database Schema:** 30+ tables với foreign keys, indexes, constraints
- **API Design:** RESTful APIs với authentication, error handling
- **UI/UX Design:** Responsive design, Role-based dashboards

### 2.7.3 Baseline cho Kiểm thử

Tất cả requirements này sẽ là basis cho:
- Unit tests (FR coverage)
- Integration tests (API endpoints)
- System tests (End-to-end scenarios)
- Performance tests (NFR metrics)
- Security tests (Auth, injection prevention)

---

**Hoàn thành CHƯƠNG 2 - PHÂN TÍCH YÊU CẦU HỆ THỐNG**

Chương này cung cấp nền tảng vững chắc cho CHƯƠNG 3 (Thiết kế Hệ thống) bằng cách:
- Xác định rõ phạm vi hệ thống
- Mô tả chi tiết các chức năng
- Đặt out non-functional requirements
- Cung cấp use case descriptions cho development

---

**Tác giả:** [Tên nhóm]  
**Ngày soạn:** Tháng 4, 2026  
**Lần cập nhật cuối:** Tháng 4, 2026
