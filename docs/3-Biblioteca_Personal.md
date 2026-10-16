# Guía de Estudio 3: Biblioteca Personal y Relaciones N:M 🎮📚

Esta guía te explica en detalle la nueva funcionalidad de **Biblioteca Personal**, diseñada para que cada usuario pueda catalogar videojuegos, clasificarlos por estado (*"Pendiente"*, *"Jugando"*, *"Completado"*, *"Abandonado"*) y marcarlos como favoritos.

---

## 1. ¿Por qué una colección adicional? (Relación Muchos a Muchos N:M)

En una base de datos:
* Un **Usuario** puede tener en su biblioteca **muchos Videojuegos**.
* Un **Videojuego** puede estar en la biblioteca de **muchos Usuarios**.
* Pero además, **cada relación tiene datos propios** (atributos de la relación):
  * ¿En qué estado lo tiene ese usuario específico? (*¿Jugando? ¿Completado?*)
  * ¿Es favorito para ese usuario? (*true / false*)
  * ¿Cuándo lo agregó o actualizó? (*timestamps*)

En lugar de sobrecargar el documento de Usuario con arreglos gigantescos, la mejor práctica en bases de datos relacionales y NoSQL es crear una **colección intermedia** (también conocida como tabla de unión o colección pivote).

---

## 2. El Modelo: `src/models/UserGame.js`

```javascript
import mongoose from 'mongoose';

const userGameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Jugando', 'Completado', 'Abandonado', null],
    default: null // Opcional: no estás obligado a clasificarlo para tenerlo como favorito
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice compuesto único: un usuario no puede tener el mismo juego duplicado en su biblioteca
userGameSchema.index({ user: 1, game: 1 }, { unique: true });

export default mongoose.model('UserGame', userGameSchema);
```

### 💡 Puntos Clave de este Modelo:
1. **`ref: 'User'` y `ref: 'Game'`**: Referencias a las otras dos colecciones mediante `ObjectId`. Al hacer consultas, usamos `.populate()` para traer los datos completos del juego, su género y su empresa desarrolladora.
2. **`enum` estricto**: Mongoose rechaza automáticamente cualquier estado que no sea uno de los 4 permitidos (*Pendiente*, *Jugando*, *Completado*, *Abandonado*).
3. **Índice compuesto `{ user: 1, game: 1 }` único**: A nivel de base de datos, garantiza que no puedan crearse dos registros para el mismo juego y el mismo usuario.

---

## 3. Endpoints del Backend (`/api/library`)

Todas estas rutas están protegidas con el middleware `protect` (requieren Token JWT del usuario):

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/library` | Obtiene todos los juegos de la biblioteca del usuario. Soporta query params: `?status=Jugando` o `?favorite=true`. |
| **GET** | `/api/library/check/:gameId` | Verifica si un juego específico ya está en la biblioteca del usuario y devuelve su estado actual. |
| **POST** | `/api/library` | Agrega o actualiza un juego en la biblioteca (`gameId`, `status`, `isFavorite`). |
| **PUT** | `/api/library/:gameId` | Cambia el estado o favorito de un juego existente. |
| **DELETE**| `/api/library/:gameId` | Quita un juego de la biblioteca personal. |
| **POST** | `/api/library/toggle-favorite/:gameId` | Alterna el estado de favorito (❤️ / 🤍) y sincroniza con el perfil. |

---

## 4. El Frontend (React + Vite + TailwindCSS)

1. **`Navbar.jsx`**: Ahora incluye el acceso directo a **📚 Mi Biblioteca** para cualquier usuario autenticado.
2. **`pages/Library.jsx`**:
   * **Tarjetas de Estadísticas**: Muestra conteos en tiempo real (Total, Jugando, Pendiente, Completado, Abandonado y Favoritos).
   * **Pestañas de Filtrado**: Permite filtrar los juegos por estado con un solo clic.
   * **Buscador Interno**: Búsqueda en tiempo real por título, género o empresa dentro de la biblioteca propia.
   * **Selectores interactivos**: Cada tarjeta permite cambiar el estado en vivo mediante un `<select>` sin recargar la página.
   * **Botón de Favorito Flotante**: Permite marcar o desmarcar favoritos con animación y cambio de color.
   * **Botón Eliminar**: Quita el juego de la biblioteca previa confirmación.
3. **`pages/GameDetail.jsx`**:
   * Si el usuario está navegando un juego del catálogo general, ve un bloque interactivo de **"Mi Biblioteca Personal"**.
   * Si no lo tiene agregado, le ofrece el botón `+ Agregar a mi Biblioteca`.
   * Si ya lo tiene, muestra su estado actual con un badge colorido y le permite cambiar de estado directamente allí.

---

## 5. Preguntas Típicas de Examen y Respuestas 🎯

**Pregunta 1:** *"¿Por qué creaste la colección `UserGame` en vez de meter los juegos adentro de un array en el modelo `User`?"*
* **Tu respuesta:** *"Porque modela una relación Muchos a Muchos con atributos propios. En MongoDB, almacenar listas crecientes de subdocumentos dentro de un usuario puede causar problemas de escalabilidad y tamaño máximo de documento (límite de 16MB). Con una colección intermedia `UserGame`, cada entrada representa la relación entre un usuario y un juego, permitiendo consultar, indexar, filtrar por estado y ordenar de manera eficiente con `.populate()`."*

**Pregunta 2:** *"¿Cómo evitas que un usuario agregue dos veces el mismo juego a su biblioteca?"*
* **Tu respuesta:** *"Definí un índice compuesto único en Mongoose: `userGameSchema.index({ user: 1, game: 1 }, { unique: true })`. Además, en el controlador usamos operaciones que verifican la existencia previa para actualizar en lugar de duplicar."*

**Pregunta 3:** *"¿Cómo se sincronizan los estados de los juegos con el Frontend?"*
* **Tu respuesta:** *"En React usamos el hook `useState` y peticiones asíncronas con `axios`. Al cambiar el estado en un menú desplegable, enviamos una petición `PUT` a `/api/library/:gameId` enviando el token en el header `Authorization`. Cuando el servidor responde con el nuevo estado validado, actualizamos el array local de React mediante `setItems`, logrando una actualización instantánea en la interfaz sin necesidad de refrescar la página."*
