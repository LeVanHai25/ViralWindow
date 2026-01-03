# API MOCK SERVER

## Cài đặt

```bash
npm install express cors
```

## Chạy server

```bash
node api/mock-api.js
```

Server sẽ chạy tại: http://localhost:3000

## Các Endpoints

### 1. GET /api/aluminum-systems
Lấy danh sách hệ nhôm

### 2. GET /api/accessories
Lấy danh sách phụ kiện
- Query params: `search`, `category`

### 3. GET /api/projects
Lấy danh sách dự án
- Query params: `status`, `progress`, `search`

### 4. POST /api/calculate-bom
Tính toán BOM
- Body: `{ doorType, width, height, panels, aluminumSystemId }`

### 5. POST /api/optimize-cutting
Tối ưu cắt nhôm
- Body: `{ bomItems }`

### 6. GET /api/kpi-summary
Lấy thống kê tổng quan

## Sử dụng trong Frontend

```javascript
// Fetch projects
fetch('http://localhost:3000/api/projects?status=approved&progress=50-75')
    .then(res => res.json())
    .then(data => console.log(data));

// Calculate BOM
fetch('http://localhost:3000/api/calculate-bom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        doorType: 'swing',
        width: 1200,
        height: 2100,
        panels: 1,
        aluminumSystemId: 1
    })
})
.then(res => res.json())
.then(data => console.log(data));
```






