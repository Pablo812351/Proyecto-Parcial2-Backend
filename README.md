# 🎮 Gaming Search - Propuesta de Proyecto SPA & REST API

## 📝 Descripción General

**Gaming Hub** es una plataforma web orientada al catálogo y exploración de videojuegos. La propuesta consiste en una Single Page Application (SPA) interactiva que permite a los usuarios buscar, filtrar y explorar información de videojuegos por título, género o empresa desarrolladora. Cada juego contará con una ficha explicativa (fecha de lanzamiento, desarrolladora, género y enlace directo a la página de Steam para ver o comprar).

Este proyecto se concibe como una solución Full-Stack donde el backend expone una API REST para el modelado, autenticación y persistencia de datos, la cual es consumida por el frontend de la aplicación.

## 🎯 Alcance del Proyecto

### 🏢 Usuarios y Permisos

El sistema gestionará dos tipos de usuarios autenticados mediante tokens JWT:

* **Usuario Final (Cliente/Visitante):**

  * Explorar el catálogo de videojuegos con filtros dinámicos (género, desarrollador, nombre).

  * Ver el detalle individual de cada videojuego (reseñas, descripción, desarrolladora, género y enlace directo a Steam).

  * Gestionar su propia lista de favoritos o guardados.

* **Usuario Administrador:**

  * Acceso completo al módulo CRUD de videojuegos (Crear, Editar, Eliminar y Leer).

  * Administración de categorías / géneros.

  * Gestión de plataformas o empresas vinculadas.

## 🛠️ Tecnologías Propuestas

* **Frontend:** React / Vite (Single Page Application) + CSS Framework (Tailwind CSS / Bootstrap).

* **Backend:** Node.js + Express.js.

* **Base de Datos:** MongoDB (Modelo orientado a documentos) + Mongoose ODM.

* **Autenticación:** JSON Web Tokens (JWT) + Bcrypt.

* **Despliegue (Hosting):** Render / Vercel / Railway.

## 🗄️ Modelo de Datos (Backend)

La base de datos estará compuesta por al menos **4 colecciones interrelacionadas**:

1. **`users` (Usuarios):**

   * `_id`: ObjectId

   * `username`: String (Único, requerido)

   * `email`: String (Único, requerido, formato email)

   * `password`: String (Encriptada)

   * `role`: String (`USER_ROLE`, `ADMIN_ROLE`)

2. **`games` (Videojuegos - Entidad CRUD Principal):**

   * `_id`: ObjectId

   * `title`: String (Requerido)

   * `description`: String

   * `releaseDate`: Date

   * `developer`: ObjectId (Ref: `companies`)

   * `genre`: ObjectId (Ref: `genres`)

   * `steamUrl`: String

   * `imageUrl`: String

3. **`genres` (Géneros):**

   * `_id`: ObjectId

   * `name`: String (Acción, RPG, Estrategia, etc.)

   * `description`: String

4. **`companies` (Empresas / Desarrolladoras):**

   * `_id`: ObjectId

   * `name`: String

## 📂 Estructura General del Proyecto

```
.
├── data/             # Datos sembrados / scripts de inicialización de la base de datos
├── src/              # Código fuente principal de la aplicación
│   ├── config/       # Configuración de conexión a la base de datos y entorno
│   ├── controllers/  # Lógica de controladores (Auth, Games, Genres, Companies)
│   ├── middlewares/  # Validaciones, verificación de JWT y control de roles
│   ├── models/       # Esquemas de Mongoose (User, Game, Genre, Company)
│   ├── routes/       # Definición de rutas y endpoints de la API
│   └── app.js        # Punto de entrada principal y servidor de Express
├── .env.example      # Plantilla de variables de entorno
├── .gitignore        # Archivos e carpetas ignoradas por Git
├── package.json      # Dependencias y scripts de ejecución del proyecto
└── README.md         # Documentación y propuesta del proyecto

```

## ⚙️ Pasos de Instalación y Ejecución Local

### Prerrequisitos

* Node.js (v18 o superior)

* MongoDB local o instancia en MongoDB Atlas

* Git

### Pasos de Configuración

1. Clonar el repositorio e ingresar a la carpeta del proyecto:

   ```
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DE_LA_CARPETA>
   
   ```

2. Instalar las dependencias:

   ```
   npm install
   
   ```

3. Crear el archivo de configuración `.env` en la raíz tomando como base `.env.example`:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gaming_hub
   JWT_SECRET=tu_clave_secreta_aqui
   
   ```

4. Iniciar el servidor en modo desarrollo:

   ```
   npm run dev
   
   ```