import express from 'express';
import {
  getDesignerProfile,
  updateDesignerProfile,
  uploadProfileImage,
  uploadPortfolioImage,
  getAllDesigners,
  getDesignerById,
} from '../controllers/designerController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'backend/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Public routes
router.get('/', getAllDesigners);
router.get('/:id', getDesignerById);

// Protected routes
router.get('/profile/me', protect, authorize('designer'), getDesignerProfile);
router.put('/profile/me', protect, authorize('designer'), updateDesignerProfile);
router.post('/upload/profile-image', protect, authorize('designer'), upload.single('profileImage'), uploadProfileImage);
router.post('/upload/portfolio', protect, authorize('designer'), upload.single('portfolioImage'), uploadPortfolioImage);

export default router;
