import express from 'express';
import { register, login, getFavorites, toggleFavorite } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:gameId', protect, toggleFavorite);

export default router;
