const express = require("express");
const router = express.Router();
const financialCtrl = require("../controllers/financialController");

// Get all transactions
router.get("/transactions", financialCtrl.getAllTransactions);

// Get statistics
router.get("/statistics", financialCtrl.getStatistics);

// Get transaction by ID
router.get("/transactions/:id", financialCtrl.getById);

// Create transaction
router.post("/transactions", financialCtrl.create);

// Update transaction
router.put("/transactions/:id", financialCtrl.update);

// Delete transaction
router.delete("/transactions/:id", financialCtrl.delete);

// Sync data from projects (quotations, materials)
router.post("/sync", financialCtrl.syncFromProjects);

// Get dashboard summary
router.get("/dashboard", financialCtrl.getDashboardSummary);

// Migration: Add status column (GET for easy browser testing)
router.get("/migrate-add-status", financialCtrl.migrateAddStatus);

module.exports = router;




























