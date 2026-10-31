import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la empresa desarrolladora es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [80, 'El nombre de la empresa no puede superar los 80 caracteres']
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);
