import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Like, Post } from '../models';
import { v4 as uuidv4 } from 'uuid';

export const likePost = [
  body('postId').isUUID().withMessage('Invalid post ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.body;
      const userId = req.user.id;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const existingLike = await Like.findOne({ where: { userId, postId } });
      if (existingLike) {
        return res.status(400).json({ error: 'Post already liked' });
      }

      const like = await Like.create({
        userId,
        postId,
      });

      res.status(201).json(like);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const unlikePost = [
  body('postId').isUUID().withMessage('Invalid post ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { postId } = req.body;
      const userId = req.user.id;

      const like = await Like.findOne({ where: { userId, postId } });
      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }

      await like.destroy();
      res.json({ message: 'Like removed' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];