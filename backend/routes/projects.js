const express = require("express");
const router = express.Router();
const projectCtrl = require("../controllers/projectController");
const doorCalcCtrl = require("../controllers/doorCalculationController");
const projectMaterialCtrl = require("../controllers/projectMaterialController");

router.get("/", projectCtrl.getAllProjects);
router.get("/stats/summary", projectCtrl.getStatistics);
router.get("/:id/doors/:doorId", projectCtrl.getDoorById); // Must be before /:id/doors
router.get("/:id/doors/:doorId/aluminum-cutting", doorCalcCtrl.calculateAluminumCutting);
router.get("/:id/doors/:doorId/glass-dimensions", doorCalcCtrl.calculateGlassDimensions);
router.get("/:id/doors/:doorId/accessories", doorCalcCtrl.getDoorAccessories);
router.get("/:id/doors/:doorId/gaskets", doorCalcCtrl.getDoorGaskets);
router.get("/:id/doors/:doorId/price", doorCalcCtrl.calculateDoorPrice);
router.get("/:id/doors", projectCtrl.getProjectDoors);
router.get("/:id/logs", projectCtrl.getProjectLogs);
router.get("/:id/materials", projectMaterialCtrl.getProjectMaterials);
router.delete("/:id/materials/:materialId", projectMaterialCtrl.deleteProjectMaterial);

// Design files route - returns empty for now (placeholder)
router.get("/:id/files", (req, res) => {
    // TODO: Implement file storage for design files (PDF, DWG, etc.)
    res.json({ success: true, data: [] });
});

router.get("/:id", projectCtrl.getById); // Must be last
router.post("/", projectCtrl.create);
router.post("/:id/doors", projectCtrl.createDoor);
router.post("/:id/doors/from-quotation", projectCtrl.importDoorsFromQuotation);
router.post("/:id/auto-import-from-quotation", projectCtrl.autoImportFromQuotation);
router.get("/:id/quotation-items-for-design", projectCtrl.getQuotationItemsForDesign);
router.post("/:id/design-items", projectCtrl.createDesignItemFromQuotation);
router.get("/:projectId/items/:itemId/bom-detail", projectCtrl.getProjectItemBOMDetail);
router.put("/:id", projectCtrl.update);
router.put("/:id/doors/:doorId", projectCtrl.updateDoor);
router.delete("/:id", projectCtrl.delete);
router.delete("/:id/doors/:doorId", projectCtrl.deleteDoor);

module.exports = router;

