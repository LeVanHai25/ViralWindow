# 🔄 HƯỚNG DẪN KHỞI ĐỘNG LẠI BACKEND

## Vấn đề:
Sau khi chạy migration SQL, backend vẫn báo lỗi "Cột không tồn tại" vì:
- Backend server chưa được restart
- Connection pool đang cache schema cũ

## Giải pháp:

### Bước 1: Dừng Backend Server
1. Tìm cửa sổ Terminal/Command Prompt đang chạy backend
2. Nhấn `Ctrl + C` để dừng server

### Bước 2: Khởi động lại Backend
Mở Terminal trong thư mục `backend/` và chạy:

```bash
cd backend
npm start
```

Hoặc nếu dùng nodemon:
```bash
npm run dev
```

### Bước 3: Kiểm tra kết nối
Bạn sẽ thấy thông báo:
```
✅ Kết nối database thành công!
🔥 API Server đang chạy tại http://localhost:3001
```

### Bước 4: Test lại
1. Mở trình duyệt
2. Vào trang Quản lý Kho
3. Thử thêm/sửa kho nhôm

## Nếu vẫn lỗi:

### Kiểm tra Database Name
Đảm bảo file `.env` trong thư mục `backend/` có:
```
DB_NAME=viral_window_db
```

### Kiểm tra Database trong phpMyAdmin
Chạy câu SQL này để xác nhận:
```sql
DESCRIBE aluminum_systems;
```

Bạn phải thấy 2 cột:
- `density` (DECIMAL(10,3))
- `cross_section_image` (VARCHAR(500))








