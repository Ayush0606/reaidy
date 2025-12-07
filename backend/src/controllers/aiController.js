import Transaction from '../models/Transaction.js';
import MonthlySummary from '../models/MonthlySummary.js';
import aiService from '../services/aiService.js';

/**
 * Analyze transactions for a month using AI
 * POST /api/ai/analyze?month=YYYY-MM
 */
export const analyzeMonth = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month query parameter (YYYY-MM).'
      });
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format.'
      });
    }

    // Calculate start and end dates for the month
    const [year, monthNum] = month.split('-');
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(year, parseInt(monthNum), 0);

    // Get all transactions for the month
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Calculate total spending and category breakdown
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const byCategory = {};
    const categories = [
      'food', 'rent', 'transport', 'shopping', 'subscriptions',
      'utilities', 'healthcare', 'entertainment', 'education', 'others'
    ];
    
    categories.forEach(cat => {
      byCategory[cat] = 0;
    });

    transactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    // Get AI analysis
    const aiInsights = await aiService.analyzeTransactions(
      req.user._id,
      month,
      transactions
    );

    // Save or update monthly summary
    const monthlySummary = await MonthlySummary.findOneAndUpdate(
      { userId: req.user._id, month },
      {
        userId: req.user._id,
        month,
        totalSpending,
        byCategory,
        aiSummary: aiInsights.summary,
        aiInsights: {
          topCategories: aiInsights.topCategories,
          suggestions: aiInsights.suggestions,
          savingsGoal: aiInsights.savingsGoal
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'AI analysis completed successfully.',
      data: {
        month,
        totalSpending,
        byCategory,
        aiSummary: aiInsights.summary,
        aiInsights: {
          topCategories: aiInsights.topCategories,
          suggestions: aiInsights.suggestions,
          savingsGoal: aiInsights.savingsGoal
        }
      }
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing transactions.',
      error: error.message
    });
  }
};

/**
 * Get saved AI summaries
 * GET /api/ai/summaries?month=YYYY-MM
 */
export const getSummaries = async (req, res) => {
  try {
    const { month } = req.query;

    const query = { userId: req.user._id };
    if (month) {
      query.month = month;
    }

    const summaries = await MonthlySummary.find(query).sort({ month: -1 });

    if (month && summaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No AI summary found for this month.'
      });
    }

    res.status(200).json({
      success: true,
      data: { summaries }
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI summaries.',
      error: error.message
    });
  }
};
