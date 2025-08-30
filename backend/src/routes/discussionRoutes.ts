import express from 'express';
import { Op } from 'sequelize';
import { Discussion, DiscussionComment, User } from '../models';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get all discussions with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const order: any = [[sortBy, (sortOrder as string).toUpperCase()]];

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture', 'role']
      }],
      limit: Number(limit),
      offset,
      order
    });

    res.json({
      status: 'success',
      discussions: discussions.rows,
      totalCount: discussions.count,
      totalPages: Math.ceil(discussions.count / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error: any) {
    console.error('Get discussions error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get single discussion with comments
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'profilePicture', 'role']
        },
        {
          model: DiscussionComment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'profilePicture', 'role']
            },
            {
              model: DiscussionComment,
              as: 'replies',
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePicture', 'role']
              }]
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    // Increment view count
    await discussion.increment('viewCount');

    res.json({ status: 'success', discussion });
  } catch (error: any) {
    console.error('Get discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Create new discussion
router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, content, and category are required'
      });
    }

    const discussion = await Discussion.create({
      title,
      content,
      category,
      userId: req.user!.id
    });

    const discussionWithUser = await Discussion.findByPk(discussion.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture', 'role']
      }]
    });

    res.status(201).json({
      status: 'success',
      message: 'Discussion created successfully',
      discussion: discussionWithUser
    });
  } catch (error: any) {
    console.error('Create discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update discussion
router.put('/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    if (discussion.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to update this discussion' });
    }

    const { title, content, category } = req.body;

    await discussion.update({
      title: title || discussion.title,
      content: content || discussion.content,
      category: category || discussion.category
    });

    res.json({
      status: 'success',
      message: 'Discussion updated successfully',
      discussion
    });
  } catch (error: any) {
    console.error('Update discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Delete discussion
router.delete('/:id', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    if (discussion.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to delete this discussion' });
    }

    await discussion.destroy();

    res.json({ status: 'success', message: 'Discussion deleted successfully' });
  } catch (error: any) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Upvote discussion
router.post('/:id/upvote', async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    await discussion.increment('upvoteCount');

    res.json({
      status: 'success',
      message: 'Discussion upvoted successfully',
      upvoteCount: discussion.upvoteCount + 1
    });
  } catch (error: any) {
    console.error('Upvote discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Pin/unpin discussion (admin only)
router.patch('/:id/pin', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    // For now, allow discussion creator to pin/unpin
    if (discussion.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to pin this discussion' });
    }

    await discussion.update({ isPinned: !discussion.isPinned });

    res.json({
      status: 'success',
      message: `Discussion ${discussion.isPinned ? 'unpinned' : 'pinned'} successfully`,
      isPinned: !discussion.isPinned
    });
  } catch (error: any) {
    console.error('Pin discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Close discussion
router.patch('/:id/close', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    if (discussion.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to close this discussion' });
    }

    await discussion.update({ isClosed: true });

    res.json({
      status: 'success',
      message: 'Discussion closed successfully',
      isClosed: true
    });
  } catch (error: any) {
    console.error('Close discussion error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Add comment to discussion
router.post('/:id/comments', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ status: 'error', message: 'Discussion not found' });
    }

    if (discussion.isClosed) {
      return res.status(400).json({ status: 'error', message: 'This discussion is closed' });
    }

    const { content, parentId } = req.body;

    if (!content) {
      return res.status(400).json({ status: 'error', message: 'Comment content is required' });
    }

    const comment = await DiscussionComment.create({
      content,
      discussionId: req.params.id,
      userId: req.user!.id,
      parentId: parentId || null
    });

    // Increment comment count on discussion
    await discussion.increment('commentCount');

    const commentWithUser = await DiscussionComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profilePicture', 'role']
      }]
    });

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      comment: commentWithUser
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update comment
router.put('/comments/:commentId', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const comment = await DiscussionComment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to update this comment' });
    }

    const { content } = req.body;

    await comment.update({
      content: content || comment.content,
      isEdited: true
    });

    res.json({
      status: 'success',
      message: 'Comment updated successfully',
      comment
    });
  } catch (error: any) {
    console.error('Update comment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Delete comment
router.delete('/comments/:commentId', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const comment = await DiscussionComment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to delete this comment' });
    }

    // Decrement comment count on discussion
    const discussion = await Discussion.findByPk(comment.discussionId);
    if (discussion) {
      await discussion.decrement('commentCount');
    }

    await comment.destroy();

    res.json({ status: 'success', message: 'Comment deleted successfully' });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Upvote comment
router.post('/comments/:commentId/upvote', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  try {
    const comment = await DiscussionComment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    await comment.increment('upvoteCount');

    res.json({
      status: 'success',
      message: 'Comment upvoted successfully',
      upvoteCount: comment.upvoteCount + 1
    });
  } catch (error: any) {
    console.error('Upvote comment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;