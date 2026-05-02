# CHƯƠNG 1: TỔNG QUAN VỀ CÔNG NGHỆ SỬ DỤNG VÀ MÔI TRƯỜNG TRIỂN KHAI

## 1.1 Giới thiệu chung

Hệ thống Quản lý Dự án Cửa Nhôm Kính ViralWindow là một ứng dụng Web hiện đại được phát triển nhằm hỗ trợ toàn bộ quy trình quản lý kinh doanh từ khâu quoting (báo giá) đến sản xuất, giao hàng và theo dõi tài chính cho các công ty chuyên sản xuất cửa nhôm kính. Dự án được xây dựng dựa trên kiến trúc Client-Server với các công nghệ hiện đại nhằm đảm bảo hiệu suất, bảo mật và khả năng mở rộng.

Hệ thống bao gồm ba tầng chính:
- **Tầng Presentation (Frontend):** HTML5, CSS3, JavaScript Vanilla
- **Tầng Business Logic (Backend):** Node.js + Express.js
- **Tầng Data (Database):** MySQL 8.0+

## 1.2 Giới thiệu về HTML5, CSS3 và JavaScript

### 1.2.1 Tổng quan về công nghệ Frontend

Tầng Presentation (Frontend) của hệ thống ViralWindow được xây dựng trên nền tảng HTML5, CSS3 và JavaScript ES6+. Đây là ba công nghệ cốt lõi của web development hiện đại, cho phép xây dựng giao diện người dùng tương tác cao, đáp ứng tốt trên các thiết bị khác nhau.

### 1.2.2 HTML5 – Cấu trúc và ngữ nghĩa web

**Định nghĩa và lịch sử phát triển:**

HTML5 là phiên bản thứ năm của ngôn ngữ đánh dấu siêu văn bản (HyperText Markup Language), được W3C (World Wide Web Consortium) chính thức công bố vào năm 2014. Nó đã thay thế các phiên bản cũ như XHTML 1.0 và HTML 4.01, mang đến các cải tiến đáng kể về khả năng xây dựng ứng dụng web phức tạp.

**Vai trò và ứng dụng trong hệ thống:**

HTML5 đóng vai trò là khung cấu trúc (skeleton) của tất cả các trang giao diện người dùng trong ViralWindow. Nó cung cấp:

1. **Cấu trúc ngữ nghĩa (Semantic Structure):** 
   - Sử dụng các thẻ semantic như `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>` 
   - Giúp code dễ đọc, dễ bảo trì, và tốt cho SEO
   - Hỗ trợ công cụ trợ năng (accessibility tools) cho người dùng

2. **Quản lý biểu mẫu (Form Management):**
   - Các input types: `text`, `email`, `password`, `date`, `number`, `file`
   - Validation tích hợp HTML5: `required`, `pattern`, `min`, `max`
   - Xử lý upload file thông qua `<input type="file">`

3. **Canvas API – Vẽ đồ họa 2D:**
   - Module Door Editor (thiết kế cửa nhôm kính) sử dụng Canvas API
   - Cho phép vẽ các hình dạng, đường thẳng, chữ văn bản
   - Hỗ trợ tương tác chuột (click, drag, scroll) để điều chỉnh thiết kế
   - Xuất hình ảnh dưới dạng PNG/JPEG

4. **Local Storage & Session Storage:**
   - Lưu trữ dữ liệu tạm thời phía client (user preferences, draft quotations)
   - Giảm tải cho server, cải thiện tốc độ ứng dụng
   - Dữ liệu không mất khi refresh trang

**Các trang HTML5 chính trong hệ thống:**

| Trang HTML | Mô tả | Công dụng |
|-----------|-------|----------|
| `index.html` | Dashboard chính | Hiển thị tổng quan doanh số, dự án đang chạy |
| `login.html` | Đăng nhập | Xác thực người dùng |
| `projects.html` | Quản lý dự án | CRUD dự án (Create, Read, Update, Delete) |
| `quotation-new.html` | Tạo báo giá | Tạo và quản lý báo giá |
| `door-editor.html` | Thiết kế cửa | Canvas-based door design tool |
| `inventory.html` | Quản lý kho | Theo dõi vật tư, phụ kiện, thành phẩm |
| `reports.html` | Báo cáo tổng hợp | Hiển thị các biểu đồ và báo cáo kinh doanh |
| `finance-dashboard.html` | Dashboard tài chính | Quản lý doanh số, công nợ, chi phí |

### 1.2.3 CSS3 – Styling và Responsive Design

**Định nghĩa và đặc điểm:**

CSS3 (Cascading Style Sheets Level 3) là phiên bản nâng cấp của CSS, được W3C công bố dần dần từ năm 2011. Nó giới thiệu các tính năng mới như Flexbox, CSS Grid, Transitions, Animations, và được tối ưu hóa cho responsive design trên nhiều thiết bị khác nhau.

**Ứng dụng trong hệ thống ViralWindow:**

1. **Responsive Design (Thiết kế đáp ứng):**
   - Giao diện tự động thích ứng với kích thước màn hình (desktop, tablet, mobile)
   - Sử dụng Media Queries để định nghĩa breakpoints:
   ```css
   /* Desktop: >= 1200px */
   @media (min-width: 1200px) {
     .container { width: 1200px; }
   }
   
   /* Tablet: 768px - 1199px */
   @media (max-width: 1199px) and (min-width: 768px) {
     .container { width: 90%; }
   }
   
   /* Mobile: < 768px */
   @media (max-width: 767px) {
     .container { width: 100%; }
   }
   ```

2. **Flexbox Layout – Bố cục linh hoạt:**
   - Sắp xếp các phần tử (header, sidebar, content) một cách dễ dàng
   - Căn chỉnh (alignment) và phân phối (distribution) không gian
   ```css
   .dashboard {
     display: flex;
     flex-direction: row;
     gap: 20px;
   }
   
   .sidebar { flex: 0 0 250px; }
   .main-content { flex: 1; }
   ```

3. **CSS Grid – Bố cục dạng lưới:**
   - Tạo các bảng biểu, danh sách dữ liệu
   - Sắp xếp các card thành hàng/cột tự động
   ```css
   .data-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
     gap: 20px;
   }
   ```

4. **Transitions & Animations – Hiệu ứng mượt mà:**
   - Hover effects: nút bấm có màu sắc thay đổi khi di chuột
   - Loading animations: vòng quay (spinner) khi tải dữ liệu
   ```css
   .button {
     background-color: #007bff;
     transition: all 0.3s ease;
   }
   
   .button:hover {
     background-color: #0056b3;
     transform: translateY(-2px);
     box-shadow: 0 4px 8px rgba(0,0,0,0.2);
   }
   
   @keyframes spin {
     0% { transform: rotate(0deg); }
     100% { transform: rotate(360deg); }
   }
   
   .spinner {
     animation: spin 1s linear infinite;
   }
   ```

5. **CSS Custom Properties (Biến CSS):**
   - Quản lý tập trung màu sắc, kích thước font, spacing
   - Dễ dàng thay đổi theme (dark mode, light mode)
   ```css
   :root {
     --primary-color: #007bff;
     --secondary-color: #6c757d;
     --success-color: #28a745;
     --danger-color: #dc3545;
     --spacing-unit: 8px;
     --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
   }
   
   .btn-primary {
     background-color: var(--primary-color);
     padding: calc(var(--spacing-unit) * 2);
   }
   ```

