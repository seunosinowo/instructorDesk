import express, { Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireProfileCompletion } from '../middleware/profileCompletionMiddleware';
import { Op } from 'sequelize';
import { Message } from '../models';
import { User } from '../models';

interface AuthenticatedRequest extends express.Request {
  user?: { id: string; role: string };
}

const router = express.Router();

// Get all users (both teachers and students) for messaging
router.get('/users', authMiddleware, requireProfileCompletion, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.findAll({ 
      where: { 
        emailConfirmed: true,
        id: { [Op.ne]: req.user!.id } // Exclude current user
      }, 
      attributes: ['id', 'name', 'email', 'role', 'profilePicture'] 
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy route for backward compatibility
router.get('/teachers', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teachers = await User.findAll({ where: { role: 'teacher', emailConfirmed: true }, attributes: ['id', 'name', 'email'] });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to any user
router.post('/', authMiddleware, requireProfileCompletion, async (req: AuthenticatedRequest, res: Response) => {
  const { receiverId, content } = req.body;
  try {
    const message = await Message.create({ 
      senderId: String(req.user!.id), 
      receiverId: String(receiverId), 
      content 
    });
    
    // Fetch the created message with sender and receiver info
    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] }
      ]
    });
    
    res.status(201).json(messageWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for the current user
router.get('/conversations', authMiddleware, requireProfileCompletion, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: String(req.user!.id) },
          { receiverId: String(req.user!.id) }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    conversations.forEach((message: any) => {
      const partnerId = message.senderId === req.user!.id ? message.receiverId : message.senderId;
      const partner = message.senderId === req.user!.id ? message.receiver : message.sender;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: message,
          messages: []
        });
      }
      
      conversationMap.get(partnerId).messages.push(message);
    });

    const conversationList = Array.from(conversationMap.values());
    res.json(conversationList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a specific user
router.get('/conversation/:userId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: String(req.user!.id), receiverId: String(req.params.userId) },
          { senderId: String(req.params.userId), receiverId: String(req.user!.id) }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a message (only sender can edit)
router.put('/:messageId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { content } = req.body;
  try {
    const message = await Message.findByPk(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.senderId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }
    
    await message.update({ content });
    
    const updatedMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profilePicture'] }
      ]
    });
    
    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message (only sender can delete)
router.delete('/:messageId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const message = await Message.findByPk(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.senderId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    
    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy route for backward compatibility
router.get('/:teacherId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: String(req.user!.id), receiverId: String(req.params.teacherId) },
          { senderId: String(req.params.teacherId), receiverId: String(req.user!.id) }
        ]
      },
      include: [{ model: User, as: 'sender', attributes: ['name'] }, { model: User, as: 'receiver', attributes: ['name'] }]
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;