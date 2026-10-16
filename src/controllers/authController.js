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
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
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
      res.status(401).json({ message: 'Invalid email or password' });
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
      res.status(404).json({ message: 'User not found' });
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
