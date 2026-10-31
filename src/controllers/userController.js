import User from '../models/User.js';
import UserGame from '../models/UserGame.js';
import { handleControllerError, isValidObjectId } from '../utils/errorHandler.js';

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
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'El identificador de usuario no es válido' });
    }

    if (typeof role !== 'string' || !['ADMIN_ROLE', 'USER_ROLE'].includes(role)) {
      return res.status(400).json({ message: 'El rol especificado no es válido' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Regla de seguridad: Si actualmente es ADMIN_ROLE y se le quiere quitar el admin (pasar a USER_ROLE)
    if (targetUser.role === 'ADMIN_ROLE' && role === 'USER_ROLE') {
      const adminCount = await User.countDocuments({ role: 'ADMIN_ROLE' });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No es posible quitar el rol de administrador porque es el único administrador del sistema.'
        });
      }
    }

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
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'El identificador de usuario no es válido' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Regla de seguridad: No se puede eliminar al único administrador del sistema
    if (targetUser.role === 'ADMIN_ROLE') {
      const adminCount = await User.countDocuments({ role: 'ADMIN_ROLE' });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No es posible eliminar al único administrador del sistema.'
        });
      }
    }

    // Limpiar biblioteca personal del usuario a eliminar
    await UserGame.deleteMany({ user: id });

    // Eliminar usuario
    await User.findByIdAndDelete(id);

    res.json({ message: `Cuenta del usuario "${targetUser.username}" eliminada correctamente.` });
  } catch (error) {
    handleControllerError(res, error, 'Error al eliminar la cuenta de usuario');
  }
};
