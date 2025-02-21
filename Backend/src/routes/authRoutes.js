import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';
import csrf from 'csurf';

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.post('/register', csrfProtection, register);
router.post('/login', csrfProtection, login);
router.post('/refresh', csrfProtection, refreshToken);
router.post('/logout', csrfProtection, logout);

router.get('/csrf-token', (req, res) => {
    console.log('🟢 CSRF-токен выдан:', req.csrfToken());
    res.json({ csrfToken: req.csrfToken() });
});


export default router;
