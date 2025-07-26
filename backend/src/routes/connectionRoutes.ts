import express from 'express';
import * as connectionController from '../controllers/connectionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/request', authMiddleware, connectionController.sendConnectionRequest);
router.post('/accept', authMiddleware, connectionController.acceptConnection);
router.post('/reject', authMiddleware, connectionController.rejectConnection);
router.get('/', authMiddleware, connectionController.getConnections);

export default router;