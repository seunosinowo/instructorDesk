import express from 'express';
import * as teacherController from '../controllers/teacherController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, teacherController.createTeacherProfile);
router.get('/', teacherController.getTeachers);
router.get('/:id', teacherController.getTeacher);
router.put('/:id', authMiddleware, teacherController.updateTeacherProfile);

export default router;