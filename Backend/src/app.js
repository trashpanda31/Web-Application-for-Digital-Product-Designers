import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();

// Настройка CORS перед всеми роутами
app.use(cors({
    origin: 'http://localhost:5000', // Подставь свой клиентский URL
    credentials: true
}));

// Подключаем cookieParser ДО обработки JSON
app.use(cookieParser());

// Основные middleware
app.use(helmet());
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Роуты API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);

// Обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong on the server',
    });
});

// Тестовый маршрут
app.get('/', (req, res) => {
    res.send('🚀 Server works! You are welcome');
});

export default app;
