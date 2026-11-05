import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isValidObjectId } from '../utils/errorHandler.js';

const JWT_ERROR_NAMES = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'];

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, falta token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !isValidObjectId(decoded.id)) {
      return res.status(401).json({ message: 'No autorizado, token inválido o expirado' });
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
    }

    return next();
  } catch (error) {
    if (JWT_ERROR_NAMES.includes(error.name)) {
      return res.status(401).json({ message: 'No autorizado, token inválido o expirado' });
    }
    return next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN_ROLE') {
    return res.status(403).json({ message: 'No autorizado como administrador' });
  }
  return next();
};

export { protect, admin };
