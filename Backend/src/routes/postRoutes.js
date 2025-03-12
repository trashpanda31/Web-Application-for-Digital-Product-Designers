import express from 'express';
import { createPost, searchPostsByTitle, filterPosts, sortPosts, searchPostsByImage, redirectToGoogleImageSearch } from '../controllers/postController.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), createPost);
router.get('/search', searchPostsByTitle);
router.get('/filter', filterPosts);
router.get('/sort', sortPosts);
router.post('/search-image', upload.single('image'), searchPostsByImage);
router.post('/google-search', upload.single('image'), redirectToGoogleImageSearch);

export default router;
