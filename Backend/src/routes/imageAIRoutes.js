import express from 'express';
import multer from 'multer';
import { generateImage, removeBackground } from '../controllers/imageAIController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-image', authMiddleware, generateImage);
router.post('/remove-background', authMiddleware, upload.single('image'), removeBackground);

export default router;
