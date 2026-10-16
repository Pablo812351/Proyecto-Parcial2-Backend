import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import Game from '../src/models/Game.js';
import Genre from '../src/models/Genre.js';
import Company from '../src/models/Company.js';
import UserGame from '../src/models/UserGame.js';

// Usamos el entorno desde .env
dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado para Seeding...');

    // Limpiar colecciones
    await User.deleteMany();
    await Game.deleteMany();
    await Genre.deleteMany();
    await Company.deleteMany();
    await UserGame.deleteMany();

    // Crear Usuario Admin y Usuario Normal
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    // Mongoose saltará el hook 'pre-save' si usamos insertMany o create, 
    // pero nuestro User.js tiene un pre('save') hook. 
    // Para que no haga doble-hash, como ya solucionamos el bug de 'isModified', podemos pasar la contraseña cruda,
    // PERO insertMany no dispara middleware pre('save').
    // Así que mejor usamos User.create y le pasamos el password crudo, ya que el modelo se encarga de hashear.
    const users = await User.create([
      { username: 'admin', email: 'admin@admin.com', password: 'admin123', role: 'ADMIN_ROLE' },
      { username: 'usuario', email: 'user@user.com', password: 'user123', role: 'USER_ROLE' }
    ]);
    console.log('Usuarios sembrados.');

    // Crear Géneros
    const genres = await Genre.insertMany([
      { name: 'Acción', description: 'Juegos rápidos que requieren reflejos' },
      { name: 'RPG', description: 'Juegos de rol y desarrollo de personajes' },
      { name: 'Estrategia', description: 'Juegos que requieren pensar tácticas' }
    ]);
    console.log('Géneros sembrados.');

    // Crear Empresas
    const companies = await Company.insertMany([
      { name: 'Valve' },
      { name: 'CD Projekt Red' },
      { name: 'Bethesda Game Studios' }
    ]);
    console.log('Empresas sembradas.');

    // Crear Juegos
    const games = await Game.insertMany([
      {
        title: 'Half-Life 2',
        description: 'El clásico shooter de Valve que revolucionó las físicas en los videojuegos.',
        releaseDate: new Date('2004-11-16'),
        developer: companies[0]._id, // Valve
        genre: genres[0]._id, // Acción
        steamUrl: 'https://store.steampowered.com/app/220/HalfLife_2/',
        imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/220/header.jpg'
      },
      {
        title: 'The Witcher 3: Wild Hunt',
        description: 'Como Geralt de Rivia, debes encontrar a la niña de la profecía en un mundo abierto masivo.',
        releaseDate: new Date('2015-05-18'),
        developer: companies[1]._id, // CD Projekt Red
        genre: genres[1]._id, // RPG
        steamUrl: 'https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/',
        imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg'
      },
      {
        title: 'The Elder Scrolls V: Skyrim',
        description: 'Fantasía épica de mundo abierto donde encarnas al Sangre de Dragón.',
        releaseDate: new Date('2011-11-11'),
        developer: companies[2]._id, // Bethesda
        genre: genres[1]._id, // RPG
        steamUrl: 'https://store.steampowered.com/app/489830/The_Elder_Scrolls_V_Skyrim_Special_Edition/',
        imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/489830/header.jpg'
      }
    ]);
    console.log('Juegos sembrados.');

    // Crear entradas de biblioteca para el usuario de prueba
    await UserGame.create([
      {
        user: users[1]._id,
        game: games[0]._id, // Half-Life 2
        status: 'Jugando',
        isFavorite: true
      },
      {
        user: users[1]._id,
        game: games[1]._id, // The Witcher 3
        status: 'Pendiente',
        isFavorite: false
      },
      {
        user: users[1]._id,
        game: games[2]._id, // Skyrim
        status: 'Completado',
        isFavorite: true
      }
    ]);
    console.log('Biblioteca personal sembrada.');

    console.log('--- SEEDING COMPLETADO CON ÉXITO ---');
    process.exit();
  } catch (error) {
    console.error(`Error en seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
