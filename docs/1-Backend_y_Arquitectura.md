# Guía de Estudio 1: Backend y Arquitectura 🧠

¡Felicidades por llegar hasta acá! Esta guía te va a servir para entender cómo funciona el "cerebro" de tu aplicación y para que puedas defender tu código ante cualquier profesor.

## 1. El Stack MERN
Tu proyecto está construido sobre el **Stack MERN**, que significa:
* **M**ongoDB: La base de datos (donde guardamos los juegos y usuarios).
* **E**xpress: El framework que nos ayuda a crear el servidor web fácilmente.
* **R**eact: La librería de interfaz de usuario (el Frontend).
* **N**ode.js: El entorno de ejecución que permite que el servidor funcione fuera del navegador.

## 2. La Estructura del Backend (API REST)
El backend no devuelve páginas web bonitas (HTML), devuelve **Datos Puros** en formato JSON. Se comunica con el frontend a través de URLs (Rutas).

Hemos organizado el código usando un patrón inspirado en **MVC (Modelo-Vista-Controlador)**:

### 📁 `src/config/` (Configuración)
Aquí tenemos `db.js`. Su único trabajo es usar la librería `mongoose` para conectarse a tu base de datos de MongoDB Atlas (o local) usando el link secreto que está en tu archivo `.env`.

### 📁 `src/models/` (Los Modelos)
Los modelos definen **cómo lucen los datos**. En MongoDB puedes guardar lo que sea, pero nosotros usamos `Mongoose` para ponerle reglas estrictas (Schemas).
* **Game.js**: Exige que todo juego tenga un título. Además, vincula la Empresa y el Género usando un `ObjectId` (relacionando las tablas).
* **User.js**: Guarda el email y rol. **Dato de oro:** Aquí usamos un *Hook* (un interceptor) llamado `userSchema.pre('save')`. Antes de guardar un usuario en la base de datos, este código toma su contraseña y la encripta usando `bcrypt`. ¡Así nadie puede robar las contraseñas!

### 📁 `src/controllers/` (Los Controladores)
Aquí vive la **lógica pesada**. Si el modelo es el esqueleto, el controlador es el músculo.
* En `gameController.js` tenemos funciones como `getGames`, `createGame`, etc.
* Ejemplo de tu genialidad: En `createGame`, en lugar de obligar al usuario a crear empresas por separado, la función `findOrCreate` busca si el nombre que escribiste (ej: "Valve") ya existe. Si no existe, lo crea automáticamente y luego guarda el juego.

### 📁 `src/routes/` (Las Rutas)
El controlador tiene las funciones, pero ¿cómo accedemos a ellas desde internet? ¡Con las Rutas!
En `gameRoutes.js` definimos que si alguien entra a `http://localhost:5000/api/games` con un método **GET**, se ejecutará la función `getGames`.

### 📁 `src/middlewares/` (Los Patovicas / Guardias de Seguridad)
Son funciones que se ejecutan **en el medio** (de ahí su nombre) antes de llegar al controlador.
* **`protect`**: Revisa si la petición trae un token válido. Si no lo trae o es falso, rechaza la conexión con un Error 401.
* **`admin`**: Revisa si el usuario que hace la petición tiene el rol `ADMIN_ROLE`. Si no lo es, lo rechaza con un Error 403.
Fíjate en tus rutas: `.post(protect, admin, createGame)`. Significa: *"Para crear un juego, primero debes estar logueado (protect), luego debes ser admin (admin), y recién ahí te dejo ejecutar la función (createGame)"*.

### 📄 `app.js` (El Corazón)
Es el archivo principal. Aquí encendemos el servidor con `app.listen(5000)`, activamos **CORS** (un permiso que permite que el puerto 5173 del frontend se comunique con el puerto 5000 del backend sin que el navegador lo bloquee por seguridad) y conectamos todas nuestras Rutas.

---
**Pregunta típica de examen:** *"¿Cómo manejas la seguridad de las contraseñas?"*
**Tu respuesta:** *"No guardo contraseñas en texto plano. Uso la librería Bcrypt en un middleware 'pre-save' del modelo User para hashear (encriptar) la contraseña antes de guardarla en MongoDB. Para validar quién entra, uso JSON Web Tokens (JWT) que me firman una sesión segura."*
