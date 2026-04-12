import express from 'express';
import { registerDesigner, registerCompany, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register/designer', registerDesigner);
router.post('/register/company', registerCompany);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
