# 🔧 Hướng dẫn sửa lỗi API endpoint /api/projects/:id/detail

## ✅ Đã hoàn thành

1. ✅ **Endpoint đã được tạo** trong `backend/controllers/projectController.js`:
   - Function: `exports.getDetail`
   - Route: `GET /api/projects/:id/detail`

2. ✅ **Route đã được đăng ký** trong `backend/routes/projects.js`:
   - Dòng 19: `router.get("/:id/detail", projectCtrl.getDetail);`
   - Route được đặt trước `/:id` để tránh conflict

3. ✅ **File frontend đã được sửa**:
   - Encoding UTF-8 đã đúng
   - Menu sidebar đầy đủ
   - Code gọi API đã đúng

## 🚀 Cần làm ngay: RESTART SERVER

Endpoint đã có trong code nhưng **server cần được restart** để endpoint mới có hiệu lực.

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```powershell
cd backend
.\start-server.ps1
```

Hoặc:

```cmd
cd backend
start-server.bat
```

### Cách 2: Restart thủ công

1. **Dừng server hiện tại:**
   - Nhấn `Ctrl + C` trong terminal đang chạy server
   - Hoặc kill process:
     ```powershell
     Get-Process node | Stop-Process -Force
     ```

2. **Khởi động lại server:**
   ```powershell
   cd backend
   node server.js
   ```

3. **Kiểm tra log:**
   Khi server khởi động, bạn sẽ thấy:
   ```
   🔥 API Server đang chạy tại http://localhost:3001
   📡 Các endpoints:
      ...
      ✅ GET  /api/projects/:id/detail
   ```

## 🧪 Test endpoint

Sau khi restart server, test endpoint bằng cách:

### Cách 1: Dùng browser
Mở: `http://localhost:3001/api/projects/5/detail`

### Cách 2: Dùng test script
```powershell
cd backend
node test-project-detail-endpoint.js
```

### Cách 3: Dùng curl (nếu có)
```bash
curl http://localhost:3001/api/projects/5/detail
```

## 📋 Endpoint trả về gì?

Endpoint `/api/projects/:id/detail` trả về:

```json
{
  "success": true,
  "data": {
    "project": {
      "id": 5,
      "project_code": "...",
      "project_name": "...",
      "customer_name": "...",
      ...
      "quotation": {
        "quotation_code": "..."
      }
    },
    "products": [
      {
        "code": "...",
        "name": "...",
        "width": 1200,
        "height": 2200,
        "quantity": 1,
        "unit_price": 1000000,
        "total_price": 1000000
      }
    ],
    "materials": [
      {
        "material_type": "aluminum",
        "material_name": "...",
        "quantity": 10,
        "unit": "kg",
        "unit_price": 90000,
        "total_cost": 900000
      }
    ],
    "financial": {
      "quotation_total": 50000000,
      "materials_total": 10000000,
      "net_total": 40000000
    },
    "timeline": {
      "created_at": "2025-01-01T00:00:00.000Z",
      "start_date": "...",
      "deadline": "...",
      "quotation_date": "...",
      "design_date": "...",
      "bom_date": "...",
      "production_date": "...",
      "moved_to_installation_at": "...",
      "handover_date": "..."
    }
  }
}
```

## ⚠️ Lưu ý

1. **Server phải được restart** sau khi thêm endpoint mới
2. **Kiểm tra port 3001** có đang bị chiếm không
3. **Kiểm tra database** có dữ liệu project với id=5 không
4. **Kiểm tra console** xem có lỗi gì không

## 🔍 Troubleshooting

### Lỗi 404 vẫn còn sau khi restart?

1. Kiểm tra server có chạy không:
   ```powershell
   Get-NetTCPConnection -LocalPort 3001
   ```

2. Kiểm tra log server có hiển thị endpoint không:
   - Tìm dòng: `✅ GET  /api/projects/:id/detail`

3. Kiểm tra route có đúng không:
   - Mở `backend/routes/projects.js`
   - Xem dòng 19 có: `router.get("/:id/detail", projectCtrl.getDetail);`

4. Kiểm tra controller có function không:
   - Mở `backend/controllers/projectController.js`
   - Xem dòng 86 có: `exports.getDetail = async (req, res) => {`

### Lỗi 500 (Internal Server Error)?

- Kiểm tra database connection
- Kiểm tra console log của server để xem lỗi cụ thể
- Kiểm tra các bảng: `projects`, `quotations`, `quotation_items`, `project_materials`, `door_designs` có tồn tại không

## ✅ Sau khi fix xong

1. Refresh trang `project-detail.html?id=5`
2. Kiểm tra console không còn lỗi 404
3. Dữ liệu project detail hiển thị đầy đủ

