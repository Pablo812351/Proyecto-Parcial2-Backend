import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Game from '../models/Game.js';
import UserGame from '../models/UserGame.js';
import { handleControllerError, escapeRegex, ensure } from '../utils/errorHandler.js';
import { validateRegisterInput, validateLoginInput, ensureValidId } from '../utils/validators.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    validateRegisterInput(req.body);

    const cleanUsername = req.body.username.trim();
    const cleanEmail = req.body.email.trim().toLowerCase();

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: cleanEmail }),
      User.findOne({ username: { $regex: new RegExp(`^${escapeRegex(cleanUsername)}$`, 'i') } })
    ]);

    ensure(!existingEmail, 'El correo electrónico ya está registrado. Por favor utilice otro.', 400);
    ensure(!existingUsername, 'El nombre de usuario ya está en uso. Por favor elija otro.', 400);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: req.body.password
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    handleControllerError(res, error, 'Error al registrar la cuenta de usuario');
  }
};

export const login = async (req, res) => {
  try {
    validateLoginInput(req.body);

    const cleanEmail = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    const isValidCredentials = Boolean(user && (await user.matchPassword(req.body.password)));

    ensure(isValidCredentials, 'Correo electrónico o contraseña inválidos', 401);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    handleControllerError(res, error, 'Error al iniciar sesión');
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    ensure(user, 'Usuario no encontrado', 404);

    res.json(user.favorites);
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la lista de favoritos');
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;
    ensureValidId(gameId);

    const [gameExists, user, userGame] = await Promise.all([
      Game.findById(gameId),
      User.findById(req.user._id),
      UserGame.findOne({ user: req.user._id, game: gameId })
    ]);

    ensure(gameExists, 'Videojuego no encontrado', 404);
    ensure(user, 'Usuario no encontrado', 404);

    const isCurrentlyFavorite = user.favorites.some((id) => id.toString() === gameId);
    const nextFavorite = !isCurrentlyFavorite;

    user.favorites = nextFavorite
      ? [...user.favorites, gameId]
      : user.favorites.filter((id) => id.toString() !== gameId);

    const syncLibraryPromise = !nextFavorite && userGame && !userGame.status
      ? UserGame.deleteOne({ _id: userGame._id })
      : UserGame.findOneAndUpdate(
          { user: req.user._id, game: gameId },
          { isFavorite: nextFavorite, $setOnInsert: { status: null } },
          { upsert: nextFavorite, new: true }
        );

    await Promise.all([user.save(), syncLibraryPromise]);

    res.json({ favorites: user.favorites });
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el estado de favorito');
  }
};
