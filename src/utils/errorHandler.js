/**
 * Utilidad centralizada para formatear y devolver mensajes de error en español
 * evitando que se filtren errores técnicos de MongoDB o de la base de datos al cliente.
 */

// Escapa caracteres especiales para búsquedas seguras con RegExp
export const escapeRegex = (string = '') => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Valida estrictamente que un identificador sea un ObjectId hexadecimal de 24 caracteres
export const isValidObjectId = (id) => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

// Expresión regular segura contra ReDoS (tiempo lineal) para validación de correos electrónicos
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

export const formatErrorMessage = (error, fallbackMessage = 'Ha ocurrido un error en el servidor. Por favor intente más tarde.') => {
  if (!error) {
    return { status: 500, message: fallbackMessage };
  }

  // 1. Error de clave duplicada en MongoDB (E11000)
  const isDuplicate = error.code === 11000 || (error.message && error.message.includes('E11000 duplicate key'));
  if (isDuplicate) {
    let field = '';

    if (error.keyValue && typeof error.keyValue === 'object') {
      field = Object.keys(error.keyValue)[0] || '';
    } else if (error.keyPattern && typeof error.keyPattern === 'object') {
      field = Object.keys(error.keyPattern)[0] || '';
    } else if (error.message) {
      // Extraer nombre del índice de la cadena del error si keyValue no viene poblado
      const match = error.message.match(/index:\s+([a-zA-Z0-9_]+)/);
      if (match && match[1]) {
        field = match[1].replace(/_1$/, '');
      }
    }

    if (field === 'username' || (error.message && error.message.includes('username_1'))) {
      return { status: 400, message: 'El nombre de usuario ya está en uso. Por favor elija otro.' };
    }
    if (field === 'email' || (error.message && error.message.includes('email_1'))) {
      return { status: 400, message: 'El correo electrónico ya está registrado. Por favor utilice otro.' };
    }
    if (field === 'title' || (error.message && error.message.includes('title_1'))) {
      return { status: 400, message: 'Ya existe un videojuego registrado con ese título. Por favor elija otro.' };
    }
    if (field === 'name' || (error.message && error.message.includes('name_1'))) {
      return { status: 400, message: 'Ya existe un elemento registrado con ese nombre.' };
    }
    if (field.includes('user') && field.includes('game')) {
      return { status: 400, message: 'El videojuego ya se encuentra registrado en tu biblioteca.' };
    }
    return { status: 400, message: 'Ya existe un registro con esos datos en el sistema.' };
  }

  // 2. Error de validación de esquema en Mongoose (ValidationError)
  if (error.name === 'ValidationError') {
    const errorList = Object.values(error.errors || {}).map(err => {
      // Traducir mensajes estándar de Mongoose si no están en español
      if (err.kind === 'required') {
        return `El campo '${err.path}' es obligatorio`;
      }
      if (err.kind === 'minlength') {
        return `El campo '${err.path}' no cumple con la longitud mínima requerida`;
      }
      if (err.kind === 'enum') {
        return `El valor del campo '${err.path}' no es válido`;
      }
      return err.message;
    });

    return { 
      status: 400, 
      message: errorList.join('. ') || 'Los datos proporcionados no cumplen con las reglas de validación.' 
    };
  }

  // 3. Error de tipo CastError (por ejemplo, ObjectId con formato incorrecto)
  if (error.name === 'CastError') {
    return { status: 400, message: 'El identificador proporcionado no es válido o el recurso no existe.' };
  }

  // 4. Errores de JWT (Token inválido o expirado)
  if (error.name === 'JsonWebTokenError') {
    return { status: 401, message: 'Token de autenticación inválido. Por favor inicie sesión nuevamente.' };
  }
  if (error.name === 'TokenExpiredError') {
    return { status: 401, message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.' };
  }

  // 5. Error de parseo de JSON en body o tamaño excesivo de payload
  if (error.type === 'entity.parse.failed' || (error instanceof SyntaxError && 'body' in error)) {
    return { status: 400, message: 'El formato de los datos enviados no es un JSON válido.' };
  }
  if (error.type === 'entity.too.large' || error.status === 413) {
    return { status: 413, message: 'El tamaño de los datos enviados excede el límite permitido.' };
  }

  // 6. Mensaje de error personalizado previo
  if (error.isCustom) {
    return { status: error.status || 400, message: error.message };
  }

  console.error('Error interno capturado en backend:', error);
  return { status: 500, message: fallbackMessage };
};

export const handleControllerError = (res, error, fallbackMessage) => {
  const { status, message } = formatErrorMessage(error, fallbackMessage);
  return res.status(status).json({ message });
};