**Các file CSS chính:**

| File | Mô tả |
|------|-------|
| `css/styles.css` | Stylesheet chính (reset, layout, typography) |
| `css/finance-styles.css` | Style riêng cho module tài chính |
| `css/responsive.css` | Media queries cho responsive design |
| Inline styles | Styles động được inject bởi JavaScript |

### 1.2.4 JavaScript ES6+ – Tương tác và xử lý logic

**Định nghĩa:**

JavaScript là ngôn ngữ lập trình phía client (client-side scripting language) công khai năm 1995, được ECMAScript (ECMA-262) tiêu chuẩn hóa. ES6 (ECMAScript 2015) đạo được công bố vào năm 2015, giới thiệu nhiều tính năng mới làm cho JavaScript trở nên mạnh mẽ hơn và dễ sử dụng hơn.

**Vai trò trong hệ thống:**

1. **Xử lý sự kiện người dùng (Event Handling):**
   ```javascript
   // Sự kiện click trên nút tạo dự án
   document.getElementById('btnCreateProject').addEventListener('click', async (e) => {
     e.preventDefault();
     const projectName = document.getElementById('projectName').value;
     
     // Gửi request tới backend
     const response = await fetch('/api/projects', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ name: projectName })
     });
     
     if (response.ok) {
       alert('Dự án được tạo thành công!');
       location.reload(); // Refresh trang
     }
   });
   ```

2. **Async/Await – Xử lý bất đồng bộ:**
   - Gọi API tới backend mà không block giao diện
   - Dữ liệu trả về được xử lý mà không cần callback hell
   ```javascript
   async function loadQuotations() {
     try {
       const response = await fetch('/api/quotations');
       const quotations = await response.json();
       renderQuotationTable(quotations);
     } catch (error) {
       console.error('Lỗi tải báo giá:', error);
       showErrorMessage('Không thể tải dữ liệu');
     }
   }
   ```

3. **DOM Manipulation – Thao tác với HTML:**
   ```javascript
   // Thêm hàng mới vào bảng
   const newRow = document.createElement('tr');
   newRow.innerHTML = `
     <td>${project.id}</td>
     <td>${project.name}</td>
     <td>${project.customer}</td>
     <td>${project.status}</td>
   `;
   document.getElementById('projectTable').appendChild(newRow);
   
   // Cập nhật màu sắc dựa trên trạng thái
   if (project.status === 'completed') {
     newRow.classList.add('completed');
   }
   ```

4. **Fetch API – Giao tiếp với server:**
   ```javascript
   // GET request
   const projects = await fetch('/api/projects?page=1&limit=10').then(r => r.json());
   
   // POST request
   await fetch('/api/quotations', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(quotationData)
   });
   
   // Error handling
   fetch('/api/projects')
     .then(res => {
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       return res.json();
     })
     .catch(err => console.error('API Error:', err));
   ```

5. **Canvas API – Vẽ đồ họa 2D (Door Designer):**
   ```javascript
   const canvas = document.getElementById('doorCanvas');
   const ctx = canvas.getContext('2d');
   
   // Vẽ hình chữ nhật (frame cửa)
   ctx.strokeStyle = '#333';
   ctx.lineWidth = 2;
   ctx.strokeRect(10, 10, 300, 500);
   
   // Vẽ text
   ctx.fillStyle = '#000';
   ctx.font = '14px Arial';
   ctx.fillText('W: 1000mm H: 2000mm', 20, 30);
   
   // Lắng nghe sự kiện chuột
   canvas.addEventListener('mousemove', (e) => {
     const rect = canvas.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     updateDoorDesign(x, y);
   });
   ```

6. **Local Storage – Lưu dữ liệu phía client:**
   ```javascript
   // Lưu draft quotation
   const draftQuotation = {
     id: 'QT-2025-001',
     items: [...],
     total: 50000000
   };
   localStorage.setItem('draftQuotation', JSON.stringify(draftQuotation));
   
   // Lấy draft khi load trang
   const saved = localStorage.getItem('draftQuotation');
   if (saved) {
     const draft = JSON.parse(saved);
     loadDraftData(draft);
   }
   ```

**Các mẫu JavaScript chính:**

| Module | Mô tả |
|--------|-------|
| `js/main.js` | Logic khởi tạo ứng dụng, routing trang |
| `js/auth.js` | Xử lý đăng nhập/đăng xuất, JWT token |
| `js/api-client.js` | Wrapper function gọi API (GET, POST, PUT, DELETE) |
| `js/dashboard.js` | Logic cho trang Dashboard |
| `js/quotation-handler.js` | Xử lý tạo, sửa, xóa báo giá |
| `js/door-editor-engine.js` | Canvas engine để thiết kế cửa |
| `js/inventory-manager.js` | Quản lý kho vật tư |
| `components/*.js` | Các component tái sử dụng (modal, form, grid) |

**Phiên bản JavaScript:**

Hệ thống sử dụng **ES6+ (ECMAScript 2015+)** với các tính năng:
- Classes, Arrow functions, Template literals
- Destructuring, Spread operator
- Async/Await, Promises
- Modules (ES6 modules)

## 1.3 Giới thiệu về Node.js và Express.js

### 1.3.1 Tổng quan về Backend

Tầng Business Logic (Backend) của ViralWindow được xây dựng trên nền tảng Node.js kết hợp với Express.js Framework. Đây là một trong những stack phổ biến nhất cho việc xây dựng web applications hiệu suất cao, có khả năng mở rộng tốt.

### 1.3.2 Node.js – JavaScript Runtime Environment

**Định nghĩa và lịch sử:**

Node.js là một JavaScript runtime environment được phát hành lần đầu vào năm 2009 bởi Ryan Dahl. Nó cho phép chạy JavaScript phía server (backend) thay vì chỉ phía client (trình duyệt). Node.js được xây dựng trên V8 JavaScript engine của Google Chrome, và sử dụng mô hình Event-driven, Non-blocking I/O làm cho nó rất hiệu quả cho các ứng dụng realtime.

**Phiên bản và yêu cầu:**

Hệ thống ViralWindow yêu cầu:
- **Node.js:** v14.0.0 trở lên (khuyến nghị v18 LTS hoặc v20 hiện tại)
- **npm:** v6.0.0 trở lên (đi kèm với Node.js)

**Ưu điểm của Node.js:**

1. **Event-Driven Architecture:**
   - Sử dụng event loop xử lý các sự kiện bất đồng bộ
   - Có thể xử lý hàng ngàn kết nối đồng thời mà không cần thread
   - Tối ưu cho I/O-bound operations (đọc ghi file, database queries)

2. **Non-Blocking I/O:**
   - Các hoạt động I/O (database, file system) không block code execution
   - Cho phép server tiếp tục xử lý requests khác trong khi chờ I/O hoàn thành
   - Cải thiện throughput và responsiveness

   ```javascript
   // Non-blocking example
   fs.readFile('data.json', (err, data) => {
     if (err) throw err;
     console.log('File read completed');
     // Code khác tiếp tục chạy trong khi chờ file đọc xong
   });
   
   console.log('This runs before file read completes');
   ```

3. **Unified Language:**
   - Frontend (JavaScript) và Backend (Node.js) sử dụng cùng một ngôn ngữ
   - Nhóm lập trình viên có thể làm việc trên cả hai tầng
   - Dễ dàng tái sử dụng code, logic validation

