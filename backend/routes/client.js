import express from 'express';
import {
  createClientRequest,
  getCompanyRequests,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyPortfolioItem,
} from '../controllers/clientController.js';
import { protect, authorize, requireApproved } from '../middleware/auth.js';
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
router.use('/requests', requireApproved);
router.post('/requests', createClientRequest);
router.get('/requests', getCompanyRequests);

// Company profile
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.post('/upload/portfolio', upload.single('portfolioImage'), uploadCompanyPortfolioItem);

export default router;
