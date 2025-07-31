import express, { Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { Op } from 'sequelize';
import { Message } from '../models';
import { User } from '../models';

interface AuthenticatedRequest extends express.Request {
  user?: { id: string; role: string };
}

const router = express.Router();

router.get('/list/teachers', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teachers = await User.findAll({ where: { role: 'teacher', emailConfirmed: true }, attributes: ['id', 'name', 'email'] });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { teacherId, content } = req.body;
  try {
    const message = await Message.create({ senderId: String(req.user!.id), receiverId: String(teacherId), content });
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/teachers', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teachers = await User.findAll({ where: { role: 'teacher', emailConfirmed: true }, attributes: ['id', 'name', 'email'] });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

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