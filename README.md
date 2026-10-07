# 🎮 Gaming Hub - Propuesta de Proyecto SPA & REST API

## 📝 Descripción General
**Gaming Hub** es una plataforma web orientada al catálogo y exploración de videojuegos. La propuesta consiste en una Single Page Application (SPA) interactiva que permite a los usuarios buscar, filtrar y explorar información detallada de videojuegos por título, género, empresa desarrolladora y otros criterios clave. Cada juego contará con una ficha explicativa (fecha de lanzamiento, desarrolladora/editora, descripción, enlace directo a la tienda oficial de Steam para compra o consulta, etc.).

Este proyecto se concibe como una solución Full-Stack dividida en dos componentes independientes: un **Backend (API REST)** encargado del modelado, autenticación y persistencia de datos, y un **Frontend (SPA)** responsivo orientado a la experiencia del usuario.

---

## 🎯 Alcance del Proyecto

### 🏢 Usuarios y Permisos
El sistema gestionará dos tipos de usuarios autenticados mediante tokens JWT:
*   **Usuario Final (Cliente/Visitante):**
    *   Explorar el catálogo de videojuegos con filtros dinámicos (género, desarrollador, nombre).
    *   Ver el detalle individual de cada videojuego (reseñas, datos técnicos, link a Steam).
    *   Gestionar su propia lista de favoritos o guardados.
*   **Usuario Administrador:**
    *   Acceso completo al módulo CRUD de videojuegos (Crear, Editar, Eliminar y Leer).
    *   Administración de categorías / géneros.
    *   Gestión de plataformas o empresas vinculadas.

---

## 🛠️ Tecnologías Propuestas

*   **Frontend:** React / Vite (Single Page Application) + CSS Framework (Tailwind CSS / Bootstrap).
*   **Backend:** Node.js + Express.js.
*   **Base de Datos:** MongoDB (Modelo orientado a documentos) + Mongoose ODM.
*   **Autenticación:** JSON Web Tokens (JWT) + Bcrypt.
*   **Despliegue (Hosting):** Render / Vercel / Railway.

---

## 🗄️ Modelo de Datos (Backend)

La base de datos estará compuesta por al menos **4 colecciones interrelacionadas**:

1.  **`users` (Usuarios):**
    *   `_id`: ObjectId
    *   `username`: String (Único, requerido)
    *   `email`: String (Único, requerido, formato email)
    *   `password`: String (Encriptada)
    *   `role`: String (`USER_ROLE`, `ADMIN_ROLE`)
    *   `favorites`: Array de ObjectIds (Ref: `games`)
2.  **`games` (Videojuegos - Entidad CRUD Principal):**
    *   `_id`: ObjectId
    *   `title`: String (Requerido)
    *   `description`: String
    *   `releaseDate`: Date
    *   `developer`: ObjectId (Ref: `companies`)
    *   `publisher`: ObjectId (Ref: `companies`)
    *   `genre`: ObjectId (Ref: `genres`)
    *   `steamUrl`: String (URL válida a la tienda de Steam)
    *   `imageUrl`: String
3.  **`genres` (Géneros):**
    *   `_id`: ObjectId
    *   `name`: String (Acción, RPG, Estrategia, etc.)
    *   `description`: String
4.  **`companies` (Empresas / Desarrolladoras):**
    *   `_id`: ObjectId
    *   `name`: String
    *   `country`: String
    *   `website`: String

---

## 📂 Estructura General del Proyecto

```text
gaming-hub/
├── backend/                  # Repositorio de la API REST
│   ├── src/
│   │   ├── config/           # Configuración de BD y variables de entorno
│   │   ├── controllers/      # Lógica de controladores (Auth, Games, Genres, etc.)
│   │   ├── middlewares/      # Validaciones, JWT y control de roles
│   │   ├── models/           # Esquemas Mongoose (User, Game, Genre, Company)
│   │   ├── routes/           # Endpoints de la API
│   │   └── utils/            # Manejo centralizado de errores y helpers
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # Repositorio de la SPA
    ├── src/
    │   ├── assets/           # Recursos estáticos (imágenes, íconos)
    │   ├── components/       # Componentes reutilizables (Navbar, Cards, Modals, Loader)
    │   ├── context/          # Estado global (AuthContext)
    │   ├── pages/            # Vistas principales (Home, GameDetail, AdminDashboard, Login)
    │   ├── services/         # Conexiones Axios/Fetch hacia la API Backend
    │   └── utils/            # Validaciones de formularios y helpers
    ├── .env.example
    └── package.json
```

---

## 🔌 Principales Endpoints de la API

### Autenticación (`/api/auth`)
*   `POST /api/auth/register` - Registro de usuario.
*   `POST /api/auth/login` - Inicio de sesión y entrega de token JWT.

### Videojuegos (`/api/games`)
*   `GET /api/games` - Obtener catálogo (Soporta query params: `?genre=...&search=...`).
*   `GET /api/games/:id` - Obtener detalle de un juego específico.
*   `POST /api/games` - Crear un nuevo videojuego *(Solo Admin)*.
*   `PUT /api/games/:id` - Modificar datos de un juego *(Solo Admin)*.
*   `DELETE /api/games/:id` - Eliminar un juego *(Solo Admin)*.

### Géneros y Empresas (`/api/genres`, `/api/companies`)
*   `GET /api/genres` - Listar géneros disponibles para los filtros.
*   `GET /api/companies` - Listar desarrolladoras.

---

## ⚙️ Pasos de Instalación y Ejecución Local

### Prerrequisitos
*   Node.js (v18 o superior)
*   MongoDB local o instancia en MongoDB Atlas
*   Git

### Backend
1. Clonar e ingresar al directorio: `cd backend`
2. Instalar dependencias: `npm install`
3. Crear archivo `.env` basado en `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gaming_hub
   JWT_SECRET=tu_clave_secreta_aqui
   ```
4. Ejecutar en modo desarrollo: `npm run dev`

### Frontend
1. Clonar e ingresar al directorio: `cd frontend`
2. Instalar dependencias: `npm install`
3. Crear archivo `.env` con la URL del Backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Ejecutar en modo desarrollo: `npm run dev`