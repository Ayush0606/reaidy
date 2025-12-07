import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { budgetAPI, dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'food', 'rent', 'transport', 'shopping', 'subscriptions',
  'utilities', 'healthcare', 'entertainment', 'education', 'others'
];

const Budget = () => {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    totalBudget: '',
    categoryBudgets: {}
  });

  useEffect(() => {
    fetchBudgetData();
  }, [month]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        budgetAPI.get(month).catch(() => ({ data: { data: { budget: null } } })),
        dashboardAPI.getSummary(month).catch(() => ({ data: { data: null } }))
      ]);

      const budgetData = budgetRes.data.data.budget;
      setBudget(budgetData);
      setSummary(summaryRes.data.data);

      if (budgetData) {
        setFormData({
          totalBudget: budgetData.totalBudget,
          categoryBudgets: budgetData.categoryBudgets
        });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetAPI.set({
        month,
        totalBudget: parseFloat(formData.totalBudget),
        categoryBudgets: formData.categoryBudgets
      });
      toast.success('Budget saved successfully');
      setEditing(false);
      fetchBudgetData();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };

  const handleCategoryBudgetChange = (category, value) => {
    setFormData({
      ...formData,
      categoryBudgets: {
        ...formData.categoryBudgets,
        [category]: value ? parseFloat(value) : 0
      }
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 90) return <span className="badge badge-red">Over Budget</span>;
    if (percentage >= 70) return <span className="badge badge-yellow">Close to Limit</span>;
    return <span className="badge badge-green">Within Budget</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
          />
          {!editing && budget && (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Budget
            </button>
          )}
        </div>
      </div>

      {/* Overall Budget Status */}
      {budget && summary?.budgetStatus && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Overall Budget Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">${summary.budgetStatus.totalBudget.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${summary.budgetStatus.totalSpent.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${
                  summary.budgetStatus.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(summary.budgetStatus.remaining).toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {summary.budgetStatus.percentage}% Used
                </span>
                {getStatusBadge(summary.budgetStatus.percentage)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    getProgressColor(summary.budgetStatus.percentage)
                  }`}
                  style={{ width: `${Math.min(summary.budgetStatus.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Alert Messages */}
            {summary.budgetStatus.percentage >= 90 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">🚨 Budget Alert!</p>
                <p className="text-red-700 text-sm mt-1">
                  You've exceeded 90% of your budget. Consider reducing spending immediately.
                </p>
              </div>
            )}
            {summary.budgetStatus.percentage >= 70 && summary.budgetStatus.percentage < 90 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">⚠️ Warning!</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You've used 70% of your budget. Monitor your spending carefully.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget Form */}
      {(editing || !budget) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {budget ? 'Edit Budget' : 'Set Budget'} for {month}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Monthly Budget ($)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                className="input"
                placeholder="2000.00"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Category Budgets (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <div key={category}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.categoryBudgets[category] || ''}
                      onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                Save Budget
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Category Budget Breakdown */}
      {budget && summary?.budgetStatus?.categoryStatus && !editing && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Category Budget Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(summary.budgetStatus.categoryStatus).map(([category, status]) => (
              <div key={category} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{category}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      ${status.spent.toFixed(2)} / ${status.budget.toFixed(2)}
                    </span>
                    {getStatusBadge(status.percentage)}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      getProgressColor(status.percentage)
                    }`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {status.percentage}% used
                  </span>
                  <span className={`text-xs ${
                    status.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(status.remaining).toFixed(2)} {status.remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Budget Set */}
      {!budget && !editing && (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No budget set for this month</p>
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            Set Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default Budget;
