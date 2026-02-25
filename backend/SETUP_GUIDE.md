# 🚀 HƯỚNG DẪN CÀI ĐẶT BACKEND NODE.JS

## Bước 1: Cài đặt Node.js
Tải và cài đặt Node.js từ: https://nodejs.org/ (phiên bản LTS)

## Bước 2: Cài đặt dependencies

Mở Terminal trong VS Code tại thư mục `backend/`:

```bash
cd backend
npm install
```

Lệnh này sẽ cài đặt:
- `express` - Framework web
- `mysql2` - Driver MySQL
- `cors` - Xử lý CORS
- `dotenv` - Đọc file .env

## Bước 3: Cấu hình Database

### Tạo file `.env`:

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Hoặc tạo file `.env` thủ công với nội dung:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=viral_window_db
DB_PORT=3306
PORT=3000
```

**Lưu ý:** 
- Nếu MySQL có mật khẩu, điền vào `DB_PASS`
- Đảm bảo database `viral_window_db` đã được tạo (import từ `database.sql`)

## Bước 4: Import Database

Đảm bảo MySQL đang chạy, sau đó import database:

```bash
mysql -u root -p < ../database.sql
```

Hoặc sử dụng phpMyAdmin để import file `database.sql`

## Bước 5: Chạy Server

### Chạy bình thường:
```bash
npm start
```

### Chạy với nodemon (tự động restart):
```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
✅ Kết nối database thành công!
🔥 API Server đang chạy tại http://localhost:3000
📡 Các endpoints:
   GET  /api/aluminum-systems
   GET  /api/projects
   GET  /api/accessories
   GET  /api/customers
   GET  /api/quotations
   GET  /api/reports
```

## Bước 6: Test API

Mở trình duyệt và truy cập:

- **Health check:** http://localhost:3000/
- **Hệ nhôm:** http://localhost:3000/api/aluminum-systems
- **Dự án:** http://localhost:3000/api/projects
- **Phụ kiện:** http://localhost:3000/api/accessories
- **Khách hàng:** http://localhost:3000/api/customers
- **Báo giá:** http://localhost:3000/api/quotations
- **Báo cáo:** http://localhost:3000/api/reports/dashboard

Nếu thấy JSON response → Backend đã chạy thành công! ✅

## Bước 7: Cập nhật Frontend

Frontend đã được cập nhật để sử dụng API Node.js tại `http://localhost:3000/api`

Mở các file HTML trong `FontEnd/` và test các chức năng.

## 🔧 Troubleshooting

### Lỗi: "Cannot find module"
```bash
npm install
```

### Lỗi: "Connection refused" hoặc "ECONNREFUSED"
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong `.env`
- Kiểm tra port MySQL (mặc định 3306)

### Lỗi: "Access denied for user"
- Kiểm tra username/password trong `.env`
- Kiểm tra user có quyền truy cập database

### Lỗi: "Unknown database 'viral_window_db'"
- Import database từ file `database.sql`
- Hoặc tạo database thủ công và import

### Lỗi: Port 3000 đã được sử dụng
- Đổi PORT trong `.env` (ví dụ: 3001)
- Hoặc kill process đang dùng port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill
  ```

## 📚 Tài liệu tham khảo

- Express.js: https://expressjs.com/
- MySQL2: https://github.com/sidorares/node-mysql2
- Node.js: https://nodejs.org/






