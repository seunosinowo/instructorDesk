import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string; type?: string };
    
    // Check if this is an access token (not a refresh token)
    // Only reject if explicitly marked as refresh token
    if (decoded.type === 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    (req as any).user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const guestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return res.status(403).json({ error: 'Already authenticated' });
    } catch (error) {
      // Token is invalid, continue as guest
    }
  }
  next();
};