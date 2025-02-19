import express from 'express';
import { register, login, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/logout', logout);
router.post('/login', login);

export default router; // Используем export default вместо module.exports
