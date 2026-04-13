import express from 'express';
import { protect } from '../middleware/auth.js';
import { getProjectConversations, getProjectMessages, sendProjectMessage } from '../controllers/projectChatController.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjectConversations);
router.get('/:projectId/messages', getProjectMessages);
router.post('/:projectId/messages', sendProjectMessage);

export default router;
