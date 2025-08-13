import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import teacherRoutes from './routes/teacherRoutes';
import reviewRoutes from './routes/reviewRoutes';
import postRoutes from './routes/postRoutes';
import likeRoutes from './routes/likeRoutes';
import commentRoutes from './routes/commentRoutes';
import connectionRoutes from './routes/connectionRoutes';
import profileRoutes from './routes/profileRoutes';
import messageRoutes from './routes/messageRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'] }));
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorMiddleware);

export default app;