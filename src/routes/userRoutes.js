import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas de administración de usuarios requieren autenticación y rol de administrador
router.use(protect, admin);

router.route('/')
  .get(getUsers);

router.route('/:id/role')
  .put(updateUserRole);

router.route('/:id')
  .delete(deleteUser);

export default router;
