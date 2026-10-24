import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserGame from '../models/UserGame.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    if (!username || !username.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ message: 'Todos los campos (usuario, email y contraseña) son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
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
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });

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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const user = await User.findById(req.user._id);

    if (user) {
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
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
