import mongoose from 'mongoose';
import UserGame from '../models/UserGame.js';
import Game from '../models/Game.js';
import User from '../models/User.js';
import { handleControllerError } from '../utils/errorHandler.js';

// Estados válidos
const VALID_STATUSES = ['Pendiente', 'Jugando', 'Completado', 'Abandonado'];

// @desc Obtener la biblioteca del usuario actual (opcionalmente filtrada por estado o favoritos)
// @route GET /api/library
// @access Private
export const getUserLibrary = async (req, res) => {
  try {
    const { status, favorite } = req.query;
    const query = { user: req.user._id };

    if (status && VALID_STATUSES.includes(status)) {
      query.status = status;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    const items = await UserGame.find(query)
      .populate({
        path: 'game',
        populate: [
          { path: 'genre', select: 'name' },
          { path: 'developer', select: 'name' }
        ]
      })
      .sort({ updatedAt: -1 });

    // Filtrar posibles entradas cuyo juego haya sido borrado
    const validItems = items.filter(item => item.game != null);

    res.json(validItems);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la biblioteca del usuario');
  }
};

// @desc Obtener el estado de un juego específico en la biblioteca del usuario
// @route GET /api/library/check/:gameId
// @access Private
export const getGameLibraryStatus = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const item = await UserGame.findOne({ user: req.user._id, game: gameId })
      .populate({
        path: 'game',
        populate: [
          { path: 'genre', select: 'name' },
          { path: 'developer', select: 'name' }
        ]
      });

    if (!item) {
      return res.json({ inLibrary: false, item: null });
    }

    res.json({ inLibrary: true, item });
  } catch (error) {
    handleControllerError(res, error, 'Error al consultar el estado del juego en la biblioteca');
  }
};

// @desc Agregar o actualizar un juego en la biblioteca personal
// @route POST /api/library
// @access Private
export const addOrUpdateLibraryItem = async (req, res) => {
  try {
    const { gameId, status, isFavorite } = req.body;

    if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego es inválido o no fue provisto' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Estado de juego inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}` 
      });
    }

    let item = await UserGame.findOne({ user: req.user._id, game: gameId });

    if (item) {
      if (status !== undefined) {
        item.status = (status && VALID_STATUSES.includes(status)) ? status : null;
      }
      if (typeof isFavorite === 'boolean') item.isFavorite = isFavorite;
      await item.save();
    } else {
      item = await UserGame.create({
        user: req.user._id,
        game: gameId,
        status: (status && VALID_STATUSES.includes(status)) ? status : null,
        isFavorite: typeof isFavorite === 'boolean' ? isFavorite : false
      });
    }

    // Sincronizar con el array de favoritos del modelo User
    if (typeof isFavorite === 'boolean') {
      const user = await User.findById(req.user._id);
      if (user) {
        const hasFav = user.favorites.some(id => id.toString() === gameId);
        if (isFavorite && !hasFav) {
          user.favorites.push(gameId);
          await user.save();
        } else if (!isFavorite && hasFav) {
          user.favorites = user.favorites.filter(id => id.toString() !== gameId);
          await user.save();
        }
      }
    }

    await item.populate({
      path: 'game',
      populate: [
        { path: 'genre', select: 'name' },
        { path: 'developer', select: 'name' }
      ]
    });

    res.status(200).json(item);
  } catch (error) {
    handleControllerError(res, error, 'Error al agregar el videojuego a la biblioteca');
  }
};

// @desc Modificar estado o favorito de un juego existente en la biblioteca
// @route PUT /api/library/:gameId
// @access Private
export const updateLibraryItem = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { status, isFavorite } = req.body;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    if (status !== undefined && status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ 
          message: `Estado de juego inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}` 
        });
      }
    }

    let item = await UserGame.findOne({ user: req.user._id, game: gameId });

    if (!item) {
      item = new UserGame({
        user: req.user._id,
        game: gameId,
        status: (status && VALID_STATUSES.includes(status)) ? status : null,
        isFavorite: typeof isFavorite === 'boolean' ? isFavorite : false
      });
    } else {
      if (status !== undefined) {
        item.status = (status && VALID_STATUSES.includes(status)) ? status : null;
      }
      if (typeof isFavorite === 'boolean') item.isFavorite = isFavorite;
    }

    await item.save();

    // Sincronizar con el array de favoritos de User
    if (typeof isFavorite === 'boolean') {
      const user = await User.findById(req.user._id);
      if (user) {
        const hasFav = user.favorites.some(id => id.toString() === gameId);
        if (isFavorite && !hasFav) {
          user.favorites.push(gameId);
          await user.save();
        } else if (!isFavorite && hasFav) {
          user.favorites = user.favorites.filter(id => id.toString() !== gameId);
          await user.save();
        }
      }
    }

    await item.populate({
      path: 'game',
      populate: [
        { path: 'genre', select: 'name' },
        { path: 'developer', select: 'name' }
      ]
    });

    res.json(item);
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el videojuego en la biblioteca');
  }
};

// @desc Quitar un juego de la biblioteca personal
// @route DELETE /api/library/:gameId
// @access Private
export const removeFromLibrary = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const deleted = await UserGame.findOneAndDelete({ user: req.user._id, game: gameId });

    // Sincronizar: eliminar también de los favoritos del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: gameId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'El videojuego no se encuentra en tu biblioteca' });
    }

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

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    let item = await UserGame.findOne({ user: req.user._id, game: gameId });

    if (!item) {
      // Si no estaba en biblioteca, se agrega SOLO como favorito sin obligar ningún estado
      item = await UserGame.create({
        user: req.user._id,
        game: gameId,
        status: null,
        isFavorite: true
      });
    } else {
      item.isFavorite = !item.isFavorite;

      // Si se desmarcó de favorito y no tiene ningún estado de juego, limpiamos el documento
      if (!item.isFavorite && !item.status) {
        await UserGame.deleteOne({ _id: item._id });
        const user = await User.findById(req.user._id);
        if (user) {
          user.favorites = user.favorites.filter(id => id.toString() !== gameId);
          await user.save();
        }
        return res.json({ isFavorite: false, item: null, inLibrary: false });
      }

      await item.save();
    }

    // Sincronizar con User.favorites
    const user = await User.findById(req.user._id);
    if (user) {
      const hasFav = user.favorites.some(id => id.toString() === gameId);
      if (item.isFavorite && !hasFav) {
        user.favorites.push(gameId);
        await user.save();
      } else if (!item.isFavorite && hasFav) {
        user.favorites = user.favorites.filter(id => id.toString() !== gameId);
        await user.save();
      }
    }

    await item.populate({
      path: 'game',
      populate: [
        { path: 'genre', select: 'name' },
        { path: 'developer', select: 'name' }
      ]
    });

    res.json({ isFavorite: item.isFavorite, item });
  } catch (error) {
    handleControllerError(res, error, 'Error al alternar favorito en la biblioteca');
  }
};
