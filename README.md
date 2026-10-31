# 🎮 Gaming Hub - Backend API REST

API REST profesional desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)** para la plataforma de catálogo y gestión de videojuegos **Gaming Hub**. Este repositorio conforma el componente de servidor (backend), desacoplado e independiente de la aplicación cliente (frontend).

---

## 📋 Tabla de Contenidos
1. [Requisitos Previos y Software](#-requisitos-previos-y-software)
2. [Instalación y Configuración](#-instalación-y-configuración)
3. [Variables de Entorno](#-variables-de-entorno)
4. [Modos de Ejecución](#-modos-de-ejecución)
5. [Regeneración de la Base de Datos Local (Seeding)](#-regeneración-de-la-base-de-datos-local-seeding)
6. [Estructura del Proyecto y Responsabilidades](#-estructura-del-proyecto-y-responsabilidades)
7. [Modelo de Datos (Colecciones MongoDB)](#-modelo-de-datos-colecciones-mongodb)
8. [Roles y Permisos](#-roles-y-permisos)
9. [Autenticación y Manejo de Sesión (JWT)](#-autenticación-y-manejo-de-sesión-jwt)
10. [Documentación Exhaustiva de Endpoints](#-documentación-exhaustiva-de-endpoints)
11. [Despliegue (Hosting)](#-despliegue-hosting)

---

## 💻 Requisitos Previos y Software
Para ejecutar este proyecto en un entorno local es necesario contar con el siguiente software instalado:
- **Node.js**: Versión 18.x o superior ([Descargar Node.js](https://nodejs.org/)).
- **npm**: Gestor de paquetes incluido con Node.js (v9+ recomendado).
- **MongoDB**: Instancia local de MongoDB Community Server (puerto 27017 por defecto) o un clúster en la nube en **MongoDB Atlas**.
- **Git**: Para el control de versiones.

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Pablo812351/Proyecto-Parcial2-Backend.git
   cd Proyecto-Parcial2-Backend
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Cree un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```

---

## 🔐 Variables de Entorno

El archivo `.env` requiere las siguientes variables de configuración:

| Variable | Tipo | Descripción | Ejemplo Local |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | Puerto en el que se inicializará el servidor Express | `5000` |
| `MONGO_URI` | String | URI de conexión a MongoDB (Local o Atlas) | `mongodb://localhost:27017/gaming_hub` o `mongodb+srv://<user>:<pwd>@cluster...` |
| `JWT_SECRET` | String | Clave secreta criptográfica para firmar y verificar tokens JWT | `parcial3_super_secret_jwt_key_2026` |

---

## ⚡ Modos de Ejecución

El proyecto cuenta con los siguientes scripts definidos en `package.json`:

* **Modo Desarrollo (con recarga automática mediante Nodemon):**
  ```bash
  npm run dev
  ```
  Inicia el servidor en `http://localhost:5000` y reinicia el proceso automáticamente ante cambios en el código fuente.

* **Modo Producción:**
  ```bash
  npm start
  ```
  Ejecuta el servidor con el runtime estándar de Node.js (`node src/app.js`).

---

## 🌱 Regeneración de la Base de Datos Local (Seeding)

Para cumplir con el requerimiento de regeneración de datos de forma local y permitir la corrección inmediata, se incluye un script automatizado que vacía las colecciones y precarga usuarios de prueba (con contraseñas hasheadas mediante Bcrypt), géneros, desarrolladoras y videojuegos:

```bash
npm run seed
```

### 👤 Usuarios Precargados para Pruebas:
| Rol | Email | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** (`ADMIN_ROLE`) | `admin@admin.com` | `admin123` | CRUD completo de juegos, creación de géneros y empresas, gestión de usuarios/roles y biblioteca. |
| **Usuario Final** (`USER_ROLE`) | `user@user.com` | `user123` | Consulta de catálogo, gestión de su biblioteca personal y favoritos. |

---

## 📁 Estructura del Proyecto y Responsabilidades

```text
Proyecto-Parcial2-Backend/
├── data/
│   └── seeder.js            # Script para purgar y regenerar la base de datos con datos semilla
├── src/
│   ├── config/
│   │   └── db.js            # Lógica de conexión a MongoDB mediante Mongoose con manejo de errores
│   ├── controllers/
│   │   ├── authController.js     # Registro, inicio de sesión y favoritos del usuario
│   │   ├── gameController.js     # Operaciones CRUD completas y validaciones para la entidad Game
│   │   ├── userController.js     # Gestión de usuarios (listado, cambio de rol con blindaje y eliminación)
│   │   ├── genreController.js    # Listado y creación de géneros con validación
│   │   ├── companyController.js  # Listado y creación de empresas/desarrolladoras con validación
│   │   └── libraryController.js  # Gestión de estados de biblioteca personal (Pendiente, Jugando, etc.)
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Verificación de token JWT (protect) y validación de rol de administrador (admin)
│   │   └── errorMiddleware.js    # Manejo global de rutas 404 y captura centralizada de excepciones
│   ├── models/
│   │   ├── User.js          # Esquema y modelo de Usuarios (pre-save hook con bcrypt y método matchPassword)
│   │   ├── Game.js          # Esquema y modelo de Videojuegos (entidad CRUD principal)
│   │   ├── Genre.js         # Esquema y modelo de Géneros
│   │   ├── Company.js       # Esquema y modelo de Empresas Desarrolladoras
│   │   └── UserGame.js      # Esquema y modelo de la relación Usuario-Videojuego (Biblioteca personal)
│   ├── routes/
│   │   ├── authRoutes.js    # Rutas de registro, login y favoritos
│   │   ├── gameRoutes.js    # Rutas de catálogo de videojuegos (CRUD)
│   │   ├── userRoutes.js    # Rutas de gestión y administración de usuarios
│   │   ├── genreRoutes.js   # Rutas de géneros
│   │   ├── companyRoutes.js # Rutas de empresas desarrolladoras
│   │   └── libraryRoutes.js # Rutas de biblioteca personal
│   ├── utils/
│   │   └── errorHandler.js  # Formateo y captura amigable de errores de MongoDB (E11000, validaciones, CastError)
│   └── app.js               # Archivo principal: configuración de Express, CORS, parseo JSON y montaje de rutas
├── .env.example             # Plantilla de variables de entorno requeridas
├── .gitignore               # Archivos y directorios excluidos de Git (node_modules, .env, etc.)
├── package.json             # Manifiesto del proyecto, dependencias y scripts de ejecución
└── README.md                # Documentación técnica completa del backend
```

---

## 🗄️ Modelo de Datos (Colecciones MongoDB)

El sistema implementa **5 colecciones orientadas a documentos** interconectadas mediante referencias de Mongoose (`ObjectId`):

### 1. Colección `users` (Usuarios)
Representa a los usuarios registrados en el sistema, sus credenciales y su rol de acceso.
- **`_id`**: `ObjectId` - Identificador único generado por MongoDB.
- **`username`**: `String` - Nombre de usuario. **Reglas**: Requerido (`required: true`), único (`unique: true`), entre 3 y 30 caracteres, sin espacios redundantes (`trim: true`).
- **`email`**: `String` - Correo electrónico del usuario. **Reglas**: Requerido, único, en minúsculas (`lowercase: true`), máximo 254 caracteres, validado mediante expresión regular segura en tiempo lineal (`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/`).
- **`password`**: `String` - Contraseña del usuario. **Reglas**: Requerida (entre 6 y 72 caracteres). Se almacena hasheada con algoritmo **Bcrypt** (cost factor 10) mediante un hook asíncrono `pre('save')`.
- **`role`**: `String` - Nivel de acceso y privilegios. **Reglas**: Tipo Enum: `['USER_ROLE', 'ADMIN_ROLE']`. Valor por defecto: `'USER_ROLE'`.
- **`favorites`**: `[ObjectId]` - Lista de referencias a documentos de la colección `games`.
- **`createdAt` / `updatedAt`**: `Date` - Marcas de tiempo automáticas (`timestamps: true`).

### 2. Colección `games` (Videojuegos - Entidad CRUD Principal)
Representa el catálogo de videojuegos disponible en la plataforma.
- **`_id`**: `ObjectId` - Identificador único generado por MongoDB.
- **`title`**: `String` - Título del videojuego. **Reglas**: Requerido (`required: true`), único (`unique: true`), no vacío, máximo 150 caracteres.
- **`description`**: `String` - Sinopsis o reseña explicativa del juego (máximo 3000 caracteres).
- **`releaseDate`**: `Date` - Fecha de lanzamiento original. **Reglas**: Debe ser una fecha válida comprendida entre 1950 y el año actual + 10.
- **`developer`**: `ObjectId` - Referencia (`ref: 'Company'`) al documento de la desarrolladora en la colección `companies`.
- **`genre`**: `ObjectId` - Referencia (`ref: 'Genre'`) al documento del género en la colección `genres`.
- **`steamUrl`**: `String` - Enlace externo opcional a la tienda de Steam (si se incluye, debe iniciar con `http://` o `https://`).
- **`imageUrl`**: `String` - URL pública obligatoria de la imagen de portada/banner del juego (debe iniciar con `http://` o `https://`).
- **`createdAt` / `updatedAt`**: `Date` - Marcas de tiempo automáticas.

### 3. Colección `usergames` (Biblioteca Personal de Videojuegos)
Gestiona la relación muchos a muchos entre usuarios y videojuegos, permitiendo registrar estados de progreso y favoritos.
- **`_id`**: `ObjectId` - Identificador único del registro.
- **`user`**: `ObjectId` - Referencia requerida (`ref: 'User'`) al usuario propietario.
- **`game`**: `ObjectId` - Referencia requerida (`ref: 'Game'`) al videojuego asociado.
- **`status`**: `String` - Estado de progreso del juego para ese usuario. **Reglas**: Enum con valores válidos `['Pendiente', 'Jugando', 'Completado', 'Abandonado', null]`. Valor por defecto: `null`.
- **`isFavorite`**: `Boolean` - Indicador booleano si el usuario lo marcó como favorito. Valor por defecto: `false`.
- **Índice Compuesto Único**: `{ user: 1, game: 1 }` con regla `unique: true` para impedir duplicados de un mismo juego para el mismo usuario.
- **`createdAt` / `updatedAt`**: `Date` - Marcas de tiempo automáticas.

### 4. Colección `genres` (Géneros / Categorías)
Catálogo de géneros aplicables a los videojuegos.
- **`_id`**: `ObjectId` - Identificador único.
- **`name`**: `String` - Nombre de la categoría (ej. "Acción", "RPG", "Estrategia"). **Reglas**: Requerido, único (`unique: true`).
- **`description`**: `String` - Descripción opcional del género.
- **`createdAt` / `updatedAt`**: `Date` - Marcas de tiempo automáticas.

### 5. Colección `companies` (Empresas / Desarrolladoras)
Catálogo de desarrolladoras y estudios de videojuegos.
- **`_id`**: `ObjectId` - Identificador único.
- **`name`**: `String` - Nombre de la empresa desarrolladora (ej. "Valve", "Bethesda", "CD Projekt Red"). **Reglas**: Requerido, único (`unique: true`).
- **`createdAt` / `updatedAt`**: `Date` - Marcas de tiempo automáticas.

---

## 👥 Roles y Permisos

La API implementa un modelo de Control de Acceso Basado en Roles (RBAC):

| Capacidad / Caso de Uso | Visitante (No autenticado) | Usuario Final (`USER_ROLE`) | Administrador (`ADMIN_ROLE`) |
| :--- | :---: | :---: | :---: |
| Explorar catálogo de juegos (Filtros, Búsqueda) | ✅ | ✅ | ✅ |
| Consultar detalle individual de un juego | ✅ | ✅ | ✅ |
| Listar géneros y empresas desarrolladoras | ✅ | ✅ | ✅ |
| Iniciar sesión y registrarse en la plataforma | ✅ | ✅ | ✅ |
| Agregar/Editar juegos en Biblioteca Personal | ❌ | ✅ | ✅ |
| Marcar/Desmarcar juegos como Favoritos | ❌ | ✅ | ✅ |
| Crear nuevos Videojuegos (`POST /api/games`) | ❌ | ❌ | ✅ |
| Modificar Videojuegos existentes (`PUT /api/games/:id`) | ❌ | ❌ | ✅ |
| Eliminar Videojuegos (`DELETE /api/games/:id`) | ❌ | ❌ | ✅ |
| Crear Géneros o Empresas en el sistema | ❌ | ❌ | ✅ |
| Ver listado de usuarios (`GET /api/users`) | ❌ | ❌ | ✅ |
| Cambiar rol de usuario (`PUT /api/users/:id/role`) | ❌ | ❌ | ✅ |
| Eliminar cuenta de usuario (`DELETE /api/users/:id`) | ❌ | ❌ | ✅ |

---

## 🔑 Autenticación y Manejo de Sesión (JWT)

1. **Generación de Token**: Al autenticarse exitosamente mediante `POST /api/auth/login` o registrarse con `POST /api/auth/register`, el servidor firma un token JWT utilizando el secreto `JWT_SECRET` y una validez de 30 días. El payload almacena únicamente el `id` del usuario para consultar su estado y rol actualizados en base de datos en cada petición protegida (garantizando que una revocación de permisos o eliminación de cuenta tenga efecto inmediato).
2. **Envío del Token**: Las solicitudes a endpoints protegidos deben adjuntar el token en la cabecera HTTP:
   ```http
   Authorization: Bearer <TOKEN_JWT_AQUI>
   ```
3. **Middlewares de Protección**:
   - `protect`: Extrae y verifica el token. Si es inválido, expirado o ausente, deniega el acceso con status `401 Unauthorized`. Si es válido, carga el usuario en `req.user`.
   - `admin`: Verifica que `req.user.role === 'ADMIN_ROLE'`. Si no lo es, deniega la acción con status `403 Forbidden`.

---

## 📡 Documentación Exhaustiva de Endpoints

### 🔐 1. Módulo de Autenticación (`/api/auth`)

#### `POST /api/auth/register`
- **Descripción**: Registra un nuevo usuario con rol predeterminado `USER_ROLE`.
- **Acceso**: Público.
- **Request Body**:
  ```json
  {
    "username": "jugador1",
    "email": "jugador1@correo.com",
    "password": "mypassword123"
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "_id": "671ad2b3c4e5f67890123456",
    "username": "jugador1",
    "email": "jugador1@correo.com",
    "role": "USER_ROLE",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: Campos obligatorios vacíos o contraseña de menos de 6 caracteres.
    ```json
    { "message": "Todos los campos son obligatorios" }
    ```
  - `400 Bad Request`: Usuario o correo ya registrado.
    ```json
    { "message": "El usuario ya existe" }
    ```
  - `500 Internal Server Error`: Falla de base de datos o interna del servidor.

---

#### `POST /api/auth/login`
- **Descripción**: Autentica credenciales y devuelve el token JWT con los datos del usuario.
- **Acceso**: Público.
- **Request Body**:
  ```json
  {
    "email": "jugador1@correo.com",
    "password": "mypassword123"
  }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "_id": "671ad2b3c4e5f67890123456",
    "username": "jugador1",
    "email": "jugador1@correo.com",
    "role": "USER_ROLE",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: Email o contraseña no provistos.
    ```json
    { "message": "Por favor ingrese email y contraseña" }
    ```
  - `401 Unauthorized`: Credenciales no coinciden.
    ```json
    { "message": "Credenciales inválidas" }
    ```

---

#### `GET /api/auth/favorites`
- **Descripción**: Obtiene la lista de juegos favoritos del usuario autenticado.
- **Acceso**: Privado (Requiere Bearer Token).
- **Headers**: `Authorization: Bearer <token>`
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "_id": "671ad345c4e5f67890123457",
      "title": "The Witcher 3: Wild Hunt",
      "imageUrl": "https://...",
      "developer": { "name": "CD Projekt Red" },
      "genre": { "name": "RPG" }
    }
  ]
  ```
- **Errores Posibles**:
  - `401 Unauthorized`: Token no provisto o inválido.

---

#### `POST /api/auth/favorites/:gameId`
- **Descripción**: Alterna el estado de favorito de un videojuego para el usuario autenticado, sincronizando tanto el arreglo `favorites` del modelo `User` como la colección `UserGame`.
- **Acceso**: Privado (Requiere Bearer Token).
- **Parámetros de Ruta**: `:gameId` (ObjectId hexadecimal de 24 caracteres del videojuego).
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "favorites": ["671ad345c4e5f67890123457"]
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: Identificador de videojuego inválido.
  - `401 Unauthorized`: Token no provisto o inválido.
  - `404 Not Found`: Videojuego o usuario no encontrado.

---

### 🎮 2. Módulo de Videojuegos (`/api/games`)

#### `GET /api/games`
- **Descripción**: Retorna el catálogo completo de juegos con soporte de filtros opcionales.
- **Acceso**: Público.
- **Query Parameters**:
  - `search` *(opcional)*: Filtra por coincidencia parcial insensible a mayúsculas en el título, nombre del género o nombre de la desarrolladora.
  - `genre` *(opcional)*: Filtra por el `_id` de la categoría.
  - `developer` *(opcional)*: Filtra por el `_id` de la empresa desarrolladora.
- **Ejemplo**: `GET /api/games?search=witcher`
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "_id": "671ad345c4e5f67890123457",
      "title": "The Witcher 3: Wild Hunt",
      "description": "Juego de rol de mundo abierto...",
      "releaseDate": "2015-05-18T00:00:00.000Z",
      "developer": {
        "_id": "671ad310c4e5f67890123450",
        "name": "CD Projekt Red"
      },
      "genre": {
        "_id": "671ad300c4e5f67890123440",
        "name": "RPG"
      },
      "steamUrl": "https://store.steampowered.com/app/292030",
      "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e"
    }
  ]
  ```

---

#### `GET /api/games/:id`
- **Descripción**: Obtiene los datos detallados de un videojuego específico.
- **Acceso**: Público.
- **Parámetros**: `:id` (ObjectId del juego en MongoDB).
- **Respuesta Exitosa (200 OK)**: Objeto completo del juego con populate de `developer` y `genre`.
- **Errores Posibles**:
  - `404 Not Found`: Juego no encontrado con ese identificador.
    ```json
    { "message": "Juego no encontrado" }
    ```

---

#### `POST /api/games`
- **Descripción**: Crea un nuevo videojuego en el catálogo. Si el género o desarrolladora no existen, se crean automáticamente.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Headers**: `Authorization: Bearer <token_admin>`
- **Request Body**:
  ```json
  {
    "title": "Cyberpunk 2077",
    "description": "RPG de acción en Night City",
    "releaseDate": "2020-12-10",
    "developerName": "CD Projekt Red",
    "genreName": "RPG",
    "steamUrl": "https://store.steampowered.com/app/1091500",
    "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e"
  }
  ```
- **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "_id": "671ad400c4e5f67890123499",
    "title": "Cyberpunk 2077",
    "description": "RPG de acción en Night City",
    "releaseDate": "2020-12-10T00:00:00.000Z",
    "developer": "671ad310c4e5f67890123450",
    "genre": "671ad300c4e5f67890123440",
    "steamUrl": "https://store.steampowered.com/app/1091500",
    "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e"
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: Faltan campos requeridos o fecha inválida.
    ```json
    { "message": "El título, descripción, desarrolladora, género e imagen son requeridos" }
    ```
  - `401 Unauthorized`: Token ausente o inválido.
  - `403 Forbidden`: Usuario autenticado pero sin rol de administrador.
    ```json
    { "message": "No autorizado como administrador" }
    ```

---

#### `PUT /api/games/:id`
- **Descripción**: Modifica la información de un videojuego existente.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Headers**: `Authorization: Bearer <token_admin>`
- **Request Body**: Mismos campos que `POST /api/games`.
- **Respuesta Exitosa (200 OK)**: Objeto del juego actualizado.
- **Errores Posibles**:
  - `400 Bad Request`: Título vacío o datos inválidos.
  - `404 Not Found`: No existe juego con dicho ID.
  - `401 / 403`: Falta de autenticación o permisos de administrador.

---

#### `DELETE /api/games/:id`
- **Descripción**: Elimina un videojuego del catálogo general.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Headers**: `Authorization: Bearer <token_admin>`
- **Respuesta Exitosa (200 OK)**:
  ```json
  { "message": "Juego eliminado correctamente" }
  ```
- **Errores Posibles**:
  - `404 Not Found`:
    ```json
    { "message": "Juego no encontrado" }
    ```
  - `401 / 403`: No autorizado o sin rol de administrador.

---

### 📚 3. Módulo de Biblioteca Personal (`/api/library`)

#### `GET /api/library`
- **Descripción**: Retorna todos los juegos registrados en la biblioteca del usuario autenticado (con su estado y favoritos).
- **Acceso**: Privado (Cualquier usuario autenticado).
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status` *(opcional)*: Filtra por estado (`Pendiente`, `Jugando`, `Completado`, `Abandonado`).
  - `favorite` *(opcional)*: Si es `'true'`, retorna únicamente los juegos marcados como favoritos.
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "_id": "671ad550c4e5f67890123500",
      "user": "671ad2b3c4e5f67890123456",
      "game": {
        "_id": "671ad345c4e5f67890123457",
        "title": "The Witcher 3: Wild Hunt",
        "imageUrl": "https://..."
      },
      "status": "Jugando",
      "isFavorite": true
    }
  ]
  ```

---

#### `GET /api/library/check/:gameId`
- **Descripción**: Verifica si un videojuego específico se encuentra en la biblioteca del usuario autenticado y devuelve su documento asociado.
- **Acceso**: Privado.
- **Headers**: `Authorization: Bearer <token>`
- **Parámetros de Ruta**: `:gameId` (ObjectId del videojuego).
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "inLibrary": true,
    "item": {
      "_id": "671ad550c4e5f67890123500",
      "status": "Completado",
      "isFavorite": false
    }
  }
  ```

---

#### `POST /api/library`
- **Descripción**: Agrega un juego a la biblioteca o actualiza su estado/favorito. Si el registro resultante queda sin estado (`null`) y sin ser favorito (`false`), se limpia automáticamente de la biblioteca.
- **Acceso**: Privado.
- **Request Body**:
  ```json
  {
    "gameId": "671ad345c4e5f67890123457",
    "status": "Jugando",
    "isFavorite": true
  }
  ```
- **Respuesta Exitosa (200 OK)**: Objeto `UserGame` creado/actualizado con `game` poblado.
- **Errores Posibles**:
  - `400 Bad Request`: `gameId` inválido o `status` fuera de los valores permitidos.
  - `404 Not Found`: Videojuego no encontrado.

---

#### `PUT /api/library/:gameId`
- **Descripción**: Actualiza el estado de progreso o condición de favorito de un videojuego dentro de la biblioteca del usuario autenticado. Si queda sin estado y sin ser favorito, se limpia el registro huérfano.
- **Acceso**: Privado.
- **Parámetros de Ruta**: `:gameId` (ObjectId del videojuego).
- **Request Body**:
  ```json
  {
    "status": "Completado",
    "isFavorite": true
  }
  ```
- **Respuesta Exitosa (200 OK)**: Objeto `UserGame` actualizado con `game` poblado.
- **Errores Posibles**:
  - `400 Bad Request`: Identificador inválido o estado no permitido.
  - `404 Not Found`: Videojuego no encontrado.

---

#### `POST /api/library/toggle-favorite/:gameId`
- **Descripción**: Alterna directamente el estado de favorito de un videojuego en la biblioteca del usuario sin forzar la selección de un estado de juego.
- **Acceso**: Privado.
- **Parámetros de Ruta**: `:gameId` (ObjectId del videojuego).
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "isFavorite": true,
    "item": {
      "_id": "671ad550c4e5f67890123500",
      "status": null,
      "isFavorite": true
    }
  }
  ```

---

#### `DELETE /api/library/:gameId`
- **Descripción**: Remueve completamente un videojuego de la biblioteca del usuario autenticado.
- **Acceso**: Privado.
- **Respuesta Exitosa (200 OK)**:
  ```json
  { "message": "Juego removido de la biblioteca" }
  ```

---

### 🏷️ 4. Módulo de Géneros (`/api/genres`)

#### `GET /api/genres`
- **Descripción**: Retorna la lista de géneros disponibles.
- **Acceso**: Público.
- **Respuesta Exitosa (200 OK)**: Array de géneros (`[{ "_id": "...", "name": "Acción", "description": "..." }]`).

#### `POST /api/genres`
- **Descripción**: Crea un nuevo género.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Request Body**:
  ```json
  {
    "name": "Simulación",
    "description": "Videojuegos que recrean situaciones reales"
  }
  ```
- **Respuesta Exitosa (201 Created)**: Objeto creado.
- **Errores Posibles**:
  - `400 Bad Request`: Campo `name` vacío o duplicado.
  - `401 / 403`: Falta de credenciales o permisos de administrador.

---

### 🏢 5. Módulo de Empresas Desarrolladoras (`/api/companies`)

#### `GET /api/companies`
- **Descripción**: Retorna el listado de empresas desarrolladoras.
- **Acceso**: Público.
- **Respuesta Exitosa (200 OK)**: Array de empresas (`[{ "_id": "...", "name": "Valve" }]`).

#### `POST /api/companies`
- **Descripción**: Registra una nueva empresa desarrolladora.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Request Body**:
  ```json
  { "name": "FromSoftware" }
  ```
- **Respuesta Exitosa (201 Created)**: Objeto creado.
- **Errores Posibles**:
  - `400 Bad Request`: Campo `name` vacío o duplicado.
  - `401 / 403`: Falta de credenciales o permisos de administrador.

---

### 👥 6. Módulo de Gestión de Usuarios (`/api/users`)

#### `GET /api/users`
- **Descripción**: Retorna el listado completo de usuarios registrados en el sistema ordenados por rol y fecha de creación, omitiendo el hash de contraseña (`-password`) por seguridad.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Respuesta Exitosa (200 OK)**:
  ```json
  [
    {
      "_id": "671ad2b3c4e5f67890123450",
      "username": "admin",
      "email": "admin@admin.com",
      "role": "ADMIN_ROLE",
      "favorites": [],
      "createdAt": "2026-10-24T18:00:00.000Z"
    },
    {
      "_id": "671ad2b3c4e5f67890123451",
      "username": "usuario",
      "email": "user@user.com",
      "role": "USER_ROLE",
      "favorites": [],
      "createdAt": "2026-10-24T18:05:00.000Z"
    }
  ]
  ```
- **Errores Posibles**:
  - `401 Unauthorized`: Falta de token o token inválido/expirado.
  - `403 Forbidden`: El usuario autenticado no posee rol de Administrador.

---

#### `PUT /api/users/:id/role`
- **Descripción**: Actualiza el rol de un usuario existente (permite ascender a `ADMIN_ROLE` o degradar a `USER_ROLE`). Incluye una **regla de seguridad de blindaje**: si solo queda un único administrador en todo el sistema, se rechaza la revocación del rol para evitar el bloqueo total de la plataforma.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Parámetros de Ruta**:
  - `id`: Identificador MongoDB ObjectId del usuario a modificar.
- **Request Body**:
  ```json
  { "role": "ADMIN_ROLE" }
  ```
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "_id": "671ad2b3c4e5f67890123451",
    "username": "usuario",
    "email": "user@user.com",
    "role": "ADMIN_ROLE",
    "message": "Rol de \"usuario\" actualizado a Administrador"
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: ID de usuario no válido, rol diferente a `USER_ROLE` o `ADMIN_ROLE`, o intento de quitar el rol al **único administrador del sistema**:
    ```json
    { "message": "No es posible quitar el rol de administrador porque es el único administrador del sistema." }
    ```
  - `404 Not Found`: Usuario no encontrado.
  - `401 / 403`: Falta de credenciales o permisos de administrador.

---

#### `DELETE /api/users/:id`
- **Descripción**: Elimina la cuenta de un usuario del sistema y purga en cascada todas sus relaciones asociadas en la colección `UserGame` (biblioteca personal). Incluye **blindaje de seguridad**: impide eliminar la cuenta del único administrador del sistema.
- **Acceso**: Restringido a Administradores (`protect`, `admin`).
- **Parámetros de Ruta**:
  - `id`: Identificador MongoDB ObjectId del usuario a eliminar.
- **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Cuenta del usuario \"jugador1\" eliminada correctamente."
  }
  ```
- **Errores Posibles**:
  - `400 Bad Request`: ID no válido o intento de eliminar al **único administrador del sistema**:
    ```json
    { "message": "No es posible eliminar al único administrador del sistema." }
    ```
  - `404 Not Found`: Usuario no encontrado.
  - `401 / 403`: Falta de credenciales o permisos de administrador.

---

---

## 🌐 Despliegue (Hosting)

- **Base de Datos**: MongoDB Atlas (Clúster Cloud).
- **Backend**: Configurado para despliegue continuo en plataformas PaaS como **Render**, **Railway** o **Vercel** mediante variables de entorno y comando de arranque `npm start`.
- **CORS**: Habilitado mediante el paquete `cors` para permitir peticiones HTTP seguras desde cualquier origen donde esté alojado el frontend (Netlify, Vercel, localhost).
