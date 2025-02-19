const http = require('http');
const dotenv = require('dotenv');
const app = require('./app'); // Импортируем Express-приложение

dotenv.config(); // Загружаем переменные окружения

const PORT = process.env.PORT || 5000; // Определяем порт

// Создаём HTTP-сервер и передаём Express-приложение
const server = http.createServer(app);

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