4. **Rich Ecosystem – npm:**
   - npm là package manager lớn nhất thế giới với hàng triệu packages
   - Dễ cài đặt, quản lý dependencies qua file `package.json`
   - Tự động cập nhật packages

5. **Performance:**
   - V8 Engine biên dịch JavaScript thành machine code
   - Performance tương ngang với các ngôn ngữ compiled như Java, C++
   - Rất phù hợp cho microservices, APIs

**Cách Node.js hoạt động:**

```
┌─────────────────────────────────────┐
│     Request từ Client Browser       │
└────────────────┬────────────────────┘
                 │
         ┌───────▼────────┐
         │ HTTP Server    │
         │   (port 3001)  │
         └────────┬───────┘
                  │
          ┌───────▼────────────┐
          │   Event Loop       │
          │ (Xử lý sự kiện)    │
          └────────┬───────────┘
                   │
           ┌───────▼───────┐
           │  Middleware   │ (CORS, Auth, Logging)
           └───────┬───────┘
                   │
           ┌───────▼─────────┐
           │  Route Handler  │ (Process request)
           └───────┬─────────┘
                   │
        ┌──────────┴──────────┐
        │ Database Query      │
        │ File I/O            │ (Non-blocking)
        │ API Call (Redis)    │
        └──────────┬──────────┘
                   │
           ┌───────▼──────────┐
           │  Response JSON   │
           │ Gửi về Client    │
           └────────────────────┘
```

### 1.3.3 Express.js – Web Application Framework

**Định nghĩa:**

Express.js là một framework web minimal và linh hoạt cho Node.js, giúp đơn giản hóa việc xây dựng web applications và RESTful APIs. Nó được release lần đầu vào năm 2010 và trở thành framework phổ biến nhất cho Node.js.

**Phiên bản sử dụng:** Express.js v4.21.2

**Vai trò của Express.js trong hệ thống:**

1. **HTTP Server & Routing:**
   - Khởi tạo HTTP server trên port 3001
   - Định tuyến các requests đến các handler functions phù hợp
   - Hỗ trợ GET, POST, PUT, DELETE, PATCH methods

   ```javascript
   const express = require('express');
   const app = express();
   
   // GET API
   app.get('/api/projects/:id', (req, res) => {
     const projectId = req.params.id;
     // Logic lấy project từ database
     res.json({ id: projectId, name: 'Project A' });
   });
   
   // POST API
   app.post('/api/projects', (req, res) => {
     const { name, customer } = req.body;
     // Logic tạo project mới
     res.status(201).json({ message: 'Project created' });
   });
   
   // PUT API
   app.put('/api/projects/:id', (req, res) => {
     const { id } = req.params;
     // Logic cập nhật project
     res.json({ message: 'Project updated' });
   });
   
   // DELETE API
   app.delete('/api/projects/:id', (req, res) => {
     const { id } = req.params;
     // Logic xóa project
     res.json({ message: 'Project deleted' });
   });
   
   // Phục vụ static files (HTML, CSS, JS)
   app.use(express.static('../FontEnd'));
   
   // Start server
   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Middleware Processing:**
   - Middleware là các hàm xử lý requests trước khi đến route handler
   - Thực hiện theo thứ tự: CORS → JSON parsing → Auth → Activity Log → Route Handler
   - Dùng `next()` để chuyển sang middleware tiếp theo

   ```javascript
   // Middleware CORS
   app.use(cors());
   
   // Middleware parse JSON body
   app.use(express.json({ limit: '50mb' }));
   
   // Middleware custom - Xác thực JWT
   app.use((req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (token) {
       try {
         req.user = jwt.verify(token, process.env.JWT_SECRET);
       } catch (err) {
         console.error('Invalid token');
       }
     }
     next(); // Chuyển sang middleware tiếp theo
   });
   
   // Middleware ghi log activity
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
     next();
   });
   ```

3. **Controllers & Handlers – Tách biệt logic:**
   - Mỗi domain (projects, quotations, customers) có thể có router riêng
   - Controller chứa business logic
   - Service layer xử lý các tác vụ phức tạp

   **Cấu trúc thư mục:**
   ```
   backend/
   ├── routes/
   │   ├── projects.js
   │   ├── quotations.js
   │   ├── customers.js
   │   └── reports.js
   ├── controllers/
   │   ├── projectController.js
   │   ├── quotationController.js
   │   └── customerController.js
   ├── services/
   │   ├── projectService.js
   │   ├── quotationService.js
   │   └── reportService.js
   └── server.js
   ```

   **Ví dụ cấu trúc:**
   ```javascript
   // routes/quotations.js
   const express = require('express');
   const router = express.Router();
   const quotationController = require('../controllers/quotationController');
   
   router.get('/', quotationController.getAll);
   router.get('/:id', quotationController.getById);
   router.post('/', quotationController.create);
   router.put('/:id', quotationController.update);
   router.delete('/:id', quotationController.delete);
   
   module.exports = router;
   ```

   ```javascript
   // controllers/quotationController.js
   exports.getAll = async (req, res) => {
     try {
       const page = req.query.page || 1;
       const limit = req.query.limit || 10;
       
       const quotations = await quotationService.getAllQuotations(page, limit);
       res.json({ success: true, data: quotations });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   };
   ```

   ```javascript
   // services/quotationService.js
   exports.getAllQuotations = async (page, limit) => {
     const offset = (page - 1) * limit;
     const query = 'SELECT * FROM quotations LIMIT ? OFFSET ?';
     const [rows] = await db.query(query, [limit, offset]);
     return rows;
   };
   ```

4. **Error Handling:**
   - Catch lỗi từ async/await
   - Middleware xử lý error cuối cùng

   ```javascript
   // Error handling middleware (phải cuối cùng)
   app.use((err, req, res, next) => {
     console.error('Error:', err);
     res.status(err.status || 500).json({
       error: err.message || 'Internal Server Error'
     });
   });
   ```

### 1.3.4 Dependencies chính của Backend

| Package | Phiên bản | Mục đích | Ứng dụng |
|---------|----------|---------|---------|
| **express** | ^4.21.2 | Web framework | Routing, middleware |
| **mysql2** | ^3.15.3 | Database driver | Kết nối MySQL, queries |
| **jsonwebtoken** | ^9.0.2 | JWT tokens | Xác thực API |
| **bcryptjs** | ^2.4.3 | Hash passwords | Bảo mật mật khẩu |
| **cors** | ^2.8.5 | Cross-origin | Cho phép requests từ frontend |
| **dotenv** | ^16.6.1 | Environment variables | Quản lý config |
| **multer** | ^2.0.2 | File upload | Upload file từ client |
| **exceljs** | ^4.4.0 | Excel files | Tạo/đọc Excel |
| **socket.io** | ^4.8.3 | Real-time | Real-time notifications |
| **redis** | ^5.11.0 | Caching | Cache data |
| **node-cache** | ^5.1.2 | In-memory cache | Cache local |
| **qrcode** | ^1.5.4 | QR codes | Tạo mã QR |
| **@google/generative-ai** | ^0.24.1 | Google AI | Gemini API |
| **nodemon** | ^3.0.2 (dev) | Auto restart | Phát triển |

### 1.3.5 Cấu hình và Khởi động Server

**File cấu hình (.env):**
```dotenv
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=password123
DB_NAME=viral_window_db
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d

# API Keys
GOOGLE_API_KEY=your_google_api_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Khởi động server:**
```bash
# Development mode (tự động restart khi file thay đổi)
npm run dev

# Production mode
npm start

# Server sẽ chạy trên http://localhost:3001
```

**Health Check:**
```javascript
// GET /api/health
// Response: { success: true, version: "1.0.0", uptime: 1234.56 }
```

### 1.3.6 API Endpoints chính

| Endpoint | Method | Mô tả | Ví dụ |
|----------|--------|-------|-------|
| `/api/health` | GET | Kiểm tra server sống | Monitoring |
| `/api/auth/login` | POST | Đăng nhập | { username, password } |
| `/api/projects` | GET | Lấy danh sách dự án | Pagination, filters |
| `/api/projects/:id` | GET | Lấy chi tiết dự án | Thông tin đầy đủ |
| `/api/projects` | POST | Tạo dự án mới | { name, customer_id } |
| `/api/quotations` | GET | Lấy danh sách báo giá | Analytics |
| `/api/quotations/:id` | GET | Lấy chi tiết báo giá | Include items, costs |
| `/api/quotations` | POST | Tạo báo giá mới | { project_id, items } |
| `/api/reports/dashboard` | GET | Dashboard tổng quan | KPIs, charts |
| `/api/reports/revenue-month` | GET | Doanh thu theo tháng | Year, month filters |

## 1.4 Giới thiệu về MySQL

### 1.4.1 Tổng quan về Cơ sở dữ liệu

Tầng Data của ViralWindow sử dụng MySQL, một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở. MySQL đóng vai trò trung tâm trong việc lưu trữ, quản lý, và xử lý toàn bộ dữ liệu của hệ thống.

### 1.4.2 MySQL – Hệ quản trị Cơ sở dữ liệu Quan hệ

**Định nghĩa và lịch sử:**

MySQL là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS - Relational Database Management System) được phát hành lần đầu vào năm 1995. Tên "MySQL" bắt nguồn từ "My" (con gái của người tạo lập công ty) và "SQL" (Structured Query Language). MySQL là mã nguồn mở, được sử dụng rộng rãi trong các ứng dụng web và là một phần của LAMP/LEMP stack.

