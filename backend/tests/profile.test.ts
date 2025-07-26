import request from 'supertest';
import app from '../src/server';
import { User } from '../src/models/user.model';
import { Teacher } from '../src/models/teacher.model';
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
    expect(res.body.message).toBe('Profile updated');
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get(`/api/profile/${userId}`) // Use the actual UUID
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('profile');
  });
});