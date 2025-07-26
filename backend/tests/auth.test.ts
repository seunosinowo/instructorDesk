import request from 'supertest';
import app from '../src/server';
import sequelize from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/models/user.model';

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
      .send({ email: 'test1@example.com', password: 'password123', role: 'student', name: 'Testing User', bio: 'Testing bio' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registration successful. Check your email for confirmation.');
  });

it('should login a user', async () => {
  await User.create({
    email: 'test2@example.com',
    password: 'password123',
    role: 'student',
    name: 'Test User',
    bio: 'Test bio',
    emailConfirmed: true,
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test2@example.com', password: 'password123' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.user).toHaveProperty('id');
  expect(res.body.user).toHaveProperty('role', 'student');
});

  it('should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'password123', role: 'student', name: 'Test User' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ msg: 'Invalid email format' }));
  });

  it('should fail with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test3@example.com', password: 'password123', role: 'student', name: 'Test User' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test3@example.com', password: 'password123', role: 'student', name: 'Test User' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists'); // Matches authRoutes.ts response
  });
});