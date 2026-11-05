import Game from '../models/Game.js';
import Genre from '../models/Genre.js';
import Company from '../models/Company.js';
import UserGame from '../models/UserGame.js';
import User from '../models/User.js';
import { handleControllerError, escapeRegex, ensure } from '../utils/errorHandler.js';
import { isNonEmptyString, ensureValidId, validateGameFilters, validateGamePayload } from '../utils/validators.js';

// Función auxiliar para buscar o crear documentos relacionados con escape de regex
const findOrCreate = async (Model, name) => {
  if (!isNonEmptyString(name)) return null;
  const cleanName = name.trim();
  const safeName = escapeRegex(cleanName);
  const existing = await Model.findOne({ name: { $regex: new RegExp(`^${safeName}$`, 'i') } });
  const doc = existing || (await Model.create({ name: cleanName }));
  return doc._id;
};

// Construye la condición de búsqueda por texto en título, género y desarrolladora
const buildSearchCondition = async (search) => {
  const trimmedSearch = typeof search === 'string' ? search.trim().slice(0, 100) : '';
  if (!trimmedSearch) return [];

  const safeSearch = escapeRegex(trimmedSearch);
  const regexFilter = { name: { $regex: safeSearch, $options: 'i' } };

  const [matchingGenres, matchingCompanies] = await Promise.all([
    Genre.find(regexFilter),
    Company.find(regexFilter)
  ]);

  return [{
    $or: [
      { title: { $regex: safeSearch, $options: 'i' } },
      { genre: { $in: matchingGenres.map((g) => g._id) } },
      { developer: { $in: matchingCompanies.map((c) => c._id) } }
    ]
  }];
};

export const getGames = async (req, res) => {
  try {
    validateGameFilters(req.query);

    const { search, genre, developer } = req.query;
    const searchCondition = await buildSearchCondition(search);

    const conditions = [
      ...(genre ? [{ genre: genre.trim() }] : []),
      ...(developer ? [{ developer: developer.trim() }] : []),
      ...searchCondition
    ];

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
    ensureValidId(req.params.id);

    const game = await Game.findById(req.params.id)
      .populate('developer', 'name')
      .populate('genre', 'name');

    ensure(game, 'Videojuego no encontrado', 404);
    res.json(game);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener el detalle del videojuego');
  }
};

export const createGame = async (req, res) => {
  try {
    validateGamePayload(req.body, false);

    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;
    const cleanTitle = title.trim();

    const existingGame = await Game.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(cleanTitle)}$`, 'i') }
    });
    ensure(!existingGame, 'Ya existe un videojuego registrado con ese título. Por favor elija otro.', 400);

    const [genreId, developerId] = await Promise.all([
      findOrCreate(Genre, genreName),
      findOrCreate(Company, developerName)
    ]);

    const createdGame = await Game.create({
      title: cleanTitle,
      description: description.trim(),
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      developer: developerId,
      genre: genreId,
      steamUrl: steamUrl ? steamUrl.trim() : '',
      imageUrl: imageUrl.trim()
    });

    res.status(201).json(createdGame);
  } catch (error) {
    handleControllerError(res, error, 'Error al crear el nuevo videojuego');
  }
};

export const updateGame = async (req, res) => {
  try {
    ensureValidId(req.params.id);
    validateGamePayload(req.body, true);

    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;

    const [duplicateGame, game] = await Promise.all([
      isNonEmptyString(title)
        ? Game.findOne({
            _id: { $ne: req.params.id },
            title: { $regex: new RegExp(`^${escapeRegex(title.trim())}$`, 'i') }
          })
        : Promise.resolve(null),
      Game.findById(req.params.id)
    ]);

    ensure(!duplicateGame, 'Ya existe otro videojuego registrado con ese título.', 400);
    ensure(game, 'Videojuego no encontrado', 404);

    const [genreId, developerId] = await Promise.all([
      isNonEmptyString(genreName) ? findOrCreate(Genre, genreName) : game.genre,
      isNonEmptyString(developerName) ? findOrCreate(Company, developerName) : game.developer
    ]);

    Object.assign(game, {
      title: title !== undefined ? title.trim() : game.title,
      description: description !== undefined ? description.trim() : game.description,
      releaseDate: releaseDate !== undefined ? (releaseDate ? new Date(releaseDate) : null) : game.releaseDate,
      steamUrl: steamUrl !== undefined ? (steamUrl ? steamUrl.trim() : '') : game.steamUrl,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : game.imageUrl,
      genre: genreId,
      developer: developerId
    });

    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el videojuego');
  }
};

export const deleteGame = async (req, res) => {
  try {
    ensureValidId(req.params.id);

    const game = await Game.findById(req.params.id);
    ensure(game, 'Videojuego no encontrado', 404);

    await Promise.all([
      Game.deleteOne({ _id: game._id }),
      UserGame.deleteMany({ game: game._id }),
      User.updateMany({ favorites: game._id }, { $pull: { favorites: game._id } })
    ]);

    res.json({ message: 'Videojuego eliminado correctamente' });
  } catch (error) {
    handleControllerError(res, error, 'Error al eliminar el videojuego');
  }
};
