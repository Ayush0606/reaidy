import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'food', 'rent', 'transport', 'shopping', 'subscriptions',
  'utilities', 'healthcare', 'entertainment', 'education', 'others'
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    category: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;

      const response = await transactionAPI.getAll(params);
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await transactionAPI.update(editingId, formData);
        toast.success('Transaction updated successfully');
      } else {
        await transactionAPI.create(formData);
        toast.success('Transaction added successfully');
      }
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        amount: '',
        category: ''
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category
    });
    setEditingId(transaction._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await transactionAPI.uploadCSV(formData);
      toast.success(`Imported ${response.data.data.imported} transactions`);
      setShowUploadForm(false);
      setUploadFile(null);
      fetchTransactions();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error(error.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-secondary"
          >
            📤 Upload CSV
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                description: '',
                amount: '',
                category: ''
              });
            }}
            className="btn btn-primary"
          >
            ➕ Add Transaction
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="input"
              />
              <p className="text-sm text-gray-600 mt-2">
                Format: date, description, amount (optional: category)
              </p>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={uploading} className="btn btn-primary">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadFile(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleFormChange}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                required
                value={formData.description}
                onChange={handleFormChange}
                className="input"
                placeholder="Coffee at Starbucks"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (leave empty for auto-detect)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="input"
              >
                <option value="">Auto-detect</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Transaction
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Recent Transactions ({transactions.length})
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="badge bg-primary-100 text-primary-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
