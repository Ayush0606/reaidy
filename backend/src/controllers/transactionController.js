import Transaction from '../models/Transaction.js';
import { parseCSV } from '../utils/csvParser.js';
import { categorizeTransaction, parseDate } from '../utils/categoryUtils.js';

/**
 * Upload and parse CSV file
 * POST /api/transactions/upload
 */
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a CSV file.'
      });
    }

    // Parse CSV
    const { transactions, errors } = await parseCSV(req.file.buffer);

    if (transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid transactions found in CSV file.',
        errors
      });
    }

    // Add userId to all transactions
    const transactionsWithUser = transactions.map(t => ({
      ...t,
      userId: req.user._id
    }));

    // Insert transactions
    const insertedTransactions = await Transaction.insertMany(transactionsWithUser);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${insertedTransactions.length} transactions.`,
      data: {
        imported: insertedTransactions.length,
        errors: errors.length > 0 ? errors : undefined,
        transactions: insertedTransactions
      }
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV file.',
      error: error.message
    });
  }
};

/**
 * Create a new transaction
 * POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const { date, description, amount, category } = req.body;

    // Validation
    if (!date || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, description, and amount.'
      });
    }

    // Parse date
    const parsedDate = parseDate(date);

    // Auto-categorize if category not provided
    const finalCategory = category || categorizeTransaction(description);

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      date: parsedDate,
      description: description.trim(),
      amount: parseFloat(amount),
      category: finalCategory,
      source: 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: { transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction.',
      error: error.message
    });
  }
};

/**
 * Get all transactions with filters
 * GET /api/transactions?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&category=food&page=1&limit=50
 */
export const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, category, page = 1, limit = 50 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions.',
      error: error.message
    });
  }
};

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, category } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    // Update fields
    if (date) transaction.date = parseDate(date);
    if (description) transaction.description = description.trim();
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (category) transaction.category = category;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: { transaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction.',
      error: error.message
    });
  }
};

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction.',
      error: error.message
    });
  }
};
