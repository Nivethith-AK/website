import express from 'express';
import { approveDesigner, assignProject } from '../controllers/platformAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/approve-designer', protect, authorize('admin'), approveDesigner);
router.post('/assign-project', protect, authorize('admin'), assignProject);

export default router;
