import request from 'supertest';
import app from '../src/server';
import { User } from '../src/models/user.model';
import { Teacher } from '../src/models/teacher.model';
import { Student } from '../src/models/student.model';
import { Post } from '../src/models/post.model';
import { Comment } from '../src/models/comment.model';
import { Like } from '../src/models/like.model';
import { Connection } from '../src/models/connection.model';
import { Review } from '../src/models/review.model';
import { Message } from '../src/models/message.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../src/config/database';

describe('Profile Routes', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const user = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      name: 'Test User',
      bio: 'Test bio',
      emailConfirmed: true
    });
    userId = user.id; // Store the UUID
    token = jwt.sign({ id: user.id, role: 'teacher' }, process.env.JWT_SECRET!);
  });

  afterEach(async () => {
    // Clean up database after each test
    await Teacher.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  });

  it('should update teacher profile', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subjects: ['Math', 'Science'],
        qualifications: 'MSc',
        experience: 5
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get(`/api/profile/${userId}`) // Use the actual UUID
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('profile');
  });

  it('should update student profile', async () => {
    // Create a student user
    const studentUser = await User.create({
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      name: 'Test Student',
      emailConfirmed: true,
    });

    const studentToken = jwt.sign({ id: studentUser.id, role: 'student' }, process.env.JWT_SECRET!);

    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        interests: ['Programming', 'Art', 'Music']
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
  });
});