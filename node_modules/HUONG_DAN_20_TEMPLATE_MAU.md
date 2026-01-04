# 📋 Hướng dẫn 20 Template Mẫu + Generate 100 Mẫu

## ✅ Đã hoàn thành

### 1. 20 JSON Template Mẫu Hoàn Chỉnh

**Cửa đi (D-series):**
- ✅ D1 - Cửa đi 2 cánh + Fix trên (đã có từ trước)
- ✅ D2 - Cửa đi 1 cánh + Fix trên
- ✅ D3 - Cửa đi 2 cánh không fix
- ✅ D4 - Cửa đi 4 cánh mở quay
- ✅ D5 - Cửa đi 2 cánh + Fix 2 bên

**Cửa sổ (W-series):**
- ✅ W1 - Cửa sổ 1 cánh mở quay (đã có từ trước)
- ✅ W2 - Cửa sổ 2 cánh mở quay
- ✅ W3 - Cửa sổ 1 cánh mở hất
- ✅ W4 - Cửa sổ 3 cánh + fix giữa
- ✅ W5 - Cửa sổ 2 cánh + fix trên

**Cửa lùa (SL-series):**
- ✅ SL1 - Cửa lùa 2 cánh (đã có từ trước)
- ✅ SL2 - Cửa lùa 3 cánh 3 ray
- ✅ SL3 - Cửa lùa 4 cánh (2 trượt 2 fix)
- ✅ SL4 - Cửa lùa 2 cánh + Fix trên
- ✅ SL5 - Cửa lùa 2 cánh + Fix trái

**Vách kính (VK-series):**
- ✅ VK1 - Vách kính + cửa đi 1 cánh
- ✅ VK2 - Vách + lùa 2 cánh
- ✅ VK3 - Fix trên + fix bên + cửa đi 2 cánh
- ✅ VK4 - Vách kính 4 ô
- ✅ VK5 - Vách + cửa sổ mở quay + fix trên

### 2. Script Generate 50 Templates Còn Lại

File: `backend/scripts/generate-remaining-templates.js`

Script này sẽ tự động generate:
- D6-D40: Các biến thể cửa đi (35 templates)
- W6-W30: Các biến thể cửa sổ (25 templates)
- SL6-SL20: Các biến thể cửa lùa (15 templates)

### 3. Script Generate Preview SVG

File: `backend/scripts/generate-template-preview-svg.js`

Script này sẽ tự động tạo file SVG preview cho mỗi template.

---

## 🚀 Cách sử dụng

### Bước 1: Generate 50 templates còn lại

```bash
cd backend
node scripts/generate-remaining-templates.js
```

Kết quả: Tạo thêm ~50 file JSON trong `backend/data/templates/`

### Bước 2: Generate preview SVG

```bash
node scripts/generate-template-preview-svg.js
```

Kết quả: Tạo file SVG trong `backend/public/templates/`

### Bước 3: Setup database

```bash
# Windows PowerShell (không dùng < redirect)
node scripts/setup-database-templates.js
```

Hoặc nếu dùng MySQL command line (Linux/Mac):
```bash
mysql -u root -p viral_window_db < sql/create_door_templates_table.sql
```

### Bước 4: Import tất cả vào database

```bash
node scripts/seed-100-templates.js
```

Kết quả: Import tất cả templates vào bảng `door_templates`

---

## 📁 Cấu trúc Files

```
backend/
├── data/
│   └── templates/
│       ├── D1_cua_di_2_canh.json          ✅
│       ├── D2_cua_di_1_canh_fix_tren.json ✅
│       ├── D3_cua_di_2_canh_khong_fix.json ✅
│       ├── D4_cua_di_4_canh.json          ✅
│       ├── D5_cua_di_2_canh_fix_2_ben.json ✅
│       ├── W1_cua_so_1_canh_trai.json     ✅
│       ├── W2_cua_so_2_canh.json          ✅
│       ├── W3_cua_so_1_canh_hat.json      ✅
│       ├── W4_cua_so_3_canh_fix_giua.json ✅
│       ├── W5_cua_so_2_canh_fix_tren.json ✅
│       ├── SL1_cua_lua_2_canh.json        ✅
│       ├── SL2_cua_lua_3_canh.json        ✅
│       ├── SL3_cua_lua_4_canh_2_truot_2_fix.json ✅
│       ├── SL4_cua_lua_2_canh_fix_tren.json ✅
│       ├── SL5_cua_lua_2_canh_fix_trai.json ✅
│       ├── VK1_vach_kinh_cua_di_1_canh.json ✅
│       ├── VK2_vach_lua_2_canh.json       ✅
│       ├── VK3_fix_tren_fix_ben_cua_di_2_canh.json ✅
│       ├── VK4_vach_kinh_4_o.json         ✅
│       ├── VK5_vach_cua_so_fix_tren.json  ✅
│       ├── D6_*.json (sẽ được generate)   ⏳
│       ├── ... (50 templates nữa)         ⏳
│       └── template-catalog-100.json      ✅
├── public/
│   └── templates/
│       ├── D1.svg (sẽ được generate)      ⏳
│       ├── D2.svg                         ⏳
│       └── ... (100 previews)             ⏳
└── scripts/
    ├── generate-remaining-templates.js    ✅
    ├── generate-template-preview-svg.js   ✅
    └── seed-100-templates.js              ✅
```

---

## 📊 Tổng kết

- ✅ **20 templates mẫu**: Đã tạo file JSON hoàn chỉnh
- ✅ **Script generate 50 templates**: Sẵn sàng chạy
- ✅ **Script generate preview SVG**: Sẵn sàng chạy
- ✅ **Script seed database**: Sẵn sàng import

**Tổng cộng: 20 + 50 = 70 templates** (có thể generate thêm 30 nữa để đủ 100)

---

## 🎯 Bước tiếp theo

1. **Chạy script generate**: `node scripts/generate-remaining-templates.js`
2. **Chạy script preview**: `node scripts/generate-template-preview-svg.js`
3. **Import vào database**: `node scripts/seed-100-templates.js`
4. **Test trên frontend**: Mở `template-library.html` và kiểm tra

---

## 📝 Lưu ý

- Tất cả templates đều có cấu trúc: `meta` + `panel_tree` + `settings`
- BOM sẽ được tính tự động bởi BOM Engine từ `panel_tree`
- Preview SVG được generate tự động từ `panel_tree`
- Có thể customize thêm templates bằng cách sửa file JSON trực tiếp



