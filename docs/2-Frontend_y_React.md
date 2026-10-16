# Guía de Estudio 2: Frontend y React 🎨

Esta es tu aplicación visual, donde interactúa el usuario final. Está hecha con **React**, empaquetada con **Vite** (que la hace rapidísima), y estilizada con **TailwindCSS**.

## 1. El Ecosistema de React
React es una librería basada en **Componentes**. En lugar de tener un archivo HTML gigante, dividimos la pantalla en pequeños bloques de código reutilizables (NavBar, botones, cartas de juegos, etc).

* **`App.jsx`**: Es la raíz de todo. Aquí configuramos el enrutamiento (las URLs de la página) usando la librería `react-router-dom`. Define qué Componente (Pantalla) se debe mostrar según la URL a la que entres. (Por ejemplo: `<Route path="/admin" element={<AdminPanel />} />`).

## 2. El Estado y los Hooks (El motor de React)
En React, las variables que cambian y actualizan la pantalla mágicamente se llaman **Estados**.
Usamos **Hooks** (funciones especiales que empiezan con "use"):

* **`useState`**: Crea una variable y una función para actualizarla. Ejemplo: `const [search, setSearch] = useState('')`. Cuando alguien escribe en el buscador, llamamos a `setSearch`. React detecta el cambio y redibuja la pantalla con los nuevos resultados al instante.
* **`useEffect`**: Se usa para ejecutar código cuando el componente "nace" (se renderiza por primera vez) o cuando un estado cambia. Lo usamos para conectarnos al Backend (hacer peticiones `axios.get`) apenas el usuario entra a la página, trayendo los juegos y guardándolos en el estado `games`.

## 3. AuthContext (El Estado Global de Autenticación)
¿Cómo sabe la barra de navegación que estás logueado, y al mismo tiempo el Panel de Admin sabe tu rol? ¡Porque comparten estado!

* En lugar de pasar la variable `user` de página en página, creamos `src/context/AuthContext.jsx`.
* Este archivo funciona como una "Nube de datos privada" para tu aplicación. Ahí guardamos el Token JWT y los datos del usuario.
* Al hacer login exitosamente, el AuthContext guarda el token en el **LocalStorage** (la memoria del navegador). Esto permite que, si el usuario cierra la pestaña y la vuelve a abrir mañana, sigamos recordando quién es sin pedirle contraseña de nuevo.

## 4. Las Pantallas Principales (`src/pages/`)
* **`Home.jsx`**: Tiene el catálogo y la súper barra de búsqueda global. Muestra cómo iterar un array en React usando `.map()` para generar una "Card" visual por cada juego.
* **`AdminPanel.jsx`**: El panel CRUD. Muestra cómo manejar formularios y llamar a métodos HTTP avanzados (`axios.post`, `axios.put`, `axios.delete`).
  * **Seguridad en Frontend**: Tiene un `useEffect` que ni bien cargas la página revisa tu AuthContext. Si no eres admin, usa `navigate('/')` para expulsarte a la página principal inmediatamente.

## 5. El Diseño (TailwindCSS)
En lugar de tener un archivo gigante de `.css` tradicional, usamos Tailwind.
Fíjate en las clases que usamos en el código: `className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"`.
Esto literalmente significa: "Fondo azul oscuro, al pasar el mouse ponlo azul claro, texto blanco, letra gruesa, y bordes redondeados". Esto te permitió construir un diseño espectacular y Premium sin salir de tu código JavaScript.

---
**Pregunta típica de examen:** *"¿Cómo te comunicas con el Backend desde el Frontend y cómo evitas que tu página haga llamadas eternas?"*
**Tu respuesta:** *"Uso la librería Axios para hacer peticiones HTTP. Para evitar loops infinitos, las peticiones que cargan datos iniciales las coloco dentro del hook `useEffect` y le paso un array de dependencias `[]` vacío o específico. Así me aseguro de que la consulta a la base de datos se haga solo una vez cuando el componente se carga o cuando cambia un filtro en particular."*
