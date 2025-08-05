import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { Post, User, Like, Comment } from '../models';

const router = express.Router();

// Create a new post
router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  const { content, type = 'general', imageUrl } = req.body;
  try {
    const post = await Post.create({ 
      userId: req.user!.id as string, 
      content,
      type,
      imageUrl
    });
    
    // Fetch the post with user details
    const postWithUser = await Post.findByPk(post.id, {
      include: [{ 
        model: User, 
        as: 'user',
        attributes: ['id', 'name', 'role', 'profilePicture'] 
      }]
    });
    
    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts with pagination
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const posts = await Post.findAndCountAll({
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'role', 'profilePicture'] 
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });
    
    res.json({
      posts: posts.rows,
      totalCount: posts.count,
      totalPages: Math.ceil(posts.count / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:id/like', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    
    // Check if already liked
    const existingLike = await Like.findOne({ where: { userId, postId } });
    
    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await Post.decrement('likesCount', { where: { id: postId } });
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await Like.create({ userId, postId });
      await Post.increment('likesCount', { where: { id: postId } });
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to a post
router.post('/:id/comments', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const { content } = req.body;
    
    const comment = await Comment.create({ userId, postId, content });
    await Post.increment('commentsCount', { where: { id: postId } });
    
    // Fetch comment with user details
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'profilePicture'] 
      }]
    });
    
    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.findAll({
      where: { postId },
      include: [{ 
        model: User, 
        attributes: ['id', 'name', 'profilePicture'] 
      }],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a post (only by author)
router.put('/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const { content, imageUrl } = req.body;
    
    // Check if user is the author
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }
    
    // Update the post
    await post.update({ content, ...(imageUrl && { imageUrl }) });
    
    // Fetch updated post with user details
    const updatedPost = await Post.findByPk(postId, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'name', 'role', 'profilePicture'] 
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ]
    });
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post (only by author)
router.delete('/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    
    // Check if user is the author
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Delete associated likes and comments first
    await Like.destroy({ where: { postId } });
    await Comment.destroy({ where: { postId } });
    
    // Delete the post
    await post.destroy();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;