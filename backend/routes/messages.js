import express from 'express';
import { sendMessage, getMessagesByUser, getConversations, getUnreadCount, adminSendPrivateMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'backend/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(authMiddleware);

router.get('/unread-count', getUnreadCount);
router.get('/', getConversations);
router.post('/', upload.array('attachments', 5), sendMessage);
router.post('/admin/private', authorize('admin'), upload.array('attachments', 5), adminSendPrivateMessage);
router.get('/:userId', getMessagesByUser);

export default router;
