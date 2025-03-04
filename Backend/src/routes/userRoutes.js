import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    getUserProfile,
    updateProfile,
    updateEmail,
    updatePassword,
    updateAvatar
} from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authMiddleware, getUserProfile);
router.patch('/me/update-profile', authMiddleware, updateProfile);
router.patch('/me/update-email', authMiddleware, updateEmail);  // Изменение email
router.patch('/me/update-password', authMiddleware, updatePassword);  // Изменение пароля
router.post('/me/update-avatar', authMiddleware, updateAvatar);

export default router;
