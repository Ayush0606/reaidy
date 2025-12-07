import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { setBudget, getBudget, getAllBudgets } from '../controllers/budgetController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.post('/', setBudget);
router.get('/', getBudget);
router.get('/all', getAllBudgets);

export default router;
