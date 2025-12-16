import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { 
    createPost, 
    getAllPosts, 
    getPostById, 
    updatePost, 
    deletePost,
    getUserPosts
} from '../controllers/postsController.js';

const router = express.Router();

// Public routes (anyone can view)
router.get("/", optionalAuth, getAllPosts);           // Get all posts (feed)
router.get("/:id", optionalAuth, getPostById);        // Get single post
router.get("/user/:userId", getUserPosts);            // Get posts by user

// Protected routes (requires authentication)
router.post("/", protect, createPost);                // Create post
router.put("/:id", protect, updatePost);              // Update post
router.delete("/:id", protect, deletePost);           // Delete post

export default router;