import User from '../models/User.js';
import UserGame from '../models/UserGame.js';
import { handleControllerError, ensure } from '../utils/errorHandler.js';
import { ensureValidId, validateRoleUpdateInput } from '../utils/validators.js';

// Verifica si un usuario es el único administrador activo del sistema
const isOnlyAdmin = async (user) => {
  if (user.role !== 'ADMIN_ROLE') return false;
  const adminCount = await User.countDocuments({ role: 'ADMIN_ROLE' });
  return adminCount <= 1;
};

// @desc    Obtener lista de todos los usuarios
// @route   GET /api/users
// @access  Privado/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ role: 1, createdAt: -1 });

    res.json(users);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la lista de usuarios');
  }
};

// @desc    Actualizar rol de un usuario (hacer admin o quitar admin)
// @route   PUT /api/users/:id/role
// @access  Privado/Admin
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    validateRoleUpdateInput(id, role);

    const targetUser = await User.findById(id);
    ensure(targetUser, 'Usuario no encontrado', 404);

    const blockedDemotion = role === 'USER_ROLE' && (await isOnlyAdmin(targetUser));
    ensure(!blockedDemotion, 'No es posible quitar el rol de administrador porque es el único administrador del sistema.', 400);

    targetUser.role = role;
    await targetUser.save();

    res.json({
      _id: targetUser._id,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
      message: `Rol de "${targetUser.username}" actualizado a ${role === 'ADMIN_ROLE' ? 'Administrador' : 'Usuario estándar'}`
    });
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el rol del usuario');
  }
};

// @desc    Eliminar cuenta de un usuario
// @route   DELETE /api/users/:id
// @access  Privado/Admin
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    ensureValidId(id, 'El identificador de usuario no es válido');

    const targetUser = await User.findById(id);
    ensure(targetUser, 'Usuario no encontrado', 404);

    const blockedDeletion = await isOnlyAdmin(targetUser);
    ensure(!blockedDeletion, 'No es posible eliminar al único administrador del sistema.', 400);

    await Promise.all([
      UserGame.deleteMany({ user: id }),
      User.findByIdAndDelete(id)
    ]);

    res.json({ message: `Cuenta del usuario "${targetUser.username}" eliminada correctamente.` });
  } catch (error) {
    handleControllerError(res, error, 'Error al eliminar la cuenta de usuario');
  }
};
