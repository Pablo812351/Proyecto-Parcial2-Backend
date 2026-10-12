# 🎮 Gaming Hub - Propuesta de Proyecto SPA & REST API

## 📝 Descripción General
**Gaming Hub** es una plataforma web orientada al catálogo y exploración de videojuegos. La propuesta consiste en una Single Page Application (SPA) interactiva que permite a los usuarios buscar, filtrar y explorar información de videojuegos por título, género o empresa desarrolladora. Cada juego contará con una ficha explicativa (fecha de lanzamiento, descripción, desarrolladora, etc).

---

## 🎯 Alcance del Proyecto

### 🏢 Usuarios y Permisos
El sistema gestionará dos tipos de usuarios autenticados:
* **Usuario Final (Cliente/Visitante):**
  * Explorar el catálogo de videojuegos con filtros dinámicos (género, desarrollador, nombre).
  * Ver el detalle individual de cada videojuego.
* **Usuario Administrador:**
  * Acceso completo al módulo CRUD de videojuegos (Crear, Editar, Eliminar y Leer).
  * Administración de categorías / géneros.
---

## 🛠️ Tecnologías Propuestas

* **Frontend:** React (Single Page Application) + CSS Framework.
* **Backend:** Node.js + Express.js.
* **Base de Datos:** MongoDB (Modelo orientado a documentos) + Mongoose ODM.
* **Autenticación:** JSON Web Tokens (JWT) + Bcrypt.
* **Despliegue (Hosting):** Render / Vercel / Railway.

---

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

---

## 📂 Estructura General del Proyecto

```text
/
├── data/             # Archivos de datos iniciales o scripts para regenerar la base de datos
├── src/              # Código fuente de la aplicación
│   ├── config/       # Configuración de conexión a la base de datos y variables de entorno
│   ├── controllers/  # Controladores de la API (Auth, Games, Genres, Companies)
│   ├── middlewares/  # Validaciones, autenticación JWT y manejo de roles
│   ├── models/       # Esquemas de Mongoose (User, Game, Genre, Company)
│   ├── routes/       # Definición de rutas y endpoints de la API
│   └── app.js        # Punto de entrada principal y configuración del servidor Express
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Exclusiones de Git
├── package.json      # Dependencias y scripts
└── README.md         # Documentación del proyecto
