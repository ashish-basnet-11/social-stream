// backend/src/routes/userRoutes.js
import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { 
    getMyProfile, 
    updateMyProfile, 
    getUserProfile, 
    searchUsers 
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes (requires authentication)
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/search", protect, searchUsers);

// Public/optional auth routes
router.get("/:userId", optionalAuth, getUserProfile);

export default router;