import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'No autorizado, token inválido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, falta token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN_ROLE') {
    next();
  } else {
    return res.status(403).json({ message: 'No autorizado como administrador' });
  }
};

export { protect, admin };
