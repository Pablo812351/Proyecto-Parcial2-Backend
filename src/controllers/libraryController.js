import UserGame from '../models/UserGame.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { handleControllerError, ensure } from '../utils/errorHandler.js';
import { VALID_STATUSES, ensureValidId, validateLibraryInput } from '../utils/validators.js';

// Configuración reutilizable de populate para evitar repetición
const GAME_POPULATE = {
  path: 'game',
  populate: [
    { path: 'genre', select: 'name' },
    { path: 'developer', select: 'name' }
  ]
};

// Sincroniza en una sola operación de MongoDB el array de favoritos del modelo User
const syncUserFavorite = (userId, gameId, isFavorite) =>
  User.findByIdAndUpdate(
    userId,
    isFavorite ? { $addToSet: { favorites: gameId } } : { $pull: { favorites: gameId } }
  );

// Elimina una entrada huérfana de la biblioteca y quita el favorito del usuario
const clearOrphanLibraryItem = async (userId, gameId, existingItem) => {
  await Promise.all([
    existingItem ? UserGame.deleteOne({ _id: existingItem._id }) : Promise.resolve(),
    syncUserFavorite(userId, gameId, false)
  ]);
};

// Lógica compartida para agregar o actualizar un elemento en la biblioteca (POST y PUT)
const saveLibraryItem = async (req, res, gameId, invalidIdMessage, fallbackError) => {
  try {
    validateLibraryInput(gameId, req.body, invalidIdMessage);

    const { status, isFavorite } = req.body;
    const [game, existingItem] = await Promise.all([
      Game.findById(gameId),
      UserGame.findOne({ user: req.user._id, game: gameId })
    ]);

    ensure(game, 'Videojuego no encontrado', 404);

    const nextStatus = status !== undefined
      ? (status && VALID_STATUSES.includes(status) ? status : null)
      : (existingItem?.status ?? null);

    const nextFavorite = typeof isFavorite === 'boolean'
      ? isFavorite
      : (existingItem?.isFavorite ?? false);

    if (!nextStatus && !nextFavorite) {
      await clearOrphanLibraryItem(req.user._id, gameId, existingItem);
      return res.status(200).json({
        removed: true,
        inLibrary: false,
        item: null,
        status: null,
        isFavorite: false,
        message: 'Videojuego removido de tu biblioteca'
      });
    }

    const [item] = await Promise.all([
      UserGame.findOneAndUpdate(
        { user: req.user._id, game: gameId },
        { status: nextStatus, isFavorite: nextFavorite },
        { upsert: true, new: true, runValidators: true }
      ).populate(GAME_POPULATE),
      syncUserFavorite(req.user._id, gameId, nextFavorite)
    ]);

    res.status(200).json(item);
  } catch (error) {
    handleControllerError(res, error, fallbackError);
  }
};

// @desc Obtener la biblioteca del usuario actual (opcionalmente filtrada por estado o favoritos)
// @route GET /api/library
// @access Private
export const getUserLibrary = async (req, res) => {
  try {
    const { status, favorite } = req.query;
    const query = {
      user: req.user._id,
      ...(status && VALID_STATUSES.includes(status) ? { status } : {}),
      ...(favorite === 'true' ? { isFavorite: true } : {})
    };

    const items = await UserGame.find(query)
      .populate(GAME_POPULATE)
      .sort({ updatedAt: -1 });

    res.json(items.filter((item) => item.game != null));
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la biblioteca del usuario');
  }
};

// @desc Obtener el estado de un juego específico en la biblioteca del usuario
// @route GET /api/library/check/:gameId
// @access Private
export const getGameLibraryStatus = async (req, res) => {
  try {
    ensureValidId(req.params.gameId);

    const item = await UserGame.findOne({ user: req.user._id, game: req.params.gameId }).populate(GAME_POPULATE);
    res.json({ inLibrary: Boolean(item), item: item || null });
  } catch (error) {
    handleControllerError(res, error, 'Error al consultar el estado del juego en la biblioteca');
  }
};

// @desc Agregar o actualizar un juego en la biblioteca personal
// @route POST /api/library
// @access Private
export const addOrUpdateLibraryItem = (req, res) =>
  saveLibraryItem(
    req,
    res,
    req.body.gameId,
    'El identificador del videojuego es inválido o no fue provisto',
    'Error al agregar el videojuego a la biblioteca'
  );

// @desc Modificar estado o favorito de un juego existente en la biblioteca
// @route PUT /api/library/:gameId
// @access Private
export const updateLibraryItem = (req, res) =>
  saveLibraryItem(
    req,
    res,
    req.params.gameId,
    'El identificador del videojuego no es válido',
    'Error al actualizar el videojuego en la biblioteca'
  );

// @desc Quitar un juego de la biblioteca personal
// @route DELETE /api/library/:gameId
// @access Private
export const removeFromLibrary = async (req, res) => {
  try {
    const { gameId } = req.params;
    ensureValidId(gameId);

    const [deleted] = await Promise.all([
      UserGame.findOneAndDelete({ user: req.user._id, game: gameId }),
      syncUserFavorite(req.user._id, gameId, false)
    ]);

    ensure(deleted, 'El videojuego no se encuentra en tu biblioteca', 404);
    res.json({ message: 'Videojuego eliminado de tu biblioteca', gameId });
  } catch (error) {
    handleControllerError(res, error, 'Error al eliminar el videojuego de la biblioteca');
  }
};

// @desc Alternar favorito directamente en la biblioteca
// @route POST /api/library/toggle-favorite/:gameId
// @access Private
export const toggleLibraryFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;
    ensureValidId(gameId);

    const [game, existingItem] = await Promise.all([
      Game.findById(gameId),
      UserGame.findOne({ user: req.user._id, game: gameId })
    ]);

    ensure(game, 'Videojuego no encontrado', 404);

    const nextFavorite = existingItem ? !existingItem.isFavorite : true;

    if (!nextFavorite && !existingItem?.status) {
      await clearOrphanLibraryItem(req.user._id, gameId, existingItem);
      return res.json({ isFavorite: false, item: null, inLibrary: false });
    }

    const [item] = await Promise.all([
      UserGame.findOneAndUpdate(
        { user: req.user._id, game: gameId },
        { isFavorite: nextFavorite, $setOnInsert: { status: null } },
        { upsert: true, new: true }
      ).populate(GAME_POPULATE),
      syncUserFavorite(req.user._id, gameId, nextFavorite)
    ]);

    res.json({ isFavorite: item.isFavorite, item });
  } catch (error) {
    handleControllerError(res, error, 'Error al alternar favorito en la biblioteca');
  }
};
