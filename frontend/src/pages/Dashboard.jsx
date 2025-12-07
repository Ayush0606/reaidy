import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { dashboardAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = {
  food: '#ef4444',
  rent: '#3b82f6',
  transport: '#f59e0b',
  shopping: '#8b5cf6',
  subscriptions: '#ec4899',
  utilities: '#14b8a6',
  healthcare: '#10b981',
  entertainment: '#f97316',
  education: '#6366f1',
  others: '#6b7280'
};

const Dashboard = () => {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [summary, setSummary] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, aiRes] = await Promise.all([
        dashboardAPI.getSummary(month),
        aiAPI.getSummaries(month).catch(() => ({ data: { data: { summaries: [] } } }))
      ]);

      setSummary(summaryRes.data.data);
      
      if (aiRes.data.data.summaries.length > 0) {
        setAiInsights(aiRes.data.data.summaries[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await aiAPI.analyze(month);
      setAiInsights(response.data.data);
      toast.success('AI analysis completed!');
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Failed to analyze transactions');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = summary?.byCategory
    ? Object.entries(summary.byCategory)
        .filter(([_, amount]) => amount > 0)
        .map(([category, amount]) => ({
          name: category,
          value: amount
        }))
    : [];

  const timeSeriesData = summary?.timeSeries || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !summary || summary.transactionCount === 0}
            className="btn btn-primary whitespace-nowrap"
          >
            {analyzing ? '🤖 Analyzing...' : '🤖 AI Analyze'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spending</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${summary?.totalSpending?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {summary?.transactionCount || 0} transactions
          </p>
        </div>

        {summary?.budgetStatus && (
          <>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Budget Status</h3>
              <p className="text-3xl font-bold" style={{
                color: summary.budgetStatus.color === 'green' ? '#10b981' : 
                       summary.budgetStatus.color === 'yellow' ? '#f59e0b' : '#ef4444'
              }}>
                {summary.budgetStatus.percentage}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${summary.budgetStatus.remaining.toFixed(2)} remaining
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Budget Limit</h3>
              <p className="text-3xl font-bold text-gray-900">
                ${summary.budgetStatus.totalBudget.toFixed(2)}
              </p>
              <span className={`badge ${
                summary.budgetStatus.status === 'within' ? 'badge-green' :
                summary.budgetStatus.status === 'close' ? 'badge-yellow' : 'badge-red'
              } mt-2 inline-block`}>
                {summary.budgetStatus.status === 'within' ? 'Within Budget' :
                 summary.budgetStatus.status === 'close' ? 'Close to Limit' : 'Over Budget'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Budget Alerts */}
      {summary?.budgetStatus && summary.budgetStatus.percentage >= 70 && (
        <div className={`p-4 rounded-lg border ${
          summary.budgetStatus.percentage >= 90
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className="font-semibold mb-1" style={{
            color: summary.budgetStatus.percentage >= 90 ? '#dc2626' : '#d97706'
          }}>
            ⚠️ Budget Alert
          </h3>
          <p className="text-sm" style={{
            color: summary.budgetStatus.percentage >= 90 ? '#991b1b' : '#92400e'
          }}>
            You've used {summary.budgetStatus.percentage}% of your monthly budget.
            {summary.budgetStatus.percentage >= 90 && ' Consider reducing spending to stay within your budget.'}
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No spending data for this month</p>
          )}
        </div>

        {/* Time Series */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Daily Spending</h2>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No transactions to display</p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="card bg-gradient-to-br from-primary-50 to-white border border-primary-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-semibold">AI Financial Insights</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{aiInsights.aiSummary}</p>
            </div>

            {aiInsights.aiInsights?.topCategories && aiInsights.aiInsights.topCategories.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Top Spending Categories</h3>
                <div className="space-y-2">
                  {aiInsights.aiInsights.topCategories.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{cat.category}</span>
                      <span className="font-medium">${cat.amount.toFixed(2)} ({cat.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiInsights.aiInsights?.suggestions && aiInsights.aiInsights.suggestions.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">💡 Suggestions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.aiInsights.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.aiInsights?.savingsGoal > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-1">🎯 Savings Goal</h3>
                <p className="text-green-700">
                  Try to save <span className="font-bold">${aiInsights.aiInsights.savingsGoal}</span> this month
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
