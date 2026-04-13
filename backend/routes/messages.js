import express from 'express';
import { sendMessage, getMessagesByUser, getConversations } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getConversations);
router.post('/', sendMessage);
router.get('/:userId', getMessagesByUser);

export default router;
