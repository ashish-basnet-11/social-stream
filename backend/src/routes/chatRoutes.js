import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    deleteMessage
} from '../controllers/chatController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all conversations for the user
router.get('/conversations', getConversations);

// Create or get a conversation with another user
router.post('/conversations', getOrCreateConversation);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', sendMessage);

// Mark messages as read in a conversation
router.put('/conversations/:conversationId/read', markAsRead);

// Delete a message
router.delete('/messages/:messageId', deleteMessage);

export default router;
