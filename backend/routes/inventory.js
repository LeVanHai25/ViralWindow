const express = require("express");
const router = express.Router();
const inventoryCtrl = require("../controllers/inventoryController");

// Dashboard routes - chỉ xem, không CRUD
router.get("/stats", inventoryCtrl.getStatistics);
router.get("/aggregated", inventoryCtrl.getAggregatedItems);
router.get("/low-stock", inventoryCtrl.getLowStockItems);

// VRPK code generation - MUST be before /:id
router.get("/next-vrpk-code", inventoryCtrl.getNextVRPKCode);

// Legacy routes
router.get("/", inventoryCtrl.getAllItems);
router.get("/transactions", inventoryCtrl.getTransactions);
router.get("/scraps", inventoryCtrl.getScraps);

// Scraps routes - MUST be before /:id
router.put("/scraps/:id/mark-used", inventoryCtrl.markScrapUsed);
router.delete("/scraps/:id", inventoryCtrl.deleteScrap);

// Delete all inventory data (use with caution!)
router.delete("/delete-all", inventoryCtrl.deleteAllInventory);

// CRUD routes - /:id routes MUST be at the END
router.post("/", inventoryCtrl.create);
router.get("/:id", inventoryCtrl.getById);
router.put("/:id", inventoryCtrl.update);
router.delete("/:id", inventoryCtrl.delete);

module.exports = router;


