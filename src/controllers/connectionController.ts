import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Connection } from '../models/connection.model';
import { User } from '../models/user.model';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export const sendConnectionRequest = [
  body('receiverId').isUUID().withMessage('Invalid receiver ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { receiverId } = req.body;
      const userId1 = req.user.id;
      const userId2 = receiverId;

      if (userId1 === userId2) {
        return res.status(400).json({ error: 'Cannot connect with yourself' });
      }

      const receiver = await User.findByPk(userId2);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      const existingConnection = await Connection.findOne({
        where: { userId1, userId2 },
      });
      if (existingConnection) {
        return res.status(400).json({ error: 'Connection request already exists' });
      }

      const connection = await Connection.create({
        userId1,
        userId2,
        status: 'pending',
      });

      res.status(201).json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const acceptConnection = [
  body('connectionId').isUUID().withMessage('Invalid connection ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { connectionId } = req.body;
      const userId = req.user.id;

      const connection = await Connection.findByPk(connectionId);
      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }
      // Fix: cast connection as any to access receiverId
      if ((connection as any).userId2 !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await connection.update({ status: 'accepted' });
      res.json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const rejectConnection = [
  body('connectionId').isUUID().withMessage('Invalid connection ID'),
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { connectionId } = req.body;
      const userId = req.user.id;

      const connection = await Connection.findByPk(connectionId);
      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }
      // Fix: cast connection as any to access receiverId
      if ((connection as any).userId2 !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await connection.update({ status: 'rejected' });
      res.json(connection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

export const getConnections = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.id;
    const connections = await Connection.findAll({
      where: {
        [Op.or]: [{ userId1: userId }, { userId2: userId }],
        status: 'accepted',
      },
      include: [
        { model: User, as: 'Requester', attributes: ['name', 'profilePicture'] },
        { model: User, as: 'Receiver', attributes: ['name', 'profilePicture'] },
      ],
    });
    res.json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};