**Phiên bản sử dụng:** MySQL 8.0+

**Ưu điểm của MySQL:**

1. **Miễn phí & Mã nguồn mở:**
   - Không phải trả license fee
   - Source code public, có thể sửa đổi theo nhu cầu
   - Cộng đồng support lớn

2. **Độ tin cậy & Ổn định:**
   - ACID compliance (Atomicity, Consistency, Isolation, Durability) - MySQL 5.7+
   - Transaction support
   - Crash recovery mechanisms
   - Raw backup & recovery tools

3. **Hiệu suất:**
   - Nhanh cho read operations (SELECT queries)
   - Hỗ trợ indexing tối ưu
   - Connection pooling
   - Thích hợp cho các ứng dụng vừa đến lớn

4. **Dễ sử dụng:**
   - SQL syntax đơn giản, chuẩn
   - Các platform hỗ trợ (Windows, Linux, macOS)
   - GUI tools (MySQL Workbench)

5. **Hỗ trợ UTF-8 cho tiếng Việt:**
   - Charset `utf8mb4` hỗ trợ đầy đủ Unicode
   - Collation `utf8mb4_unicode_ci` cho so sánh chính xác

**So sánh với các DBMS khác:**

| Tiêu chí | MySQL | PostgreSQL | MongoDB |
|----------|-------|-----------|---------|
| **Loại** | Relational | Relational | Document (NoSQL) |
| **ACID** | Có (InnoDB) | Có | Có (4.0+) |
| **Mã nguồn** | Mở | Mở | Mở |
| **Khó sử dụng** | Dễ | Trung bình | Dễ |
| **Kinh phí** | Miễn phí | Miễn phí | Miễn phí |
| **Phù hợp** | Web apps, CMS | Data warehouse | Mobile, Real-time |

**Chọn MySQL vì:**
- Hệ thống ViralWindow cần quản lý dữ liệu có quan hệ phức tạp (Projects → Quotations → Items)
- ACID compliance đảm bảo tính toàn vẹn dữ liệu
- MySQL phổ biến, hosting hỗ trợ rộng rãi
- Performance đủ tốt cho ứng dụng này

### 1.4.3 Kiến trúc Cơ sở dữ liệu ViralWindow

**Tên database:** `viral_window_db`

**Engine:** InnoDB (từ MySQL 5.7+)
- Hỗ trợ Foreign Keys
- ACID transactions
- Row-level locking

**Encoding:** `utf8mb4` (Unicode, hỗ trợ Tiếng Việt)

**Collation:** `utf8mb4_unicode_ci` (case-insensitive)

### 1.4.4 Các bảng chính và cấu trúc dữ liệu

**A. Quản lý Dự án & Báo giá**

Bảng `projects` lưu trữ thông tin chính của dự án, bảng `quotations` lưu báo giá gửi khách hàng:

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_number VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  customer_id INT,
  sales_id INT,
  status ENUM('new', 'in-progress', 'completed', 'cancelled'),
  start_date DATE,
  end_date DATE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_status (status),
  INDEX idx_customer (customer_id)
);

CREATE TABLE quotations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quotation_number VARCHAR(20) UNIQUE,
  project_id INT,
  total_amount DECIMAL(15, 2),
  discount_amount DECIMAL(15, 2),
  final_amount DECIMAL(15, 2),
  status ENUM('draft', 'sent', 'accepted', 'rejected'),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_status (status)
);
```

**B. Quản lý Vật liệu & Sản phẩm**

Bảng `aluminum_systems`, `glass_items`, `accessories` quản lý các thành phần sản phẩm:

```sql
CREATE TABLE aluminum_systems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  system_name VARCHAR(100),
  profile_width INT,  -- mm
  price_per_meter DECIMAL(10, 2),
  material_type VARCHAR(50),
  status ENUM('active', 'inactive')
);

CREATE TABLE glass_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  glass_type VARCHAR(100),  -- Single, Double, Laminated
  thickness INT,  -- mm
  color VARCHAR(50),
  price_per_sqm DECIMAL(10, 2)
);

CREATE TABLE accessories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  accessory_name VARCHAR(100),
  category VARCHAR(50),  -- Handle, Hinge, Lock
  price DECIMAL(10, 2),
  stock_quantity INT,
  unit_id INT
);
```

**C. Quản lý Khách hàng**

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  company_name VARCHAR(100),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_debt (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  project_id INT,
  debt_amount DECIMAL(15, 2),
  due_date DATE,
  status ENUM('unpaid', 'partial', 'paid'),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**D. Quản lý Người dùng & Phân quyền**

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(100),
  role VARCHAR(50),  -- 'admin', 'manager', 'sales', 'production'
  is_active BOOLEAN DEFAULT TRUE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE user_roles (
  id INT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE,
  description VARCHAR(255)
);
```

**E. Quản lý Tài chính**

```sql
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_type VARCHAR(50),  -- 'rent', 'salary', 'transportation'
  amount DECIMAL(15, 2),
  expense_date DATE,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  amount DECIMAL(15, 2),
  payment_date DATE,
  method VARCHAR(50),  -- 'cash', 'bank_transfer'
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

**F. Quản lý Nhân sự**

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  attendance_date DATE,
  check_in_time TIME,
  check_out_time TIME,
  status ENUM('present', 'absent', 'late'),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY (user_id, attendance_date)
);
```

