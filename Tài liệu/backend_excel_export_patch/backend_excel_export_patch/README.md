# Backend Excel Export Patch (Phase 1/2/3)

This patch implements the 3 missing endpoints that are causing 404 in `inventory.html`:

1. `GET /api/inventory/export-excel`  (Export inventory by warehouse)
2. `GET /api/stock-documents/ledger/monthly-summary/export-excel?month=YYYY-MM` (Monthly report from stock_ledger)
3. `GET /api/stock-documents/:id/export-excel` (Export single stock document)

## 1) Install dependency

```bash
npm i exceljs
```

## 2) Copy files into your backend project

Copy these folders into your backend source tree:
- `controllers/`
- `services/`
- `utils/`

## 3) Wire routes

### Inventory router
In your existing `routes/inventory.js` (or similar):

```js
const auth = require('../middlewares/auth');
const inventoryExportController = require('../controllers/inventoryExportController');

router.get('/export-excel', auth, inventoryExportController.exportInventoryExcel);
```

### Stock documents router
In your existing `routes/stockDocument.js` (or similar). IMPORTANT: add these **before** any `router.get('/:id', ...)` routes.

```js
const auth = require('../middlewares/auth');
const stockDocumentExportController = require('../controllers/stockDocumentExportController');

router.get('/ledger/monthly-summary/export-excel', auth, stockDocumentExportController.exportMonthlySummaryExcel);
router.get('/:id/export-excel', auth, stockDocumentExportController.exportSingleDocumentExcel);
```

## 4) Connect DB adapter

These controllers expect `require('../db')` to exist and export one of:
- `{ sequelize }` (Sequelize)
- `{ pool }` (mysql2/promise)
- `{ knex }` (knex)
- `{ query(sql, params) }`

If your project uses a different module path, change the `require('../db')` line or call `db.init(...)` during app startup.

## 5) Update table/column names

You **must** adapt these SQL queries to your schema:

- `services/inventoryExportService.js` assumes a table `inventory_items`
- `services/stockExportService.js` assumes tables:
  - `stock_ledger`
  - `stock_documents`
  - `stock_document_items`

If your schema differs, adjust SQL + column mappings.

## 6) Quick smoke tests

```bash
curl -I -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/inventory/export-excel?item_type=accessory"

curl -I -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/stock-documents/ledger/monthly-summary/export-excel?month=2026-01"

curl -I -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/stock-documents/17/export-excel"
```

