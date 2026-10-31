import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Validar variables de entorno críticas antes de iniciar
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Error crítico: Las variables MONGO_URI y JWT_SECRET deben estar definidas en el archivo .env');
  process.exit(1);
}

// Conectar a la base de datos
connectDB();

const app = express();

// Ocultar cabecera de tecnología del servidor por seguridad
app.disable('x-powered-by');

// Cabeceras HTTP de seguridad básicas
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/library', libraryRoutes);

// Ruta raíz de estado
app.get('/', (req, res) => {
  res.send('API de Gaming Hub en funcionamiento...');
});

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
