import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
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
    type: String
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Game', gameSchema);
