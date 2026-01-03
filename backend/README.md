# Backend API - Node.js + Express + MySQL

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cấu hình database
Chỉnh sửa file `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=viral_window_db
DB_PORT=3306
PORT=3000
```

### Bước 3: Chạy server
```bash
npm start
```

Hoặc chạy với nodemon (tự động restart khi có thay đổi):
```bash
npm run dev
```

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

### 1. Aluminum Systems
- `GET /api/aluminum-systems` - Lấy tất cả hệ nhôm
- `GET /api/aluminum-systems/:id` - Lấy hệ nhôm theo ID
- `POST /api/aluminum-systems` - Thêm hệ nhôm mới
- `PUT /api/aluminum-systems/:id` - Cập nhật hệ nhôm
- `DELETE /api/aluminum-systems/:id` - Xóa hệ nhôm

### 2. Projects
- `GET /api/projects` - Lấy tất cả dự án
- `GET /api/projects/:id` - Lấy dự án theo ID
- `POST /api/projects` - Thêm dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án
- `GET /api/projects/stats/summary` - Thống kê dự án

### 3. Accessories
- `GET /api/accessories` - Lấy tất cả phụ kiện
- `GET /api/accessories/stats` - Thống kê phụ kiện
- `GET /api/accessories/:id` - Lấy phụ kiện theo ID
- `POST /api/accessories` - Thêm phụ kiện mới
- `PUT /api/accessories/:id` - Cập nhật phụ kiện
- `DELETE /api/accessories/:id` - Xóa phụ kiện

### 4. Customers
- `GET /api/customers` - Lấy tất cả khách hàng
- `GET /api/customers/:id` - Lấy khách hàng theo ID
- `POST /api/customers` - Thêm khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### 5. Quotations
- `GET /api/quotations` - Lấy tất cả báo giá
- `GET /api/quotations/stats` - Thống kê báo giá
- `GET /api/quotations/:id` - Lấy báo giá theo ID (kèm chi tiết)
- `POST /api/quotations` - Tạo báo giá mới
- `PUT /api/quotations/:id` - Cập nhật báo giá
- `PUT /api/quotations/:id/status` - Cập nhật trạng thái
- `DELETE /api/quotations/:id` - Xóa báo giá

### 6. Reports
- `GET /api/reports/dashboard` - Dashboard tổng quan
- `GET /api/reports/revenue-month?year=2025` - Doanh thu theo tháng
- `GET /api/reports/conversion-rate` - Tỷ lệ chốt báo giá
- `GET /api/reports/revenue-sales` - Doanh thu theo sale
- `GET /api/reports/production` - Báo cáo sản xuất
- `GET /api/reports/inventory` - Báo cáo kho
- `GET /api/reports/financial?start_date=2025-01-01&end_date=2025-01-31` - Báo cáo tài chính

## 📝 Ví dụ sử dụng

### GET Request
```javascript
fetch('http://localhost:3000/api/aluminum-systems')
    .then(res => res.json())
    .then(data => console.log(data));
```

### POST Request
```javascript
fetch('http://localhost:3000/api/customers', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        full_name: 'Nguyễn Văn A',
        phone: '0912 345 678',
        email: 'nguyenvana@email.com'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🔧 Cấu trúc thư mục

```
backend/
├── config/
│   └── db.js              # Kết nối database
├── controllers/
│   ├── aluminumController.js
│   ├── projectController.js
│   ├── accessoriesController.js
│   ├── customerController.js
│   ├── quotationController.js
│   └── reportController.js
├── routes/
│   ├── aluminum.js
│   ├── projects.js
│   ├── accessories.js
│   ├── customers.js
│   ├── quotations.js
│   └── reports.js
├── .env                   # Cấu hình
├── .gitignore
├── package.json
├── server.js              # Entry point
└── README.md
```

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong `.env`
- Kiểm tra database đã được tạo chưa

### Lỗi port đã được sử dụng
- Đổi PORT trong `.env`
- Hoặc kill process đang dùng port 3000

### Lỗi module not found
- Chạy lại `npm install`






