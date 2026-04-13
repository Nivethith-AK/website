import express from 'express';
import { sendMessage, getMessagesByUser, getConversations, getUnreadCount } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/unread-count', getUnreadCount);
router.get('/', getConversations);
router.post('/', sendMessage);
router.get('/:userId', getMessagesByUser);

export default router;
