import { Request, Response } from 'express';
import { Comment, Post } from '../models';
import { User } from '../models';

export const createComment = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      userId,
      postId,
      content: content.trim(),
    });

    // Fetch comment with user details
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;
    
    if (!postId || Array.isArray(postId) || typeof postId !== 'string') {
      return res.status(400).json({ error: 'Invalid postId' });
    }
    
    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateComment = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    await comment.update({ content: content.trim() });

    // Fetch updated comment with user details
    const updatedComment = await Comment.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Decrement the comments count on the post
    await Post.decrement('commentsCount', { where: { id: comment.postId } });
    
    await comment.destroy();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};