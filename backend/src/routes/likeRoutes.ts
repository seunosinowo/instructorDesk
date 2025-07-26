import express from 'express';
import * as likeController from '../controllers/likeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, likeController.likePost);
router.delete('/', authMiddleware, likeController.unlikePost);

export default router;