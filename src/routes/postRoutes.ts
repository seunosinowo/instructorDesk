import express from 'express';
import * as postController from '../controllers/postController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;