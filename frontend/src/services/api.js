import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Transaction API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  uploadCSV: (formData) => api.post('/transactions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Budget API
export const budgetAPI = {
  get: (month) => api.get('/budgets', { params: { month } }),
  getAll: () => api.get('/budgets/all'),
  set: (data) => api.post('/budgets', data)
};

// Dashboard API
export const dashboardAPI = {
  getSummary: (month) => api.get('/dashboard/summary', { params: { month } }),
  getYearly: (year) => api.get('/dashboard/yearly', { params: { year } })
};

// AI API
export const aiAPI = {
  analyze: (month) => api.post('/ai/analyze', null, { params: { month } }),
  getSummaries: (month) => api.get('/ai/summaries', { params: month ? { month } : {} })
};

export default api;
