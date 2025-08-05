import request from 'supertest';
import app from '../src/server';
import sequelize from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/user.model';
// import { Teacher } from '../src/models/teacher.model';
// import { Student } from '../src/models/student.model';
// import { Post } from '../src/models/post.model';
// import { Comment } from '../src/models/comment.model';
// import { Like } from '../src/models/like.model';
// import { Connection } from '../src/models/connection.model';
// import { Review } from '../src/models/review.model';
// import { Message } from '../src/models/message.model';

// Load test environment variables
process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set test-specific environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock nodemailer to prevent real email sending
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock file system for email templates
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue('<html>Mock email template</html>')
}));

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

afterEach(async () => {
  // Clean up database after each test
  await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
  try {
    await sequelize.close(); // Close database connection
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

describe('Auth API', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test1@example.com', password: 'password123', role: 'student', name: 'Testing User' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registration successful. Check your email for confirmation.');
  });

  it('should login a user', async () => {
    // Create user directly without hashing password (let the model handle it)
    const user = await User.create({
      email: 'test2@example.com',
      password: 'password123', // Let the model hash this
      role: 'student',
      name: 'Test User',
      emailConfirmed: true,
    });
    
    // Verify user was created
    expect(user).toBeDefined();
    expect(user.email).toBe('test2@example.com');
    expect(user.emailConfirmed).toBe(true);
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test2@example.com', password: 'password123' });
    
    if (res.status !== 200) {
      console.log('Login response:', res.body);
      console.log('User in DB:', await User.findOne({ where: { email: 'test2@example.com' } }));
    }
    
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
    expect(res.body.message).toBe('Email already registered. Please log in or use a different email.');
  });


  it('should fail login with wrong password', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'test5@example.com',
      password: hashedPassword,
      role: 'student',
      name: 'Test User',
      emailConfirmed: true,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test5@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should send forgot password email', async () => {
    await User.create({
      email: 'test6@example.com',
      password: 'password123',
      role: 'student',
      name: 'Test User',
      emailConfirmed: true,
    });
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test6@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('If the email exists, a password reset link has been sent');
  });

  it('should handle forgot password for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('If the email exists, a password reset link has been sent');
  });
});