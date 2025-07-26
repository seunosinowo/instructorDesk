import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Review } from '../models/review.model';
import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

export const createReview = [
  body('teacherId').isUUID().withMessage('Invalid teacher ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { teacherId, rating, comment } = req.body;
      const userId = req.user.id;

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const review = await Review.create({
        // id is auto-incremented
        userId,
        teacherId,
        rating,
        comment,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getReviews = [
  query('teacherId').isUUID().withMessage('Invalid teacher ID'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { teacherId } = req.query;
      if (Array.isArray(teacherId) || typeof teacherId !== 'string' || isNaN(Number(teacherId))) {
        return res.status(400).json({ error: 'Invalid teacherId' });
      }
      const numericTeacherId = parseInt(teacherId, 10);
      const reviews = await Review.findAll({
        where: { teacherId: numericTeacherId },
        include: [{ model: User, attributes: ['name', 'profilePicture'] }],
      });
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];