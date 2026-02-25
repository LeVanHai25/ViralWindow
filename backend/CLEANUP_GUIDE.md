# Hướng dẫn Cleanup Code Thừa - ViralWindow

## 📋 Tổng quan

Tài liệu này liệt kê các files có thể không còn cần thiết hoặc nên được tổ chức lại.

## ⚠️ QUAN TRỌNG

**KHÔNG XÓA FILE MÀ CHƯA:**
1. Backup file/folder
2. Kiểm tra không có references
3. Test hệ thống sau khi xóa

---

## 🗂️ FILES CẦN XEM XÉT

### Frontend - Backup/Old Files

| File | Mô tả | Khuyến nghị |
|------|-------|-------------|
| `FontEnd/index-backup.html` | Backup của index.html | Xóa nếu không dùng |
| `FontEnd/door-editor-old.html` | Phiên bản cũ door editor | Xóa nếu có bản mới |
| `FontEnd/design_old.html` | Phiên bản cũ design page | Xóa nếu có bản mới |

### Backend - One-time Scripts (root folder)

Các files này nằm ở root của `/backend` nhưng có thể di chuyển vào `/backend/scripts/archive`:

| File | Mục đích | Khuyến nghị |
|------|----------|-------------|
| `add_deposit_paid.js` | Migration một lần | Archive |
| `add_quotation_columns.js` | Migration một lần | Archive |
| `add_revision_count.js` | Migration một lần | Archive |
| `add-excel-columns.js` | Migration một lần | Archive |
| `add-more-agencies.js` | Migration một lần | Archive |
| `check_items.js` | Debug script | Archive |
| `check_project_status.js` | Debug script | Archive |
| `check-projects.js` | Debug script | Archive |
| `check-schema.js` | Utility (có thể giữ) | Review |
| `debug_status.js` | Debug script | Archive |
| `debug-material-status.js` | Debug script | Archive |
| `fix_enum_status.js` | Fix một lần | Archive |
| `fix_project_agency.js` | Fix một lần | Archive |
| `fix_project_status.js` | Fix một lần | Archive |
| `fix_project1.js` | Fix một lần | Archive |
| `fix_q19.js` | Fix một lần | Archive |
| `fix_quotation_status.js` | Fix một lần | Archive |
| `fix_quotations.js` | Fix một lần | Archive |
| `fix-material-enum.js` | Fix một lần | Archive |
| `analyze_excel.js` | Utility | Archive |
| `read-excel-detailed.js` | Utility | Archive |
| `read-orders-detail.js` | Utility | Archive |
| `read-t11-sheet.js` | Utility | Archive |

### Backend - Migration Runners

| File | Khuyến nghị |
|------|-------------|
| `run_migration.js` | Di chuyển vào scripts/ |
| `run_reset_products.js` | Di chuyển vào scripts/ |
| `run-agencies-migration.js` | Di chuyển vào scripts/ |
| `run-glass-migration.js` | Di chuyển vào scripts/ |
| `run-production-excel-migration.js` | Di chuyển vào scripts/ |
| `run-units-migration.js` | Di chuyển vào scripts/ |

### Backend - Test Files

| File | Khuyến nghị |
|------|-------------|
| `test-check-export-api.js` | Di chuyển vào scripts/ hoặc test/ |
| `test-mysql-connection.js` | Giữ lại (useful) |
| `test-project-detail-endpoint.js` | Di chuyển vào scripts/ |

---

## 📁 CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```
backend/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── sql/
│   └── migrations/
├── scripts/
│   ├── archive/         # Scripts một lần đã chạy
│   ├── migrations/      # Migration runners
│   └── utils/           # Utility scripts
├── uploads/
├── server.js
└── package.json
```

---

## 🛠️ SCRIPT TỔ CHỨC LẠI FILES

```powershell
# Tạo thư mục archive
mkdir backend/scripts/archive

# Di chuyển fix scripts
Move-Item backend/fix_*.js backend/scripts/archive/
Move-Item backend/fix-*.js backend/scripts/archive/

# Di chuyển debug scripts
Move-Item backend/debug_*.js backend/scripts/archive/
Move-Item backend/debug-*.js backend/scripts/archive/

# Di chuyển check scripts
Move-Item backend/check_*.js backend/scripts/archive/
Move-Item backend/check-*.js backend/scripts/archive/

# Di chuyển add scripts
Move-Item backend/add_*.js backend/scripts/archive/
Move-Item backend/add-*.js backend/scripts/archive/
```

---

## ✅ CHECKLIST TRƯỚC KHI CLEANUP

- [ ] Backup toàn bộ project
- [ ] Chạy `grep -r "filename"` để check references
- [ ] Test hệ thống sau mỗi batch cleanup
- [ ] Giữ git history (đừng dùng `git rm --cached`)

---

## 🔄 DEPRECATED ROUTES/CODE

Từ `server.js`:
```javascript
// Project doors (Door Catalog integration) - DEPRECATED
app.use("/api/projects", projectDoorRoutes);

// Units (Đơn vị/Chi nhánh) - DEPRECATED: use agencies instead
app.use("/api/units", unitRoutes);
```

**Xem xét:**
- Loại bỏ `projectDoorRoutes` nếu không còn frontend nào sử dụng
- Loại bỏ `/api/units` nếu đã migrate hoàn toàn sang `/api/agencies`

---
*Last updated: 2026-01-22*
*Status: REVIEW - Team cần quyết định files nào cần cleanup*
