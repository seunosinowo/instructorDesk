import express from 'express';
import * as commentController from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, commentController.createComment);
router.get('/', commentController.getComments);

export default router;