import express from 'express';
import {
  createClientRequest,
  getCompanyRequests,
  updateClientRequest,
  deleteClientRequest,
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All client routes require authentication and company role
router.use(protect, authorize('company'));

// Request management
router.post('/requests', createClientRequest);
router.get('/requests', getCompanyRequests);
router.put('/requests/:id', updateClientRequest);
router.delete('/requests/:id', deleteClientRequest);

// Company profile
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

export default router;
