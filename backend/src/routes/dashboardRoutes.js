import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getDashboardSummary, getYearlyOverview } from '../controllers/dashboardController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.get('/summary', getDashboardSummary);
router.get('/yearly', getYearlyOverview);

export default router;
