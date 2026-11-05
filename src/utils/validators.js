import { ensure, isValidObjectId, EMAIL_REGEX } from './errorHandler.js';

export const VALID_STATUSES = ['Pendiente', 'Jugando', 'Completado', 'Abandonado'];

export const isNonEmptyString = (val) => typeof val === 'string' && Boolean(val.trim());
export const isValidHttpUrl = (val) => typeof val === 'string' && /^https?:\/\/.+/i.test(val.trim());

// Evalúa una lista de reglas y lanza automáticamente el primer error que encuentre
const runValidationRules = (rules) => {
  const failed = rules.find((rule) => rule.check);
  ensure(!failed, failed?.msg, failed?.status || 400);
};

// Valida un ObjectId con un mensaje personalizado
export const ensureValidId = (id, message = 'El identificador del videojuego no es válido') => {
  ensure(isValidObjectId(id), message, 400);
};

// Validaciones de Autenticación (Registro y Login)
export const validateRegisterInput = ({ username, email, password } = {}) => {
  runValidationRules([
    {
      check: typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string',
      msg: 'Todos los campos (usuario, email y contraseña) deben ser texto'
    },
    {
      check: !isNonEmptyString(username) || !isNonEmptyString(email) || !password,
      msg: 'Todos los campos (usuario, email y contraseña) son obligatorios'
    },
    {
      check: typeof username === 'string' && (username.trim().length < 3 || username.trim().length > 30),
      msg: 'El nombre de usuario debe tener entre 3 y 30 caracteres'
    },
    {
      check: typeof email === 'string' && (email.trim().length > 254 || !EMAIL_REGEX.test(email.trim().toLowerCase())),
      msg: 'Por favor ingrese un correo electrónico válido'
    },
    {
      check: typeof password === 'string' && password.length < 6,
      msg: 'La contraseña debe tener al menos 6 caracteres'
    },
    {
      check: typeof password === 'string' && password.length > 72,
      msg: 'La contraseña no puede superar los 72 caracteres'
    }
  ]);
};

export const validateLoginInput = ({ email, password } = {}) => {
  runValidationRules([
    {
      check: typeof email !== 'string' || typeof password !== 'string',
      msg: 'El correo electrónico y la contraseña deben ser texto'
    },
    {
      check: !isNonEmptyString(email) || !password,
      msg: 'Por favor ingrese correo electrónico y contraseña'
    },
    {
      check: typeof email === 'string' && typeof password === 'string' && (email.trim().length > 254 || password.length > 128),
      msg: 'Correo electrónico o contraseña inválidos',
      status: 401
    }
  ]);
};

// Validaciones de Administración de Usuarios
export const validateRoleUpdateInput = (id, role) => {
  runValidationRules([
    {
      check: !isValidObjectId(id),
      msg: 'El identificador de usuario no es válido'
    },
    {
      check: typeof role !== 'string' || !['ADMIN_ROLE', 'USER_ROLE'].includes(role),
      msg: 'El rol especificado no es válido'
    }
  ]);
};

// Validaciones de Géneros y Empresas
export const validateGenreInput = ({ name, description } = {}) => {
  runValidationRules([
    {
      check: !isNonEmptyString(name),
      msg: 'El nombre del género es obligatorio y debe ser texto'
    },
    {
      check: description !== undefined && description !== null && typeof description !== 'string',
      msg: 'La descripción del género debe ser texto'
    },
    {
      check: typeof name === 'string' && name.trim().length > 60,
      msg: 'El nombre del género no puede superar los 60 caracteres'
    },
    {
      check: typeof description === 'string' && description.trim().length > 500,
      msg: 'La descripción no puede superar los 500 caracteres'
    }
  ]);
};

export const validateCompanyInput = ({ name } = {}) => {
  runValidationRules([
    {
      check: !isNonEmptyString(name),
      msg: 'El nombre de la empresa es obligatorio y debe ser texto'
    },
    {
      check: typeof name === 'string' && name.trim().length > 80,
      msg: 'El nombre de la empresa no puede superar los 80 caracteres'
    }
  ]);
};

