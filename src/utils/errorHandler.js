/**
 * Utilidad centralizada para formatear y devolver mensajes de error en español
 * evitando que se filtren errores técnicos de MongoDB o de la base de datos al cliente.
 */

// Escapa caracteres especiales para búsquedas seguras con RegExp
export const escapeRegex = (string = '') => {
  return typeof string === 'string' ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
};

// Valida estrictamente que un identificador sea un ObjectId hexadecimal de 24 caracteres
export const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

// Expresión regular segura contra ReDoS (tiempo lineal) para validación de correos electrónicos
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

// Verifica una condición y si no se cumple lanza un error controlado con código HTTP y mensaje
export const ensure = (condition, message, status = 400) => {
  if (!condition) {
    throw { isCustom: true, status, message };
  }
};

const DUPLICATE_MESSAGES = {
  username: 'El nombre de usuario ya está en uso. Por favor elija otro.',
  email: 'El correo electrónico ya está registrado. Por favor utilice otro.',
  title: 'Ya existe un videojuego registrado con ese título. Por favor elija otro.',
  name: 'Ya existe un elemento registrado con ese nombre.'
};

const VALIDATION_KIND_MESSAGES = {
  required: (path) => `El campo '${path}' es obligatorio`,
  minlength: (path) => `El campo '${path}' no cumple con la longitud mínima requerida`,
  enum: (path) => `El valor del campo '${path}' no es válido`
};

const ERROR_BY_NAME = {
  CastError: { status: 400, message: 'El identificador proporcionado no es válido o el recurso no existe.' },
  JsonWebTokenError: { status: 401, message: 'Token de autenticación inválido. Por favor inicie sesión nuevamente.' },
  TokenExpiredError: { status: 401, message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.' }
};

const extractDuplicateField = (error) => {
  const keySource = error.keyValue || error.keyPattern;
  if (keySource && typeof keySource === 'object') {
    return Object.keys(keySource)[0] || '';
  }
  const match = error.message?.match(/index:\s+([a-zA-Z0-9_]+)/);
  return match?.[1] ? match[1].replace(/_1$/, '') : '';
};

const resolveDuplicateError = (error) => {
  const field = extractDuplicateField(error);
  const matchedKey = Object.keys(DUPLICATE_MESSAGES).find(
    (key) => field === key || error.message?.includes(`${key}_1`)
  );
  const message = matchedKey
    ? DUPLICATE_MESSAGES[matchedKey]
    : field.includes('user') && field.includes('game')
      ? 'El videojuego ya se encuentra registrado en tu biblioteca.'
      : 'Ya existe un registro con esos datos en el sistema.';

  return { status: 400, message };
};

const resolveValidationError = (error) => {
  const errorList = Object.values(error.errors || {}).map((err) => {
    const formatter = VALIDATION_KIND_MESSAGES[err.kind];
    return formatter ? formatter(err.path) : err.message;
  });

  return {
    status: 400,
    message: errorList.join('. ') || 'Los datos proporcionados no cumplen con las reglas de validación.'
  };
};

export const formatErrorMessage = (error, fallbackMessage = 'Ha ocurrido un error en el servidor. Por favor intente más tarde.') => {
  if (!error) {
    return { status: 500, message: fallbackMessage };
  }

  const isDuplicate = error.code === 11000 || error.message?.includes('E11000 duplicate key');
  const isParseFailed = error.type === 'entity.parse.failed' || (error instanceof SyntaxError && 'body' in error);
  const isTooLarge = error.type === 'entity.too.large' || error.status === 413;

  const errorResolvers = [
    { match: Boolean(error.isCustom), resolve: () => ({ status: error.status || 400, message: error.message }) },
    { match: Boolean(isDuplicate), resolve: () => resolveDuplicateError(error) },
    { match: error.name === 'ValidationError', resolve: () => resolveValidationError(error) },
    { match: Boolean(ERROR_BY_NAME[error.name]), resolve: () => ERROR_BY_NAME[error.name] },
    { match: Boolean(isParseFailed), resolve: () => ({ status: 400, message: 'El formato de los datos enviados no es un JSON válido.' }) },
    { match: Boolean(isTooLarge), resolve: () => ({ status: 413, message: 'El tamaño de los datos enviados excede el límite permitido.' }) }
  ];

  const matchedResolver = errorResolvers.find((item) => item.match);
  if (matchedResolver) {
    return matchedResolver.resolve();
  }

  console.error('Error interno capturado en backend:', error);
  return { status: 500, message: fallbackMessage };
};

export const handleControllerError = (res, error, fallbackMessage) => {
  const { status, message } = formatErrorMessage(error, fallbackMessage);
  return res.status(status).json({ message });
};