**G. Hệ thống Thông báo**

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(100),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_read (user_id, is_read)
);
```

**H. Hệ thống AI**

```sql
CREATE TABLE ai_chat_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE ai_chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  user_message TEXT,
  ai_response TEXT,
  message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
);
```

### 1.4.5 Quan hệ và Ràng buộc (Relationships & Constraints)

**Foreign Key Relationships:**

Hệ thống sử dụng foreign keys để đảm bảo tính toàn vẹn dữ liệu:

```
customers (1) ──────────── (*) projects
customers (1) ──────────── (*) quotations  
projects (1) ──────────---- (*) quotations
quotations (1) ──────────── (*) quotation_items
users (1) ──────────────── (*) projects (sales_id)
users (1) ──────────────── (*) attendance
```

### 1.4.6 Transactions & Data Integrity (ACID)

**ACID Properties:**

Hệ thống sử dụng MySQL InnoDB engine để đảm bảo ACID:

1. **Atomicity (Tính nguyên tử):** Toàn bộ transaction hoặc không gì cả
2. **Consistency (Tính nhất quán):** Foreign keys & constraints đảm bảo dữ liệu hợp lệ
3. **Isolation (Tính cô lập):** Transactions không can thiệp lẫn nhau
4. **Durability (Tính bền vững):** Dữ liệu được lưu trên disk

### 1.4.7 Indexing & Query Optimization

Các indexes được tạo để tối ưu hiệu suất:

```sql
-- Primary Key (tự động)
PRIMARY KEY (id)

-- Unique Index
UNIQUE INDEX idx_quotation_number ON quotations(quotation_number);

-- Regular Index (tác vụ tìm kiếm)
CREATE INDEX idx_customer_id ON quotations(customer_id);
CREATE INDEX idx_status ON quotations(status);

-- Composite Index (tìm kiếm theo nhiều điều kiện)
CREATE INDEX idx_user_date ON attendance(user_id, attendance_date);
```

### 1.4.8 Backup & Recovery

**Backup Database:**

```bash
# Backup toàn bộ database
mysqldump -u root -p viral_window_db > viral_window_backup.sql

# Restore từ backup
mysql -u root -p viral_window_db < viral_window_backup.sql
```

## 1.5 Giới thiệu về Socket.io cho Real-time Communication

### 1.5.1 Tổng quan về Giao tiếp Real-time

Hệ thống ViralWindow yêu cầu khả năng gửi thông báo tức thời (real-time) đến người dùng khi có sự kiện kinh doanh xảy ra (dự án mới, báo giá được chốt, vật tư hết hạn dùng). Socket.io là giải pháp tối ưu cho nhu cầu này.

### 1.5.2 Socket.io – Thư viện Real-time Communication

**Định nghĩa:**

Socket.io là một thư viện JavaScript được phát hành vào năm 2010 bởi Guillermo Rauch, cho phép giao tiếp hai chiều (bidirectional) theo thời gian thực (real-time) giữa client và server. Nó xây dựng trên giao thức WebSocket nhưng có khả năng fallback sang HTTP long-polling cho các trình duyệt cũ hoặc network không hỗ trợ WebSocket.

**Phiên bản sử dụng:** Socket.io v4.8.3

**Ưu điểm của Socket.io:**

1. **Real-time Bidirectional Communication:**
   - Server có thể gửi thông báo đến client mà không cần client request
   - Client gửi event đến server ngay lập tức
   - Không cần polling hoặc refresh trang

2. **WebSocket + Fallbacks:**
   - Sử dụng WebSocket khi khả dụng (browser hiện đại)
   - Fallback sang HTTP long-polling cho browser cũ
   - Tự động chọn phương thức phù hợp

   ```
   WebSocket (Modern):
   ┌── Client ───────────────────────────────────────── Server ──┐
   │  (Persistent TCP connection)                                  │
   │  - Latency = ~100ms                                          │
   │  - Bandwidth efficient                                       │
   └────────────────────────────────────────────────────────────┘
   
   HTTP Long-polling (Fallback):
   ┌── Client ────────────────────────────────────────── Server ──┐
   │  Request → [Wait for data or timeout] → Response             │
   │  Request → [Wait for data or timeout] → Response             │
   │  (Repeated polling)                                          │
   │  - Latency = ~500-1000ms                                     │
   └────────────────────────────────────────────────────────────┘
   ```

3. **Rooms & Namespaces:**
   - Gửi thông báo cho nhóm users cụ thể (ví dụ: phòng Sales, phòng Kho)
   - Namespaces tách biệt logic (ví dụ: `/notifications`, `/inventory`)
   - Giảm bandwidth bằng cách gửi chỉ cho users cần thiết

   ```javascript
   // Gửi thông báo chỉ cho users trong room 'sales'
   io.to('sales').emit('new_quotation', quotationData);
   
   // Gửi thông báo chỉ cho user cụ thể
   io.to(userId).emit('personal_notification', data);
   ```

4. **Acknowledgments (Xác nhận):**
   - Client xác nhận rằng đã nhận được message
   - Server biết được thông báo có đến tay người dùng
   - Cho phép retry nếu không nhận được ack

### 1.5.3 Cách Socket.io hoạt động trong ViralWindow

**Architecture:**

```
┌─────────────────────────────────────────────────┐
│  Frontend (Browsers)                            │
│  ┌──────────────────────────────────────────┐  │
│  │ Socket.io Client                         │  │
│  │ - Lắng nghe: 'notification'              │  │
│  │ - Gửi: 'create_project'                  │  │
│  └──────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ WebSocket/HTTP
                       │ Persistent Connection
                       │
┌──────────────────────▼──────────────────────────┐
│  Backend (Node.js + Express)                    │
│  ┌──────────────────────────────────────────┐  │
│  │ Socket.io Server                         │  │
│  │ - io.emit() → Broadcast to all            │  │
│  │ - io.to() → Send to specific room        │  │
│  │ - socket.emit() → Send to one client     │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Business Logic                           │  │
│  │ - Project Controller                     │  │
│  │ - Quotation Service                      │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │ Database (MySQL)                         │  │
│  │ - projects table                         │  │
│  │ - quotations table                       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Phía Server (Backend):**

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Khi client kết nối
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User ${userId} connected: ${socket.id}`);
  
  // Thêm user vào room theo role
  socket.join(`role_${userRole}`);
  socket.join(`user_${userId}`);
  
  // Lắng nghe sự kiện từ client
  socket.on('create_project', async (data) => {
    try {
      const newProject = await projectService.create(data);
      
      // Gửi thông báo đến tất cả users
      io.emit('project_created', {
        message: `Dự án "${newProject.name}" được tạo bởi ${req.user.full_name}`,
        data: newProject,
        timestamp: new Date()
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
  
  // Lắng nghe sự kiện quotation accepted
  socket.on('accept_quotation', async (quotationId) => {
    const quotation = await quotationService.accept(quotationId);
    
    // Gửi thông báo đến Sales room
    io.to('role_sales').emit('quotation_accepted', {
      quotationId,
      message: 'Báo giá được khách hàng chốt'
    });
    
    // Gửi thông báo đến Production room
    io.to('role_production').emit('production_ready', {
      projectId: quotation.project_id,
      message: 'Sẵn sàng production'
    });
  });
  
  // Khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

httpServer.listen(3001, () => {
  console.log('Socket.io server running on http://localhost:3001');
});
```

