import express from 'express';
import {
  createClientRequest,
  getCompanyRequests,
  updateClientRequest,
  deleteClientRequest,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyPortfolioItem,
} from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'backend/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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
router.post('/upload/portfolio', upload.single('portfolioImage'), uploadCompanyPortfolioItem);

export default router;
