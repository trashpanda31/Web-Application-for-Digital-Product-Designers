import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем путь к `src/utils`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs'); // Лог-файлы в `src/utils/logs/`

// Пути к файлам логов
const logFilePath = path.join(logDir, 'server.log');
const errorLogPath = path.join(logDir, 'error.log');
const securityLogPath = path.join(logDir, 'security.log');

// ✅ Если папка `logs/` не существует, создаём её
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// ✅ Функция записи в лог
const writeLog = (filePath, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Выводим в терминал (можно отключить, если нужно)
    console.log(logMessage);

    // Записываем в файл
    fs.appendFile(filePath, logMessage, (err) => {
        if (err) console.error('❌ Ошибка при записи лога:', err);
    });
};

export const log = (message) => {
    writeLog(logFilePath, `INFO: ${message}`);
};

export const logError = (error) => {
    writeLog(errorLogPath, `ERROR: ${error.stack || error}`);
};

export const logSecurity = (message) => {
    writeLog(securityLogPath, `SECURITY: ${message}`);
};
