import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const requireProfileCompletion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        requiresAuth: true 
      });
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        requiresAuth: true 
      });
    }

    if (!user.profileCompleted) {
      return res.status(403).json({
        message: 'Profile completion required',
        requiresProfileCompletion: true,
        redirectTo: '/profile/setup'
      });
    }

    next();
  } catch (error) {
    console.error('Profile completion check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};