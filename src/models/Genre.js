import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del género es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [60, 'El nombre del género no puede superar los 60 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar los 500 caracteres']
  }
}, {
  timestamps: true
});

export default mongoose.model('Genre', genreSchema);
