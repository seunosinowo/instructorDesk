import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Post, User } from '../models';
import { uploadToCloudinary } from '../utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export const createPost = [
  body('content').notEmpty().withMessage('Content is required'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content } = req.body;
      const userId = req.user.id;
      let image;
      let video;

      if (req.file) {
        // Check if it's a video file
        if (req.file.mimetype.startsWith('video/')) {
          // Basic video validation - you might want to add duration check here
          const result = await uploadToCloudinary(req.file) as { secure_url: string };
          video = result.secure_url;
        } else if (req.file.mimetype.startsWith('image/')) {
          const result = await uploadToCloudinary(req.file) as { secure_url: string };
          image = result.secure_url;
        }
      }

      const post = await Post.create({
        userId,
        content,
        type: 'general',
        imageUrl: image,
        videoUrl: video
      });

      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ['name', 'profilePicture'] }],
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'profilePicture'] }],
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePost = [
  param('id').isUUID().withMessage('Invalid post ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      // Fix: cast post as any to access userId
      if ((post as any).userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await post.destroy();
      res.json({ message: 'Post deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];