# Đánh giá Hiện trạng Status ENUM - ViralWindow

## 📋 Tổng quan

Hệ thống đang có nhiều bảng sử dụng ENUM cho trạng thái, nhưng không đồng nhất về naming convention và giá trị. Tài liệu này mô tả hiện trạng và đề xuất chuẩn hóa.

## ⚠️ CẢNH BÁO

**KHÔNG SỬA TRỰC TIẾP DATABASE ENUM KHI CHƯA:**
1. Backup database
2. Test trên môi trường staging
3. Cập nhật tất cả code phụ thuộc

---

## 📊 HIỆN TRẠNG CÁC ENUM

### 1. Bảng `projects`

**Cột `status`:**
```sql
ENUM('new','preparing','manufacturing','installing','completed','cancelled','warranty','in_progress')
```

**Vấn đề:**
- `new` và `in_progress` có thể trùng ý nghĩa
- Thiếu `pending`, `on_hold`
- Tên không đồng nhất (snake_case vs single word)

**Đề xuất chuẩn hóa:**
```sql
ENUM('pending','preparing','manufacturing','installing','completed','cancelled','warranty')
```

---

### 2. Bảng `quotations`

**Cột `status`:**
```sql
ENUM('draft','pending','approved','rejected','cancelled','sent','quoted','ordered')
```

**Vấn đề:**
- `quoted` và `draft` có thể trùng
- `ordered` không rõ ràng (đã đặt hàng cho ai?)

**Đề xuất:**
- Giữ nguyên, chỉ document rõ nghĩa của từng status

---

### 3. Bảng `stock_documents`

**Cột `status`:**
```sql
ENUM('draft','approved','rejected','cancelled')
```

**Đánh giá:** ✅ Tốt, đơn giản và rõ ràng

---

### 4. Bảng `material_requests`

**Cột `status`:**
```sql
ENUM('pending','approved','rejected','partially_fulfilled','fulfilled','cancelled')
```

**Đánh giá:** ✅ Tốt, đầy đủ workflow

---

### 5. Bảng `financial_transactions`

**Cột `status`:**
```sql
ENUM('draft','posted','cancelled')
```

**Đánh giá:** ✅ Tốt cho giao dịch tài chính

---

## 🔄 MAPPING GIỮA CÁC BẢNG

| Giai đoạn | projects | quotations | stock_documents |
|-----------|----------|------------|-----------------|
| Mới tạo | `new` | `draft` | `draft` |
| Chờ duyệt | `pending`* | `pending` | - |
| Đã duyệt | `preparing` | `approved` | `approved` |
| Đang xử lý | `manufacturing` | - | - |
| Hoàn thành | `completed` | - | - |
| Hủy | `cancelled` | `cancelled` | `cancelled` |

*Hiện chưa có `pending` trong projects

---

## 📝 KẾ HOẠCH CHUẨN HÓA

### Phase 1: Document (Hoàn thành)
- [x] Liệt kê tất cả ENUM
- [x] Xác định vấn đề
- [x] Đề xuất chuẩn hóa

### Phase 2: Chuẩn bị (Cần thực hiện)
- [ ] Backup database
- [ ] Tạo migration scripts
- [ ] Update code sử dụng ENUM

### Phase 3: Migration (Cẩn thận)
- [ ] Test trên staging
- [ ] Chạy migration
- [ ] Verify data

---

## 🛠️ SQL MIGRATION TEMPLATE

```sql
-- BACKUP TRƯỚC KHI CHẠY!
-- ALTER TABLE projects 
-- MODIFY COLUMN status ENUM('pending','preparing','manufacturing','installing','completed','cancelled','warranty') 
-- NOT NULL DEFAULT 'pending';

-- Cập nhật dữ liệu cũ
-- UPDATE projects SET status = 'pending' WHERE status = 'new';
-- UPDATE projects SET status = 'manufacturing' WHERE status = 'in_progress';
```

---

## ✅ NGUYÊN TẮC ĐỒNG BỘ

1. **Frontend hiển thị:** Map ENUM value → Label tiếng Việt
2. **Backend validation:** Kiểm tra giá trị trong allowed list
3. **Database constraint:** ENUM tự validate

### Ví dụ Frontend Mapping:

```javascript
const PROJECT_STATUS_LABELS = {
    'pending': 'Chờ xử lý',
    'preparing': 'Đang chuẩn bị',
    'manufacturing': 'Đang sản xuất',
    'installing': 'Đang lắp đặt',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'warranty': 'Bảo hành'
};
```

---
*Last updated: 2026-01-22*
*Status: REVIEW - Chưa thực hiện migration*
