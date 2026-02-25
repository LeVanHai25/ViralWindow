# 🔧 Hướng dẫn đổi PORT từ 3000 sang 3001

## ✅ Đã cập nhật tất cả file Frontend

Tất cả các file HTML đã được cập nhật từ `localhost:3000` sang `localhost:3001`.

## 📝 Cần cập nhật file .env

### Bước 1: Mở file `.env`
Mở file `backend/.env` (nếu chưa có, tạo mới)

### Bước 2: Đổi PORT
Tìm dòng:
```env
PORT=3000
```

Đổi thành:
```env
PORT=3001
```

### Bước 3: Lưu file

### Bước 4: Khởi động lại server
```powershell
cd backend
node server.js
```

Bạn sẽ thấy:
```
🔥 API Server đang chạy tại http://localhost:3001
```

---

## ✅ Files đã cập nhật

- ✅ FontEnd/index.html
- ✅ FontEnd/login.html
- ✅ FontEnd/register.html
- ✅ FontEnd/forgot-password.html
- ✅ FontEnd/projects.html
- ✅ FontEnd/config.html
- ✅ FontEnd/sales.html
- ✅ FontEnd/pending-quotations.html
- ✅ FontEnd/profile.html
- ✅ FontEnd/reports.html
- ✅ FontEnd/production.html
- ✅ FontEnd/inventory.html
- ✅ FontEnd/inventory-warnings.html
- ✅ FontEnd/finance-hr.html

---

## 🎯 Kiểm tra

1. **Kiểm tra server:**
   - Mở: `http://localhost:3001`
   - Phải thấy JSON response

2. **Test đăng nhập:**
   - Mở: `http://localhost:5500/FontEnd/login.html`
   - Đăng nhập và kiểm tra không có lỗi kết nối

---

## ⚠️ Lưu ý

- File `.env` nằm trong thư mục `backend/`
- Nếu không có file `.env`, tạo mới với nội dung:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=
  DB_NAME=viral_window_db
  DB_PORT=3306
  PORT=3001
  JWT_SECRET=your-super-secret-key-change-in-production
  NODE_ENV=development
  ```






