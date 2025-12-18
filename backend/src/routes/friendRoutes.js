// backend/src/routes/friendRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getPendingRequests,
    getFriends
} from '../controllers/friendController.js';

const router = express.Router();

// All friend routes require authentication
router.post("/request", protect, sendFriendRequest);
router.put("/request/:requestId/accept", protect, acceptFriendRequest);
router.put("/request/:requestId/reject", protect, rejectFriendRequest);
router.delete("/request/:requestId", protect, cancelFriendRequest);
router.delete("/:friendId", protect, removeFriend);
router.get("/requests/pending", protect, getPendingRequests);
router.get("/", protect, getFriends);

export default router;