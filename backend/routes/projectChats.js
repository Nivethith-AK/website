import express from 'express';
import { protect } from '../middleware/auth.js';
import { getProjectConversations, getProjectMessages, sendProjectMessage } from '../controllers/projectChatController.js';
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

router.use(protect);

router.get('/', getProjectConversations);
router.get('/:projectId/messages', getProjectMessages);
router.post('/:projectId/messages', upload.array('attachments', 5), sendProjectMessage);

export default router;
