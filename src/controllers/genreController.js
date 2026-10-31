import Genre from '../models/Genre.js';
import { handleControllerError, escapeRegex } from '../utils/errorHandler.js';

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({}).sort({ name: 1 });
    res.json(genres);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la lista de géneros');
  }
};

export const createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'El nombre del género es obligatorio y debe ser texto' });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'La descripción del género debe ser texto' });
    }

    const cleanName = name.trim();
    if (cleanName.length > 60) {
      return res.status(400).json({ message: 'El nombre del género no puede superar los 60 caracteres' });
    }

    const cleanDescription = description ? description.trim() : '';
    if (cleanDescription.length > 500) {
      return res.status(400).json({ message: 'La descripción no puede superar los 500 caracteres' });
    }

    const safeName = escapeRegex(cleanName);
    const genreExists = await Genre.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });
    
    if (genreExists) {
      return res.status(400).json({ message: 'El género ya se encuentra registrado' });
    }

    const genre = new Genre({
      name: cleanName,
      description: cleanDescription
    });

    const createdGenre = await genre.save();
    res.status(201).json(createdGenre);
  } catch (error) {
    handleControllerError(res, error, 'Error al crear el género');
  }
};
