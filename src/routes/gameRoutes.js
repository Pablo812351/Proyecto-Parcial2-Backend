import express from 'express';
import { getGames, getGameById, createGame, updateGame, deleteGame } from '../controllers/gameController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getGames)
  .post(protect, admin, createGame);

router.route('/:id')
  .get(getGameById)
  .put(protect, admin, updateGame)
  .delete(protect, admin, deleteGame);

export default router;
