import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model';
import { uploadToCloudinary } from '../utils/cloudinary';

export const register = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher']).withMessage('Role must be "student" or "teacher"'),
  body('name').notEmpty().withMessage('Name is required'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, name, bio } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let profilePicture;
      if (req.file) {
        const result = await uploadToCloudinary(req.file) as { secure_url: string };
        profilePicture = result.secure_url;
      }

      const user = await User.create({
        id: uuidv4(),
        email,
        password: hashedPassword,
        role,
        name,
        bio,
        profilePicture,
      });

      
      res.status(201).json({ message: 'User registered', userId: (user as any).id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const login = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, (user as any).password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      
      const token = jwt.sign(
        { id: (user as any).id, role: (user as any).role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      res.json({ token, userId: (user as any).id, role: (user as any).role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getMe = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name', 'bio', 'profilePicture'],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};