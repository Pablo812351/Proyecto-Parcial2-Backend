import express from 'express';
import { getGenres, createGenre } from '../controllers/genreController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getGenres)
  .post(protect, admin, createGenre);

export default router;
