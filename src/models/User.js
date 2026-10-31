import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { EMAIL_REGEX } from '../utils/errorHandler.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El nombre de usuario no puede superar los 30 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [254, 'El correo electrónico no puede superar los 254 caracteres'],
    match: [EMAIL_REGEX, 'Por favor ingrese un correo electrónico válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: {
      values: ['USER_ROLE', 'ADMIN_ROLE'],
      message: 'El rol {VALUE} no es válido'
    },
    default: 'USER_ROLE'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
