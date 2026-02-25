/**
 * Patch snippet for your existing stock-documents router.
 *
 * Add imports:
 *   const stockDocumentExportController = require('../controllers/stockDocumentExportController');
 *
 * Add routes (IMPORTANT: put these BEFORE `router.get('/:id', ...)` if you have it)
 *
 *   router.get('/ledger/monthly-summary/export-excel', auth, stockDocumentExportController.exportMonthlySummaryExcel);
 *   router.get('/:id/export-excel', auth, stockDocumentExportController.exportSingleDocumentExcel);
 */

