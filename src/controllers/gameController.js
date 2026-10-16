import mongoose from 'mongoose';
import Game from '../models/Game.js';
import Genre from '../models/Genre.js';
import Company from '../models/Company.js';
import UserGame from '../models/UserGame.js';
import User from '../models/User.js';

export const getGames = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Find matching genres and companies by text
      const matchingGenres = await Genre.find({ name: { $regex: search, $options: 'i' } });
      const matchingCompanies = await Company.find({ name: { $regex: search, $options: 'i' } });

      const genreIds = matchingGenres.map(g => g._id);
      const companyIds = matchingCompanies.map(c => c._id);

      // Game matches if title matches OR its genre is in matchingGenres OR its developer is in matchingCompanies
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
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
    res.status(500).json({ message: error.message });
  }
};

export const getGameById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido' });
    }

    const game = await Game.findById(req.params.id)
      .populate('developer', 'name')
      .populate('genre', 'name');
    
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: 'Game not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to find or create a related document
const findOrCreate = async (Model, name) => {
  if (!name) return null;
  // Búsqueda case-insensitive exacta
  let doc = await Model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (!doc) {
    doc = await Model.create({ name });
  }
  return doc._id;
};

export const createGame = async (req, res) => {
  try {
    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;

    const genreId = await findOrCreate(Genre, genreName);
    const developerId = await findOrCreate(Company, developerName);

    const game = new Game({
      title,
      description,
      releaseDate,
      developer: developerId,
      genre: genreId,
      steamUrl,
      imageUrl
    });

    const createdGame = await game.save();
    res.status(201).json(createdGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido' });
    }

    const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = req.body;
    const game = await Game.findById(req.params.id);

    if (game) {
      if (title !== undefined) game.title = title;
      if (description !== undefined) game.description = description;
      if (releaseDate !== undefined) game.releaseDate = releaseDate;
      if (steamUrl !== undefined) game.steamUrl = steamUrl;
      if (imageUrl !== undefined) game.imageUrl = imageUrl;

      if (genreName) game.genre = await findOrCreate(Genre, genreName);
      if (developerName) game.developer = await findOrCreate(Company, developerName);

      const updatedGame = await game.save();
      res.json(updatedGame);
    } else {
      res.status(404).json({ message: 'Game not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de juego inválido' });
    }

    const game = await Game.findById(req.params.id);

    if (game) {
      await Game.deleteOne({ _id: game._id });
      // Limpiar en cascada relaciones de biblioteca y favoritos
      await UserGame.deleteMany({ game: game._id });
      await User.updateMany({ favorites: game._id }, { $pull: { favorites: game._id } });
      res.json({ message: 'Game removed' });
    } else {
      res.status(404).json({ message: 'Game not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
