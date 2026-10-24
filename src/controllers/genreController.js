import Genre from '../models/Genre.js';

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({});
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGenre = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre del género es obligatorio' });
    }

    const genreExists = await Genre.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    
    if (genreExists) {
      return res.status(400).json({ message: 'El género ya existe' });
    }

    const genre = new Genre({
      name,
      description
    });

    const createdGenre = await genre.save();
    res.status(201).json(createdGenre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
