import express from 'express';
import { updateMyProfile, getProfileById } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.put('/', authMiddleware, updateMyProfile);
router.get('/:id', authMiddleware, getProfileById);

export default router;
