const express = require("express");
const router = express.Router();
const quotationCtrl = require("../controllers/quotationController");
const quotationBOMCtrl = require("../controllers/quotationBOMController");
const quotationPDFCtrl = require("../controllers/quotationPDFController");
const quotationExcelCtrl = require("../controllers/quotationExcelController");

router.get("/", quotationCtrl.getAllQuotations);
router.get("/stats", quotationCtrl.getStatistics);
router.get("/pending", quotationCtrl.getPendingQuotations);
router.get("/:id", quotationCtrl.getById);
router.post("/", quotationCtrl.create);
router.post("/from-project", quotationCtrl.createFromProject); // Tạo báo giá từ dự án
router.post("/:id/remind", quotationCtrl.sendReminder);
router.post("/:id/versions", quotationCtrl.createNewVersion);
router.post("/:id/sign-contract", quotationCtrl.signContract);
router.put("/:id", quotationCtrl.update);
router.put("/:id/status", quotationCtrl.updateStatus);
router.delete("/:id", quotationCtrl.delete);

// Quotation Items CRUD
router.post("/:id/items", quotationCtrl.addQuotationItem);
router.put("/items/:itemId", quotationCtrl.updateQuotationItem);
router.delete("/items/:itemId", quotationCtrl.deleteQuotationItem);

// BOM integration routes
router.post("/calculate-from-bom", quotationBOMCtrl.calculateQuotationFromBOM);
router.get("/projects/:projectId/doors", quotationBOMCtrl.getDoorsForQuotation);

// Export routes
router.get("/:id/pdf-data", quotationPDFCtrl.exportQuotationPDF);
router.get("/:id/export-excel", quotationExcelCtrl.exportQuotationToExcel);

module.exports = router;