**Phía Client (Frontend):**

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  // Kết nối đến Socket.io server
  const socket = io('/', {
    query: {
      userId: localStorage.getItem('userId'),
      userRole: localStorage.getItem('userRole')
    }
  });
  
  // Xử lý khi kết nối thành công
  socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
  });
  
  // Lắng nghe thông báo từ server
  socket.on('project_created', (data) => {
    console.log('Project created:', data);
    showNotificationToast(`${data.message}`, 'success');
    refreshProjectList();
  });
  
  socket.on('quotation_accepted', (data) => {
    showNotificationToast(data.message, 'success');
    updateQuotationStatus(data.quotationId, 'accepted');
  });
  
  socket.on('error', (error) => {
    showNotificationToast(error.message, 'error');
  });
  
  // Gửi sự kiện đến server
  function createProject(projectData) {
    socket.emit('create_project', projectData);
  }
  
  function acceptQuotation(quotationId) {
    socket.emit('accept_quotation', quotationId);
  }
  
  // Xử lý khi mất connection
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showOfflineMode();
  });
</script>
```

### 1.5.4 Các sự kiện Socket.io chính

| Sự kiện | Hướng | Dữ liệu | Mô tả |
|---------|-------|--------|-------|
| `project_created` | Server → Clients | { projectId, name, customerId } | Dự án mới được tạo |
| `quotation_created` | Server → Clients | { quotationId, projectId, amount } | Báo giá mới được tạo |
| `quotation_accepted` | Server → Clients | { quotationId, acceptedDate } | Báo giá được khách chốt |
| `project_completed` | Server → Clients | { projectId, completedDate } | Dự án hoàn thành |
| `material_low_stock` | Server → Clients | { materialId, quantity } | Vật tư gần hết hạn |
| `attendance_checked` | Server → Clients | { userId, checkInTime } | Nhân viên chấm công |
| `expense_approved` | Server → Role(Finance) | { expenseId, amount } | Chi phí được duyệt |

### 1.5.5 Performance Optimization

Để tối ưu Socket.io:

1. **Sử dụng Rooms để giảm broadcast:**
   ```javascript
   // Xấu: Gửi đến tất cả clients
   io.emit('event', data); // 1000 users nhận
   
   // Tốt: Gửi chỉ cho nhóm cụ thể
   io.to('role_sales').emit('event', data); // 50 users nhận
   ```

2. **Nén dữ liệu lớn:**
   ```javascript
   // Giới hạn kích thước message
   const io = new Server(httpServer, {
     maxHttpBufferSize: 1e6 // 1MB
   });
   ```

3. **Sử dụng middlewares để validate:**
   ```javascript
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     if (!validateToken(token)) {
       return next(new Error('Authentication failed'));
     }
     next();
   });
   ```

## 1.6 Giới thiệu về Google Generative AI (Gemini API)

### 1.6.1 Google Generative AI là gì?

**Định nghĩa:** Google Generative AI là một tập các API cho phép ứng dụng sử dụng mô hình AI generative (như Gemini) để xử lý text, image, và các dữ liệu khác.

**Phiên bản thư viện:** @google/generative-ai v0.24.1

**Vai trò trong hệ thống:**
- Hỗ trợ chatbot AI cho khách hàng (tư vấn sản phẩm, trả lời câu hỏi)
- Phân tích dữ liệu kinh doanh
- Gợi ý giải pháp thiết kế cửa
- Tối ưu hóa báo giá

### 1.6.2 Cách tích hợp Gemini API

**Setup:**
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

**Ví dụ sử dụng:**
```javascript
// Simple text generation
const prompt = 'Gợi ý 3 loại kính phù hợp cho cửa sổ phòng khách';
const result = await model.generateContent(prompt);
const response = await result.response;
const text = response.text();
console.log(text);

// Chat conversation
const chat = model.startChat();
const msg1 = await chat.sendMessage('Kính laminat có ưu điểm gì?');
console.log(msg1.response.text());

const msg2 = await chat.sendMessage('Giá thành thì sao?');
console.log(msg2.response.text());
```

### 1.6.3 Các ứng dụng AI trong hệ thống

1. **Chatbot (AI Brain):**
   - Trả lời câu hỏi khách hàng về sản phẩm
   - Hỗ trợ quá trình sales

2. **Phân tích Báo cáo:**
   - Tóm tắt báo cáo tài chính
   - Gợi ý cải tiến

3. **Tối ưu BOM:**
   - Gợi ý vật tư phù hợp
   - Tính toán giá tối ưu

### 1.6.4 Yêu cầu

- **API Key:** Cần đăng ký tài khoản Google Cloud
- **Quota:** Google cấp quota miễn phí cho phát triển
- **Latency:** Avg 1-3 giây phản hồi

## 1.7 Giới thiệu về Redis cho Caching

### 1.7.1 Redis là gì?

**Định nghĩa:** Redis là một in-memory data store mã nguồn mở, được sử dụng cho caching, session management, và real-time analytics.

**Phiên bản:** redis v5.11.0, ioredis v5.10.0

**Vai trò trong hệ thống:**
- Cache dữ liệu để giảm truy vấn database
- Lưu trữ sessions người dùng
- Lưu dữ liệu tạm thời

**Ưu điểm:**
- Nhanh (in-memory)
- Hỗ trợ data structures (strings, lists, sets, hashes)
- TTL (Time To Live) - tự động xóa data sau thời gian

**Ví dụ sử dụng:**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Lưu vào cache
await client.set('customers:all', JSON.stringify(customersList), 'EX', 3600);

// Lấy từ cache
const cached = await client.get('customers:all');
if (cached) {
  return JSON.parse(cached);
}
```

## 1.8 Giới thiệu về JWT (JSON Web Tokens) và Bảo mật

### 1.8.1 Tổng quan về Xác thực và Bảo mật

Bảo mật là một yêu cầu quan trọng nhất cho hệ thống Enterprise. ViralWindow sử dụng JWT (JSON Web Tokens) cho xác thực (authentication) và bcryptjs cho bảo vệ mật khẩu.

### 1.8.2 JWT – JSON Web Token

**Định nghĩa và tiêu chuẩn:**

JWT (JSON Web Token) là một chuẩn công khai (RFC 7519) do IETF công bố năm 2015. Nó cung cấp một cách tự chứa (self-contained) để truyền thông tin giữa các bên theo cách an toàn và có thể xác minh được.

**Phiên bản thư viện:** jsonwebtoken v9.0.2

**Cấu trúc JWT:**

JWT gồ ba phần cách nhau bởi dấu chấm (`.`):

```
header.payload.signature

Ví dụ token thực tế:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjQ1MDAwMDAwLCJleHAiOjE2NDUwMDAwMDB9.
4IcD7SnZ5fK3-xQ1dFq8Q9s8k0fZ5k3tJ9j2l0m3n4o
```

**1. Header (Phần đầu):**
```json
{
  "alg": "HS256",    // Thuật toán ký: HMAC-SHA256
  "typ": "JWT"       // Loại token
}
```
Được mã hóa Base64URL thành: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

**2. Payload (Dữ liệu):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1645000000,       // Issued at (thời gian tạo)
  "exp": 1645086400        // Expiration (hết hạn)
}
```
Được mã hóa Base64URL thành: `eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsIn...`

**3. Signature (Chữ ký):**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```
Được tính bằng server secret key để xác minh tính toàn vẹn.

**Quy trình Đăng nhập và Xác thực:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client gửi credentials (username, password)              │
└─────────────────────────────────────┬───────────────────────┘
                                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Server kiểm tra trong database users table               │
