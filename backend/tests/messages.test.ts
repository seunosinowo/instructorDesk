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

describe('Message Routes', () => {
  let token: string;
  let teacherToken: string;
  let teacher: User;
  let student: User;

  beforeEach(async () => {
    await sequelize.sync(); // Remove force: true to avoid dropping tables
    student = await User.create({
      email: 'student@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      name: 'Student User',
      emailConfirmed: true,
      profileCompleted: true  // Add this to allow messaging
    });
    teacher = await User.create({
      email: 'teacher@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      name: 'Teacher User',
      emailConfirmed: true,
      profileCompleted: true
    });
    token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET!);
    teacherToken = jwt.sign({ id: teacher.id, role: 'teacher' }, process.env.JWT_SECRET!);
  });

  afterEach(async () => {
    // Clean up only test data, not all data
    await Message.destroy({ where: { senderId: [student.id, teacher.id] }, force: true });
    await User.destroy({ where: { email: { [require('sequelize').Op.like]: '%@example.com' } }, force: true });
  });

  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  });

  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverId: teacher.id, content: 'Hello teacher' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hello teacher');
  });

  it('should get teachers', async () => {
    const res = await request(app)
      .get('/api/messages/teachers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get messages between student and teacher with existing messages', async () => {
    // Create a message
    await Message.create({ 
      senderId: student.id, 
      receiverId: teacher.id, 
      content: 'Test message' 
    });

    const res = await request(app)
      .get(`/api/messages/${teacher.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get teachers by role', async () => {
    const res = await request(app)
      .get('/api/messages/teachers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});