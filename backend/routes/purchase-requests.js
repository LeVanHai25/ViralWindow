const express = require("express");
const router = express.Router();
const purchaseRequestCtrl = require("../controllers/purchaseRequestController");
const { authenticateToken } = require("../middleware/auth");

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /api/purchase-requests - Lấy danh sách phiếu yêu cầu
router.get("/", purchaseRequestCtrl.getAll);

// GET /api/purchase-requests/:id - Lấy chi tiết phiếu yêu cầu
router.get("/:id", purchaseRequestCtrl.getById);

// POST /api/purchase-requests - Tạo phiếu yêu cầu mới
router.post("/", purchaseRequestCtrl.create);

// PUT /api/purchase-requests/:id - Cập nhật phiếu yêu cầu
router.put("/:id", purchaseRequestCtrl.update);

// DELETE /api/purchase-requests/:id - Xóa phiếu yêu cầu
router.delete("/:id", purchaseRequestCtrl.delete);

// PUT /api/purchase-requests/:id/status - Cập nhật trạng thái
router.put("/:id/status", purchaseRequestCtrl.updateStatus);

module.exports = router;

