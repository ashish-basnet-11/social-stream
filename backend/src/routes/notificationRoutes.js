import express from "express";
import { getNotifications, markAsRead, markOneRead, deleteNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read", protect, markAsRead);
// backend/routes/notificationRoutes.js
router.put("/:id/read", protect, markOneRead);

router.delete("/:id", protect, deleteNotification);

export default router;