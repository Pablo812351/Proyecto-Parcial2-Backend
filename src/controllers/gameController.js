import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Genre from '../models/Genre.js';
import Company from '../models/Company.js';
import UserGame from '../models/UserGame.js';
import User from '../models/User.js';
import { handleControllerError, escapeRegex } from '../utils/errorHandler.js';

export const getGames = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      // Búsqueda insensible a mayúsculas y protegida contra caracteres de regex
      const matchingGenres = await Genre.find({ name: { $regex: safeSearch, $options: 'i' } });
      const matchingCompanies = await Company.find({ name: { $regex: safeSearch, $options: 'i' } });

      const genreIds = matchingGenres.map(g => g._id);
      const companyIds = matchingCompanies.map(c => c._id);

      query = {
        $or: [
          { title: { $regex: safeSearch, $options: 'i' } },
          { genre: { $in: genreIds } },
          { developer: { $in: companyIds } }
        ]
      };
    }

    const games = await Game.find(query)
      .populate('developer', 'name')
      .populate('genre', 'name');
    res.json(games);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener el catálogo de videojuegos');
  }
};

export const getGameById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const game = await Game.findById(req.params.id)
      .populate('developer', 'name')
      .populate('genre', 'name');
    
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: 'Videojuego no encontrado' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener el detalle del videojuego');
  }
};

// Función auxiliar para buscar o crear documentos relacionados con escape de regex
const findOrCreate = async (Model, name) => {
  if (!name) return null;
  const cleanName = name.trim();
  const safeName = escapeRegex(cleanName);
  let doc = await Model.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });
  if (!doc) {
    doc = await Model.create({ name: cleanName });
  }
  return doc._id;
};

export const createGame = async (req, res) => {
  try {
    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;

    // Validaciones estrictas de campos obligatorios
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'El título del videojuego es obligatorio' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'La descripción del videojuego es obligatoria' });
    }
    if (!developerName || !developerName.trim()) {
      return res.status(400).json({ message: 'El nombre de la empresa/desarrolladora es obligatorio' });
    }
    if (!genreName || !genreName.trim()) {
      return res.status(400).json({ message: 'El género del videojuego es obligatorio' });
    }
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ message: 'La URL de la imagen de portada es obligatoria' });
    }
    if (!imageUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'La URL de la imagen debe comenzar con http:// o https://' });
    }

    if (steamUrl && steamUrl.trim() && !steamUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'El enlace de Steam debe comenzar con http:// o https://' });
    }

    if (releaseDate) {
      const parsedDate = new Date(releaseDate);
      const year = parsedDate.getUTCFullYear();
      const maxYear = new Date().getFullYear() + 10;
      if (isNaN(parsedDate.getTime()) || isNaN(year) || year < 1950 || year > maxYear) {
        return res.status(400).json({ 
          message: `El año de lanzamiento debe estar comprendido entre 1950 y ${maxYear}` 
        });
      }
    }

    const cleanTitle = title.trim();
    // Validar que no exista un juego registrado con el mismo título (case-insensitive)
    const existingGame = await Game.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') }
    });
    if (existingGame) {
      return res.status(400).json({ message: 'Ya existe un videojuego registrado con ese título. Por favor elija otro.' });
    }

    const genreId = await findOrCreate(Genre, genreName);
    const developerId = await findOrCreate(Company, developerName);

    const game = new Game({
      title: cleanTitle,
      description: description.trim(),
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      developer: developerId,
      genre: genreId,
      steamUrl: steamUrl ? steamUrl.trim() : '',
      imageUrl: imageUrl.trim()
    });

    const createdGame = await game.save();
    res.status(201).json(createdGame);
  } catch (error) {
    handleControllerError(res, error, 'Error al crear el nuevo videojuego');
  }
};

export const updateGame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'El título no puede estar vacío' });
    }
    if (description !== undefined && !description.trim()) {
      return res.status(400).json({ message: 'La descripción no puede estar vacía' });
    }
    if (imageUrl !== undefined && imageUrl.trim() && !imageUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'La URL de la imagen debe comenzar con http:// o https://' });
    }
    if (steamUrl !== undefined && steamUrl.trim() && !steamUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'El enlace de Steam debe comenzar con http:// o https://' });
    }
    if (releaseDate !== undefined && releaseDate) {
      const parsedDate = new Date(releaseDate);
      const year = parsedDate.getUTCFullYear();
      const maxYear = new Date().getFullYear() + 10;
      if (isNaN(parsedDate.getTime()) || isNaN(year) || year < 1950 || year > maxYear) {
        return res.status(400).json({ 
          message: `El año de lanzamiento debe estar comprendido entre 1950 y ${maxYear}` 
        });
      }
    }

    // Validar que no exista OTRO juego con el mismo título
    if (title !== undefined && title.trim()) {
      const cleanTitle = title.trim();
      const duplicateGame = await Game.findOne({
        _id: { $ne: req.params.id },
        title: { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') }
      });
      if (duplicateGame) {
        return res.status(400).json({ message: 'Ya existe otro videojuego registrado con ese título.' });
      }
    }

    const game = await Game.findById(req.params.id);

    if (game) {
      if (title !== undefined) game.title = title.trim();
      if (description !== undefined) game.description = description.trim();
      if (releaseDate !== undefined) game.releaseDate = releaseDate ? new Date(releaseDate) : null;
      if (steamUrl !== undefined) game.steamUrl = steamUrl ? steamUrl.trim() : '';
      if (imageUrl !== undefined) game.imageUrl = imageUrl ? imageUrl.trim() : '';

      if (genreName && genreName.trim()) {
        game.genre = await findOrCreate(Genre, genreName);
      }
      if (developerName && developerName.trim()) {
        game.developer = await findOrCreate(Company, developerName);
      }

      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Videojuego no encontrado' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el videojuego');
  }
};

export const deleteGame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const game = await Game.findById(req.params.id);

    if (game) {
      await Game.deleteOne({ _id: game._id });
      // Limpiar en cascada relaciones de biblioteca y favoritos
      await UserGame.deleteMany({ game: game._id });
      await User.updateMany({ favorites: game._id }, { $pull: { favorites: game._id } });
      res.json({ message: 'Videojuego eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Videojuego no encontrado' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al eliminar el videojuego');
  }
};
