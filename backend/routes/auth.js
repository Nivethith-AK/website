import express from 'express';
import { registerDesigner, registerCompany, registerUser, loginUser, login, getMe, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/register/designer', registerDesigner);
router.post('/register/company', registerCompany);
router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

export default router;
