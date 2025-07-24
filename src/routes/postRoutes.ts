import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';

const router = express.Router();

router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  const { content } = req.body;
  try {
    const post = await Post.create({ userId: req.user!.id as string, content }); // Cast to string for UUID
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.findAll({ include: [{ model: User, attributes: ['name'] }] });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;