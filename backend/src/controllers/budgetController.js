import Budget from '../models/Budget.js';

/**
 * Set or update budget for a month
 * POST /api/budgets
 */
export const setBudget = async (req, res) => {
  try {
    const { month, totalBudget, categoryBudgets } = req.body;

    // Validation
    if (!month || !totalBudget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month (YYYY-MM) and totalBudget.'
      });
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format.'
      });
    }

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month },
      {
        userId: req.user._id,
        month,
        totalBudget: parseFloat(totalBudget),
        categoryBudgets: categoryBudgets || {}
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget set successfully.',
      data: { budget }
    });
  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting budget.',
      error: error.message
    });
  }
};

/**
 * Get budget for a specific month
 * GET /api/budgets?month=YYYY-MM
 */
export const getBudget = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month query parameter (YYYY-MM).'
      });
    }

    const budget = await Budget.findOne({
      userId: req.user._id,
      month
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No budget found for this month.'
      });
    }

    res.status(200).json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget.',
      error: error.message
    });
  }
};

/**
 * Get all budgets for the user
 * GET /api/budgets/all
 */
export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id })
      .sort({ month: -1 });

    res.status(200).json({
      success: true,
      data: { budgets }
    });
  } catch (error) {
    console.error('Get all budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets.',
      error: error.message
    });
  }
};
