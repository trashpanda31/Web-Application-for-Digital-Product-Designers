import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';

import authRoutes from './routes/authRoutes.js';
import authOAuthRoutes from "./routes/authOAuthRoutes.js";
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

import errorHandler from './middlewares/errorMiddleware.js';
import { log } from './utils/logger.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
    log(`Request: ${req.method} ${req.url} | IP: ${req.ip}`);
    next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use('/api/auth', authRoutes);
app.use('/api/auth', authOAuthRoutes);
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
