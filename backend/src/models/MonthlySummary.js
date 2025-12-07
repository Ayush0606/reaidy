import mongoose from 'mongoose';

const monthlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  totalSpending: {
    type: Number,
    required: true,
    default: 0
  },
  byCategory: {
    food: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    utilities: { type: Number, default: 0 },
    healthcare: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    others: { type: Number, default: 0 }
  },
  aiSummary: {
    type: String,
    default: ''
  },
  aiInsights: {
    topCategories: [{
      category: String,
      amount: Number,
      percent: Number
    }],
    suggestions: [String],
    savingsGoal: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one summary per user per month
monthlySummarySchema.index({ userId: 1, month: 1 }, { unique: true });

const MonthlySummary = mongoose.model('MonthlySummary', monthlySummarySchema);

export default MonthlySummary;
