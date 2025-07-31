import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Comment, Post } from '../models';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';

export const createComment = [
  body('postId').isUUID().withMessage('Invalid post ID'),
  body('content').notEmpty().withMessage('Content is required'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId, content } = req.body;
      const userId = req.user.id;
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;

      const post = await Post.findByPk(numericPostId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = await Comment.create({
        userId,
        postId: numericPostId,
        content,
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getComments = [
  query('postId').isUUID().withMessage('Invalid post ID'),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.query;
      if (Array.isArray(postId) || typeof postId !== 'string' || isNaN(Number(postId))) {
        return res.status(400).json({ error: 'Invalid postId' });
      }
      const numericPostId = parseInt(postId, 10);
      const comments = await Comment.findAll({
        where: { postId: numericPostId },
        include: [{ model: User, attributes: ['name', 'profilePicture'] }],
      });
      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];