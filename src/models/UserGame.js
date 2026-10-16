import mongoose from 'mongoose';

const userGameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Jugando', 'Completado', 'Abandonado', null],
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Asegura que no se dupliquen registros para un mismo usuario y juego
userGameSchema.index({ user: 1, game: 1 }, { unique: true });

export default mongoose.model('UserGame', userGameSchema);
