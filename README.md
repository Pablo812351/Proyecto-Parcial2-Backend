# 🎮 Gaming Search - Propuesta de Proyecto SPA & REST API

## 📝 Descripción General
**Gaming Hub** es una plataforma web orientada al catálogo y exploración de videojuegos. La propuesta consiste en una Single Page Application (SPA) interactiva que permite a los usuarios buscar, filtrar y explorar información de videojuegos por título, género o empresa desarrolladora. Cada juego contará con una ficha explicativa (fecha de lanzamiento, desarrolladora, género y enlace a la tienda de Steam para ver/comprar).

Este proyecto se concibe como una solución Full-Stack donde **el backend y el frontend se desarrollarán y entregarán en repositorios independientes**. El backend expone una API REST para el modelado, autenticación y persistencia de datos, consumida exclusivamente por el frontend (SPA).

---

## 🎯 Alcance del Proyecto

### 🏢 Usuarios y Permisos
El sistema contará con navegación pública y gestión de usuarios autenticados mediante tokens JWT, divididos en los siguientes roles:

* **Visitante (Usuario no autenticado):**
  * Explorar el catálogo general de videojuegos.
  * Utilizar filtros dinámicos (género, desarrollador, nombre).
  * Ver el detalle individual de cada videojuego (descripción, desarrolladora, género y enlace a Steam).
  * *Nota: El sistema le indicará que debe iniciar sesión si intenta clasificar un juego o agregarlo a favoritos.*
* **Usuario Final (Autenticado):**
  * Todas las funcionalidades de consulta del visitante.
  * **Gestión de Biblioteca Personal:** Agregar videojuegos a su perfil y clasificarlos según su estado de juego actual ("Pendiente", "Jugando", "Completado" o "Abandonado").
  * Marcar videojuegos como favoritos.
* **Usuario Administrador (Autenticado):**
  * Acceso completo al módulo CRUD de videojuegos (Crear, Editar, Eliminar y Leer).
  * Administración de categorías / géneros.
  * Gestión de plataformas o empresas vinculadas.

---

## 🛠️ Tecnologías Propuestas

* **Frontend:** React / Vite (Single Page Application) + CSS Framework (Tailwind CSS / Bootstrap).
* **Backend:** Node.js + Express.js.
* **Base de Datos:** MongoDB (Modelo orientado a documentos) + Mongoose ODM.
* **Autenticación:** JSON Web Tokens (JWT) + Bcrypt.
* **Despliegue (Hosting):** Render / Vercel / Railway.

---

## 🗄️ Modelo de Datos (Backend)

La base de datos estará compuesta por **5 colecciones interrelacionadas**:

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
3. **`libraries` / `user_games` (Biblioteca Personal):**
   * `_id`: ObjectId
   * `user`: ObjectId (Ref: `users`)
   * `game`: ObjectId (Ref: `games`)
   * `status`: String (Enum: 'Pendiente', 'Jugando', 'Completado', 'Abandonado')
   * `isFavorite`: Boolean
4. **`genres` (Géneros):**
   * `_id`: ObjectId
   * `name`: String (Acción, RPG, Estrategia, etc.)
   * `description`: String
5. **`companies` (Empresas / Desarrolladoras):**
   * `_id`: ObjectId
   * `name`: String

---

## 📂 Estructura de Repositorios

Cumpliendo con los requerimientos, el código fuente estará dividido en dos repositorios distintos:

### Repositorio 1: Backend (API REST)
```text
/
├── data/             # Archivos de datos iniciales o scripts para regenerar la base de datos local
├── src/              # Código fuente principal de la aplicación
│   ├── config/       # Configuración de conexión a BD y variables de entorno
│   ├── controllers/  # Lógica de controladores (Auth, Games, Genres, Libraries, etc.)
│   ├── middlewares/  # Validaciones, verificación de JWT y control de roles
│   ├── models/       # Esquemas de Mongoose (User, Game, Library, Genre, Company)
│   ├── routes/       # Definición de rutas y endpoints de la API
│   └── app.js        # Punto de entrada principal y servidor de Express
├── .env.example      # Plantilla de variables de entorno
├── .gitignore        
└── package.json
