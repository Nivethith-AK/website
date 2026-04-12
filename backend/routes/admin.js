import express from 'express';
import {
  getDashboardStats,
  getPendingDesigners,
  approveDesigner,
  rejectDesigner,
  getAllRequests,
  approveRequest,
  rejectRequest,
  assignDesignersToProject,
  updateProjectStatus,
  getAllProjects,
  getAllCompanies,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Designer management
router.get('/designers/pending', getPendingDesigners);
router.put('/designers/:id/approve', approveDesigner);
router.put('/designers/:id/reject', rejectDesigner);

// Request management
router.get('/requests', getAllRequests);
router.put('/requests/:id/approve', approveRequest);
router.put('/requests/:id/reject', rejectRequest);

// Project management
router.get('/projects', getAllProjects);
router.post('/projects/assign', assignDesignersToProject);
router.put('/projects/:id/status', updateProjectStatus);

// Company management
router.get('/companies', getAllCompanies);

export default router;
