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
    const genreExists = await Genre.findOne({ name });
    
    if (genreExists) {
      return res.status(400).json({ message: 'Genre already exists' });
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
