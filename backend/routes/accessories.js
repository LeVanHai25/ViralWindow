const express = require("express");
const router = express.Router();
const accessoriesCtrl = require("../controllers/accessoriesController");

router.get("/", accessoriesCtrl.getAllAccessories);
router.get("/stats", accessoriesCtrl.getStatistics);
router.get("/:id", accessoriesCtrl.getById);
router.post("/", accessoriesCtrl.create);
router.put("/:id", accessoriesCtrl.update);
router.delete("/:id", accessoriesCtrl.delete);

module.exports = router;






