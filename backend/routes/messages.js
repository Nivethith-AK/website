import express from 'express';
import { sendMessage, getMessagesByUser } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/:userId', getMessagesByUser);

export default router;
