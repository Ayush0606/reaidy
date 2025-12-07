import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

/**
 * Get dashboard summary for a specific month
 * GET /api/dashboard/summary?month=YYYY-MM
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month query parameter (YYYY-MM).'
      });
    }

    // Calculate start and end dates for the month
    const [year, monthNum] = month.split('-');
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(year, parseInt(monthNum), 0); // Last day of month

    // Get all transactions for the month
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Calculate total spending
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate spending by category
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

    // Calculate daily spending for time series
    const dailySpending = {};
    transactions.forEach(t => {
      const dateKey = t.date.toISOString().split('T')[0];
      dailySpending[dateKey] = (dailySpending[dateKey] || 0) + t.amount;
    });

    // Convert to array format for charts
    const timeSeries = Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount
    }));

    // Get budget for the month
    const budget = await Budget.findOne({
      userId: req.user._id,
      month
    });

    // Calculate budget status
    let budgetStatus = null;
    if (budget) {
      const ratio = totalSpending / budget.totalBudget;
      let status = 'within';
      let color = 'green';
      
      if (ratio >= 0.9) {
        status = 'over';
        color = 'red';
      } else if (ratio >= 0.7) {
        status = 'close';
        color = 'yellow';
      }

      budgetStatus = {
        totalBudget: budget.totalBudget,
        totalSpent: totalSpending,
        remaining: budget.totalBudget - totalSpending,
        percentage: Math.round(ratio * 100),
        status,
        color
      };

      // Calculate category budget status
      const categoryStatus = {};
      Object.keys(budget.categoryBudgets).forEach(cat => {
        if (budget.categoryBudgets[cat] > 0) {
          const spent = byCategory[cat] || 0;
          const catRatio = spent / budget.categoryBudgets[cat];
          let catStatus = 'within';
          let catColor = 'green';
          
          if (catRatio >= 0.9) {
            catStatus = 'over';
            catColor = 'red';
          } else if (catRatio >= 0.7) {
            catStatus = 'close';
            catColor = 'yellow';
          }

          categoryStatus[cat] = {
            budget: budget.categoryBudgets[cat],
            spent,
            remaining: budget.categoryBudgets[cat] - spent,
            percentage: Math.round(catRatio * 100),
            status: catStatus,
            color: catColor
          };
        }
      });

      budgetStatus.categoryStatus = categoryStatus;
    }

    res.status(200).json({
      success: true,
      data: {
        month,
        totalSpending,
        byCategory,
        timeSeries,
        transactionCount: transactions.length,
        budgetStatus
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary.',
      error: error.message
    });
  }
};

/**
 * Get yearly overview
 * GET /api/dashboard/yearly?year=YYYY
 */
export const getYearlyOverview = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear().toString();

    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate monthly totals
    const monthlyTotals = {};
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${currentYear}-${i.toString().padStart(2, '0')}`;
      monthlyTotals[monthKey] = 0;
    }

    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
    });

    const monthlyData = Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));

    res.status(200).json({
      success: true,
      data: {
        year: currentYear,
        totalSpending: transactions.reduce((sum, t) => sum + t.amount, 0),
        monthlyData
      }
    });
  } catch (error) {
    console.error('Yearly overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching yearly overview.',
      error: error.message
    });
  }
};
