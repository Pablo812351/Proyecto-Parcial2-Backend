import Genre from '../models/Genre.js';
import { handleControllerError, escapeRegex, ensure } from '../utils/errorHandler.js';
import { validateGenreInput } from '../utils/validators.js';

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
    validateGenreInput(req.body);

    const cleanName = req.body.name.trim();
    const cleanDescription = req.body.description ? req.body.description.trim() : '';

    const genreExists = await Genre.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(cleanName)}$`, 'i') }
    });
    ensure(!genreExists, 'El género ya se encuentra registrado', 400);

    const createdGenre = await Genre.create({
      name: cleanName,
      description: cleanDescription
    });

    res.status(201).json(createdGenre);
  } catch (error) {
    handleControllerError(res, error, 'Error al crear el género');
  }
};
