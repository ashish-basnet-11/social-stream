import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
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
router.get("/", optionalAuth, getAllPosts);           
router.get("/:id", optionalAuth, getPostById);        
router.get("/user/:userId", getUserPosts);            

// Protected routes (requires authentication)
router.post("/", protect, upload.single('image'), createPost);  // Add upload middleware
router.put("/:id", protect, updatePost);              
router.delete("/:id", protect, deletePost);           

export default router;