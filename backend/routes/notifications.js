const express = require("express");
const router = express.Router();
const notificationCtrl = require("../controllers/notificationController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

// Routes that require authentication
router.get("/", authenticateToken, notificationCtrl.getAllNotifications);
// Routes with optional auth (return 0 count if not logged in)
router.get("/unread-count", optionalAuth, notificationCtrl.getUnreadCount);
router.get("/unread", optionalAuth, notificationCtrl.getUnreadCount); // Alias for compatibility
router.post("/:id/read", authenticateToken, notificationCtrl.markAsRead);
router.post("/read-all", authenticateToken, notificationCtrl.markAllAsRead);
router.delete("/:id", authenticateToken, notificationCtrl.deleteNotification);
router.delete("/delete-read", authenticateToken, notificationCtrl.deleteAllRead);
router.post("/", authenticateToken, notificationCtrl.create);

module.exports = router;
