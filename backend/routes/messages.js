import express from 'express';
import { sendMessage, getMessagesByUser, getConversations, getUnreadCount, adminSendPrivateMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/unread-count', getUnreadCount);
router.get('/', getConversations);
router.post('/', sendMessage);
router.post('/admin/private', authorize('admin'), adminSendPrivateMessage);
router.get('/:userId', getMessagesByUser);

export default router;
