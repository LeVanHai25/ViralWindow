# API PHP - Hệ thống Quản lý Cửa Nhôm Kính

## 📁 Cấu trúc thư mục

```
viralwindow_api/
├── config/
│   ├── database.php      # Cấu hình kết nối database
│   └── cors.php          # Cấu hình CORS
├── models/
│   ├── AluminumSystem.php    # Model xử lý hệ nhôm
│   ├── Accessory.php         # Model xử lý phụ kiện
│   └── Project.php           # Model xử lý dự án
├── controllers/
│   ├── AluminumSystemController.php
│   ├── AccessoryController.php
│   └── ProjectController.php
├── api/
│   ├── aluminum-systems.php
│   ├── accessories.php
│   └── projects.php
├── .htaccess              # Cấu hình Apache
└── README.md
```

## ⚙️ Cấu hình

### 1. Cấu hình Database

Mở file `config/database.php` và chỉnh sửa thông tin kết nối:

```php
private $host = "localhost";
private $db_name = "viral_window_db";
private $username = "root";
private $password = "";  // Đổi mật khẩu nếu cần
```

### 2. Đảm bảo Apache đã bật mod_rewrite

Kiểm tra file `httpd.conf` hoặc `apache2.conf`:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

## 🚀 Sử dụng API

### Base URL
```
http://localhost/viralwindow_api/api/
```

### 1. API Hệ Nhôm

#### Lấy tất cả hệ nhôm
```
GET /api/aluminum-systems.php
GET /api/aluminum-systems.php?search=xingfa
```

#### Lấy hệ nhôm theo ID
```
GET /api/aluminum-systems.php?id=1
```

#### Lấy hệ nhôm theo mã
```
GET /api/aluminum-systems.php?code=XF-001
```

#### Thêm hệ nhôm mới
```
POST /api/aluminum-systems.php
Content-Type: application/json

{
    "code": "XF-003",
    "name": "Thanh ngang cửa sổ",
    "brand": "Xingfa",
    "thickness_mm": 1.2,
    "weight_per_meter": 1.0,
    "cutting_formula": "W - 45",
    "description": "Mô tả"
}
```

#### Cập nhật hệ nhôm
```
PUT /api/aluminum-systems.php?id=1
Content-Type: application/json

{
    "name": "Tên mới",
    "brand": "Xingfa",
    ...
}
```

#### Xóa hệ nhôm
```
DELETE /api/aluminum-systems.php?id=1
```

### 2. API Phụ Kiện

#### Lấy tất cả phụ kiện
```
GET /api/accessories.php
GET /api/accessories.php?search=khóa
GET /api/accessories.php?category=Khóa
GET /api/accessories.php?stats=true  # Lấy thống kê
```

#### Thêm phụ kiện
```
POST /api/accessories.php
Content-Type: application/json

{
    "code": "PK-007",
    "name": "Khóa mới",
    "category": "Khóa",
    "unit": "Bộ",
    "purchase_price": 200000,
    "sale_price": 250000,
    "stock_quantity": 50,
    "min_stock_level": 10,
    "description": "Mô tả"
}
```

### 3. API Dự Án

#### Lấy tất cả dự án
```
GET /api/projects.php
GET /api/projects.php?status=approved
GET /api/projects.php?progress=50-75
GET /api/projects.php?search=biệt thự
GET /api/projects.php?stats=true  # Lấy thống kê
```

#### Lấy dự án theo ID
```
GET /api/projects.php?id=1
```

## 📝 Ví dụ sử dụng trong JavaScript

```javascript
// Lấy danh sách hệ nhôm
fetch('http://localhost/viralwindow_api/api/aluminum-systems.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            data.data.forEach(item => {
                console.log(item.name);
            });
        }
    });

// Tìm kiếm hệ nhôm
fetch('http://localhost/viralwindow_api/api/aluminum-systems.php?search=xingfa')
    .then(response => response.json())
    .then(data => console.log(data));

// Thêm hệ nhôm mới
fetch('http://localhost/viralwindow_api/api/aluminum-systems.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        code: 'XF-003',
        name: 'Thanh mới',
        brand: 'Xingfa',
        thickness_mm: 1.4,
        weight_per_meter: 1.2,
        cutting_formula: 'W - 50',
        description: ''
    })
})
.then(response => response.json())
.then(data => console.log(data));

// Lấy dự án với filter
fetch('http://localhost/viralwindow_api/api/projects.php?status=approved&progress=50-75')
    .then(response => response.json())
    .then(data => console.log(data));
```

## 🔧 Xử lý lỗi

API trả về format JSON:

**Thành công:**
```json
{
    "success": true,
    "data": [...],
    "count": 10
}
```

**Lỗi:**
```json
{
    "success": false,
    "message": "Thông báo lỗi"
}
```

## 🐛 Debug

Nếu gặp lỗi, kiểm tra:

1. **Lỗi kết nối database:**
   - Kiểm tra thông tin trong `config/database.php`
   - Đảm bảo MySQL đang chạy
   - Kiểm tra database đã được tạo chưa

2. **Lỗi 404:**
   - Kiểm tra đường dẫn API
   - Đảm bảo file `.htaccess` đã được copy
   - Kiểm tra mod_rewrite đã bật

3. **Lỗi CORS:**
   - Kiểm tra file `config/cors.php` đã được include
   - Kiểm tra `.htaccess` có cấu hình CORS

## 📚 Mở rộng

Để thêm API mới:

1. Tạo Model trong `models/`
2. Tạo Controller trong `controllers/`
3. Tạo endpoint trong `api/`
4. Test API bằng Postman hoặc trình duyệt






