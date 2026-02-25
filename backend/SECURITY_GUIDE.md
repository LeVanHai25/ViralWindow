# Hướng dẫn Bảo mật API - ViralWindow

## 📋 Tổng quan

Hiện tại nhiều routes chưa được bảo vệ bởi authentication. Tài liệu này hướng dẫn cách thêm auth cho các routes quan trọng.

## ⚠️ CÁC ROUTES CẦN BẢO VỆ KHẨN CẤP

### Mức độ CRITICAL (Xử lý dữ liệu nhạy cảm)

| Route File | Routes Cần Bảo Vệ | Middleware |
|------------|-------------------|------------|
| `financial.js` | ALL | `authenticateToken` |
| `debts.js` | ALL | `authenticateToken` |
| `quotations.js` | POST, PUT, DELETE | `authenticateToken` |
| `inventory.js` | POST, PUT, DELETE | `authenticateToken` |
| `customers.js` | POST, PUT, DELETE | `authenticateToken` |
| `projects.js` | POST, PUT, DELETE | `authenticateToken` |

### Mức độ HIGH (Dữ liệu quan trọng)

| Route File | Routes Cần Bảo Vệ | Middleware |
|------------|-------------------|------------|
| `inventory-out.js` | ALL | `authenticateToken` |
| `inventory-in.js` | ALL | `authenticateToken` |
| `purchase-requests.js` | POST, PUT, DELETE | `authenticateToken` |
| `warehouse-export.js` | POST, PUT, DELETE | `authenticateToken` |

## 🔧 CÁCH THÊM AUTHENTICATION

### 1. Import middleware trong route file

```javascript
// Ở đầu file route
const { authenticateToken, requireAdmin } = require('../middleware/auth');
```

### 2. Thêm middleware vào route

**Cách 1: Bảo vệ một route cụ thể**
```javascript
// Trước
router.delete('/:id', controller.delete);

// Sau
router.delete('/:id', authenticateToken, controller.delete);
```

**Cách 2: Bảo vệ nhiều routes**
```javascript
// Bảo vệ tất cả routes trong router
router.use(authenticateToken);

// Hoặc bảo vệ chỉ các routes sửa đổi dữ liệu
router.post('/', authenticateToken, controller.create);
router.put('/:id', authenticateToken, controller.update);
router.delete('/:id', authenticateToken, requireAdmin, controller.delete);
```

### 3. Yêu cầu quyền Admin cho các thao tác nguy hiểm

```javascript
// Delete chỉ admin mới được thực hiện
router.delete('/:id', authenticateToken, requireAdmin, controller.delete);
```

## 📝 VÍ DỤ HOÀN CHỈNH

File: `routes/financial.js`

```javascript
const express = require('express');
const router = express.Router();
const financialCtrl = require('../controllers/financialController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Tất cả routes financial cần auth
router.use(authenticateToken);

// GET - Xem thông tin tài chính
router.get('/summary', financialCtrl.getSummary);
router.get('/transactions', financialCtrl.getTransactions);

// POST/PUT - Thêm/sửa giao dịch
router.post('/transactions', financialCtrl.createTransaction);
router.put('/transactions/:id', financialCtrl.updateTransaction);

// DELETE - Chỉ admin
router.delete('/transactions/:id', requireAdmin, financialCtrl.deleteTransaction);

module.exports = router;
```

## ⏱️ LỘ TRÌNH TRIỂN KHAI

### Phase 1 (Ngay lập tức)
- [ ] `financial.js` - Tài chính
- [ ] `debts.js` - Công nợ

### Phase 2 (Tuần tới)
- [ ] `quotations.js` - Báo giá (POST, PUT, DELETE)
- [ ] `customers.js` - Khách hàng (POST, PUT, DELETE)
- [ ] `projects.js` - Dự án (POST, PUT, DELETE)

### Phase 3 (2 tuần)
- [ ] `inventory-out.js` - Xuất kho
- [ ] `inventory-in.js` - Nhập kho
- [ ] `purchase-requests.js` - Yêu cầu mua hàng

## 🧪 TESTING SAU KHI THÊM AUTH

1. Test không có token → Expected: 401 Unauthorized
2. Test với token hết hạn → Expected: 403 Forbidden
3. Test với token hợp lệ → Expected: 200 OK
4. Test route admin với user thường → Expected: 403 Forbidden

## 💡 NOTES

- **Không break frontend**: Đảm bảo frontend gửi token trong header
- **Graceful fallback**: Sử dụng `optionalAuth` cho routes cần xem public
- **Logging**: Log các request không có token để debug

---
*Last updated: 2026-01-22*
