import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

export const createTeacherProfile = [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('experience').notEmpty().withMessage('Experience is required'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { subject, subjects, experience, qualifications } = req.body;
      const userId = req.user.id;

      const existingProfile = await Teacher.findOne({ where: { userId } });
      if (existingProfile) {
        return res.status(400).json({ error: 'Teacher profile already exists' });
      }

      const teacher = await Teacher.create({
        userId,
        subjects,
        experience,
        qualifications,
      });

      res.status(201).json(teacher);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: User, attributes: ['name', 'bio', 'profilePicture'] }],
    });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTeacher = async (req: Request, res: Response) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'bio', 'profilePicture'] }],
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTeacherProfile = [
  param('id').isUUID().withMessage('Invalid teacher ID'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('experience').optional().notEmpty().withMessage('Experience cannot be empty'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const teacher = await Teacher.findByPk(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      // Fix: cast teacher as any to access userId
      if ((teacher as any).userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await teacher.update(req.body);
      res.json(teacher);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];