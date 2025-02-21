import http from 'http';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from './utils/logger.js';

dotenv.config();

const PORT_HTTP = 80;   // HTTP → HTTPS редирект
const PORT_HTTPS = process.env.PORT || 443;  // Это HTTPS-порт, который мы используем
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Loaded MongoDB URI:', MONGODB_URI);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    key: fs.readFileSync(path.join(__dirname, '../server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../server.cert')),
};

// Подключаем MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ Cannot connect to MongoDB:', err);
        process.exit(1);
    });

// HTTP-сервер для редиректа на HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
    res.end();
}).listen(PORT_HTTP, () => {
    console.log(`🔀 Redirecting HTTP (${PORT_HTTP}) to HTTPS (${PORT_HTTPS})`);
});

// HTTPS-сервер
https.createServer(options, app).listen(PORT_HTTPS, () => {
    log(`🚀 Server is running on https://localhost:${PORT_HTTPS}`);
});
