import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Game from '../models/Game.js';
import UserGame from '../models/UserGame.js';
import { handleControllerError, escapeRegex, isValidObjectId, EMAIL_REGEX } from '../utils/errorHandler.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // 1. Validar tipos de datos y campos requeridos
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Todos los campos (usuario, email y contraseña) deben ser texto' });
    }

    if (!username.trim() || !email.trim() || !password) {
      return res.status(400).json({ message: 'Todos los campos (usuario, email y contraseña) son obligatorios' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Validar longitud del nombre de usuario
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' });
    }

    // 3. Validar formato y longitud de correo electrónico
    if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: 'Por favor ingrese un correo electrónico válido' });
    }

    // 4. Validar longitud de contraseña (límite de 72 caracteres por algoritmo Bcrypt)
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (password.length > 72) {
      return res.status(400).json({ message: 'La contraseña no puede superar los 72 caracteres' });
    }

    // 5. Validar si el email ya existe
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado. Por favor utilice otro.' });
    }

    // 6. Validar si el username ya existe (case-insensitive)
    const existingUsername = await User.findOne({ 
      username: { $regex: new RegExp(`^${escapeRegex(cleanUsername)}$`, 'i') } 
    });
    if (existingUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso. Por favor elija otro.' });
    }

    // 7. Crear el nuevo usuario
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Los datos proporcionados no son válidos' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al registrar la cuenta de usuario');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'El correo electrónico y la contraseña deben ser texto' });
    }

    if (!email.trim() || !password) {
      return res.status(400).json({ message: 'Por favor ingrese correo electrónico y contraseña' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.length > 254 || password.length > 128) {
      return res.status(401).json({ message: 'Correo electrónico o contraseña inválidos' });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Correo electrónico o contraseña inválidos' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al iniciar sesión');
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (user) {
      res.json(user.favorites);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    handleControllerError(res, error, 'Error al obtener la lista de favoritos');
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const gameId = req.params.gameId;

    if (!isValidObjectId(gameId)) {
      return res.status(400).json({ message: 'El identificador del videojuego no es válido' });
    }

    const gameExists = await Game.findById(gameId);
    if (!gameExists) {
      return res.status(404).json({ message: 'Videojuego no encontrado' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isFavorite = user.favorites.some(id => id.toString() === gameId);
    
    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== gameId);
      const userGame = await UserGame.findOne({ user: req.user._id, game: gameId });
      if (userGame) {
        userGame.isFavorite = false;
        if (!userGame.status) {
          await UserGame.deleteOne({ _id: userGame._id });
        } else {
          await userGame.save();
        }
      }
    } else {
      user.favorites.push(gameId);
      await UserGame.findOneAndUpdate(
        { user: req.user._id, game: gameId },
        { isFavorite: true, $setOnInsert: { status: null } },
        { upsert: true, new: true }
      );
    }
    
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    handleControllerError(res, error, 'Error al actualizar el estado de favorito');
  }
};
