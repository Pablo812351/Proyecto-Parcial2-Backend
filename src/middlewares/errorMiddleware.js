import { formatErrorMessage } from '../utils/errorHandler.js';

// Middleware para rutas no encontradas (404)
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
};

// Middleware global para manejo de errores de Express
export const errorHandler = (err, req, res, next) => {
  const { status, message } = formatErrorMessage(err, 'Error interno del servidor');
  res.status(status).json({ message });
};
