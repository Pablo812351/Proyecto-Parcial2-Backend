import express from 'express';
import {
  getUserLibrary,
  getGameLibraryStatus,
  addOrUpdateLibraryItem,
  updateLibraryItem,
  removeFromLibrary,
  toggleLibraryFavorite
} from '../controllers/libraryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas de la biblioteca personal requieren autenticación
router.use(protect);

router.get('/', getUserLibrary);
router.get('/check/:gameId', getGameLibraryStatus);
router.post('/', addOrUpdateLibraryItem);
router.put('/:gameId', updateLibraryItem);
router.delete('/:gameId', removeFromLibrary);
router.post('/toggle-favorite/:gameId', toggleLibraryFavorite);

export default router;