// Validaciones de Videojuegos (Filtros, Creación y Edición)
export const validateGameFilters = ({ search, genre, developer } = {}) => {
  runValidationRules([
    {
      check: Boolean(genre) && (typeof genre !== 'string' || !isValidObjectId(genre.trim())),
      msg: 'El identificador de género no es válido'
    },
    {
      check: Boolean(developer) && (typeof developer !== 'string' || !isValidObjectId(developer.trim())),
      msg: 'El identificador de desarrolladora no es válido'
    },
    {
      check: search !== undefined && search !== '' && typeof search !== 'string',
      msg: 'El parámetro de búsqueda debe ser texto'
    }
  ]);
};

const getReleaseDateError = (releaseDate) => {
  if (releaseDate === undefined || releaseDate === null || releaseDate === '') return null;
  if (typeof releaseDate !== 'string') {
    return 'La fecha de lanzamiento debe ser una cadena de fecha válida';
  }
  const parsedDate = new Date(releaseDate);
  const year = parsedDate.getUTCFullYear();
  const maxYear = new Date().getFullYear() + 10;
  return isNaN(parsedDate.getTime()) || isNaN(year) || year < 1950 || year > maxYear
    ? `El año de lanzamiento debe estar comprendido entre 1950 y ${maxYear}`
    : null;
};

export const validateGamePayload = (body = {}, isUpdate = false) => {
  const { title, description, releaseDate, developerName, genreName, steamUrl, imageUrl } = body;
  const shouldCheck = (value) => !isUpdate || value !== undefined;
  const dateError = getReleaseDateError(releaseDate);

  runValidationRules([
    {
      check: shouldCheck(title) && !isNonEmptyString(title),
      msg: isUpdate ? 'El título debe ser texto y no puede estar vacío' : 'El título del videojuego es obligatorio y debe ser texto'
    },
    {
      check: shouldCheck(title) && typeof title === 'string' && title.trim().length > 150,
      msg: 'El título del videojuego no puede superar los 150 caracteres'
    },
    {
      check: shouldCheck(description) && !isNonEmptyString(description),
      msg: isUpdate ? 'La descripción debe ser texto y no puede estar vacía' : 'La descripción del videojuego es obligatoria y debe ser texto'
    },
    {
      check: shouldCheck(description) && typeof description === 'string' && description.trim().length > 3000,
      msg: 'La descripción no puede superar los 3000 caracteres'
    },
    {
      check: shouldCheck(developerName) && !isNonEmptyString(developerName),
      msg: isUpdate ? 'La desarrolladora debe ser texto y no puede estar vacía' : 'El nombre de la empresa/desarrolladora es obligatorio'
    },
    {
      check: shouldCheck(developerName) && typeof developerName === 'string' && developerName.trim().length > 80,
      msg: 'El nombre de la empresa no puede superar los 80 caracteres'
    },
    {
      check: shouldCheck(genreName) && !isNonEmptyString(genreName),
      msg: isUpdate ? 'El género debe ser texto y no puede estar vacío' : 'El género del videojuego es obligatorio'
    },
    {
      check: shouldCheck(genreName) && typeof genreName === 'string' && genreName.trim().length > 60,
      msg: 'El nombre del género no puede superar los 60 caracteres'
    },
    {
      check: !isUpdate && !isNonEmptyString(imageUrl),
      msg: 'La URL de la imagen de portada es obligatoria'
    },
    {
      check: shouldCheck(imageUrl) && !isValidHttpUrl(imageUrl),
      msg: 'La URL de la imagen debe comenzar con http:// o https://'
    },
    {
      check: steamUrl !== undefined && steamUrl !== null && typeof steamUrl !== 'string',
      msg: 'El enlace de Steam debe ser texto'
    },
    {
      check: typeof steamUrl === 'string' && Boolean(steamUrl.trim()) && !isValidHttpUrl(steamUrl),
      msg: 'El enlace de Steam debe comenzar con http:// o https://'
    },
    {
      check: Boolean(dateError),
      msg: dateError
    }
  ]);
};

// Validaciones de Biblioteca Personal
export const validateLibraryInput = (gameId, { status, isFavorite } = {}, invalidIdMessage) => {
  runValidationRules([
    {
      check: !isValidObjectId(gameId),
      msg: invalidIdMessage
    },
    {
      check: isFavorite !== undefined && typeof isFavorite !== 'boolean',
      msg: 'El campo isFavorite debe ser un valor booleano'
    },
    {
      check: status !== undefined && status !== null && status !== '' && (typeof status !== 'string' || !VALID_STATUSES.includes(status)),
      msg: `Estado de juego inválido. Debe ser uno de: ${VALID_STATUSES.join(', ')}`
    }
  ]);
};