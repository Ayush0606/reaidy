# AI Personal Finance Advisor

A full-stack web application built with the MERN stack that helps users manage their personal finances with AI-powered insights. Users can upload bank statements, track transactions, set budgets, and receive personalized spending analysis using Google's Gemini AI.

## 🚀 Features

### User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **User Registration & Login**: Simple onboarding flow with session management
- **Protected Routes**: Secure access to user data and features

### Transaction Management
- **Manual Entry**: Add individual transactions with auto-categorization
- **CSV Upload**: Bulk import transactions from bank statements
- **Smart Categorization**: Automatic transaction categorization based on description keywords
- **CRUD Operations**: Full create, read, update, and delete functionality
- **Advanced Filters**: Filter by date range and category
- **Transaction History**: View all transactions with pagination

### Budget Management
- **Monthly Budgets**: Set overall and category-specific budgets
- **Real-time Tracking**: Visual progress bars showing budget utilization
- **Smart Alerts**: Color-coded warnings at 70% and 90% thresholds
- **Category Breakdown**: Detailed spending vs. budget for each category

### AI-Powered Insights
- **Spending Analysis**: AI-generated summaries of spending patterns
- **Top Categories**: Identify highest spending categories with percentages
- **Actionable Suggestions**: Personalized recommendations to reduce expenses
- **Savings Goals**: AI-recommended monthly savings targets
- **Historical Summaries**: Save and review past AI analyses

### Dashboard & Visualization
- **Summary Cards**: Total spending, budget status, and key metrics
- **Category Pie Chart**: Visual breakdown of spending by category
- **Time Series Chart**: Daily spending trends over the month
- **Budget Alerts**: Prominent warnings when approaching or exceeding limits

## 📋 Prerequisites

- **Node.js**: v18+ and npm/yarn
- **MongoDB**: v5.0+ (local or MongoDB Atlas)
- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reaidy
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# - AI_API_KEY: Your Gemini API key
```

**Backend .env Configuration:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-finance
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
AI_PROVIDER_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and add it to `backend/.env`

**Option C: Docker**
```bash
# From project root
docker-compose up mongodb
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests include:
- User registration and login
- JWT authentication
- Transaction CRUD operations
- CSV upload functionality
- Authorization middleware

## 📁 Project Structure

```
reaidy/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # Auth endpoints
│   │   │   ├── transactionController.js
│   │   │   ├── budgetController.js
│   │   │   ├── dashboardController.js
│   │   │   └── aiController.js
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Transaction.js
│   │   │   ├── Budget.js
│   │   │   └── MonthlySummary.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification
│   │   │   └── uploadMiddleware.js   # Multer config
│   │   ├── services/
│   │   │   └── aiService.js          # Gemini AI integration
│   │   ├── utils/
│   │   │   ├── categoryUtils.js      # Auto-categorization
│   │   │   └── csvParser.js          # CSV parsing
│   │   └── app.js                    # Express app
│   ├── tests/
│   │   └── api.test.js               # API tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Main layout
│   │   │   └── PrivateRoute.jsx      # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Transactions.jsx      # Transaction management
│   │   │   └── Budget.jsx            # Budget settings
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Tailwind styles
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── sample-transactions.csv
└── README.md
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions (with filters)
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/upload` - Upload CSV file

### Budgets
- `POST /api/budgets` - Set/update budget
- `GET /api/budgets?month=YYYY-MM` - Get budget for month
- `GET /api/budgets/all` - Get all budgets

### Dashboard
- `GET /api/dashboard/summary?month=YYYY-MM` - Get monthly summary
- `GET /api/dashboard/yearly?year=YYYY` - Get yearly overview

### AI Analysis
- `POST /api/ai/analyze?month=YYYY-MM` - Analyze transactions with AI
- `GET /api/ai/summaries?month=YYYY-MM` - Get saved AI summaries

## 💾 Database Schemas

