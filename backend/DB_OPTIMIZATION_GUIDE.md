# Hướng dẫn Tối ưu Database Queries - ViralWindow

## 📋 Tổng quan

Tài liệu này hướng dẫn các best practices để tối ưu database queries, tránh các vấn đề phổ biến như N+1 problem.

## ⚠️ VẤN ĐỀ PHÁT HIỆN

### 1. Nhiều queries có thể consolidate

Một số endpoints đang gọi nhiều queries riêng lẻ có thể JOIN được.

### 2. Missing Indexes

Một số columns được filter thường xuyên nhưng chưa có index.

---

## 🔧 GIẢI PHÁP VÀ PATTERNS

### Pattern 1: Sử dụng JOIN thay vì nhiều queries

**❌ Bad - N+1 Problem:**
```javascript
// Lấy list projects
const [projects] = await db.query('SELECT * FROM projects');

// N queries cho mỗi project
for (const project of projects) {
    const [customer] = await db.query(
        'SELECT * FROM customers WHERE id = ?', 
        [project.customer_id]
    );
    project.customer = customer[0];
}
```

**✅ Good - Single JOIN Query:**
```javascript
const [projects] = await db.query(`
    SELECT p.*, c.name as customer_name, c.phone as customer_phone
    FROM projects p
    LEFT JOIN customers c ON p.customer_id = c.id
    ORDER BY p.created_at DESC
`);
```

---

### Pattern 2: Sử dụng IN clause cho batch fetch

**❌ Bad:**
```javascript
const items = [];
for (const id of itemIds) {
    const [item] = await db.query('SELECT * FROM items WHERE id = ?', [id]);
    items.push(item[0]);
}
```

**✅ Good:**
```javascript
if (itemIds.length > 0) {
    const placeholders = itemIds.map(() => '?').join(',');
    const [items] = await db.query(
        `SELECT * FROM items WHERE id IN (${placeholders})`,
        itemIds
    );
}
```

---

### Pattern 3: Pagination với COUNT tối ưu

**❌ Bad - 2 full table scans:**
```javascript
const [total] = await db.query('SELECT COUNT(*) as count FROM large_table WHERE status = ?', [status]);
const [data] = await db.query('SELECT * FROM large_table WHERE status = ? LIMIT ? OFFSET ?', [status, limit, offset]);
```

**✅ Good - SQL_CALC_FOUND_ROWS (MySQL):**
```javascript
const [data] = await db.query(
    'SELECT SQL_CALC_FOUND_ROWS * FROM large_table WHERE status = ? LIMIT ? OFFSET ?',
    [status, limit, offset]
);
const [countResult] = await db.query('SELECT FOUND_ROWS() as total');
const total = countResult[0].total;
```

**✅ Better - Estimate count for large tables:**
```javascript
// Chỉ count exact khi cần, otherwise estimate
const [estimate] = await db.query(`
    SELECT TABLE_ROWS as estimate
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'large_table'
`);
```

---

### Pattern 4: Selective Columns

**❌ Bad:**
```javascript
const [data] = await db.query('SELECT * FROM large_table');
// Chỉ dùng id, name, status
```

**✅ Good:**
```javascript
const [data] = await db.query('SELECT id, name, status FROM large_table');
```

---

## 📊 INDEXES CẦN THIẾT

### Đề xuất thêm indexes:

```sql
-- Projects: Filter by status, customer
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Quotations: Filter by status, project
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_project_id ON quotations(project_id);

-- Inventory: Tìm kiếm nhanh
CREATE INDEX idx_inventory_item_code ON inventory(item_code);
CREATE INDEX idx_inventory_item_type ON inventory(item_type);

-- Stock Documents: Filter by type, status
CREATE INDEX idx_stock_documents_doc_type ON stock_documents(doc_type);
CREATE INDEX idx_stock_documents_status ON stock_documents(status);

-- Financial Transactions: Report queries
CREATE INDEX idx_financial_transaction_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_status ON financial_transactions(status);
```

### Kiểm tra indexes hiện tại:

```sql
SHOW INDEX FROM projects;
SHOW INDEX FROM quotations;
SHOW INDEX FROM inventory;
```

---

## 🚀 CHECKLIST TỐI ƯU

### Khi viết query mới:

- [ ] Chỉ SELECT columns cần thiết
- [ ] Sử dụng JOIN thay vì multiple queries
- [ ] Thêm LIMIT cho list queries
- [ ] Sử dụng prepared statements (đã có sẵn với mysql2)
- [ ] Kiểm tra có index cho WHERE columns

### Khi review code:

- [ ] Tìm loops với queries bên trong
- [ ] Tìm SELECT * trong production code
- [ ] Kiểm tra pagination có count hợp lý

---

## 📈 MONITORING

### Enable Slow Query Log:

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries > 1 second
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
```

### Query để tìm slow queries:

```sql
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 20;
```

---
*Last updated: 2026-01-22*
