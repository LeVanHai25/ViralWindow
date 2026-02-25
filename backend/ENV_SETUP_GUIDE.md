# Hướng dẫn Cấu hình Môi trường - ViralWindow Backend

## 📋 Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
# =====================================================
# SERVER CONFIGURATION
# =====================================================
PORT=3001
NODE_ENV=development

# =====================================================
# DATABASE CONFIGURATION (MySQL/MariaDB)
# =====================================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=viral_window_db

# =====================================================
# AUTHENTICATION & SECURITY
# =====================================================
# QUAN TRỌNG: Thay đổi JWT_SECRET trong production!
# Tạo secret mạnh: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# =====================================================
# FILE UPLOAD CONFIGURATION
# =====================================================
UPLOAD_DIR=../FontEnd/uploads
MAX_FILE_SIZE=50mb
```

## 🔐 Tạo JWT Secret Mạnh

Chạy lệnh sau để tạo JWT secret an toàn:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Kết quả sẽ như: `a1b2c3d4e5f6...` - Copy và paste vào `JWT_SECRET` trong file .env

## ⚠️ Lưu ý quan trọng

1. **KHÔNG commit file .env** vào git
2. **Thay đổi JWT_SECRET** khi deploy production
3. **Backup file .env** ở nơi an toàn

## 🔄 Sau khi tạo file .env

Restart server:
```bash
cd backend
npm start
```
