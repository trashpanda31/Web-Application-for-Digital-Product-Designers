import { log } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    log(`❌ Ошибка: ${err.message} (Запрос: ${req.method} ${req.url})`);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};
