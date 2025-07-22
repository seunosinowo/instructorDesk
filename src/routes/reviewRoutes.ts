import express from 'express';
import * as reviewController from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, reviewController.createReview);
router.get('/', reviewController.getReviews);

export default router;