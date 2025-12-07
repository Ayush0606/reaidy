import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  uploadCSV,
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// CSV upload
router.post('/upload', upload.single('file'), uploadCSV);

// CRUD operations
router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
