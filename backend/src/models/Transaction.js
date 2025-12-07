import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'food',
      'rent',
      'transport',
      'shopping',
      'subscriptions',
      'utilities',
      'healthcare',
      'entertainment',
      'education',
      'others'
    ],
    default: 'others'
  },
  source: {
    type: String,
    enum: ['manual', 'csv'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
