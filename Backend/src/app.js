import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

// Настройка CORS перед всеми роутами
app.use(cors({
    origin: 'http://localhost:5000', // Подставь свой клиентский URL
    credentials: true
}));

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(errorHandler);

const csrfProtection = csrf({cookie: true});
app.use(csrfProtection);
app.use((req, res, next) => {
    console.log('🔍 Запрос:', req.method, req.url);
    console.log('🔍 Cookies:', req.cookies);
    console.log('🔍 Заголовки:', req.headers);
    next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

app.get('/csrf-token', (req, res) => {
    res.json({csrfToken: req.csrfToken});
})

// Тестовый маршрут
app.get('/', (req, res) => {
    res.send('🚀 Server works! You are welcome');
});

export default app;