│    - Tìm user bằng username                                 │
│    - Kiểm tra password bằng bcrypt.compare()                │
└─────────────────────────────────────┬───────────────────────┘
                                      ↓
                ┌─────────────────────┴──────────────────┐
        (Invalid)│                            │(Valid)
                ↓                            ↓
        ┌──────────────────┐    ┌─────────────────────┐
        │ Return Error 401 │    │ 3. Tạo JWT token    │
        │ Unauthorized     │    │ (có user info)      │
        └──────────────────┘    └──────────┬──────────┘
                                           ↓
                        ┌──────────────────────────────┐
                        │ 4. Server response token     │
                        │ { token: "jwt..." }          │
                        └──────────────────┬───────────┘
                                           ↓
                        ┌──────────────────────────────┐
                        │ 5. Client lưu token          │
                        │ (localStorage hoặc memory)   │
                        └──────────────────┬───────────┘
                                           ↓
        ┌───────────────────────────────────────────────────────┐
        │ 6. Client gửi token trong header của mỗi request      │
        │ Authorization: Bearer <token>                          │
        └───────────────────────────────────────┬────────────────┘
                                                ↓
        ┌───────────────────────────────────────────────────────┐
        │ 7. Server xác minh token:                             │
        │    - Kiểm tra signature (có bị giả mạo không?)        │
        │    - Kiểm tra expiration (còn hạn không?)             │
        └───────────────────────────────────────┬────────────────┘
                                                ↓
                            ┌─────────────────┴──────────────┐
                       (Expired)│                   │(Valid)
                            ┌──┴──────────┐  ┌──────▼──────┐
                            │ Return 401  │  │ Cho phép    │
                            │ Token invalid│  │ access     │
                            └─────────────┘  └────────────┘
```

**Cài đặt JWT trong ViralWindow:**

```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// LOGIN endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Kiểm tra user trong database
    const query = 'SELECT id, username, email, password_hash, role FROM users WHERE username = ?';
    const [users] = await db.query(query, [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Username or password incorrect' });
    }
    
    const user = users[0];
    
    // Kiểm tra password (so sánh với hash lưu trong DB)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Username or password incorrect' });
    }
    
    // Tạo JWT token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '7d'
    });
    
    // Update last_login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // Return token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT endpoint (optional - xóa token phía client)
router.post('/logout', (req, res) => {
  // Token bị xóa từ client-side (localStorage)
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;
```

**Xác thực Token - Middleware:**

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    // Token format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gán user info vào request
    req.user = decoded;
    next();
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authMiddleware };
```

**Sử dụng trong routes:**

```javascript
// Protected route - yêu cầu token hợp lệ
router.get('/api/projects', authMiddleware, async (req, res) => {
  const userId = req.user.id;  // Lấy từ decoded token
  const projects = await projectService.getByUser(userId);
  res.json(projects);
});

// Role-based access control
router.delete('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin only' });
  }
  // Logic xóa user
});
```

### 1.8.3 bcryptjs – Hash Passwords

**Định nghĩa:**

bcryptjs là một thư viện JavaScript triển khai thuật toán bcrypt - một thuật toán hash password mạnh với khả năng chống brute-force attacks. Khác với MD5 hoặc SHA1 (đã lỗi thời), bcrypt tự động thêm "salt" và có thể điều chỉnh độ khó (cost factor).

**Phiên bản thư viện:** bcryptjs v2.4.3

**Công thức bcrypt:**

```
bcrypt(password, salt) = hash

salt = random data (16 bytes)
cost = số round của Blowfish (mặc định 10)
hash = $2b$10$<22-char-salt><31-char-hash>
```

**Ví dụ:**
```
hash = $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86U36dSjy
```

**Cài đặt Hash Password:**

```javascript
// services/userService.js
const bcrypt = require('bcryptjs');

// Khi đăng ký user mới hoặc đổi password
exports.hashPassword = async (plainPassword) => {
  // Tạo salt (cost factor = 10, mất ~100ms trên máy hiện đại)
  const salt = await bcrypt.genSalt(10);
  
  // Hash password với salt
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  
  return hashedPassword;
};

// Khi register user
exports.registerUser = async (username, email, password) => {
  // Hash password
  const passwordHash = await exports.hashPassword(password);
  
  // Lưu vào database
  const query = `
    INSERT INTO users (username, email, password_hash, role, created_date)
    VALUES (?, ?, ?, 'user', NOW())
  `;
  
  await db.query(query, [username, email, passwordHash]);
};

// Khi verify password (đăng nhập)
exports.verifyPassword = async (plainPassword, storedHash) => {
  // So sánh: password nhập vào với hash lưu trong DB
  const isValid = await bcrypt.compare(plainPassword, storedHash);
  return isValid;
};
```

**Tại sao bcrypt tốt:**

1. **Salt và Hash:** Mỗi password có salt riêng, nên cùng password cũng tạo hash khác
2. **Slow hashing:** bcrypt cố tình chậm (để chống brute-force), hashpwd trong ~100ms
3. **Adaptive:** Có thể tăng cost factor khi CPU nhanh hơn
4. **Wide adoption:** Được sử dụng rộng rãi trong industry

**So sánh các phương pháp hashing:**

| Phương pháp | Tốc độ | Bảo mật | Khuyên dùng |
|-------------|-------|--------|-----------|
| plaintext | Tức thì | Rất kém | ❌ KHÔNG |
| MD5 | Rất nhanh | Lỗi thời | ❌ KHÔNG |
| SHA1 | Rất nhanh | Lỗi thời | ❌ KHÔNG |
| SHA256 | Nhanh | Khá | Có nếu cần tốc độ |
| bcrypt | Chậm (100ms) | Rất tốt | ✅ CÓ - Khuyên dùng |
| scrypt | Lâu (200-500ms) | Rất tốt | ✅ CÓ - Khuyên dùng |
| argon2 | Lâu (300-500ms) | Tốt nhất | ✅ CÓ - Tốt nhất |

### 1.8.4 Các biện pháp bảo mật khác

1. **HTTPS trong Production:**
   - Token được truyền qua HTTPS (encrypted), không HTTP

2. **HTTPOnly Cookies (Optional):**
   - Để tránh XSS attacks, có thể lưu token trong HTTPOnly cookies thay localStorage

3. **CORS Whitelist:**
   ```javascript
   app.use(cors({
     origin: ['https://viralwindow.com']
   }));
   ```

4. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // 5 attempts
   });
   router.post('/login', loginLimiter, loginController);
   ```

5. **Input Validation:**
   ```javascript
   if (!username || username.length < 3) {
     return res.status(400).json({ error: 'Invalid username' });
   }
   ```

## 1.9 Môi trường triển khai

### 1.9.1 Yêu cầu hệ thống - Development

**Máy tính cục bộ:**
- OS: Windows 10/11 hoặc Linux/macOS
- CPU: Intel i5 8th Gen trở lên hoặc tương đương
- RAM: Tối thiểu 4GB (khuyến nghị 8GB+)
- Ổ cứng: 1GB dung lượng trống

**Phần mềm bắt buộc:**
- **Node.js:** v14.0.0 trở lên (khuyến nghị v18 LTS)
  - npm: v6.0.0 trở lên (đi kèm Node.js)
- **MySQL:** v8.0+
  - XAMPP hoặc MySQL Server độc lập
- **Git:** Để clone repository

### 1.9.2 Yêu cầu hệ thống - Production

**Server:**
- OS: Linux (CentOS, Ubuntu) hoặc Windows Server
- CPU: Intel Xeon 4-core trở lên
- RAM: 8GB trở lên
- Ổ cứng: SSD 50GB+ (database), 20GB+ (ứng dụng)
- Bandwidth: 10Mbps+ (tùy lưu lượng)

**Phần mềm Production:**
- **Node.js:** v18 LTS
- **MySQL:** v8.0+ (server standalone)
- **Redis:** Cho caching & sessions (tuỳ chọn)
- **Nginx/Apache:** Web server proxy (tuỳ chọn)
- **PM2:** Quản lý process Node.js để tự động restart

### 1.9.3 Cấu hình môi trường (.env)

```dotenv
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=viral_window_db
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# Google AI Configuration
GOOGLE_API_KEY=your_google_generative_ai_key

