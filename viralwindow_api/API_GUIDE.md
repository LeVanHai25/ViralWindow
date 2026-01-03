# HƯỚNG DẪN SỬ DỤNG API PHP

## 📋 Tổng quan

API được xây dựng theo mô hình MVC (Model-View-Controller) với PHP thuần.

## 🔌 Các API Endpoints

### 1. **API Khách hàng** (`/api/customers.php`)

#### GET - Lấy danh sách khách hàng
```
GET /api/customers.php
GET /api/customers.php?search=tuan
GET /api/customers.php?id=1
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "customer_code": "KH-0001",
            "full_name": "Anh Tuấn",
            "phone": "0988 123 456",
            "email": "tuan@email.com",
            "total_quotations": 3,
            "total_projects": 2
        }
    ],
    "count": 1
}
```

#### POST - Thêm khách hàng
```
POST /api/customers.php
Content-Type: application/json

{
    "full_name": "Nguyễn Văn A",
    "phone": "0912 345 678",
    "email": "nguyenvana@email.com",
    "address": "123 Đường ABC",
    "tax_code": "0123456789",
    "notes": "Ghi chú"
}
```

#### PUT - Cập nhật khách hàng
```
PUT /api/customers.php?id=1
Content-Type: application/json

{
    "full_name": "Nguyễn Văn A (Updated)",
    "phone": "0912 345 678",
    ...
}
```

#### DELETE - Xóa khách hàng
```
DELETE /api/customers.php?id=1
```

---

### 2. **API Báo giá** (`/api/quotations.php`)

#### GET - Lấy danh sách báo giá
```
GET /api/quotations.php
GET /api/quotations.php?status=approved
GET /api/quotations.php?customer_id=1
GET /api/quotations.php?search=biệt thự
GET /api/quotations.php?id=1
GET /api/quotations.php?stats=true
```

**Response (List):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "quotation_code": "BG-2025-0001",
            "customer_name": "Anh Tuấn",
            "total_amount": 156300000,
            "status": "approved",
            "quotation_date": "2025-01-15",
            "item_count": 5
        }
    ],
    "count": 1
}
```

**Response (Detail with items):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "quotation_code": "BG-2025-0001",
        "customer_name": "Anh Tuấn",
        "total_amount": 156300000,
        "subtotal": 130250000,
        "profit_amount": 26050000,
        "items": [
            {
                "id": 1,
                "item_name": "Cửa đi 1 cánh",
                "quantity": 1,
                "unit": "bộ",
                "unit_price": 130250000,
                "total_price": 130250000
            }
        ]
    }
}
```

#### POST - Tạo báo giá mới
```
POST /api/quotations.php
Content-Type: application/json

{
    "customer_id": 1,
    "project_id": null,
    "quotation_date": "2025-01-20",
    "validity_days": 30,
    "status": "draft",
    "profit_margin_percent": 20,
    "items": [
        {
            "item_name": "Cửa đi 1 cánh",
            "quantity": 1,
            "unit": "bộ",
            "unit_price": 1000000,
            "total_price": 1000000,
            "item_type": "material"
        }
    ],
    "notes": "Ghi chú"
}
```

#### PUT - Cập nhật báo giá
```
PUT /api/quotations.php?id=1
Content-Type: application/json

{
    "customer_id": 1,
    "status": "approved",
    "items": [...],
    ...
}
```

#### PUT - Cập nhật trạng thái
```
PUT /api/quotations.php?id=1&status=approved
```

#### DELETE - Xóa báo giá
```
DELETE /api/quotations.php?id=1
```

---

### 3. **API Báo cáo** (`/api/reports.php`)

#### GET - Dashboard tổng quan
```
GET /api/reports.php?type=dashboard
```

**Response:**
```json
{
    "success": true,
    "data": {
        "total_revenue": 500000000,
        "total_profit": 100000000,
        "approved_quotations": 15,
        "running_projects": 8
    }
}
```

#### GET - Doanh thu theo tháng
```
GET /api/reports.php?type=revenue-month
GET /api/reports.php?type=revenue-month&year=2025
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "month": 1,
            "revenue": 50000000,
            "profit": 10000000,
            "quotation_count": 5
        }
    ]
}
```

#### GET - Tỷ lệ chốt báo giá
```
GET /api/reports.php?type=conversion-rate
```

**Response:**
```json
{
    "success": true,
    "data": {
        "total": 20,
        "approved": 12,
        "rejected": 3,
        "pending": 5,
        "conversion_rate": 60.0
    }
}
```

#### GET - Báo cáo sản xuất
```
GET /api/reports.php?type=production
```

#### GET - Báo cáo kho
```
GET /api/reports.php?type=inventory
```

#### GET - Báo cáo tài chính
```
GET /api/reports.php?type=financial
GET /api/reports.php?type=financial&start_date=2025-01-01&end_date=2025-01-31
```

---

## 📝 Ví dụ sử dụng trong JavaScript

### Fetch API với async/await
```javascript
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost/viralwindow_api/api/customers.php');
        const result = await response.json();
        
        if (result.success) {
            console.log('Khách hàng:', result.data);
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}
```

### POST với JSON
```javascript
async function createQuotation(data) {
    try {
        const response = await fetch('http://localhost/viralwindow_api/api/quotations.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Tạo thành công:', result.data);
        } else {
            console.error('Lỗi:', result.message);
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
    }
}
```

### Xử lý lỗi
```javascript
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'API error');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        alert('Lỗi: ' + error.message);
        return null;
    }
}
```

## 🔧 Troubleshooting

### Lỗi CORS
- Kiểm tra file `config/cors.php` đã được include
- Kiểm tra `.htaccess` có cấu hình CORS

### Lỗi 500 Internal Server Error
- Kiểm tra PHP error logs
- Kiểm tra kết nối database
- Kiểm tra syntax PHP

### Lỗi 404 Not Found
- Kiểm tra đường dẫn API
- Kiểm tra file `.htaccess`
- Kiểm tra mod_rewrite đã bật

## 📚 Tài liệu tham khảo

- PHP PDO: https://www.php.net/manual/en/book.pdo.php
- RESTful API Best Practices: https://restfulapi.net/






