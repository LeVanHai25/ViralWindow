const express = require("express");
const router = express.Router();
const bomExportCtrl = require("../controllers/bomExportController");
const purchaseRequestExportCtrl = require("../controllers/purchaseRequestExportController");

// Export Excel routes
router.post("/:projectId/aluminum", bomExportCtrl.exportAluminumBreakdown);
router.post("/:projectId/glass", bomExportCtrl.exportGlassBreakdown);
router.post("/:projectId/accessories", bomExportCtrl.exportAccessoriesBreakdown);
router.post("/:projectId/combined", bomExportCtrl.exportCombinedBreakdown);
router.post("/:projectId/product-list", bomExportCtrl.exportProductList);

// Purchase Request Export
router.post("/purchase-request", purchaseRequestExportCtrl.exportPurchaseRequest);

// Material Request Export
router.post("/material-request", bomExportCtrl.exportMaterialRequest);

module.exports = router;