# Redis Configuration (nếu dùng)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50mb
```

### 1.9.4 Cài đặt Development - Bước chi tiết

**Bước 1:** Tải source code
```bash
cd d:\ViralWindow_Phan_Mem_Nhom_Kinh
```

**Bước 2:** Cài đặt MySQL & tạo database
```bash
# Restore từ file SQL
mysql -u root -p viral_window_db < viral_window_db.sql
```

**Bước 3:** Cài đặt dependencies backend
```bash
cd backend
npm install
```

**Bước 4:** Cấu hình .env
```bash
# Tạo file .env hoặc copy từ .env.example
# Điền thông tin MySQL
```

**Bước 5:** Khởi động server
```bash
npm start        # Chạy server
# Hoặc
npm run dev      # Chạy với nodemon (tự động restart)
```

**Bước 6:** Truy cập ứng dụng
```
http://localhost:3001
```

### 1.9.5 Cấu trúc thư mục

```
ViralWindow_Phan_Mem_Nhom_Kinh/
├── backend/
│   ├── config/           # Cấu hình DB, constants
│   ├── controllers/      # Logic xử lý API
│   ├── routes/           # Định tuyến API
│   ├── middleware/       # Middleware (auth, logging)
│   ├── services/         # Business logic
│   ├── migrations/       # SQL migration scripts
│   ├── ai-brain/         # Logic AI
│   ├── uploads/          # Thư mục upload file
│   ├── server.js         # Entry point
│   ├── package.json      # Dependencies
│   └── .env              # Biến môi trường
│
├── FontEnd/
│   ├── *.html            # Các trang HTML
│   ├── js/               # Các file JavaScript
│   ├── css/              # Stylesheet
│   ├── components/       # HTML components
│   └── uploads/          # File upload từ client
│
├── Tài liệu/             # Tài liệu dự án
└── ...
```

## 1.10 Kết luận

### 1.10.1 Tóm tắt công nghệ

Hệ thống ViralWindow được xây dựng với một stack công nghệ hiện đại, ổn định, và được sử dụng rộng rãi trong ngành:

**Frontend Tier:**
- **HTML5:** Cấu trúc semantic, Canvas API cho thiết kế cửa
- **CSS3:** Flexbox/Grid, Responsive design, Animations
- **JavaScript ES6+:** DOM manipulation, Fetch API, Local Storage

**Backend Tier:**
- **Node.js + Express.js:** RESTful APIs, Middleware, Route handling
- **JWT + bcryptjs:** Secure authentication & password hashing
- **Socket.io:** Real-time notifications & bidirectional communication

**Data Tier:**
- **MySQL 8.0:** Relational database với ACID compliance, UTF-8 support
- **Redis (Optional):** In-memory caching, Session management

**Additional Services:**
- **Google Generative AI (Gemini):** AI chatbot & analytics
- **ExcelJS/XLSX:** Excel file import/export
- **Multer:** File upload handling
- **Nodemon:** Development auto-reload

### 1.10.2 Ưu điểm của Stack

✅ **Performance:**
- Event-driven, non-blocking I/O
- Connection pooling, Query optimization
- Real-time WebSocket communication
- Throughput cao cho hàng trăm users đồng thời

✅ **Security:**
- JWT token-based authentication
- bcrypt password hashing (mất 100ms để hash một password)
- CORS, Input validation, SQL injection prevention
- HTTPS support, Rate limiting

✅ **Scalability:**
- Horizontal scaling (multiple Node instances)
- Database indexing & optimization
- Microservices architecture có thể triển khai
- Cloud deployment ready (AWS, Azure, Render, etc.)

✅ **Developer Experience:**
- Unified language (JavaScript) frontend & backend
- Rich npm ecosystem (millions of packages)
- Well-documented frameworks & libraries
- Large community support

✅ **Business Value:**
- Quick time-to-market with Node.js
- Low infrastructure cost (open-source technologies)
- Easy maintenance & updates
- Compatible with most hosting providers

### 1.10.3 Khuyến nghị cho tương lai

1. **Upgrade to TypeScript:** Để type safety & better IDE support
2. **Implement Microservices:** Tách Auth, Finance, Production services
3. **Add GraphQL:** Thay thế REST API để query flexibility
4. **Implement Docker:** Containerization cho deployment consistency
5. **Setup CI/CD:** GitHub Actions / GitLab CI cho automated testing & deployment
6. **Database Sharding:** Nếu data lớn vượt quá capacity của MySQL
7. **Message Queue:** RabbitMQ/Kafka cho async task processing

### 1.10.4 Kết luận chung

Stack công nghệ được chọn phù hợp hoàn toàn với yêu cầu của dự án đồ án tốt nghiệp:

- **Hiệu suất cao** cho hàng trăm users đồng thời
- **Bảo mật mạnh mẽ** cho dữ liệu kinh doanh nhạy cảm
- **Dễ phát triển** với các framework phổ biến
- **Chi phí thấp** với các công nghệ mã nguồn mở
- **Sẵn sàng production** với các best practices

Hệ thống không chỉ hoàn thành đồ án học tập mà còn có thể triển khai thực tế cho các công ty sản xuất cửa nhôm kính để quản lý kinh doanh, tăng hiệu suất công việc.

---

**Hoàn thành CHƯƠNG 1 - TỔNG QUAN VỀ CÔNG NGHỆ SỬ DỤNG VÀ MÔI TRƯỜNG TRIỂN KHAI**

Chương này đã trình bày chi tiết:
- 1.1 Giới thiệu chung
- 1.2 HTML5, CSS3 và JavaScript (Frontend technologies)
- 1.3 Node.js và Express.js (Backend technologies)
- 1.4 MySQL (Database technology)
- 1.5 Socket.io (Real-time communication)
- 1.6 Google Generative AI (AI integration)
- 1.7 Redis (Caching technology)
- 1.8 JWT và Bảo mật (Authentication & Security)
- 1.9 Môi trường triển khai (Development & Production environment)
- 1.10 Kết luận (Summary & Recommendations)

Với những kiến thức này, người đọc có thể hiểu rõ:
- Kiến trúc hệ thống 3 tầng (Frontend, Backend, Database)
- Từng công nghệ chính & vai trò của chúng
- Cách cài đặt & cấu hình trong development
- Cách triển khai lên production
- Các best practices & security measures
- Khuyến nghị cho tương lai

---

**Tác giả:** [Tên nhóm]  
**Ngày soạn:** [Ngày hiện tại]  
**Lần cập nhật cuối:** Tháng 4, 2026
