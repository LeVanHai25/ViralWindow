const express = require("express");
const router = express.Router();
const installationCtrl = require("../controllers/installationController");

// Lấy danh sách dự án ở giai đoạn lắp đặt
router.get("/projects", installationCtrl.getInstallationProjects);

// Cập nhật tiến độ lắp đặt cho sản phẩm
router.put("/projects/:projectId/products/:productId/progress", installationCtrl.updateInstallationProgress);

// Chuyển dự án sang giai đoạn Bàn giao
router.post("/projects/:projectId/move-to-handover", installationCtrl.moveToHandover);

module.exports = router;



