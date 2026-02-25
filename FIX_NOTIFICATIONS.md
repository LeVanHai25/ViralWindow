# 🔧 FIX LỖI HỆ THỐNG THÔNG BÁO

## ❌ **CÁC LỖI BẠN GẶP**

### **Lỗi 1: "Không có thông báo nào"**
- Dropdown thông báo trống
- Badge không hiển thị số

### **Lỗi 2: Click "Xem tất cả" không chuyển trang**
- Link không hoạt động
- Trang notifications.html không mở

---

## ✅ **NGUYÊN NHÂN & CÁCH SỬA**

### **Nguyên nhân 1: Bảng notifications chưa tồn tại trong database**

**Giải pháp:** Chạy file SQL để tạo bảng

#### **Cách 1: Dùng file BAT (Nhanh nhất)**
```bash
# Double click file:
tao-bang-notifications.bat

# Hoặc chạy trong PowerShell:
cd d:\ViralWindow_Phan_Mem_Nhom_Kinh
.\tao-bang-notifications.bat
```

#### **Cách 2: Dùng phpMyAdmin**
1. Mở phpMyAdmin: http://localhost/phpmyadmin
2. Chọn database `viral_window_db`
3. Click tab "SQL"
4. Copy nội dung file `backend/sql/create_notifications_table.sql`
5. Paste và click "Go"

#### **Cách 3: Dùng MySQL command line**
```bash
cd backend\sql
"C:\xampp\mysql\bin\mysql.exe" -u root -p viral_window_db < create_notifications_table.sql
```

### **Nguyên nhân 2: Backend chưa chạy**

**Giải pháp:** Khởi động backend server

```bash
cd backend
node server.js
```

**Kiểm tra:** Mở http://localhost:3001 → Thấy "API is running"

### **Nguyên nhân 3: File notifications.html bị lỗi**

**Giải pháp:** File đã được tạo đúng, chỉ cần reload

1. Đóng tất cả tab browser
2. Mở lại: http://localhost:5500/notifications.html
3. Hard refresh: Ctrl + F5

---

## 🧪 **CÁCH TEST SAU KHI SỬA**

### **Test 1: Kiểm tra database**

```sql
-- Mở phpMyAdmin hoặc MySQL CLI, chạy:
USE viral_window_db;

-- Check table tồn tại
SHOW TABLES LIKE 'notifications';

-- Check data
SELECT COUNT(*) FROM notifications;
-- → Phải có ít nhất 7 rows

-- Check notifications chưa đọc
SELECT COUNT(*) FROM notifications WHERE is_read = 0;
-- → Phải có ít nhất 4 rows
```

### **Test 2: Kiểm tra API**

Mở browser, vào Console (F12), chạy:

```javascript
// Test API get notifications
fetch('http://localhost:3001/api/notifications')
  .then(r => r.json())
  .then(d => console.log('API Response:', d));

// → Phải trả về: { success: true, data: [...] }
```

### **Test 3: Kiểm tra trang notifications.html**

1. Mở trực tiếp: http://localhost:5500/notifications.html
2. Phải thấy:
   - Header "Thông báo"
   - Thống kê: Tổng | Chưa đọc | Hôm nay | Quan trọng
   - Danh sách 7 thông báo mẫu
3. Nếu không thấy → Check Console (F12) xem lỗi

### **Test 4: Kiểm tra dropdown**

1. Mở http://localhost:5500/index.html
2. Click icon chuông 🔔 ở góc phải
3. Phải thấy:
   - Dropdown hiện ra
   - 3-5 thông báo gần nhất
   - Link "📋 Xem tất cả thông báo →"
4. Click link → Chuyển sang notifications.html

### **Test 5: Kiểm tra badge**

1. Ở index.html, nhìn icon chuông 🔔
2. Phải thấy badge đỏ [4] hoặc số khác
3. Badge hiển thị số thông báo chưa đọc

---

## 🚀 **HƯỚNG DẪN NHANH**

### **Bước 1: Tạo bảng notifications**
```bash
Double click: tao-bang-notifications.bat
```

### **Bước 2: Khởi động backend**
```bash
cd backend
node server.js
```

### **Bước 3: Test notifications**
```
Mở: http://localhost:5500/notifications.html
```

