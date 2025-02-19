import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server',
    });
});

app.get('/', (req, res) => {
    res.send('🚀 Server works! You are welcome');
});

export default app;

