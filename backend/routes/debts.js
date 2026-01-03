const express = require("express");
const router = express.Router();
const debtCtrl = require("../controllers/debtController");

// Get all debts
router.get("/", debtCtrl.getAllDebts);

// Get statistics
router.get("/statistics", debtCtrl.getStatistics);

// Get debt by ID
router.get("/:id", debtCtrl.getById);

// Create debt
router.post("/", debtCtrl.create);

// Update debt
router.put("/:id", debtCtrl.update);

// Record payment
router.post("/:id/payment", debtCtrl.recordPayment);

// Delete debt
router.delete("/:id", debtCtrl.delete);

module.exports = router;




























