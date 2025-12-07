import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
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
  totalBudget: {
    type: Number,
    required: true,
    min: [0, 'Budget must be positive']
  },
  categoryBudgets: {
    food: { type: Number, default: 0, min: 0 },
    rent: { type: Number, default: 0, min: 0 },
    transport: { type: Number, default: 0, min: 0 },
    shopping: { type: Number, default: 0, min: 0 },
    subscriptions: { type: Number, default: 0, min: 0 },
    utilities: { type: Number, default: 0, min: 0 },
    healthcare: { type: Number, default: 0, min: 0 },
    entertainment: { type: Number, default: 0, min: 0 },
    education: { type: Number, default: 0, min: 0 },
    others: { type: Number, default: 0, min: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one budget per user per month
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
