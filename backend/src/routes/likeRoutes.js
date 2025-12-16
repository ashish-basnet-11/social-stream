// likeRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { toggleLike, getPostLikes } from '../controllers/likeController.js';

const router = express.Router();

// All like routes require authentication
router.post("/:postId", protect, toggleLike);         // Toggle like on post
router.get("/:postId", getPostLikes);                 // Get all likes for post

export default router;