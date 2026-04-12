import express from 'express';
import { getApprovedDesigners } from '../controllers/platformDesignerController.js';

const router = express.Router();

router.get('/', getApprovedDesigners);

export default router;
