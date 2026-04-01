import express from 'express';
import {
    exportConversation,
    getAdminConversationMessages,
    getAdminConversations,
    getConversationMessages,
    getConversations,
    getFlaggedMessages,
    markConversationAsRead,
    sendMessage,
    startConversation
} from '../controllers/chatController.js';
import { isAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/conversations/start', startConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.put('/conversations/:conversationId/read', markConversationAsRead);
router.post('/messages', sendMessage);
router.get('/export/:conversationId', exportConversation);

router.get('/admin/conversations', isAdmin, getAdminConversations);
router.get('/admin/conversations/:conversationId/messages', isAdmin, getAdminConversationMessages);
router.get('/admin/flagged-messages', isAdmin, getFlaggedMessages);

export default router;
