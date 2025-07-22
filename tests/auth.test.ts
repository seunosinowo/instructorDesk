import request from 'supertest';
import { app, sequelize } from '../src/server';
import dotenv from 'dotenv';
import path from 'path';

// Load .env for tests
process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('Test .env loaded from:', path.resolve(__dirname, '../.env'));

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Test database connected');
    await sequelize.sync({ force: true }); // Reset database for tests
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
});

afterAll(async () => {
  await sequelize.close(); // Close database connection
});

describe('Auth API', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('email', 'test1@example.com')
      .field('password', 'password123')
      .field('role', 'student')
      .field('name', 'Testing User')
      .field('bio', 'Testing bio');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('should login a user', async () => {
    await request(app)
      .post('/api/auth/register')
      .field('email', 'test2@example.com')
      .field('password', 'password123')
      .field('role', 'student')
      .field('name', 'Test User')
      .field('bio', 'Test bio');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test2@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('role', 'student');
  });

  it('should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('email', 'invalid')
      .field('password', 'password123')
      .field('role', 'student')
      .field('name', 'Test User');
    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ msg: 'Invalid email format' })
    );
  });

  it('should fail with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .field('email', 'test3@example.com')
      .field('password', 'password123')
      .field('role', 'student')
      .field('name', 'Test User');
    const res = await request(app)
      .post('/api/auth/register')
      .field('email', 'test3@example.com')
      .field('password', 'password123')
      .field('role', 'student')
      .field('name', 'Test User');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already exists');
  });
});