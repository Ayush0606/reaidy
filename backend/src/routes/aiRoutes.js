import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { analyzeMonth, getSummaries } from '../controllers/aiController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/analyze', analyzeMonth);
router.get('/summaries', getSummaries);

export default router;
