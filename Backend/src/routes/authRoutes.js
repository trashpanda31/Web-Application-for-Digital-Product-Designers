import express from 'express';
import csrf from 'csurf';
import { register, login, logout, refreshToken } from '../controllers/authController.js';
import { log } from '../utils/logger.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.post('/register', csrfProtection, register);
router.post('/login', csrfProtection, login);
router.post('/refresh', csrfProtection, refreshToken);
router.post('/logout', csrfProtection, logout);

router.get('/csrf-token', (req, res) => {
    log(`CSRF token issued for IP: ${req.ip}`);
    res.json({ csrfToken: req.csrfToken() });
});

export default router;
