# 🔄 HƯỚNG DẪN RESTART SERVER ĐỂ ÁP DỤNG THAY ĐỔI

## ⚠️ QUAN TRỌNG: Sau khi sửa code, BẮT BUỘC phải restart server!

### 📋 Các bước:

1. **Dừng server hiện tại:**
   - Nhấn `Ctrl + C` trong terminal đang chạy server
   - Hoặc đóng terminal

2. **Khởi động lại server:**
   ```bash
   cd backend
   node server.js
   ```
   
   Hoặc sử dụng script có sẵn:
   ```bash
   backend\start-server.bat
   ```

3. **Kiểm tra server đã chạy:**
   - Xem console có dòng: `🔥 API Server đang chạy tại http://localhost:3001`
   - Xem có dòng: `✅ Route /api/project-materials đã được đăng ký`

4. **Test API:**
   - Mở trình duyệt: `http://localhost:3001/api/project-materials/check-export-requirement/11`
   - Phải thấy JSON response, không phải "Cannot GET"

### 🧪 Test nhanh bằng script:

```bash
cd backend
node test-check-export-api.js
```

### ✅ Khi thành công, bạn sẽ thấy:

- Console server: `🔍 checkExportRequirement được gọi với projectId: 11`
- Browser/Postman: JSON response với `success: true`

### ❌ Nếu vẫn lỗi 404:

1. Kiểm tra server có đang chạy không
2. Kiểm tra port 3001 có bị chiếm không
3. Xem console server có log route không
4. Kiểm tra file `routes/projectMaterialRoutes.js` có đúng không













