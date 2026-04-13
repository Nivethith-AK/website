import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getPublishedJobs, getAdminJobs, createJob, updateJob, deleteJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/public', getPublishedJobs);

router.get('/admin', protect, authorize('admin'), getAdminJobs);
router.post('/admin', protect, authorize('admin'), createJob);
router.put('/admin/:id', protect, authorize('admin'), updateJob);
router.delete('/admin/:id', protect, authorize('admin'), deleteJob);

export default router;