### **Bước 4: Test dropdown**
```
Mở: http://localhost:5500/index.html
Click icon chuông → Click "Xem tất cả"
```

---

## 🐛 **NẾU VẪN LỖI**

### **Lỗi: "Cannot GET /notifications.html"**

**Nguyên nhân:** File không ở đúng vị trí

**Giải pháp:**
```
Kiểm tra file tồn tại:
d:\ViralWindow_Phan_Mem_Nhom_Kinh\FontEnd\notifications.html

Nếu không có → File đã bị xóa hoặc chưa tạo
→ Báo lại để tôi tạo lại
```

### **Lỗi: "Không có thông báo nào" (dropdown)**

**Nguyên nhân:** API không trả về data

**Giải pháp:**
1. Check backend đang chạy
2. Check Console (F12) xem lỗi API
3. Reload trang → Sẽ hiển thị demo data

### **Lỗi: Badge không hiển thị số**

**Nguyên nhân:** JavaScript chưa load

**Giải pháp:**
1. Hard refresh: Ctrl + F5
2. Clear cache browser
3. Check Console (F12) xem lỗi

### **Lỗi: Link "Xem tất cả" không hoạt động**

**Nguyên nhân:** Dropdown chặn click event

**Giải pháp:** ĐÃ FIX trong code mới
- Link giờ đóng dropdown trước khi navigate
- Có logging để debug
- CSS được cải thiện

---

## 📝 **CHECKLIST**

Trước khi test, đảm bảo:

- [ ] ✅ MySQL đang chạy (XAMPP → Start MySQL)
- [ ] ✅ Backend đang chạy (`node server.js`)
- [ ] ✅ Bảng notifications đã được tạo
- [ ] ✅ File notifications.html tồn tại
- [ ] ✅ Browser đã clear cache

---

## 🎯 **EXPECTED RESULTS**

Sau khi fix, bạn sẽ thấy:

### **1. Trang index.html:**
```
Icon chuông 🔔 [4]  ← Badge đỏ hiển thị số 4
```

### **2. Click icon chuông:**
```
┌────────────────────────────┐
│ Thông báo                  │
├────────────────────────────┤
│ 🏗️ Dự án mới được tạo     │
│ Dự án "Nhà S10"...         │
│ Vừa xong                   │
├────────────────────────────┤
│ ⚠️ Vật tư sắp hết          │
│ Y6501 còn 5 cây...         │
│ 2 giờ trước                │
├────────────────────────────┤
│ 💰 Công nợ quá hạn         │
│ Khách "ABC" nợ 50M...      │
│ 2 ngày trước               │
├────────────────────────────┤
│ 📋 Xem tất cả thông báo →  │ ← Click vào đây
└────────────────────────────┘
```

### **3. Sau khi click "Xem tất cả":**
```
Trang notifications.html mở ra với:
- Header "Thông báo"
- Thống kê: Tổng 7 | Chưa đọc 4
- Danh sách 7 thông báo
- Bộ lọc đầy đủ
```

---

## 📞 **HỖ TRỢ**

Nếu sau khi làm theo hướng dẫn vẫn lỗi:

1. **Chụp screenshot** Console (F12) → Tab Console
2. **Chụp screenshot** Network tab → Xem request nào bị lỗi
3. **Copy log** từ backend terminal
4. **Báo lại** kèm screenshots

---

## 🎉 **KẾT QUẢ MONG ĐỢI**

✅ Icon chuông có badge số  
✅ Click chuông → Dropdown hiện thông báo  
✅ Click "Xem tất cả" → Chuyển sang notifications.html  
✅ Trang notifications.html hiển thị đầy đủ  
✅ Có thể lọc, xóa, đánh dấu đã đọc  

---

## 🚀 **BẮT ĐẦU FIX NGAY**

```bash
# Bước 1: Tạo bảng
Double click: tao-bang-notifications.bat

# Bước 2: Khởi động backend
cd backend
node server.js

# Bước 3: Test
Mở: http://localhost:5500/index.html
Click icon chuông 🔔
Click "Xem tất cả" →
```

**Nếu vẫn lỗi, báo lại để tôi debug tiếp!** 🔧





