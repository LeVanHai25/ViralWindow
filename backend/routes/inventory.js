const express = require("express");
const router = express.Router();
const inventoryCtrl = require("../controllers/inventoryController");

// Dashboard routes - chỉ xem, không CRUD
router.get("/stats", inventoryCtrl.getStatistics);
router.get("/aggregated", inventoryCtrl.getAggregatedItems);
router.get("/low-stock", inventoryCtrl.getLowStockItems);

// Legacy routes - giữ lại để tương thích nhưng sẽ deprecated
router.get("/", inventoryCtrl.getAllItems);
router.get("/transactions", inventoryCtrl.getTransactions);
router.get("/scraps", inventoryCtrl.getScraps);
router.get("/:id", inventoryCtrl.getById);
// CRUD routes - vô hiệu hóa, chỉ giữ để không lỗi
router.post("/", inventoryCtrl.create);
router.put("/:id", inventoryCtrl.update);
router.delete("/:id", inventoryCtrl.delete);

// Scraps routes
router.put("/scraps/:id/mark-used", inventoryCtrl.markScrapUsed);
router.delete("/scraps/:id", inventoryCtrl.deleteScrap);

// VRPK code generation
router.get("/next-vrpk-code", inventoryCtrl.getNextVRPKCode);

// Delete all inventory data (use with caution!)
router.delete("/delete-all", inventoryCtrl.deleteAllInventory);

module.exports = router;

