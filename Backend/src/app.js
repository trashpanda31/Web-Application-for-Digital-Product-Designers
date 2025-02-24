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
import errorHandler  from './middlewares/errorMiddleware.js';
import { log } from './utils/logger.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));

app.use(cookieParser());
app.use(helmet());
app.use(express.json());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
    log(`Request: ${req.method} ${req.url} | IP: ${req.ip}`);
    next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);

app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.get('/', (req, res) => {
    res.send('Server is running.');
});

app.use(errorHandler);

export default app;
