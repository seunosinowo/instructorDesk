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
    await sequelize.sync(); // Remove force: true to avoid dropping tables
    const user = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      name: 'Test User',
      emailConfirmed: true,
      profileCompleted: true // Add this for consistency
    });
    userId = user.id; // Store the UUID
    token = jwt.sign({ id: user.id, role: 'teacher' }, process.env.JWT_SECRET!);
  });

  afterEach(async () => {
    // Clean up only test data, not all data
    await Teacher.destroy({ where: { userId }, force: true });
    await Student.destroy({ 
      where: { 
        userId: { [require('sequelize').Op.in]: await User.findAll({
          where: { email: { [require('sequelize').Op.like]: '%@test.com' } },
          attributes: ['id']
        }).then(users => users.map(u => u.id))}
      }, 
      force: true 
    });
    await User.destroy({ 
      where: { 
        email: { [require('sequelize').Op.like]: '%@test.com' } 
      }, 
      force: true 
    });
    await User.destroy({ 
      where: { 
        email: { [require('sequelize').Op.like]: '%@example.com' } 
      }, 
      force: true 
    });
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
      password: await bcrypt.hash('password123', 10), // Hash the password
      role: 'student',
      name: 'Test Student',
      emailConfirmed: true,
      profileCompleted: true // Add this for consistency
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