import request from 'supertest';
import app from '../src/server';
import { User, Teacher, Student, Message } from '../src/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../src/config/database';
import { Op } from 'sequelize';

describe('Message Routes', () => {
  let token: string;
  let teacherToken: string;
  let teacher: User;
  let student: User;

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      console.log('Test database connected');
      await sequelize.sync({ force: true });
      console.log('Test database synced');
    } catch (error) {
      console.error('Test database setup failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    student = await User.create({
      email: 'student@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      name: 'Student User',
      emailConfirmed: true,
      profileCompleted: true
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
    if (student && teacher) {
      await Message.destroy({ where: { senderId: [student.id, teacher.id] }, force: true });
    }
  await User.destroy({ where: { email: { [Op.like]: '%@example.com' } }, force: true });
  });

  afterAll(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await sequelize.close();
      console.log('Test database connection closed');
    } catch (error) {
      // Silently handle connection close errors
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