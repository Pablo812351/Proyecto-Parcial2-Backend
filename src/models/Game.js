import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título del videojuego es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [150, 'El título del videojuego no puede superar los 150 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [3000, 'La descripción no puede superar los 3000 caracteres']
  },
  releaseDate: {
    type: Date
  },
  developer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  },
  steamUrl: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^https?:\/\/.+/i.test(v),
      message: 'El enlace de Steam debe comenzar con http:// o https://'
    }
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: (v) => !v || /^https?:\/\/.+/i.test(v),
      message: 'La URL de la imagen debe comenzar con http:// o https://'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Game', gameSchema);
