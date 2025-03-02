import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js'; // ✅ Теперь passport загружается первым!

import authRoutes from './routes/authRoutes.js';
import authOAuthRoutes from "./routes/authOAuthRoutes.js";
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

import errorHandler from './middlewares/errorMiddleware.js';
import { log } from './utils/logger.js';

dotenv.config();

const app = express();

// ✅ Безопасность и обработка запросов
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// ✅ Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// ✅ Подключение Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ CSRF защита
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// ✅ Логирование запросов
app.use((req, res, next) => {
    log(`Request: ${req.method} ${req.url} | IP: ${req.ip}`);
    next();
});

// ✅ Настройка загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/auth', authOAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);

// ✅ Автоматический редирект с HTTP на HTTPS
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

// ✅ Маршруты API
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.get('/', (req, res) => {
    res.send('Server is running.');
});

// ✅ Обработчик ошибок
app.use(errorHandler);

export default app;
