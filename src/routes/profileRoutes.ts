import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Teacher } from '../models/teacher.model';

const router = express.Router();

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }; // Changed to string for UUID
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/', authMiddleware, async (req: express.Request & { user?: { id: string; role: string } }, res) => {
  const { subjects, qualifications, experience, interests } = req.body;
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'teacher') {
      await Teacher.upsert({ userId: user.id, subjects, qualifications, experience });
    } else if (interests) {
      console.log('Student interests not implemented yet:', interests);
    }

    await User.update({ profileCompleted: true }, { where: { id: user.id } });
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id); // No need for number casting, UUID will work
    if (!user) return res.status(404).json({ message: 'User not found' });

    const teacher = await Teacher.findOne({ where: { userId: user.id } });
    res.json({ ...user.toJSON(), profile: teacher ? teacher.toJSON() : {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;