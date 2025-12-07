# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "settings": {
        "currency": "USD",
        "defaultBudget": 0
      },
      "createdAt": "2025-12-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

---

## Transaction Endpoints

### Create Transaction
**POST** `/transactions` 🔒

**Request Body:**
```json
{
  "date": "2025-11-15",
  "description": "Starbucks Coffee",
  "amount": 5.50,
  "category": "food"  // Optional - will auto-detect if not provided
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully.",
  "data": {
    "transaction": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "date": "2025-11-15T00:00:00.000Z",
      "description": "Starbucks Coffee",
      "amount": 5.5,
      "category": "food",
      "source": "manual",
      "createdAt": "2025-12-06T10:30:00.000Z"
    }
  }
}
```

### Get All Transactions
**GET** `/transactions` 🔒

**Query Parameters:**
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `category` (optional): Filter by category
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50)

**Example:**
```
GET /transactions?startDate=2025-11-01&endDate=2025-11-30&category=food&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [ /* array of transactions */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Update Transaction
**PUT** `/transactions/:id` 🔒

**Request Body:**
```json
{
  "description": "Updated Description",
  "amount": 10.00,
  "category": "shopping"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction updated successfully.",
  "data": {
    "transaction": { /* updated transaction */ }
  }
}
```

### Delete Transaction
**DELETE** `/transactions/:id` 🔒

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully."
}
```

### Upload CSV
**POST** `/transactions/upload` 🔒

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- File type: `.csv`

**CSV Format:**
```csv
date,description,amount
2025-11-01,Coffee,4.75
2025-11-02,Rent,800
```

**Response (201):**
```json
{
  "success": true,
  "message": "Successfully imported 2 transactions.",
  "data": {
    "imported": 2,
    "transactions": [ /* imported transactions */ ]
  }
}
```

---

## Budget Endpoints

### Set Budget
**POST** `/budgets` 🔒

**Request Body:**
```json
{
  "month": "2025-11",
  "totalBudget": 2000,
  "categoryBudgets": {
    "food": 400,
    "rent": 800,
    "transport": 200
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Budget set successfully.",
  "data": {
    "budget": { /* budget object */ }
  }
}
```

### Get Budget
**GET** `/budgets?month=2025-11` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {
    "budget": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "month": "2025-11",
      "totalBudget": 2000,
      "categoryBudgets": { /* category budgets */ }
    }
  }
}
```

---

## Dashboard Endpoints

### Get Monthly Summary
**GET** `/dashboard/summary?month=2025-11` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {
    "month": "2025-11",
    "totalSpending": 1250.50,
    "byCategory": {
      "food": 350.00,
      "rent": 800.00,
      "transport": 100.50
    },
    "timeSeries": [
      { "date": "2025-11-01", "amount": 50.00 },
      { "date": "2025-11-02", "amount": 800.00 }
    ],
    "transactionCount": 15,
    "budgetStatus": {
      "totalBudget": 2000,
      "totalSpent": 1250.50,
      "remaining": 749.50,
      "percentage": 63,
      "status": "within",
      "color": "green",
      "categoryStatus": { /* per-category status */ }
    }
  }
}
```

---

## AI Endpoints

### Analyze Transactions
**POST** `/ai/analyze?month=2025-11` 🔒

**Response (200):**
```json
{
  "success": true,
  "message": "AI analysis completed successfully.",
  "data": {
    "month": "2025-11",
    "totalSpending": 1250.50,
    "byCategory": { /* spending by category */ },
    "aiSummary": "You spent $1,250.50 this month...",
    "aiInsights": {
      "topCategories": [
        {
          "category": "rent",
          "amount": 800,
          "percent": 64
        }
      ],
      "suggestions": [
        "Cook at home 3x/week to save ~$60",
        "Review subscriptions and cancel unused"
      ],
      "savingsGoal": 150
    }
  }
}
```

### Get AI Summaries
**GET** `/ai/summaries?month=2025-11` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summaries": [ /* array of monthly summaries */ ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error.",
  "error": "Error details..."
}
```

---

## Rate Limiting
Currently not implemented. Recommended for production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

## CORS
Configured to allow requests from:
- `http://localhost:3000` (development)
- Configure production frontend URL in `.env`

---

🔒 = Requires authentication
