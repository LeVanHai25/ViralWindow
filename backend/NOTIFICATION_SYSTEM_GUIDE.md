# Hướng dẫn hoàn thiện Hệ thống Thông báo

## ✅ Đã hoàn thành

### 1. Database Schema
- ✅ File: `backend/sql/create_notifications_tables.sql`
- Chạy SQL này để tạo 3 bảng:
  - `notifications`: Lưu thông báo
  - `notification_recipients`: Lưu người nhận (1 notification → nhiều users)
  - `notification_rules`: Lưu luật gửi (Event → Rule → Recipients)

### 2. Backend Service
- ✅ File: `backend/services/notificationEventService.js`
- Kiến trúc 3 lớp: **Event → Rule → Notification**
- Cách sử dụng:
```javascript
const NotificationEventService = require('../services/notificationEventService');

// Emit event
await NotificationEventService.emit('project.created', {
    project_id: 123,
    project_code: 'CT2025-001',
    project_name: 'Dự án ABC',
    customer_name: 'Khách hàng XYZ'
}, {
    createdBy: req.user?.id,
    entityType: 'project',
    entityId: 123
});
```

### 3. API Endpoints
- ✅ File: `backend/controllers/notificationController.js`
- ✅ File: `backend/routes/notifications.js`
- Endpoints:
  - `GET /api/notifications` - Lấy danh sách
  - `GET /api/notifications/unread-count` - Đếm chưa đọc
  - `POST /api/notifications/:id/read` - Đánh dấu đã đọc
  - `POST /api/notifications/read-all` - Đánh dấu tất cả đã đọc
  - `DELETE /api/notifications/:id` - Xóa
  - `DELETE /api/notifications/delete-read` - Xóa đã đọc

### 4. Frontend Component
- ✅ File: `FontEnd/js/notification-system.js`
- ✅ File: `FontEnd/css/notification-system.css`
- Tự động polling mỗi 15 giây
- Dropdown hiển thị thông báo
- Badge hiển thị số chưa đọc

### 5. Tích hợp vào ProjectController
- ✅ Đã thêm notification cho:
  - `project.created` - Khi tạo dự án mới
  - `project.status_changed` - Khi thay đổi trạng thái
  - `project.completed` - Khi hoàn thành

## 🔧 Cần hoàn thiện

### 1. Chạy SQL để tạo bảng
```bash
mysql -u root -p your_database < backend/sql/create_notifications_tables.sql
```

### 2. Tích hợp notification component vào tất cả các trang

**Các trang cần thêm:**
- index.html ✅ (đã có trong sales.html)
- projects.html
- quotation-new.html
- design-new.html
- production.html
- production-management.html
- inventory.html
- installation.html
- handover.html
- exported-materials.html
- finance-dashboard.html
- completed-projects.html

**Cách thêm:**
1. Thêm CSS link vào `<head>`:
```html
<link rel="stylesheet" href="css/notification-system.css">
```

2. Thêm JS script vào `<head>`:
```html
<script src="js/notification-system.js"></script>
```

3. Thêm HTML vào sidebar (sau user menu dropdown):
```html
<!-- Notification Button -->
<div class="p-4 border-b border-blue-600">
    <div class="notification-button-wrapper relative">
        <button onclick="toggleNotifications()" 
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="flex-1 text-sm font-medium">Thông báo</span>
            <span id="notificationBadge" class="notification-badge hidden">0</span>
        </button>
        
        <!-- Notification Dropdown -->
        <div id="notificationsDropdown" class="hidden">
            <div class="p-3 border-b border-gray-200 bg-gray-50">
                <h3 class="text-sm font-semibold text-gray-900">Thông báo</h3>
            </div>
            <div id="notificationsList" class="bg-white">
                <!-- Notifications will be loaded here -->
            </div>
        </div>
    </div>
</div>
```

### 3. Thêm notification vào các API khác

**QuotationController:**
```javascript
// Khi tạo báo giá
await NotificationEventService.emit('quotation.created', {
    quotation_id: result.insertId,
    quotation_code: code,
    customer_name: customerName
}, {
    createdBy: req.user?.id,
    entityType: 'quotation',
    entityId: result.insertId
});

// Khi chốt báo giá
await NotificationEventService.emit('quotation.approved', {
    quotation_id: id,
    quotation_code: quotation.code,
    customer_name: quotation.customer_name
}, {
    createdBy: req.user?.id,
    entityType: 'quotation',
    entityId: id
});
```

**CustomerController:**
```javascript
// Khi tạo khách hàng
await NotificationEventService.emit('customer.created', {
    customer_id: result.insertId,
    customer_name: full_name,
    customer_code: customer_code
}, {
    createdBy: req.user?.id,
    entityType: 'customer',
    entityId: result.insertId
});
```

**InventoryController:**
```javascript
// Khi nhập kho
await NotificationEventService.emit('inventory.imported', {
    item_id: itemId,
    item_name: itemName,
    quantity: quantity,
    unit: unit
}, {
    createdBy: req.user?.id,
    entityType: 'inventory',
    entityId: itemId
});

// Khi xuất kho
await NotificationEventService.emit('inventory.exported', {
    item_id: itemId,
    item_name: itemName,
    quantity: quantity,
    unit: unit
}, {
    createdBy: req.user?.id,
    entityType: 'inventory',
    entityId: itemId
});

// Khi vật tư sắp hết
await NotificationEventService.emit('inventory.low_stock', {
    item_id: itemId,
    item_name: itemName,
    item_code: itemCode,
    current_stock: currentStock,
    min_stock: minStock,
    unit: unit
}, {
    createdBy: req.user?.id,
    entityType: 'inventory',
    entityId: itemId
});
```

**ProductionController:**
```javascript
// Khi tạo lệnh sản xuất
await NotificationEventService.emit('production.order_created', {
    order_id: result.insertId,
    order_code: code,
    project_name: projectName
}, {
    createdBy: req.user?.id,
    entityType: 'production',
    entityId: result.insertId
});

// Khi hoàn thành sản xuất
await NotificationEventService.emit('production.completed', {
    order_id: id,
    order_code: order.code,
    project_name: order.project_name
}, {
    createdBy: req.user?.id,
    entityType: 'production',
    entityId: id
});
```

### 4. Cấu hình Rules (nếu cần)

Có thể thêm/sửa rules trong bảng `notification_rules`:
```sql
INSERT INTO notification_rules (event_type, recipient_roles, level) VALUES
('project.created', '["manager", "sales"]', 'info'),
('quotation.approved', '["manager", "sales"]', 'important'),
('inventory.low_stock', '["warehouse", "manager"]', 'urgent');
```

### 5. Test hệ thống

1. Tạo một dự án mới → Kiểm tra notification xuất hiện
2. Thay đổi trạng thái dự án → Kiểm tra notification
3. Tạo báo giá → Kiểm tra notification
4. Nhập/xuất kho → Kiểm tra notification

## 📝 Lưu ý

1. **Database**: Phải chạy SQL script trước khi sử dụng
2. **Authentication**: Tất cả API endpoints đều cần token
3. **Polling**: Frontend tự động polling mỗi 15 giây
4. **Null checks**: Frontend đã có null checks để tránh lỗi
5. **Event types**: Xem trong `notificationEventService.js` để biết các event types có sẵn

## 🚀 Nâng cấp sau này

1. **SSE/WebSocket**: Thay polling bằng realtime push
2. **Email notifications**: Gửi email khi có thông báo quan trọng
3. **Mobile push**: Push notification cho mobile app
4. **Notification preferences**: Cho phép user tùy chỉnh loại thông báo muốn nhận

