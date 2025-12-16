// commentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    createComment, 
    getPostComments, 
    updateComment, 
    deleteComment 
} from '../controllers/commentController.js';

const router = express.Router();

// Public route
router.get("/:postId", getPostComments);              // Get comments for post

// Protected routes
router.post("/:postId", protect, createComment);      // Create comment
router.put("/:id", protect, updateComment);           // Update comment
router.delete("/:id", protect, deleteComment);        // Delete comment

export default router;