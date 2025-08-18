import request from 'supertest';
import app from '../src/server';
import { User, Teacher, Student } from '../src/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../src/config/database';
import { Op } from 'sequelize';

describe('Profile Routes', () => {
  let token: string;
  let userId: string;

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
    const user = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      name: 'Test User',
      emailConfirmed: true,
      profileCompleted: true
    });
    userId = user.id;
    token = jwt.sign({ id: user.id, role: 'teacher' }, process.env.JWT_SECRET!);
  });

  afterEach(async () => {
    if (userId) {
      await Teacher.destroy({ where: { userId }, force: true });
      await Student.destroy({ 
        where: { 
          userId: { [Op.in]: await User.findAll({
            where: { email: { [Op.like]: '%@example.com' } },
            attributes: ['id']
          }).then(users => users.map(u => u.id))}
        }, 
        force: true 
      });
    }
    await User.destroy({ 
      where: { 
        email: { [Op.like]: '%@example.com' } 
      }, 
      force: true 
    });
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
      .get(`/api/profile/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('profile');
  });

  it('should update student profile', async () => {
    const studentUser = await User.create({
      email: 'student@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      name: 'Test Student',
      emailConfirmed: true,
      profileCompleted: true
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