import Game from '../models/Game.js';
import Genre from '../models/Genre.js';
import Company from '../models/Company.js';
import UserGame from '../models/UserGame.js';
import User from '../models/User.js';
import { handleControllerError, escapeRegex, isValidObjectId } from '../utils/errorHandler.js';

export const getGames = async (req, res) => {
  try {
    const { search, genre, developer } = req.query;
    const conditions = [];

    if (genre !== undefined && genre !== '') {
      if (typeof genre !== 'string' || !isValidObjectId(genre.trim())) {
        return res.status(400).json({ message: 'El identificador de género no es válido' });
      }
      conditions.push({ genre: genre.trim() });
    }

    if (developer !== undefined && developer !== '') {
      if (typeof developer !== 'string' || !isValidObjectId(developer.trim())) {
        return res.status(400).json({ message: 'El identificador de desarrolladora no es válido' });
      }
      conditions.push({ developer: developer.trim() });
    }

    if (search !== undefined && search !== '') {
      if (typeof search !== 'string') {
        return res.status(400).json({ message: 'El parámetro de búsqueda debe ser texto' });
      }

      const trimmedSearch = search.trim().slice(0, 100);
      if (trimmedSearch) {
        const safeSearch = escapeRegex(trimmedSearch);

        // Búsqueda insensible a mayúsculas y protegida contra caracteres de regex
        const matchingGenres = await Genre.find({ name: { $regex: safeSearch, $options: 'i' } });
        const matchingCompanies = await Company.find({ name: { $regex: safeSearch, $options: 'i' } });

        const genreIds = matchingGenres.map(g => g._id);
        const companyIds = matchingCompanies.map(c => c._id);

        conditions.push({
          $or: [
            { title: { $regex: safeSearch, $options: 'i' } },
            { genre: { $in: genreIds } },
            { developer: { $in: companyIds } }
          ]
        });
      }
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

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
    if (!isValidObjectId(req.params.id)) {
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

    // Validaciones estrictas de campos obligatorios y tipos de datos
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'El título del videojuego es obligatorio y debe ser texto' });
    }
    if (title.trim().length > 150) {
      return res.status(400).json({ message: 'El título del videojuego no puede superar los 150 caracteres' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'La descripción del videojuego es obligatoria y debe ser texto' });
    }
    if (description.trim().length > 3000) {
      return res.status(400).json({ message: 'La descripción no puede superar los 3000 caracteres' });
    }
    if (!developerName || typeof developerName !== 'string' || !developerName.trim()) {
      return res.status(400).json({ message: 'El nombre de la empresa/desarrolladora es obligatorio' });
    }
    if (developerName.trim().length > 80) {
      return res.status(400).json({ message: 'El nombre de la empresa no puede superar los 80 caracteres' });
    }
    if (!genreName || typeof genreName !== 'string' || !genreName.trim()) {
      return res.status(400).json({ message: 'El género del videojuego es obligatorio' });
    }
    if (genreName.trim().length > 60) {
      return res.status(400).json({ message: 'El nombre del género no puede superar los 60 caracteres' });
    }
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return res.status(400).json({ message: 'La URL de la imagen de portada es obligatoria' });
    }
    if (!imageUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'La URL de la imagen debe comenzar con http:// o https://' });
    }

    if (steamUrl !== undefined && steamUrl !== null && typeof steamUrl !== 'string') {
      return res.status(400).json({ message: 'El enlace de Steam debe ser texto' });
    }
    if (typeof steamUrl === 'string' && steamUrl.trim() && !steamUrl.trim().match(/^https?:\/\/.+/i)) {
      return res.status(400).json({ message: 'El enlace de Steam debe comenzar con http:// o https://' });
    }

    if (releaseDate !== undefined && releaseDate !== null && releaseDate !== '') {
      if (typeof releaseDate !== 'string') {
        return res.status(400).json({ message: 'La fecha de lanzamiento debe ser una cadena de fecha válida' });
      }
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'El título debe ser texto y no puede estar vacío' });
      }
      if (title.trim().length > 150) {
        return res.status(400).json({ message: 'El título del videojuego no puede superar los 150 caracteres' });
      }
    }
    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ message: 'La descripción debe ser texto y no puede estar vacía' });
      }
      if (description.trim().length > 3000) {
        return res.status(400).json({ message: 'La descripción no puede superar los 3000 caracteres' });
      }
    }
    if (genreName !== undefined) {
      if (typeof genreName !== 'string' || !genreName.trim()) {
        return res.status(400).json({ message: 'El género debe ser texto y no puede estar vacío' });
      }
      if (genreName.trim().length > 60) {
        return res.status(400).json({ message: 'El nombre del género no puede superar los 60 caracteres' });
      }
    }
    if (developerName !== undefined) {
      if (typeof developerName !== 'string' || !developerName.trim()) {
        return res.status(400).json({ message: 'La desarrolladora debe ser texto y no puede estar vacía' });
      }
      if (developerName.trim().length > 80) {
        return res.status(400).json({ message: 'El nombre de la empresa no puede superar los 80 caracteres' });
      }
    }
    if (imageUrl !== undefined && (typeof imageUrl !== 'string' || !imageUrl.trim() || !imageUrl.trim().match(/^https?:\/\/.+/i))) {
      return res.status(400).json({ message: 'La URL de la imagen debe comenzar con http:// o https://' });
    }
    if (steamUrl !== undefined && steamUrl !== null) {
      if (typeof steamUrl !== 'string') {
        return res.status(400).json({ message: 'El enlace de Steam debe ser texto' });
      }
      if (steamUrl.trim() && !steamUrl.trim().match(/^https?:\/\/.+/i)) {
        return res.status(400).json({ message: 'El enlace de Steam debe comenzar con http:// o https://' });
      }
    }
    if (releaseDate !== undefined && releaseDate !== null && releaseDate !== '') {
      if (typeof releaseDate !== 'string') {
        return res.status(400).json({ message: 'La fecha de lanzamiento debe ser una cadena de fecha válida' });
      }
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

      if (typeof genreName === 'string' && genreName.trim()) {
        game.genre = await findOrCreate(Genre, genreName);
      }
      if (typeof developerName === 'string' && developerName.trim()) {
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
    if (!isValidObjectId(req.params.id)) {
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
