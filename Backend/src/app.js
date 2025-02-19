const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/images', imageRoutes);

//@ts-ignore
app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong in server',
    });
});

app.get('/', (req, res) => {
    res.send('🚀 Сервер работает! Добро пожаловать!');
});


module.exports = app;

