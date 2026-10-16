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

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/library', libraryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Gaming Hub API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
