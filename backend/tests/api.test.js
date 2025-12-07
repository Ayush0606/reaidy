import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Transaction from '../src/models/Transaction.js';

// Test database connection
const TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-finance-test';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User One',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Two',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Me Test',
          email: 'me@example.com',
          password: 'password123'
        });
      token = response.body.data.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('me@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid token');
    });
  });
});

describe('Transaction Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Transaction Test',
        email: 'transactions@example.com',
        password: 'password123'
      });
    token = response.body.data.token;
    userId = response.body.data.user._id;
  });

  beforeEach(async () => {
    await Transaction.deleteMany({});
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction successfully', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2025-11-15',
          description: 'Coffee Shop',
          amount: 5.50,
          category: 'food'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction).toHaveProperty('description', 'Coffee Shop');
      expect(response.body.data.transaction).toHaveProperty('amount', 5.50);
    });

    it('should auto-categorize transaction', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2025-11-15',
          description: 'Starbucks Coffee',
          amount: 5.50
        });

      expect(response.status).toBe(201);
      expect(response.body.data.transaction.category).toBe('food');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          date: '2025-11-15',
          description: 'Test',
          amount: 10
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Missing date and amount'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      // Create test transactions
      await Transaction.create([
        {
          userId,
          date: new Date('2025-11-01'),
          description: 'Transaction 1',
          amount: 50,
          category: 'food'
        },
        {
          userId,
          date: new Date('2025-11-15'),
          description: 'Transaction 2',
          amount: 100,
          category: 'shopping'
        },
        {
          userId,
          date: new Date('2025-12-01'),
          description: 'Transaction 3',
          amount: 75,
          category: 'transport'
        }
      ]);
    });

    it('should get all transactions', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(3);
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/transactions?startDate=2025-11-01&endDate=2025-11-30')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.transactions).toHaveLength(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/transactions?category=food')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].category).toBe('food');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const transaction = await Transaction.create({
        userId,
        date: new Date('2025-11-01'),
        description: 'Original Description',
        amount: 50,
        category: 'food'
      });
      transactionId = transaction._id;
    });

    it('should update transaction successfully', async () => {
      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Updated Description',
          amount: 75
        });

      expect(response.status).toBe(200);
      expect(response.body.data.transaction.description).toBe('Updated Description');
      expect(response.body.data.transaction.amount).toBe(75);
    });

    it('should fail with invalid transaction ID', async () => {
      const response = await request(app)
        .put('/api/transactions/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Updated'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      const transaction = await Transaction.create({
        userId,
        date: new Date('2025-11-01'),
        description: 'To be deleted',
        amount: 50,
        category: 'food'
      });
      transactionId = transaction._id;
    });

    it('should delete transaction successfully', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deleted = await Transaction.findById(transactionId);
      expect(deleted).toBeNull();
    });
  });
});
