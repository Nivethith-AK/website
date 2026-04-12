import express from 'express';
import { createRequest } from '../controllers/platformRequestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('company'), createRequest);

export default router;
