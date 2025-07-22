import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Comment from '../models/comment.model';
import Post from '../models/post.model';
import User from '../models/user.model';
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

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = await Comment.create({
        id: uuidv4(),
        userId,
        postId,
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
      const comments = await Comment.findAll({
        where: { postId },
        include: [{ model: User, attributes: ['name', 'profilePicture'] }],
      });
      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];