### User
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  settings: {
    currency: String,
    defaultBudget: Number
  },
  createdAt: Date
}
```

### Transaction
```javascript
{
  userId: ObjectId,
  date: Date,
  description: String,
  amount: Number,
  category: String,
  source: String (manual|csv),
  createdAt: Date
}
```

### Budget
```javascript
{
  userId: ObjectId,
  month: String (YYYY-MM),
  totalBudget: Number,
  categoryBudgets: {
    food: Number,
    rent: Number,
    // ... other categories
  },
  createdAt: Date
}
```

### MonthlySummary
```javascript
{
  userId: ObjectId,
  month: String (YYYY-MM),
  totalSpending: Number,
  byCategory: Object,
  aiSummary: String,
  aiInsights: {
    topCategories: Array,
    suggestions: Array,
    savingsGoal: Number
  },
  createdAt: Date
}
```

## 📝 CSV Upload Format

Your CSV file should have the following columns:

```csv
date,description,amount
2025-11-01,Starbucks Coffee,4.75
2025-11-02,Rent November,800
2025-11-03,Uber ride,15.50
```

**Supported date formats:**
- `YYYY-MM-DD` (recommended)
- `MM/DD/YYYY`

**Optional column:**
- `category` - If not provided, the system will auto-categorize based on description

## 🎨 Categories

Available transaction categories:
- Food
- Rent
- Transport
- Shopping
- Subscriptions
- Utilities
- Healthcare
- Entertainment
- Education
- Others

## 🤖 AI Integration

The application uses Google's Gemini AI for transaction analysis. The AI provides:

1. **Spending Summary**: Concise overview of monthly spending patterns
2. **Top Categories**: Identifies highest spending areas with percentages
3. **Cost-cutting Suggestions**: Personalized recommendations
4. **Savings Goals**: Realistic monthly savings targets

**Fallback Behavior**: If AI is unavailable, the system generates basic statistical analysis.

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Protected Routes**: Middleware verification on all protected endpoints
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin access
- **SQL Injection Prevention**: MongoDB query parameterization

## 🌐 Deployment

### Backend (Node.js + Express)
Recommended platforms:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Environment Variables**: Ensure all `.env` variables are set in your deployment platform.

### Frontend (React + Vite)
Recommended platforms:
- Vercel
- Netlify
- Cloudflare Pages

**Build Command**: `npm run build`
**Output Directory**: `dist`

### Database
- MongoDB Atlas (recommended for production)
- Self-hosted MongoDB

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## 🎯 Usage Guide

### Getting Started
1. **Register**: Create an account with email and password
2. **Login**: Access your personal dashboard
3. **Add Transactions**: Upload CSV or manually add transactions
4. **Set Budget**: Define monthly and category budgets
5. **Get AI Insights**: Click "AI Analyze" on the dashboard
6. **Monitor**: Track spending with charts and alerts

### Budget Alerts
- **Green** (0-69%): Within budget ✅
- **Yellow** (70-89%): Close to limit ⚠️
- **Red** (90%+): Over budget 🚨

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running. Check connection string in `.env`

### JWT Authentication Error
```
Error: Invalid token
```
**Solution**: Clear browser localStorage and login again

### AI Analysis Fails
```
Error: AI API key not configured
```
**Solution**: Add valid Gemini API key to `backend/.env`

### CSV Upload Error
```
Error: Only CSV files are allowed
```
**Solution**: Ensure file has `.csv` extension and proper format

## 📈 Future Enhancements

- Multi-currency support
- Recurring transaction detection
- Goal-based savings tracking
- Bill payment reminders
- Export reports (PDF/Excel)
- Mobile app (React Native)
- Bank account integration (Plaid)
- Multi-user household budgets
- Investment tracking
- Tax categorization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Created as part of a full-stack development assessment demonstrating:
- MERN stack proficiency
- RESTful API design
- Database schema design
- AI integration
- Modern React patterns
- Security best practices

## 🙏 Acknowledgments

- Google Gemini AI for intelligent insights
- Recharts for beautiful visualizations
- Tailwind CSS for rapid UI development
- MongoDB for flexible data storage

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint examples

---

**Built with ❤️ using the MERN Stack**
#   r e a i d y  
 